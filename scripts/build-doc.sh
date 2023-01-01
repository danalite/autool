#!/usr/bin/env sh

set -e
cd docs && yarn run docs:build
cd docs/.vuepress/dist

# Publish to custom domain
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# Publish to https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# Publish to https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:danalites/autoo.git master:gh-pages

cd -
