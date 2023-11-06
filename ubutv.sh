#!/usr/bin/env bash

set -e

./ubutv.mjs | 
  while read line 
    do echo -e "$(date -Iseconds) $line" >> /tmp/ubutv.log
  done
