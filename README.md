# 🚀 GitKraken CLI

`gk` is GitKraken on the command line. It brings workspaces, pull requests, issues and other GitKraken perks to the terminal for you to work with it along with your code and `git`.

// Screenshot here 

GitKraken CLI is available on macOS, Windows and Unix systems.

## 📚 Documentation

Check out the [installation section below](#installation). For command usage [see the docs][documentation].

## 🤝 Contributing

If you have any suggestion, anything that feels off, or you miss some functionality that you would like to see here, please check out the [contributing page][contributing]. There you will find instructions for sharing your feedback to the project.

<!-- this is an anchor, do not rename -->
## 💻 Installation

`gk` is available as a downloadable binary from the [releases page][]. Then, you only need to add it to your path in the terminal to make it globally available.

### macOS and Unix

Add it to your binaries folder:

```bash
mv ~/Downloads/gk ~/usr/local/bin/gk
``` 

### Windows

Place the `gk` binary in a desired folder. Then edit your environment variables to add it to your PATH.

1. In Search, search for **Environment Variables**.
2. Click on the **Edit the system environment variables** result.
3. In the modal, click on the **Environment Variables...** button.
4. In the **System Variables** section, scroll until you find the **PATH** variable. Click on it.
    - If it doesn't exist, create a variable with the name **PATH**. 
5. Add the path to the `gk` binary at the end.



[documentation]: https://gitkraken.github.io/gk-cli/
[contributing]: CONTRIBUTING.md
[releases page]: https://github.com/gitkraken/gk-cli/releases/latest
