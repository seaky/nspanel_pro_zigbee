#!/bin/sh

export LD_LIBRARY_PATH=/vendor/bin/siliconlabs_host/:${LD_LIBRARY_PATH}

cp -r /vendor/bin/siliconlabs_host/libmosquitto.so.1 /vendor/lib
cp -r /vendor/bin/siliconlabs_host/libcrypto.so.1.1 /vendor/lib
cp -r /vendor/bin/siliconlabs_host/libssl.so.1.1 /vendor/lib
cp -r /vendor/bin/siliconlabs_host/mosquitto_pub /system/bin
cp -r /vendor/bin/siliconlabs_host/mosquitto_sub /system/bin

/vendor/bin/siliconlabs_host/mosquitto_pub -t "gw/factoryTest" -q 2 -m "{\"commands\":\"FactoryTest\"}" -i factory_Test

res=$(/vendor/bin/siliconlabs_host/mosquitto_sub -h "localhost" -t "gw/factoryTest" -i factory_Test -C 1)
echo "$res"

exit 0



