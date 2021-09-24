# How can I contribute?
To contribute and add your features to the project follow the steps below:

- Fork this repo
- Clone the repo you forked
- Jump into the project directory
- Install local dependencies via `npm` or `yarn`
- Do your awesome stuff :pop:

## Build & Run:
To build `splash-cli` correctly you **must** have some *Unsplash API credentials* (you can get some [there][unsplash_dev]) and right now (10 March 2020) a valid [*Sentry DSN*][sentry_website].

Put everything inside a `.env` file in the root dir of the project (a template is available here: [`.env.example`][env_example])

Then you can start play with the code. Have fun ✌️ (we use [YARN](https://yarnpkg.com))

## Explanation:

#### Add a new flag
To add flags and arguments you should do something like this:
> :warn: You maybe would change the params somewhere else, that's ok.
If you need help please create a new issue

##### Example
```js
    // here you can add your own flag
    if (flags.customFlag) {
        // Do your awesome stuff
        console.log('CUSTOM FLAG')

        // please remember the return statement at the end if you don't want to
        // continue the process with the download
        return;

        // else you should provide a value for the `photo` variable
        const response = await fetch('API URL');
        photo = await response.json() // API URL RESPONSE
    }  else if (flags.day) {
        // Stuff
    }

    // other flags check
```

Then you should add your flag into [`./src/bin/help.js`](/src/bin/help.js) for the helpmenu, and also inside [`./src/bin/index.js`](/src/bin/index.js).

#### Add a new command
Create a new file inside commands where you will export your new function as a module.
```js
    import inquirer from 'inquirer';
    import printBlock from '@splash-cli/print-block';

    printBlock('Type in your Unsplash:')

    export default async function login() {
        // Prompting the input
        const { username, password } = inquirer.prompt([{
            name: 'username',
            message: 'Username'
        }, {
            name: 'password',
            message: 'Password'
        }])

        /*
        * Backend stuff for login
        */

        // Greet the user!
        printBlock(`Welcome to splash-cli ${username}`)
        return;
    }
```

Please remember to update the `README` and run **tests**  and all the documentation.



[unsplash_dev]: https://unsplash.com/developers
[env_example]: https://github.com/splash-cli/splash-cli/blob/master/.env.example
[sentry_website]: https://sentry.io
