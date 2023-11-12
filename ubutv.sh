#!/usr/bin/env bash

set -e

echo -en 'WELCOME TO UBUTV!\n\nSEARCHING FOR VIDEOS...'

while true 
do 
  echo -n .
  sleep 10
done &

$HOME/Programming/ubutv/ubutv.mjs 2>&1 | 
  while read line 
  do 
    echo -e "$(date -Iseconds) $line" >> /tmp/ubutv.log
  done
