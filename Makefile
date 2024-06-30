.PHONY: all clean test 

# Automatically read env file and inject in scripts
env := $(shell cat .env | xargs)


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

# =================
# Quality Checks
# =================
## tidy: format code and tidy modfile
.PHONY: tidy
tidy:
	@go fmt ./...
	@go mod tidy



## check: checks for errors/vulnerabilities in the code
.PHONY: check
check:
	@go run honnef.co/go/tools/cmd/staticcheck@latest -checks=all,-ST1000,-U1000 ./...
	@go run golang.org/x/vuln/cmd/govulncheck@latest ./...
	@go run github.com/kisielk/errcheck@latest ./... | grep -v "defer " || true

## audit: run quality control checks
.PHONY: audit
audit: check
	@go mod verify
	@go vet ./...
	@go test -race -buildvcs -vet=off ./...

## test: run all tests
.PHONY: test
test:
	go test -v -race -buildvcs ./...

.PHONY: test/cover
test/cover:
	go test -race -buildvcs -cover -coverprofile=./tmp/coverage.out ./...
	go tool cover -html=./tmp/coverage.out
