.PHONY: build

buildNumber := $(shell ./build-number.sh)
version := "4.0.0-alpha.${buildNumber}"
bin := "splash"

build:
	@echo "Build N.${buildNumber}"
	@echo "Building splash-cli ${version}"

	@rm -f ${bin}
	@go build -o ${bin} -ldflags="-X 'main.ClientId=${UNSPLASH_CLIENT_ID}' -X 'main.ClientSecret=${UNSPLASH_CLIENT_SECRET}' -X 'main.Version=${version}' -X 'main.Debug=${DEBUG}' -X 'github.com/rawnly/splash-cli/config.Version=${version}'"
	@echo "Build complete"
	@echo "BIN available at ${bin}"
