#!/usr/bin/env bash

set -e

dir=$(dirname "$0")
echo -e 'WELCOME TO UBUTV!\nSEARCHING FOR VIDEOS...'

"$dir"/ubutv.mjs 2>&1 |
  while read -r line
  do
    echo -e "$(date -Iseconds) $line" >> "$dir"/ubutv.log
  done
