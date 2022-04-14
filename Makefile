# Automatically read env file and inject in scripts
env := $(shell cat .env | xargs)

build:
	$(env) goreleaser --snapshot --rm-dist

build-prod:
	$(env) goreleaser release --rm-dist