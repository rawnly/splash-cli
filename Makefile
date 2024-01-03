# Automatically read env file and inject in scripts
env := $(shell cat .env | xargs)

default: build


pretty-logs:
	cat splash-cli.log | jq > splash-cli-formatted.log

build:
	$(env) goreleaser build --snapshot --clean --single-target -o splash

build-sentry-debug:
	$(env) ENABLE_SENTRY_DEBUG=true goreleaser build --snapshot --clean --single-target -o splash --debug

build-prod:
	$(env) goreleaser release --clean

clean:
	$(env) rm -f splash-cli.log
