$ErrorActionPreference = "Stop"

$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

$failures = [System.Collections.Generic.List[string]]::new()

function Add-Failure($message) {
    $failures.Add($message)
}

# Check every local HTML reference against the file that contains it.
# (templates/ holds reference-only material dropped in for design lookup, not deployed site content.)
$htmlFiles = Get-ChildItem -Recurse -File -Filter *.html | Where-Object { $_.FullName -notmatch '\\templates\\' }
foreach ($file in $htmlFiles) {
    $matches = Select-String -Path $file.FullName -Pattern '(?:href|src)=["'']([^"''#?]+)' -AllMatches
    foreach ($line in $matches) {
        foreach ($match in $line.Matches) {
            $reference = $match.Groups[1].Value
            if ($reference -match '^(https?:|mailto:|tel:|javascript:|data:|//|\$|\{)') {
                continue
            }

            if ($reference -eq "auth-config.js") {
                continue
            }

            $target = Join-Path $file.DirectoryName $reference
            if (-not (Test-Path $target)) {
                Add-Failure "$($file.FullName):$($line.LineNumber) -> $reference"
            }
        }
    }
}

# Check imports in the storefront CSS manifest.
$manifest = Join-Path $root "css\storefront\style.css"
$imports = Get-Content $manifest | ForEach-Object {
    if ($_ -match '^@import url\("(.+)"\);$') {
        $Matches[1]
    }
}
foreach ($import in $imports) {
    if (-not (Test-Path (Join-Path (Split-Path $manifest -Parent) $import))) {
        Add-Failure "$manifest -> missing import $import"
    }
}

# Check JavaScript syntax with the installed Node.js runtime.
Get-ChildItem js,admin -Recurse -File -Filter *.js | ForEach-Object {
    node --check $_.FullName
    if ($LASTEXITCODE -ne 0) {
        Add-Failure "JavaScript syntax error: $($_.FullName)"
    }
}

# All storefront code must use the same cart storage key.
$oldCartKey = Select-String -Path js\shared\*.js,js\pages\*.js -Pattern 'afrigadgetsCart'
if ($oldCartKey) {
    Add-Failure "Old cart storage key found: afrigadgetsCart"
}

if ($failures.Count -gt 0) {
    $failures | ForEach-Object { Write-Error $_ }
    exit 1
}

Write-Output "Project validation passed."
