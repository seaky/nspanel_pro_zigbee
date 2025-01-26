#!/bin/bash

. /vendor/bin/siliconlabs_host/pm_config.sh
. /vendor/bin/siliconlabs_host/pm_utils.sh

stop() {
    pkill -f "node $PKG_PATH/z2m/index.js"
    sleep 5
}

start() {
    echo "start $PKG_NAME gateway"

    stop

    export LD_LIBRARY_PATH=$PKG_PATH/nodejs/lib/
    #export ZIGBEE2MQTT_CONFIG=$PKG_CONFIG/z2m_configuration.yaml
    cp $PKG_CONFIG/z2m_configuration.yaml $PKG_PATH/data/configuration.yaml
    export ZIGBEE2MQTT_DATA=$PKG_PATH/data

    $PKG_PATH/nodejs/bin/node $PKG_PATH/z2m/index.js > $PKG_PATH/run_z2m.log 2>&1 &
}

handle_start_stop_command $1