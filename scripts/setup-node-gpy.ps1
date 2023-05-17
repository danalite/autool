$path = "$env:LocalAppData\node-gyp\Cache"
if (Test-Path -LiteralPath $path) {
  Remove-Item -LiteralPath $path -Recurse -Verbose
} else {
  "Path doesn't exist: $path"
}

# https://github.com/nodejs/node-gyp/issues/1371#issuecomment-910729288

# Set the folder path to 16.19.1 cache
$folderPath = "$env:USERPROFILE\.node-gyp\16.19.1"
Write-Output $folderPath

# Create the folder if it doesn't exist
if (-not (Test-Path -Path $folderPath)) {
    New-Item -ItemType Directory -Path $folderPath | Out-Null
}

# Create the Release and src subfolders within the folder
New-Item -ItemType Directory -Path "$folderPath\Release" | Out-Null
New-Item -ItemType Directory -Path "$folderPath\src" | Out-Null

# Download node.lib and place it in the Release subfolder
Invoke-WebRequest -Uri "https://nodejs.org/download/release/v16.19.1/win-x64/node.lib" -OutFile "$folderPath\Release\node.lib"

# Download node headers.tar.gz
Invoke-WebRequest -Uri "https://nodejs.org/download/release/v16.19.1/node-v16.19.1-headers.tar.gz" -OutFile "$folderPath\node-v16.19.1-headers.tar.gz"

# Extract the .gypi files into the base folder
tar -xf "$folderPath\node-v16.19.1-headers.tar.gz" -C $folderPath

# Copy $folderPath\node-v16.19.1\include\node\*gypi to $folderPath
Copy-Item -Path "$folderPath\node-v16.19.1\include\node\*gypi" -Destination $folderPath

# Move $folderPath\node-v16.19.1\include\node\* to $folderPath\src
Move-Item -Path "$folderPath\node-v16.19.1\include\node\*" -Destination "$folderPath\src"