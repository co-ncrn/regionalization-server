#!/bin/sh
export NODE_ENV=production
export PATH=/usr/local/bin:$PATH
forever stopall
forever start /home/omundy/regionalization-server/index.js > /dev/null
