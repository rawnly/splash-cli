# Splash CLI v4
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
- Blazing fast (~50%)

### Feature List
- [x] Change wallpaper on your desktop
- [x] Download photos
- [ ] Create new collections
- [ ] Add photos to collections
- [ ] Like photos
- More to come

### Build Locally
To build the project locally you can use the following command:

```bash
```shell
    got install
    go build -ldflags "-X 'main.ClientId=<your-client-id>' -X 'main.ClientSecret=<your-client-secret>'"
    
    # OR via makefile
    
    make build 
```