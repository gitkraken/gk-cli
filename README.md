# 🚀 GitKraken CLI

`gk` is GitKraken on the command line. The core functionality is focused on a "Unit of Work" model. This allows you to work with multiple repos at once and get the same UX as if you were in a monorepo. We also provide robust AI-powered commit messages and Pull Request generation (coming soon).

<p align="center">
<img src="https://user-images.githubusercontent.com/86774052/225326381-aaea81a3-9f19-4170-9e0b-2f42fac8edda.png" style="margin: 0 auto" />
</p>

GitKraken CLI is available on macOS, Windows and Unix systems.

## 📚 Documentation

The documentation is currently limited to using the help command from the CLI itself: `gk help`

```bash

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

- `gk patch view` - preview the changes of a Cloud Patch
- `gk patch list` - list all your Cloud Patches
- `gk patch delete` - delete a Cloud Patch

### Self-Hosting Cloud Patch data

If you do not want your Cloud Patch data stored on GitKraken Servers, we offer the ability for you to host Cloud Patches on your own AWS S3 storage instance. For more information on configuring this, see our documentation [here](https://help.gitkraken.com/gk-dev/gk-dev-home/#self-hosted).

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
