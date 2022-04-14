# Splash CLI v4
[![Go](https://github.com/splash-cli/splash-cli/actions/workflows/go.yml/badge.svg?branch=go-rewrite)](https://github.com/splash-cli/splash-cli/actions/workflows/go.yml)
> Are you looking for the v3.x `splash-cli`? Check out the [master](https://github.com/splash-cli/splash-cli/tree/master) branch


	
![splash-cli](https://socialify.git.ci/splash-cli/splash-cli/image?description=1&language=1&owner=1&pattern=Brick%20Wall&theme=Dark)	


<p align="center">
    <a href="https://splash-cli.app">
        <img alt="Website" src="https://img.shields.io/website/https/splash-cli.app.svg?down_color=red&style=for-the-badge"/>
    </a>
	<a href="https://plant.treeware.earth/splash-cli/splash-cli">
		<img src="https://img.shields.io/badge/Treeware-%F0%9F%8C%B3-lightgreen?style=for-the-badge" alt="Buy usa  tree" />
	</a>
</p>
<p align="center">
	<a href="https://stars.medv.io/splash-cli/splash-cli">
		<img src="https://stars.medv.io/splash-cli/splash-cli.svg" alt="stars_spark" />
	</a>
</p>

<h6 align="center">Get stunning wallpapers from <a href="https://unsplash.com">Unsplash</a> </h6>
<hr />


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

### Feature List
- [x] Change wallpaper on your desktop
- [x] Download photos
- [x] Login to your account
- [ ] Create new collections
- [ ] Add photos to collections
- [ ] Like photos
- More to come

### Build Locally
To build the project locally you can use the following command:

```shell
    goreleaser --snapshot --rm-dist
```

Be sure to set up your environment before running the command.
Required environment variables are:
 - `UNSPLASH_CLIENT_ID`
 - `UNSPLASH_CLIENT_SECRET`

You can get credentials on the [Unsplash Developer Portal](https://unsplash.com/developers).
