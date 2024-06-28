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

[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/gitkraken-cli)

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

#### Optional Enable Auto Command Completion
To enable auto-completion for `gk` in PowerShell, follow these steps:

**Create and Save the Install Scripts**
Appendix section with script files:
- [gkcli-update-profile.ps1](#gkcli-update-profileps1)
- [gkcli-uninstall-profile.ps1](#gkcli-uninstall-profileps1)

##### Run the Installer Scripts
- Change to the directory where update-profile.ps1 is located
```sh
cd "C:\Path\To\gkcli-update-profile.ps1"
```

- Run the script to update the profile and sign the auto-completion script
```sh
.\gkcli-update-profile.ps1
```
- Restart PowerShell to apply the changes.

##### Run the Uninstall Script
 - Change to the directory where uninstall-profile.ps1 is located
```sh
cd "C:\Path\To\gkcli-uninstall-profile.ps1"
```

- Run the script to remove the auto-completion setup
```sh
.\gkcli-uninstall-profile.ps1
```

- Restart PowerShell to apply the changes.



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

### Themes
Customize your experience with the theme system. This feature allows you to create custom color schemes and adapt the interface to your preference in both light and dark environments.

#### Creating a custom theme
1. Navigate to the installation folder
2. Create a new JSON file inside the ```themes``` folder
3. Define colors using hexadecimal codes inside the new file. You can see all possible options in the default theme ```gk_theme.json```.

 - There are two possible options to define colors:

    ```
    "accent": {
        "dark": "93A9EC",
        "light": "93A9EC"
    }
    ```
    or
    
    ```
    "accent": "93A9EC"
    ```

4. Execute ```gk setting --theme NAME_OF_THE_NEW_FILE```
5. View the changes with ```gk setting theme```

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

When selecting _locally on your machine_ you can open them on [GitKraken Desktop](/gitkraken-client/pull-requests/#review-code-and-suggest-changes) or [GitLens](gitlens/gitlens-features/#code-suggest-preview). Here, you can review the changes by selecting each file and once you are ready, you can select _Apply_ to apply to the branch you currently have checked out or select the dropdown and then _Apply to a Branch_ to apply to a new branch or select an existing branch. This will apply the patch locally.

![gl-accept-code-suggestion-from-gl.gif](/.github/images/gl-accept-code-suggestion-from-gl.gif)

## Examples

### 🎯 Launchpad

```
gk launchpad
```

GitKraken Launchpad is a unified dashboard that consolidates PRs, Issues, and WIPs across all of the repositories in a [Cloud Workspace](/cli/cli-home/#create-workspaces-to-group-repos). You can view the details of any item and take action on your most important tasks.

![cli-launchpad.png](/.github/images/cli-launchpad.png)

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
gk graph
```
Open a visual graph of the repo in your current directory in either [GitKraken Desktop](https://www.gitkraken.com/git-client) or [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) in VS Code.


https://user-images.githubusercontent.com/3358707/231006608-18f3dca2-a67c-4e77-b1e2-f930828a0a02.mov



[documentation]: https://gitkraken.github.io/gk-cli/
[releases page]: https://github.com/gitkraken/gk-cli/releases/latest
[brew]: https://brew.sh/
[macports]: https://www.macports.org/
[winget]: https://github.com/microsoft/winget-cli
[chocolatey]: https://community.chocolatey.org/packages/GKCLI



## Appendix

### gkcli-update-profile.ps1
>Note: the installer script creates a self-signed certificate and adds it to the trusted root.

```sh
# gkcli-update-profile.ps1

function Test-Admin {
    $currentUser = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    $currentUser.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Admin)) {
    Write-Warning "This script requires elevation (run as administrator)."
    exit 1
}

$gkPath = (Get-Command gk).Source

$gkDir = Split-Path $gkPath

$completionScriptPath = Join-Path -Path $gkDir -ChildPath "completions\gk.ps1"

if (-Not (Test-Path -Path $completionScriptPath)) {
    Write-Error "The auto-completion script gk.ps1 could not be found at $completionScriptPath"
    exit 1
}

$signature = Get-AuthenticodeSignature -FilePath $completionScriptPath
if ($signature.Status -ne 'Valid') {
    Write-Host "The script is not signed. Creating a self-signed certificate and signing the script."

    # Create a self-signed certificate for script signing
    $cert = New-SelfSignedCertificate -DnsName "GitKrakenCLI" -Type CodeSigningCert -CertStoreLocation "Cert:\CurrentUser\My"

    # Export the certificate to a file
    $certPath = "$env:TEMP\GitKrakenCLI.cer"
    Export-Certificate -Cert $cert -FilePath $certPath

    # Import the certificate into Trusted Root Certification Authorities and Trusted Publishers
    Import-Certificate -FilePath $certPath -CertStoreLocation "Cert:\LocalMachine\Root" -ErrorAction Stop
    Import-Certificate -FilePath $certPath -CertStoreLocation "Cert:\LocalMachine\TrustedPublisher" -ErrorAction Stop

    # Sign the completion script with the certificate
    Set-AuthenticodeSignature -FilePath $completionScriptPath -Certificate $cert

    Write-Host "Script signed successfully and certificate added to Trusted Root Certification Authorities and Trusted Publishers."
} else {
    Write-Host "The script is already signed."
}

$profilePath = [System.Environment]::GetFolderPath('MyDocuments') + "\WindowsPowerShell\Microsoft.PowerShell_profile.ps1"

# Create the profile file if it doesn't exist
if (-Not (Test-Path -Path $profilePath)) {
    New-Item -ItemType File -Path $profilePath -Force
}

$content = Get-Content -Path $profilePath
if (-Not ($content -contains ". '$completionScriptPath'")) {
    Add-Content -Path $profilePath -Value "`n. '$completionScriptPath'"
    Write-Host "The PowerShell profile has been updated to source the auto-completion script."
} else {
    Write-Host "The PowerShell profile already sources the auto-completion script."
}

# Source the completion script in the current session
. $completionScriptPath

Write-Host "Auto-completion script sourced successfully. Please restart PowerShell to activate the changes."

```
### gkcli-uninstall-profile.ps1
```sh
# gkcli-uninstall-profile.ps1

function Test-Admin {
    $currentUser = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    $currentUser.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Admin)) {
    Write-Warning "This script requires elevation (run as administrator)."
    exit 1
}

$certSubjectName = "CN=GitKrakenCLI"

function Remove-Certificate {
    param (
        [string]$storeName,
        [string]$storeLocation,
        [string]$subjectName
    )
    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store($storeName, $storeLocation)
    $store.Open("ReadWrite")
    $certs = $store.Certificates | Where-Object { $_.Subject -eq $subjectName }
    if ($certs.Count -gt 0) {
        $store.Remove($certs)
        Write-Host "Removed certificate from $storeName."
    } else {
        Write-Host "Certificate not found in $storeName."
    }
    $store.Close()
}

Remove-Certificate -storeName "Root" -storeLocation "LocalMachine" -subjectName $certSubjectName
Remove-Certificate -storeName "TrustedPublisher" -storeLocation "LocalMachine" -subjectName $certSubjectName

$gkPath = (Get-Command gk).Source

$gkDir = Split-Path $gkPath

$completionScriptPath = Join-Path -Path $gkDir -ChildPath "completions\gk.ps1"

$profilePath = [System.Environment]::GetFolderPath('MyDocuments') + "\WindowsPowerShell\Microsoft.PowerShell_profile.ps1"
if (Test-Path -Path $profilePath) {
    $content = Get-Content -Path $profilePath
    $newContent = $content | Where-Object { $_ -notmatch [regex]::Escape(". '$completionScriptPath'") }
    Set-Content -Path $profilePath -Value $newContent
    Write-Host "Removed the auto-completion script sourcing line from the PowerShell profile."
} else {
    Write-Host "PowerShell profile not found."
}

Write-Host "Uninstallation complete. Please restart PowerShell to apply the changes."

```
