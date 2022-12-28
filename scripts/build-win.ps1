$paths = '.\pyenv', '.\dist', '.\dist_electron', '.\release', '.\build'
foreach ($path in $paths) {
    if (Test-Path -LiteralPath $path) {
      Remove-Item -LiteralPath $path -Recurse # -Verbose -WhatIf
    } else {
      "Path doesn't exist: $path"
    }
}

yarn run init
yarn run build-py
yarn run electron:build

