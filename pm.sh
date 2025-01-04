#!/bin/sh

# NSPanel Pro Tools package manager script

echo "Package installer by Seaky v1.0"

if [ $# -lt 2 ]
then
    echo "Not enough params"
    echo "Usage: pm.sh <install|uninstall> <source path> <target path>"
    exit 1
fi

source_dir=$2
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
        purge_dir $PKG_PATH
    else
        echo "No version file found. Backup target dir."
        backup_dir="${target_dir}_original"
        backup_dir $target_dir $backup_dir
    fi

    # --- custom installer code begin
    scopy $source_dir $target_dir config

    chmod -R 755 "$target_dir"
    chown -R root:shell "$target_dir"

    mkdir -p $PKG_PATH/config
    scopy $source_dir/config $PKG_PATH/config
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

# Entry point
echo "for $PKG_NAME package"

version_file=$PKG_VERSION_FILE

case "$1" in
    install)
        target_dir=$3

        if [ ! -d "$target_dir" ]; then
            echo "Target dir does not exist: $target_dir"
            exit 1
        fi

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