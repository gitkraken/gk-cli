# 🚀 GitKraken CLI

`gk` is GitKraken on the command line. It brings workspaces, pull requests, issues and other GitKraken perks to the terminal for you to work with it along with your code and `git`.

<!-- TODO: replace with a GIF or a screenshot of a cool gk feature -->
<p align="center">
<img src="https://user-images.githubusercontent.com/86774052/225326381-aaea81a3-9f19-4170-9e0b-2f42fac8edda.png" style="margin: 0 auto" />
</p>

GitKraken CLI is available on macOS, Windows and Unix systems.

## 📚 Documentation

Check out the [installation section below](#installation). For command usage [see the docs][documentation].

<!-- this is an anchor, do not rename -->
## Installation

`gk` is available as a downloadable binary from the [releases page][].

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

## Examples
#### Create Workspaces to group repos
```
gk ws create
```
GitKraken workspaces associate groups of repos and set the context for helpful commands that can operate on, or get information for, multiple repos at once. There are two types of workspaces:
##### Local
Local Workspaces exist only on your machine.
##### Cloud
Cloud Workspaces are accessible on any machine, and can be connected to hosting and issue providers like GitHub and GitLab to get additional information about pull requests and issues. Share Cloud Workspaces with your team to improve onboarding with the ability to clone all repos at once. To enable this extra functionality, Cloud Workspaces require a free GitKraken account. We are continuing to evolve and improve GitKraken Workspaces and welcome any feedback.

<img width="486" alt="gk-ws-create-demo" src="https://user-images.githubusercontent.com/3358707/231017646-6401a751-b3ac-486d-8520-55c006843c9d.png">

#### Get pull requests and issues
```
gk pr list
```
When a Cloud Workspace has a provider connected, you can list all pull requests and issues for repos in the workspace, and view details for a specific one.

<img width="612" alt="gk-pr-list-demo" src="https://user-images.githubusercontent.com/3358707/231019508-8923bb6e-7e33-4be1-8427-915ab97bca21.png">


#### 📈 Pull Request Insights
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

#### ✨ Visual Commit Graph
```
gk ws graph
```
Open a visual graph of the repo in your current directory in either [GitKraken Client](https://www.gitkraken.com/git-client) or [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) in VS Code.


https://user-images.githubusercontent.com/3358707/231006608-18f3dca2-a67c-4e77-b1e2-f930828a0a02.mov



[documentation]: https://gitkraken.github.io/gk-cli/
[releases page]: https://github.com/gitkraken/gk-cli/releases/latest
