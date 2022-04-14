.PHONY: build

LAST_COMMIT := $(shell git log --pretty=format:'%H' -n 1)
BIN_NAME := "splash"
BUILD_NUMBER := $(shell git rev-list HEAD --count)
version = "4.0.0-alpha.${BUILD_NUMBER}"

build:
	@echo "---------- DEV --------------"
	@echo "Version ${version}"
	@echo "Commit: ${LAST_COMMIT}"
	@echo "-----------------------------"

	@rm -f ${BIN_NAME}
	@go build -o ${BIN_NAME} -ldflags="-X 'main.ClientId=${UNSPLASH_CLIENT_ID}' -X 'main.ClientSecret=${UNSPLASH_CLIENT_SECRET}' -X 'main.Version=${version}' -X 'main.Debug=${DEBUG}' -X 'github.com/rawnly/splash-cli/config.Version=${version}' -X 'github.com/rawnly/splash-cli/config.Commit=${LAST_COMMIT}'"

	@echo ""
	@echo "Build complete"

build-prod:
	@echo "--------- PROD --------------"
	@echo "Version ${version}"
	@echo "Commit: ${LAST_COMMIT}"
	@echo "-----------------------------"

	@rm -f ${BIN_NAME}
	@go build -o ${BIN_NAME} -ldflags="-X 'main.ClientId=${UNSPLASH_CLIENT_ID}' -X 'main.ClientSecret=${UNSPLASH_CLIENT_SECRET}' -X 'main.Version=${version}' -X 'main.Debug=${DEBUG}' -X 'github.com/rawnly/splash-cli/config.Version=${version}' -X 'github.com/rawnly/splash-cli/config.Commit=${LAST_COMMIT}'"
	@git tag -a ${version} -m "v${version}"

	@echo ""
	@echo "Build complete"

