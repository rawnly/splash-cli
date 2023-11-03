# Automatically read env file and inject in scripts
env := $(shell cat .env | xargs)

build:
	$(env) goreleaser build --snapshot --clean --single-target

build-prod:
	$(env) goreleaser release --clean

install:
	$(env) go install
