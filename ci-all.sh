#!/usr/bin/env bash
echo "$(tput setaf 2)installing lerna@^3.19.0$(tput sgr0)"
npm install lerna@^3.19.0 --no-save
for d in ./packages/* ; do
  if [[ -d "$d" && -f "$d/package.json" ]]; then
    echo "$(tput setaf 2)installing for CI $d$(tput sgr0)"
    cd "$d"
    npm ci
    cd ../..
  fi
done
