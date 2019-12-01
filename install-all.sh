#!/usr/bin/env bash
for d in ./packages/* ; do
  if [[ -d "$d" && -f "$d/package.json" ]]; then
    echo "$(tput setaf 2)installing $d$(tput sgr0)"
    cd "$d"
    npm install
    cd ../..
  fi
done
