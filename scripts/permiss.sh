#!/bin/bash

OWNER=$(ls -ld /var/run/docker.sock | awk '{print $3}')
ME=$(whoami)

if [ $OWNER = $ME ]
then
    exit 0
else 
    exit $(sudo chown $ME:$ME /var/run/docker.sock)
fi