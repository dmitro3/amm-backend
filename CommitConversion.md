# Rule for commit format:
Custom config in  .commitlintrc.js

*Commit* follow format: type(scope?): subject

## type:
- build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- ci: Changes to our CI configuration files and scripts (example scopes: Gitlab CI, Circle, BrowserStack, SauceLabs)
- chore: add something without touching production code (Eg: update npm dependencies)
- docs: Documentation only changes
- feat: A new feature
- fix: A bug fix
- perf: A code change that improves performance
- refactor: A code change that neither fixes a bug nor adds a feature
- revert: Reverts a previous commit
- style: Changes that do not affect the meaning of the code (Eg: adding white-space, formatting, missing semi-colons, etc)
- test: Adding missing tests or correcting existing tests

## scope:
> (This is optional): name of package which changes  

## subject:
> Description commit


## Reference:
- [CommitLint](https://github.com/conventional-changelog/commitlint#config)
- [Angular commit guideline](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines)
