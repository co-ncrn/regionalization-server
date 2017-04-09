#!/bin/sh
export NODE_ENV=production
export PATH=/usr/local/bin:$PATH
forever stopall
cd /home/omundy/regionalization-server/ && forever start ./index.js > /dev/null

