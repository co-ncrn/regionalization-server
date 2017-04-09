#!/bin/sh
export NODE_ENV=production
export PATH=/usr/local/bin:$PATH
forever stopall
<<<<<<< HEAD
cd /home/omundy/regionalization-server/ && forever start ./index.js > /dev/null

=======
cd /home/omundy/regionalization-server/ && forever start ./index.js > /dev/null
>>>>>>> 720a749cd931b572ce6d1e4f451902bc1035f9f0
