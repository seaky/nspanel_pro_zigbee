#!/bin/bash

echo "-------------Zigbee Host run-------------------------"
LOCAL_TIME=$(date +"%Y-%m-%d %H:%M:%S")
echo $LOCAL_TIME 'Zigbee Host, start' > /vendor/run.log 

export LD_LIBRARY_PATH=/data/local/tmp/nspanel_tools_pkg/nodejs/lib/:${LD_LIBRARY_PATH}
echo ${LD_LIBRARY_PATH}

/data/local/tmp/nspanel_tools_pkg/nodejs/bin/node /data/local/tmp/nspanel_tools_pkg/z2m/index.js