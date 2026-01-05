#!/bin/sh

# NSPanel Pro Tools package manager script

echo "Z2M Package installer by Seaky v2.0"

PM_DIR="$(cd "$(dirname "$0")" && pwd)"

usage() {
	echo "Usage: pm.sh <install|uninstall> <source path> <target path> -d <option> -d <option>"
	exit 1
}

if [ $# -lt 2 ]
then
	echo "Not enough params"
	usage
fi

command=$1
shift 1

config_script=$PM_DIR/pm_config.sh
utils_script=$PM_DIR/pm_utils.sh
if [ ! -e $config_script -o ! $utils_script ]
then
	echo "Unable to locate script dependencies"
	exit 1
fi

. $config_script
. $utils_script

# Function to stop processes regarding the pacakge
stop_package() {
	echo "stop_package"

	# --- custom stop code
	/data/data/com.termux/files/usr/bin/sh $PM_DIR/stop_package.sh
	sleep 5
}

# Function to start package
start_package() {
	echo "start_package"

	# --- custom start code
	/data/data/com.termux/files/usr/bin/sh $PM_DIR/start_package.sh
}

# Function to start package
start_stock_package() {
	echo "start_stock_package"

	# --- custom start code
	/data/data/com.termux/files/usr/bin/sh $PM_DIR/start_stock.sh
}

# Install package backup original folder
install() {
	stop_package

	if [ ! -d $PKG_PATH ]
	then
		echo "$PKG_PATH does not exist, creation"
		mkdir -p $PKG_PATH
	else 
		echo "$PKG_PATH already exist"
	fi

	if [ -f "$PKG_PATH/$version_file" ]; then
		if [ "$option_keep_data" = true ]; then
			echo "Option keep data found. Data folder will be saved."
			# archive data directory
			cp -a $PKG_PATH/data $PKG_ROOT/z2m_data_backup
		fi
		if [ "$option_keep_configuration" = true ]; then
			echo "Option keep configuration found. Config folder will be saved."
			# archive data directory
			cp -a $PKG_PATH/config $PKG_ROOT/z2m_config_backup
		fi
		purge_dir $PKG_PATH
	fi

	# --- custom installer code begin

	# --- backup cube service
	if [ ! -d "/data/data/com.termux/files/usr/var/service_off/cube" ]
	then
		echo "Turn off cube service"
		mkdir -p /data/data/com.termux/files/usr/var/service_off
		mv /data/data/com.termux/files/usr/var/service/cube /data/data/com.termux/files/usr/var/service_off
	else
		echo "Cube service is already turned off"
	fi

	# --- backup original mosquitto conf
	if [ ! -d "/data/data/com.termux/files/usr/etc/mosquitto/mosquitto.conf.nspanel_tools_backup" ]
	then
		echo "Backup original mosquitto configuration to mosquitto.conf.nspanel_tools_backup"
		mv /data/data/com.termux/files/usr/etc/mosquitto/mosquitto.conf /data/data/com.termux/files/usr/etc/mosquitto/mosquitto.conf.nspanel_tools_backup
	else
		echo "Mosquitto configuration backup was already made"
	fi	

	# --- install package
	scopy $source_dir $PKG_PATH nodejs pm service

	# --- install z2m pm2 runner
	mkdir -p $PKG_PATH/pm2
	scopy $source_dir/pm4/pm2 $PKG_PATH/pm2

	# --- setup configuration
	mkdir -p $PKG_PATH/data
	ln -nsf $PKG_CONFIG/z2m_configuration.yaml $PKG_PATH/data/configuration.yaml
	ln -nsf $PKG_CONFIG/mosquitto.conf /data/data/com.termux/files/usr/etc/mosquitto/mosquitto.conf

	# --- restore data and config
	if [ "$option_keep_data" = true ]; then
		echo "Restore saved data folder"
		# restore data directoy
		cp -a $PKG_ROOT/z2m_data_backup/* $PKG_PATH/data
		rm -rf $PKG_ROOT/z2m_data_backup
	fi
	if [ "$option_keep_configuration" = true ]; then
		echo "Restore saved config folder"
		# restore config directoy
		cp -a $PKG_ROOT/z2m_config_backup/* $PKG_PATH/config
		rm -rf $PKG_ROOT/z2m_config_backup
	fi

	# --- install service
	chmod -R 777 $PKG_ROOT
	chown -R shell:shell $PKG_ROOT
	scopy $source_dir/pm4/service $TERMUX_PREFIX/var/service
	mkdir -p /data/data/com.termux/files/usr/var/service/z2m/log
	ln -nsf /data/data/com.termux/files/usr/share/termux-services/svlogger /data/data/com.termux/files/usr/var/service/z2m/log/run
	chmod -R 777 $TERMUX_PREFIX/var/service/z2m

 	start_package
}


# Restore original folder
uninstall() {
	if [ -f "$source_dir/$version_file" ]; then
		stop_package
		rm -rf $TERMUX_PREFIX/var/service/z2m
		mv /data/data/com.termux/files/usr/etc/mosquitto/mosquitto.conf.nspanel_tools_backup /data/data/com.termux/files/usr/etc/mosquitto/mosquitto.conf
        mv /data/data/com.termux/files/usr/var/service_off/cube /data/data/com.termux/files/usr/var/service
		start_stock_package
		rm -rf $PKG_PATH
	else
		echo "There is no version file, unable to restore."
		exit 1
	fi
}

proc_opts() {
	options=""
	while [ $# -gt 0 ]; do
		case "$1" in
			-d)
				if [ -n "$2" ]; then
					options="$options $2"
					shift
				else
					echo "Error: Missing parameter for -d option" >&2
					usage
				fi
				;;
			-*)
				echo "Error: Unknown option: $1" >&2
				usage
				;;
			*)
				echo "Error: Unknown parameter: $1" >&2
				usage
				;;
		esac
		shift
	done
	for option in $options; do
		if [ "$option" = "keep_data" ]; then
			option_keep_data=true
		elif [ "$option" = "keep_configuration" ]; then
			option_keep_configuration=true
		fi
	done
}

# Entry point
version_file=$PKG_VERSION_FILE

case "$command" in
	install)
		if [ $# -lt 2 ]; then
			echo "not enough path parameter specified"
			usage
		fi

		source_dir=$1
		shift 1

		if [ ! -d $source_dir ]
		then
			echo "Source dir does not exist: $source_dir"
			exit 1
		fi
		
		target_dir=$1
		shift 1

		proc_opts $@
		install
		;;
	uninstall)
		source_dir=$1
		shift 1

		if [ ! -d $source_dir ]
		then
			echo "Source dir does not exist: $source_dir"
			exit 1
		fi

		uninstall
		;;
	*)
		echo "Unknown command: $1"
		echo "Usage: $0 <install|uninstall> <target path> <source path>"
		exit 1
		;;

esac

echo "Operation finished succesfully."
