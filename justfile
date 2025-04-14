set dotenv-load := true
set dotenv-required := true
set dotenv-filename := ".envrc"

default:
	@just --list

build:
	goreleaser build --snapshot --clean --single-target -o splash

debug:
	goreleaser build --snapshot --clean --single-target -o splash --auto-snapshot --verbose

release:
	goreleaser release --clean

test:
	go test -v ./... -race 
