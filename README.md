# 🚀 GitKraken CLI `Preview`

`gk` is GitKraken on the command line. It makes working across multiple repos easier with Workspaces, provides access to pull requests and issues from multiple services (GitHub, GitLab, Bitbucket, etc.), and seamlessly connects with [GitKraken Client](https://www.gitkraken.com/git-client) and [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) in VS Code to visualize `git` information when you need it.

<p align="center">
<img src="https://user-images.githubusercontent.com/86774052/225326381-aaea81a3-9f19-4170-9e0b-2f42fac8edda.png" style="margin: 0 auto" />
</p>

GitKraken CLI is available on macOS, Windows and Unix systems.

## 📚 Documentation

Check out the [installation instructions](#installation) and [examples](#examples) below. For command usage [see the docs][documentation].

## Installation

### macOS 
`gk` is available from [Homebrew][brew] and [MacPorts][macports] with the following command:

Homebrew:
```bash
brew install gitkraken-cli
```

MacPorts:
```bash
sudo port install gk
```

Or download it from the [releases page][] and add it to your binaries folder:

```bash
mv ~/Downloads/gk /usr/local/bin/gk
``` 
______
### Unix / Ubuntu
`gk` is available as a downloadable binary from the [releases page][]. Once you have it, add it to your binaries folder:

```bash
mv ~/Downloads/gk /usr/local/bin/gk
``` 

Or create a new directory, move the binary and add it to $PATH:
```bash
mkdir "$HOME/cli"
mv ~/Downloads/gk "$HOME/cli"
export PATH="$HOME/gk:$PATH"
``` 

You can also [download][releases page] your corresponding package (`.dev`, `.rpm`) and install it with:

```bash
sudo apt install ./gk.deb
```
or 
```bash
sudo rpm -i ./gk.rpm
```
_____
### Windows
`gk` is available from [Winget][winget] with the following command:

```bash
winget install gitkraken.cli
```

You can also download it using [Chocolately][chocolately]:

```bash
choco install gkcli
```

Or download the binary from the [releases page][] and place the `gk.exe` in a desired folder.
Then edit your environment variables to add it to your PATH.

1. In Search, search for **Environment Variables**.
2. Click on the **Edit the system environment variables** result.
3. In the modal, click on the **Environment Variables...** button.
4. In the **System Variables** section, scroll until you find the **PATH** variable. Click on it.
    - If it doesn't exist, create a variable with the name **PATH**. 
5. Add the path to the `gk` binary at the end.

## Troubleshooting

### ```gk login``` freezes after authenticating in browser
This problem is due to the browser. Currently we know that Safari and Brave do not allow to respond to localhost through port 1314. To fix this, change your default browser or copy the URL before the redirect and open it in another browser.

### gk from Oh-My-Zsh
Oh-My-Zsh has ```gitk``` aliased as ```gk``` and that can create some problems. To fix this, type in your terminal:

```
unalias gk
```

## Examples
### 🤝 Create Workspaces to group repos
```
gk ws create
```
GitKraken workspaces associate groups of repos and set the context for helpful commands that can operate on, or get information for, multiple repos at once. There are two types of workspaces:
##### Local
Local Workspaces exist only on your machine.
##### Cloud
Cloud Workspaces are accessible on any machine, and can be connected to hosting and issue providers like GitHub and GitLab to get additional information about pull requests and issues. Share Cloud Workspaces with your team to improve onboarding with the ability to clone all repos at once. To enable this extra functionality, Cloud Workspaces require a free GitKraken account. We are continuing to evolve and improve GitKraken Workspaces and welcome any feedback.

<img width="486" alt="gk-ws-create-demo" src="https://user-images.githubusercontent.com/3358707/231017646-6401a751-b3ac-486d-8520-55c006843c9d.png">

#### Adding and locating repos
```
gk ws add-repo
```
This will add a new repo to a workspace either by path or remote URL.
```
gk ws locate
```
If you're accessing a Cloud Workspace for the first time, you might need to `locate` the local repos on your machine. Run this command in the directory where youre repos are located so `gk` knows where they are.
```
gk ws clone
```
You can also `clone` all repos in a Workspace at once into a single directory. This is helpful for onboarding when your team works on multiple repos.

### 🎬 Perform `git` actions on multiple repos at once
```
gk ws [action]
```
In any workspace, you can perform `git` operations like `fetch`, `pull`, `push`, and `checkout` across all repos in the workspace.

### 📋 Get pull requests and issues
```
gk provider add
```
Before fetching pull requests and issues, ensure that you have the appropriate provider (GitHub, GitLab, etc.) connected. This will open a browser to authenticate.

```
gk pr list
```
When a Cloud Workspace has a provider connected, you can list all pull requests and issues for repos in the workspace, and view details for a specific one.

<img width="612" alt="gk-pr-list-demo" src="https://user-images.githubusercontent.com/3358707/231019508-8923bb6e-7e33-4be1-8427-915ab97bca21.png">

```
gk pr view
```
Returns a list of all pull requests for all repos in a workspace. Type to search for a specific pull request and press `enter` to view details.

<img width="540" alt="gk-pr-view-demo" src="https://user-images.githubusercontent.com/3358707/231217076-0e01e129-454d-4d56-aeb0-5fb07d1686de.png">


### 📈 Pull Request Insights
```
gk ws insights
```
See the following metrics for all repositories in a Cloud Workspace. The default time period is 7 days, but can be increased to 14 days with any paid GitKraken license.
- Average Cycle Time
- Average Throughput
- Merge Rate
- Opened Pull Requests
- Merged Pull Requests
- Closed Pull Requests

<img width="323" alt="gk-ws-insights-demo" src="https://user-images.githubusercontent.com/3358707/231011050-77518483-874e-48c7-8de6-0834eb0cc312.png">

### ✨ Visual Commit Graph
```
gk ws graph
```
Open a visual graph of the repo in your current directory in either [GitKraken Client](https://www.gitkraken.com/git-client) or [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) in VS Code.


https://user-images.githubusercontent.com/3358707/231006608-18f3dca2-a67c-4e77-b1e2-f930828a0a02.mov



[documentation]: https://gitkraken.github.io/gk-cli/
[releases page]: https://github.com/gitkraken/gk-cli/releases/latest
[brew]: https://brew.sh/
[macports]: https://www.macports.org/
[winget]: https://github.com/microsoft/winget-cli
[chocolately]: https://community.chocolatey.org/packages/GKCLI
