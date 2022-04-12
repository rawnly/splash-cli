.PHONY: all

BUILD_NUMBER := $(cat .build)

all:
	@echo "make <cmd>"
	@echo ""
	@echo "commands:"
	@echo " build - runs go build with ldflags Clientid=${UNSPLASH_CLIENT_ID} and Clientsecret=${UNSPLASH_CLIENT_SECRET}"
	@echo ""

increment-build:
	@echo "Incrementing build number"
	@echo "BUILD_NUMBER: ${BUILD_NUMBER}"


build:
	@rm -f splash splash-cli
	@go build -o splash -ldflags="-X 'main.ClientId=${UNSPLASH_CLIENT_ID}' -X 'main.ClientSecret=${UNSPLASH_CLIENT_SECRET}' -X 'main.Version=4.0.0-alpha.$(cat .build)'"