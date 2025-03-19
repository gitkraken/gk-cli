# 🚀 GitKraken CLI

`gk` is GitKraken on the command line. The core functionality is focused on "Work Items" which can be thought of as the feature or issue you are tryiong to tackle. This allows you to work with multiple repos at once and get the same UX as if you were in a monorepo. We also provide robust AI-powered commit messages and Pull Request generation.

GitKraken CLI is available on macOS, Windows, and Unix systems.

## Table of Contents

- [Documentation](#documentation)
- [Workflows](#workflows)
- [`git` Command Passthrough](#git-command-passthrough)
- [Installation](#installation)
- [Troubleshooting](#troubleshooting)

## Documentation

`gk help` is going to be your best source for exploring the CLI. But also see the [workflows](#workflows) below.

```bash
Welcome to GitKraken CLI, a premium CLI experience for managing multiple repositories with familiar GIT CLI commands

Usage:
  gk [flags]
  gk [command]

AUTHENTICATING
  auth         Authenticate with the GitKraken platform
  provider     Add or remove provider tokens

CORE COMMANDS
  graph        Display commit graph in current repository
  issue        Manage your issues
  organization Manage your Gitkraken organizations
  work         Interact with your work.
  workspace    Interact with your workspaces. Alias: 'ws'

Additional Commands:
  help         Help about any command
  setup        Print the version number of GK CLI
  version      Print the version number of GK CLI

Flags:
  -h, --help   help for gk

Use "gk [command] --help" for more information about a command.
```

## Workflows

Start with a single repo. You can add more later.

In general, your process will look like this:

```bash

# Authenticate
gk auth login

# Navigate to a git repo directory on your filesystem
cd ./path/to/repo

# Then create a Work Item and the current directory
# will be automatically added to the Work Item
gk work create "My new work item"

# Edit files...
# ...

# Commit your changes using AI
gk work commit --ai

# Push your changes
gk work push

# Create a Pull Request
gk work pr --ai

```

Once you have familiarized yourself with using a single repo, try out creating work items and generating commits and PRs for multiple repos at a time by just adding multiple repos to a new Work Item.

```bash
# Add a repo to the current work item
gk work add ./path/to/repo # path could be as simple as "." if you are in the directory already
```

## `git` Command Passthrough

You can also use `gk` to pass through any `git` command. eg:

```bash
gk status
gk remote -v
# etc
```

## Installation

All binaries can be found on the [releases page][]. Make sure you select the binary for your OS(Linux/Mac/Windows) and CPU architecture (arm64/x86_64/i386).

### macOS

Download it from the [releases page][], unzip it, and add it to your binaries folder:

```bash
mv ~/Downloads/gk /usr/local/bin/gk
```

---

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

---

### Windows

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

## Troubleshooting

### `gk login` freezes after authenticating in browser

This problem is due to the browser. Currently we know that Safari and Brave do not allow to respond to localhost through port 1314. To fix this, change your default browser or copy the URL before the redirect and open it in another browser.

### gk from Oh-My-Zsh

Oh-My-Zsh has `gitk` aliased as `gk` and that can create some problems. To fix this, type in your terminal:

```
unalias gk
```

## Support

If you encounter any bugs, please submit them to our [Support Portal](https://help.gitkraken.com/gitkraken-desktop/contact-support/).

General feedback can be submitted via the "#ambassadors" channel in the [GitKraken Community Slack](https://gitkraken.com/slack) as well as via this Google Form.

## Appendix

### gkcli-update-profile.ps1

> Note: the installer script creates a self-signed certificate and adds it to the trusted root.

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
