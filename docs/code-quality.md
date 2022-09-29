# Code Quality

Code Quality is being ensured with the help of [ESLint][eslint] and [Prettier][prettier].
You may run the control with the following command line

```bash
yarn lint
```

You may execute the same command and request errors to be fixed as much as it could be:

```bash
yarn lint:fix
```

The same commands are available with caching which may give faster linting on second runs:

```bash
yarn lint:cache
# or with fix option
yarn lint:cache:fix
```

Typing is being verified with the help of [TypeScript][ts].

```bash
yarn tsc
```

[ts]: https://www.typescriptlang.org/
[eslint]: https://eslint.org/
[prettier]: https://prettier.io/
