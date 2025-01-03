#!/bin/bash

# Sonoff NSPanel Pro starts this script at restart

echo "------------- ZGateway Host run-------------------------"
LOCAL_TIME=$(date +"%Y-%m-%d %H:%M:%S")
echo $LOCAL_TIME 'Z2M Host, start' > /vendor/run.log 

sh /vendor/bin/siliconlabs_host/run_guard_process.sh
