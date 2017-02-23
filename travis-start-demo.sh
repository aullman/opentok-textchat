#!/bin/bash

OUTFILE=/tmp/start-output$RANDOM.txt

npm install
npm start > $OUTFILE &
sleep 1
while ! grep -m1 'Hit CTRL-C to stop the server' < $OUTFILE; do
  sleep 1
done
echo "Server started"
