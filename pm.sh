#!/bin/sh

# NSPanel Pro Tools package manager script

version="1.1"
echo "Package installer by Seaky v$version"

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
source_dir=$2
shift 2

if [ ! -d $source_dir ]
then
    echo "source path: $source_dir must be a directory"
    exit 1
fi

if [ ! -e $source_dir/pm_config.sh -o ! $source_dir/pm_utils.sh ]
then
    echo "Unable to locate script dependencies"
    exit 1
fi

. $source_dir/pm_config.sh
. $source_dir/pm_utils.sh

# Function to stop processes regarding the pacakge
stop_package() {
    echo "stop_package"

    # --- custom stop code
    pkill -9 -f "sh /vendor/bin/siliconlabs_host/guard_process.sh"
    killall zgateway
    pkill -f "node /data/local/nspanel_tools_pkg/z2m/z2m/index.js"
    killall mosquitto
    sleep 5
}

# Function to start package
start_package() {
    echo "start_package"

    # --- custom start code
    nohup sh /vendor/bin/siliconlabs_host/run.sh > /dev/null 2>&1 &
}

# Install package backup original folder
install() {
    stop_package

    if [ -f "$target_dir/$version_file" ]; then
        purge_dir $target_dir
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
    else
        echo "No version file found. Backup target dir."
        backup_dir="${target_dir}_original"
        backup_dir $target_dir $backup_dir
    fi

    # --- custom installer code begin
    scopy $source_dir $target_dir z2m nodejs config

    chmod -R 755 "$target_dir"
    chown -R root:shell "$target_dir"

    mkdir -p $PKG_PATH/z2m
    mkdir -p $PKG_PATH/data
    mkdir -p $PKG_PATH/nodejs
    mkdir -p $PKG_PATH/config
    scopy $source_dir/z2m $PKG_PATH/z2m
    scopy $source_dir/nodejs $PKG_PATH/nodejs
    scopy $source_dir/config $PKG_PATH/config

    chmod -R 755 $PKG_PATH/nodejs
    chown -R root:shell $PKG_PATH/nodejs
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
    # --- custom installer code end
    
    start_package
}

# Restore original folder
uninstall() {
    if [ -f "$source_dir/$version_file" ]; then
        backup_dir="${source_dir}_original"
        if [ -d "$backup_dir" ]; then
            stop_package
            echo "Restore backup to $source_dir"
            rm -rf $source_dir
            mv $backup_dir $source_dir
            start_package
        else
            echo "Backup dir does not exist: $backup_dir"
            exit 1
        fi
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
echo "for $PKG_NAME package"

version_file=$PKG_VERSION_FILE

case "$command" in
    install)
		if [ $# -lt 1 ]; then
			echo "no target path parameter specified"
			usage
		fi
		
		target_dir=$1
		shift 1

        if [ ! -d "$target_dir" ]; then
            echo "Target dir does not exist: $target_dir"
            exit 1
        fi
		
		proc_opts $@
        install
        ;;
    uninstall)
        uninstall
        ;;
    *)
        echo "Unknown command: $1"
        echo "Usage: $0 <install|uninstall> <target path> <source path>"
        exit 1
        ;;

esac

echo "Operation finished succesfully."