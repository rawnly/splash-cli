package telemetry

import (
	"context"
	"runtime"
	"time"

	"github.com/AlecAivazis/survey/v2"
	"github.com/rawnly/splash-cli/config"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"github.com/voxelite-ai/env"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/propagation"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
	"go.opentelemetry.io/otel/trace"
)

type Telemetry struct {
	tracer           trace.Tracer
	meter            metric.Meter
	Enabled          bool
	commandCounter   metric.Int64Counter
	executionTimer   metric.Float64Histogram
	installationCounter metric.Int64Counter
	errorCounter     metric.Int64Counter
}

func New() (*Telemetry, error) {
	// Check if telemetry is enabled via environment variable
	// Default to true if not set (enabled by default)
	telemetryEnabled := env.Bool("SPLASH_CLI_TELEMETRY", true)
	
	// Also check if user has opted out via settings
	userOptedOut := viper.GetBool("user_opt_out_telemetry")
	
	// Only enable if not explicitly disabled and not in debug mode and user hasn't opted out
	enabled := telemetryEnabled && !userOptedOut && !config.IsDebug()
	
	if !enabled {
		logrus.Debug("Telemetry disabled")
		return &Telemetry{Enabled: false}, nil
	}

	// Create resource with service information
	res, err := resource.New(context.Background(),
		resource.WithAttributes(
			semconv.ServiceNameKey.String("splash-cli"),
			semconv.ServiceVersionKey.String(config.GetVersion()),
			semconv.OSNameKey.String(runtime.GOOS),
			semconv.OSTypeKey.String(runtime.GOARCH),
		),
	)
	if err != nil {
		logrus.WithError(err).Debug("Failed to create OTEL resource")
		return &Telemetry{Enabled: false}, nil
	}

	// Initialize trace provider
	if err := initTraceProvider(res); err != nil {
		logrus.WithError(err).Debug("Failed to initialize trace provider")
		return &Telemetry{Enabled: false}, nil
	}

	// Initialize metrics provider
	if err := initMetricsProvider(res); err != nil {
		logrus.WithError(err).Debug("Failed to initialize metrics provider")
		return &Telemetry{Enabled: false}, nil
	}

	// Create tracer and meter
	tracer := otel.Tracer("splash-cli")
	meter := otel.Meter("splash-cli")

	// Create metrics instruments
	commandCounter, err := meter.Int64Counter(
		"splash_cli_commands_total",
		metric.WithDescription("Total number of commands executed"),
	)
	if err != nil {
		logrus.WithError(err).Debug("Failed to create command counter")
		return &Telemetry{Enabled: false}, nil
	}

	executionTimer, err := meter.Float64Histogram(
		"splash_cli_command_duration_seconds",
		metric.WithDescription("Duration of command execution in seconds"),
		metric.WithUnit("s"),
	)
	if err != nil {
		logrus.WithError(err).Debug("Failed to create execution timer")
		return &Telemetry{Enabled: false}, nil
	}

	installationCounter, err := meter.Int64Counter(
		"splash_cli_installations_total",
		metric.WithDescription("Total number of CLI installations"),
	)
	if err != nil {
		logrus.WithError(err).Debug("Failed to create installation counter")
		return &Telemetry{Enabled: false}, nil
	}

	errorCounter, err := meter.Int64Counter(
		"splash_cli_errors_total",
		metric.WithDescription("Total number of errors encountered"),
	)
	if err != nil {
		logrus.WithError(err).Debug("Failed to create error counter")
		return &Telemetry{Enabled: false}, nil
	}

	return &Telemetry{
		tracer:              tracer,
		meter:               meter,
		Enabled:             true,
		commandCounter:      commandCounter,
		executionTimer:      executionTimer,
		installationCounter: installationCounter,
		errorCounter:        errorCounter,
	}, nil
}

func initTraceProvider(res *resource.Resource) error {
	// Use fixed production endpoint
	endpoint := "https://api.honeycomb.io/v1/traces"
	
	// Create OTLP trace exporter
	traceExporter, err := otlptracehttp.New(
		context.Background(),
		otlptracehttp.WithEndpoint(endpoint),
	)
	if err != nil {
		return err
	}

	// Create trace provider
	traceProvider := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(traceExporter),
		sdktrace.WithResource(res),
	)

	otel.SetTracerProvider(traceProvider)
	otel.SetTextMapPropagator(propagation.TraceContext{})

	return nil
}

func initMetricsProvider(res *resource.Resource) error {
	// Use fixed production endpoint
	endpoint := "https://api.honeycomb.io/v1/metrics"
	
	// Create OTLP metrics exporter
	metricsExporter, err := otlpmetrichttp.New(
		context.Background(),
		otlpmetrichttp.WithEndpoint(endpoint),
	)
	if err != nil {
		return err
	}

	// Create metrics provider
	metricsProvider := sdkmetric.NewMeterProvider(
		sdkmetric.WithReader(sdkmetric.NewPeriodicReader(
			metricsExporter,
			sdkmetric.WithInterval(30*time.Second),
		)),
		sdkmetric.WithResource(res),
	)

	otel.SetMeterProvider(metricsProvider)

	return nil
}

func (t *Telemetry) TrackCommand(ctx context.Context, commandName string, args []string) (context.Context, func()) {
	if !t.Enabled {
		return ctx, func() {}
	}

	start := time.Now()
	
	// Create span for command execution
	ctx, span := t.tracer.Start(ctx, commandName,
		trace.WithAttributes(
			semconv.ProcessCommandKey.String(commandName),
			semconv.ProcessCommandArgsKey.StringSlice(args),
		),
	)

	// Record command execution
	t.commandCounter.Add(ctx, 1,
		metric.WithAttributes(
			semconv.ProcessCommandKey.String(commandName),
		),
	)

	// Return cleanup function
	return ctx, func() {
		duration := time.Since(start).Seconds()
		
		// Record execution time
		t.executionTimer.Record(ctx, duration,
			metric.WithAttributes(
				semconv.ProcessCommandKey.String(commandName),
			),
		)
		
		span.End()
	}
}

func (t *Telemetry) TrackInstallation(ctx context.Context) {
	if !t.Enabled {
		return
	}

	// Create span for installation
	ctx, span := t.tracer.Start(ctx, "installation")
	defer span.End()

	// Record installation
	t.installationCounter.Add(ctx, 1)

	logrus.Debug("Tracked CLI installation via OTEL")
}

func (t *Telemetry) TrackTelemetryConsent(ctx context.Context, consented bool) {
	if !t.Enabled {
		return
	}

	// Create span for telemetry consent decision
	ctx, span := t.tracer.Start(ctx, "telemetry_consent")
	defer span.End()

	// Add consent decision to span
	span.SetAttributes(
		semconv.ProcessCommandKey.String("telemetry_consent"),
	)

	// Record consent decision metric
	consentCounter, err := t.meter.Int64Counter(
		"splash_cli_telemetry_consent_total",
		metric.WithDescription("Total number of telemetry consent decisions"),
	)
	if err != nil {
		logrus.WithError(err).Debug("Failed to create consent counter")
		return
	}

	consentCounter.Add(ctx, 1,
		metric.WithAttributes(
			semconv.ProcessCommandKey.String("telemetry_consent"),
		),
	)

	logrus.WithField("consented", consented).Debug("Tracked telemetry consent decision")
}

func (t *Telemetry) TrackError(ctx context.Context, err error, command string) {
	if !t.Enabled {
		return
	}

	// Create span for error
	ctx, span := t.tracer.Start(ctx, "error")
	defer span.End()

	// Record error
	t.errorCounter.Add(ctx, 1,
		metric.WithAttributes(
			semconv.ProcessCommandKey.String(command),
		),
	)

	// Add error details to span
	span.RecordError(err)

	logrus.WithError(err).Debug("Tracked error via OTEL")
}

func (t *Telemetry) CreateSpan(ctx context.Context, name string) (context.Context, trace.Span) {
	if !t.Enabled {
		return ctx, trace.SpanFromContext(ctx)
	}

	return t.tracer.Start(ctx, name)
}

func (t *Telemetry) PromptTelemetryConsent(ctx context.Context) bool {
	confirm := true
	prompt := &survey.Confirm{
		Default: true,
		Message: "Would you like to help us improve the app by sending anonymous usage telemetry? This helps us understand how the CLI is being used and identify areas for improvement.",
	}

	if err := survey.AskOne(prompt, &confirm); err != nil {
		logrus.WithError(err).Debug("Failed to prompt telemetry consent")
		return false
	}

	// Save the user's decision
	viper.Set("user_opt_out_telemetry", !confirm)

	// Track the decision before potentially disabling telemetry
	t.TrackTelemetryConsent(ctx, confirm)

	if !confirm {
		// Disable telemetry if user opted out
		t.Enabled = false
		logrus.Debug("User opted out of telemetry")
	} else {
		logrus.Debug("User consented to telemetry")
	}

	return confirm
}

func (t *Telemetry) Close() error {
	if !t.Enabled {
		return nil
	}

	logrus.Debug("Closing telemetry")
	return nil
}