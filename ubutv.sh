#!/usr/bin/env bash

set -e

echo -e 'WELCOME TO UBUTV!\n\nSEARCHING FOR VIDEOS...'

./ubutv.mjs 2>&1 |
  while read line
  do
    echo -e "$(date -Iseconds) $line" >> ./ubutv.log
  done
