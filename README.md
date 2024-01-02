# Splash CLI v4
[![Go](https://github.com/splash-cli/splash-cli/actions/workflows/go.yml/badge.svg?branch=go-rewrite)](https://github.com/splash-cli/splash-cli/actions/workflows/go.yml)
> Are you looking for the v3.x `splash-cli`? Check out the [master](https://github.com/splash-cli/splash-cli/tree/master) branch

A new era for Splash CLI is coming! After many weeks
thinking how to upgrade the project codebase I decided to
completely rewrite the CLI from the ground in Go.

The idea is to replicate the original functionality to keep
the new experience as close to the original as possible.

### Why Go?
- Distribution will not depend on NPM
- No need to install any dependencies
- Lighter bundle size
- No need to use any build tools
- Blazing fast (~2500%) (0.22s vs 5s)

#### Feature List
- [x] Change wallpaper on your desktop
- [x] Download photos
- [x] Login to your account
- [ ] Create new collections
- [ ] Add photos to collections
- [ ] Like photos
- More to come

## Installation

#### Via Homebrew
```shell
brew tap rawnly/tap
brew install splash-cli
```

#### Via Go 
```shell
go install github.com/rawnly/splash-cli@latest
```

Be sure to set up your environment before running the command.
Required environment variables are:
 - `UNSPLASH_CLIENT_ID`
 - `UNSPLASH_CLIENT_SECRET`

You can get credentials on the [Unsplash Developer Portal](https://unsplash.com/developers).


Also remember that the BIN name will be `splash-cli` and not `splash`

#### Manually
- Download the [latest pre-release](https://github.com/splash-cli/splash-cli/releases)
- Move the binary to your `$PATH`
- Enjoy

## Build Locally
To build the project locally you can use the following command:

```shell
    goreleaser --snapshot --rm-dist
    
    # Or
    
    make build # this will only build for the current platform
```
> **Note**
> If you have an `.env` file in your project root `make` will automatically inject values inside script commands.


Be sure to set up your environment before running the command.
Required environment variables are:
 - `UNSPLASH_CLIENT_ID`
 - `UNSPLASH_CLIENT_SECRET`

You can get credentials on the [Unsplash Developer Portal](https://unsplash.com/developers).

