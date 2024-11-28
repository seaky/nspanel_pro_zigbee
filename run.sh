#!/bin/bash

echo "-------------Zigbee Host run-------------------------"
LOCAL_TIME=$(date +"%Y-%m-%d %H:%M:%S")
echo $LOCAL_TIME 'Zigbee Host, start' > /vendor/run.log 

export LD_LIBRARY_PATH=/vendor/bin/siliconlabs_host/:${LD_LIBRARY_PATH}
echo ${LD_LIBRARY_PATH}

#检查是否需要拷贝
if [ ! -d "/data/vendor/siliconlabs_host" ]; then
	echo "cp oem..."
	mkdir /data/vendor/siliconlabs_host
	chmod 777 /data/vendor/siliconlabs_host
	echo $LOCAL_TIME 'Zigbee Host, start' > /data/vendor/run.log
	# cp -r /vendor/bin/siliconlabs_host/* /oem/siliconlabs_host/
else
	echo "file exist"
fi 

# sleep 1
# echo "copy libfreezgb.so"
# cp -r /vendor/bin/siliconlabs_host/libfreezgb.so /vendor/lib
# cp -r /vendor/bin/siliconlabs_host/libfreezgb.so /system/lib
# echo "copy libfreezgb.so"
# cp -r /vendor/bin/siliconlabs_host/libmosquitto.so.1 /vendor/lib
# cp -r /vendor/bin/siliconlabs_host/libmosquitto.so.1 /system/lib

# sleep 1

killall zgateway
# sleep 1
killall guard_process
killall mosquitto
sleep 1


echo $(pwd)
cd /vendor/bin/siliconlabs_host/
echo $(pwd)


#需要先启动MQTT 服务
/vendor/bin/siliconlabs_host/mosquitto -c /vendor/bin/siliconlabs_host/mosquitto.conf &

sleep 3

#在终端打印整个运行日志
/vendor/bin/siliconlabs_host/zgateway &


sh /vendor/bin/siliconlabs_host/guard_process.sh &

