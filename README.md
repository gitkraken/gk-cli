# 🚀 GitKraken CLI

`gk` is GitKraken on the command line. It makes working across multiple repos easier with Workspaces, provides access to pull requests and issues from multiple services (GitHub, GitLab, Bitbucket, etc.), and seamlessly connects with [GitKraken Desktop](https://www.gitkraken.com/git-client) and [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) in VS Code to visualize `git` information when you need it.

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

You can also [download][releases page] your corresponding package (`.deb`, `.rpm`) and install it with:

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

You can also download it using [Chocolatey][chocolatey]:

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


## ⚙️ Configuration
### Nerd Fonts
The GitKraken CLI supports Nerd Fonts to display icons for some commands. To ensure correct icon rendering, please obtain and install a Nerd Font available at https://www.nerdfonts.com/. After installation, set the selected Nerd Font as the default font for your terminal.

## Troubleshooting

### ```gk login``` freezes after authenticating in browser
This problem is due to the browser. Currently we know that Safari and Brave do not allow to respond to localhost through port 1314. To fix this, change your default browser or copy the URL before the redirect and open it in another browser.

### gk from Oh-My-Zsh
Oh-My-Zsh has ```gitk``` aliased as ```gk``` and that can create some problems. To fix this, type in your terminal:

```
unalias gk
```

## Cloud Patches

### What are Cloud Patches and why would you want to use them

A Cloud Patch is a Git patch that GitKraken securely stores for you so it can be easily shared with others across the GitKraken CLI, GitKraken Desktop, and GitLens. The patch is directly transferred from your machine into secure storage. 

Cloud Patches allow the ability to engage early with your team before a pull request. They can be created as soon as you have a work in progress. This can help with collaborating on changes prior to a pull request and minimize the delay of pull request reviews.

### How to setup Cloud Patches 

Cloud Patches are enabled in the GitKraken CLI by default. 

### How to work with Cloud Patches

To work with Cloud Patches, use `gk patch [command]`. You can run `gk patch` to see all options offered and what they do.

![gk-cli-gk-patch.png](/.github/images/gk-cli-gk-patch.png)

To create a Cloud Patch, run `gk patch create`. You will be prompted to provide information about the patch and what it should be created from. You have the following sharing options:

- `Public`: Anyone that you share the public link with will be able to work with the Cloud Patch.

- `Invite Only`: Only users in the GitKraken Organization who have been selected when sharing will be able to work with the Cloud Patch. They will be required to authenticate with a GitKraken account to access it.

- `Private`: Anyone in the GitKraken Organization will be able to work with the Cloud Patch. They will be required to authenticate with a GitKraken account to access it.

Once the process is completed, you will be provided with a link that can be used by yourself or others to open the cloud patch in GitKraken Desktop or GitLens. From there, the patch can be applied in either to work with those changes. To apply a Cloud Patch at a later time to the current repository, you can run `gk patch apply`.

![gk-cli-gk-patch.png](/.github/images/gk-cli-patch-create-example.gif)

Cloud Patches can be viewed from URLs shared to you and they can be applied to your working tree or to a new or existing branch. Simply select or open the link and then follow the prompts within GitLens or GitKraken Desktop to apply the Cloud Patch.

![gkc-apply-cloud-patch-example.gif](/.github/images/gkc-apply-cloud-patch-example.gif)

Here are some other helpful commands to be used with Cloud Patches:

* `gk patch view` - preview the changes of a Cloud Patch
* `gk patch list` - list all your Cloud Patches
* `gk patch delete` - delete a Cloud Patch

### Self-Hosting Cloud Patch data

If you do not want your Cloud Patch data stored on GitKraken Servers, we offer the ability for you to host Cloud Patches on your own AWS S3 storage instance. For more information on configuring this, see our documentation [here](https://help.gitkraken.com/gk-dev/gk-dev-home/#self-hosted).

***

## Code Suggest

GitKraken Code Suggest simplifies code review by allowing you to make suggestions and edits across the entire project, not just on the lines that were changed, within GitLens, GitKraken Desktop, and gitkraken.dev. When a Pull Request is open, you can make suggestions to the pull request that others can then review and accept to include in the pull request. 

![cli-code-suggest.png](/.github/images/cli-code-suggest.png)

To start, navigate (`cd`) to a repository with an open pull request. Then, check out the branch with the open pull request (`git checkout branch-name`). Next, begin making the desired changes locally that you would like to include as suggestions. The [Launchpad](#-launchpad) can quickly help you see open pull requests, check out branches, and begin working. 

Once you are ready to suggest the changes, run `gk pr suggest`, 

![cli-code-suggest.png](/.github/images/cli-create-code-suggestion.gif)

This will include a comment on the pull request with two options: you can select _Code Suggestion for #PR_ to open the suggestion in gitkraken.dev or select _locally on your machine_ to open the suggestion in GitKraken or GitLens.

![gl-code-suggest-comment.png](/.github/images/gl-code-suggest-comment.png)

When selecting the _Code Suggestion for #PR_ you will be taken to gitkraken.dev to review and accept the changes. Here, you can review the changes by selecting each file and once you are ready, you can select _Commit Suggestions_. This will create a new commit on the remote for the existing branch (shown under _COMMIT SUGGESTIONS TO_). 

![gl-accept-code-suggestion.gif](/.github/images/gl-accept-code-suggestion.gif)

When selecting _locally on your machine_ you can open them on GitLens or GitKraken Desktop. Here, you can review the changes by selecting each file and once you are ready, you can select _Apply_ to apply to the branch you currently have checked out or select the dropdown and then _Apply to a Branch_ to apply to a new branch or select an existing branch. This will apply the patch locally. 

![gl-accept-code-suggestion-from-gl.gif](/.github/images/gl-accept-code-suggestion-from-gl.gif)

## Examples

### 🎯 Launchpad

```
gk launchpad
```

GitKraken Launchpad is a unified dashboard that consolidates PRs, Issues, and WIPs across all of the repositories in a [Cloud Workspace](/cli/cli-home/#create-workspaces-to-group-repos). You can view the details of any item and take action on your most important tasks.

<img src="/wp-content/uploads/cli-launchpad.png" class="img-responsive center img-bordered">

#### Pin items to keep them at the top of your list
Use the shortcut <kbd>p</kbd> to pin any PR or Issue to the top of the list. You can unpin an item by using the same shortcut on any pinned item.
#### Snooze items to save them for later
Use the shortcut <kbd>s</kbd> to snooze any PR or Issue, removing them from the list of items. You can view snoozed items by navigating to the `Snoozed` tab in the Launchpad. You can unsnooze items and bring them back into your Launchpad lists by using the same shortcut on any snoozed item.

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
Open a visual graph of the repo in your current directory in either [GitKraken Desktop](https://www.gitkraken.com/git-client) or [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) in VS Code.


https://user-images.githubusercontent.com/3358707/231006608-18f3dca2-a67c-4e77-b1e2-f930828a0a02.mov



[documentation]: https://gitkraken.github.io/gk-cli/
[releases page]: https://github.com/gitkraken/gk-cli/releases/latest
[brew]: https://brew.sh/
[macports]: https://www.macports.org/
[winget]: https://github.com/microsoft/winget-cli
[chocolatey]: https://community.chocolatey.org/packages/GKCLI
