# Automatically read env file and inject in scripts
env := $(shell cat .env | xargs)

build:
	$(env) goreleaser build --snapshot --rm-dist --single-target

build-prod:
	$(env) goreleaser release --rm-dist