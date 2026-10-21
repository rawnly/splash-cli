package cmd

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"strings"
	"testing"

	surveyterminal "github.com/AlecAivazis/survey/v2/terminal"
	"github.com/rawnly/splash-cli/lib/terminal"
	"github.com/spf13/cobra"
)

func TestCommandStatusLifecycle(t *testing.T) {
	failure := errors.New("download failed")
	for _, tt := range []struct {
		name  string
		err   error
		state string
	}{
		{"success", nil, "done"},
		{"failure", failure, "error"},
		{"cancelled", errCancelled, "idle"},
		{"interrupted prompt", fmt.Errorf("prompt: %w", surveyterminal.InterruptErr), "idle"},
		{"cancelled context", context.Canceled, "idle"},
	} {
		t.Run(tt.name, func(t *testing.T) {
			var reports bytes.Buffer
			command := statusTestCommand()
			child := &cobra.Command{
				Use: "download",
				RunE: func(cmd *cobra.Command, args []string) error {
					status := terminal.Status(cmd.Context())
					status.Report("blocked", "question", "Like this photo?")
					status.Report("working", "", "Finishing photo")
					return tt.err
				},
			}
			command.AddCommand(child)
			command.SetArgs([]string{"download"})
			ctx := terminal.WithProgramStatus(t.Context(), terminal.NewProgramStatus(&reports, true))
			if err := execute(ctx, command, nil); !errors.Is(err, tt.err) {
				t.Fatalf("execute error = %v, want %v", err, tt.err)
			}
			sequences := strings.Split(strings.TrimSuffix(reports.String(), "\x1b\\"), "\x1b\\")
			if len(sequences) != 4 {
				t.Fatalf("expected working, blocked, working, result; got %q", reports.String())
			}
			if !strings.Contains(sequences[0], "state=working:app=splash-cli") ||
				!strings.Contains(sequences[1], "state=blocked:app=splash-cli:kind=question") ||
				!strings.Contains(sequences[3], "state="+tt.state+":app=splash-cli") {
				t.Fatalf("unexpected lifecycle: %q", reports.String())
			}
		})
	}
}

func TestCommandStatusSuppression(t *testing.T) {
	for _, args := range [][]string{{"--help"}, {"help"}, {"--version"}, {"--plain"}, {"--plain=true"}, {"--plain", "--invalid"}, {"completion", "bash"}, {"__complete", ""}} {
		t.Run(strings.Join(args, " "), func(t *testing.T) {
			var reports bytes.Buffer
			command := statusTestCommand()
			command.SetArgs(args)
			ctx := terminal.WithProgramStatus(t.Context(), terminal.NewProgramStatus(&reports, true))
			_ = execute(ctx, command, nil)
			if reports.Len() != 0 {
				t.Fatalf("unexpected status for %v: %q", args, reports.String())
			}
		})
	}
}

func TestCommandPreRunFailureReportsError(t *testing.T) {
	var reports bytes.Buffer
	command := statusTestCommand()
	command.PreRunE = func(cmd *cobra.Command, args []string) error {
		return errors.New("not logged in")
	}
	command.SetArgs([]string{})
	ctx := terminal.WithProgramStatus(t.Context(), terminal.NewProgramStatus(&reports, true))
	if err := execute(ctx, command, nil); err == nil {
		t.Fatal("expected pre-run failure")
	}
	if !strings.Contains(reports.String(), "state=error:app=splash-cli") {
		t.Fatalf("missing error status: %q", reports.String())
	}
}

func TestCommandPostRunStatus(t *testing.T) {
	for _, result := range []error{nil, surveyterminal.InterruptErr} {
		var reports bytes.Buffer
		command := statusTestCommand()
		command.PersistentPostRunE = func(cmd *cobra.Command, args []string) error {
			terminal.Status(cmd.Context()).Report("blocked", "permission", "Open the update page?")
			return result
		}
		command.SetArgs([]string{})
		ctx := terminal.WithProgramStatus(t.Context(), terminal.NewProgramStatus(&reports, true))
		_ = execute(ctx, command, nil)
		state := "done"
		if result != nil {
			state = "idle"
		}
		last := strings.LastIndex(reports.String(), "\x1b]7501;")
		if last < 0 || !strings.Contains(reports.String()[last:], "state="+state) {
			t.Fatalf("post-run result should be %s: %q", state, reports.String())
		}
	}
}

func statusTestCommand() *cobra.Command {
	command := &cobra.Command{
		Use:              "splash",
		Args:             cobra.NoArgs,
		Version:          "test",
		PersistentPreRun: rootCmd.PersistentPreRun,
		RunE:             func(cmd *cobra.Command, args []string) error { return nil },
		SilenceErrors:    true,
		SilenceUsage:     true,
	}
	// Cobra creates its default completion command only when subcommands exist,
	// matching the real Splash command tree.
	command.AddCommand(&cobra.Command{
		Use: "noop",
		Run: func(cmd *cobra.Command, args []string) {},
	})
	command.PersistentFlags().Bool("plain", false, "Plain output")
	command.SetOut(io.Discard)
	command.SetErr(io.Discard)
	return command
}
