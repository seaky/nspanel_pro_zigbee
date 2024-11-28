#!/bin/sh

function stop_zgateway() {
    echo "stop_zgateway"
    pkill -9 -f "sh /vendor/bin/siliconlabs_host/guard_process.sh"
    killall zgateway
    killall mosquitto
}

function start_zgateway() {
    echo "start_zgateway"
    sh /vendor/bin/siliconlabs_host/run.sh > /dev/null & 
}

# super copy function able to exclude directories
#   param1: source dir
#   param2: target dir
#   param_n: exclude dir
function scopy() {
    local src_dir="$1"        
    local dest_dir="$2"       
    echo "Copy $src_dir to $dest_dir"
    if [ "$#" -gt 2 ]; then
        shift 2         
        local exclude_dirs="$@"    

        if [ ! -d "$src_dir" ]; then
            echo "Error: Source direcotry does not exist: $src_dir" >&2
            return 1
        fi

        mkdir -p "$dest_dir"

        find "$src_dir" -mindepth 1 -maxdepth 1 | while IFS= read -r item; do
            skip=0
            for exclude_dir in $exclude_dirs; do
                if [ "$item" = "$src_dir/$exclude_dir" ]; then
                    skip=1
                    break
                fi
            done

            # Ha az elem nem kizárt, másold át
            if [ $skip -eq 0 ]; then
                cp -r "$item" "$dest_dir/"
            else
                echo "Directory $item skipped"
            fi
        done
    else 
        cp -r "$src_dir"/* "$dest_dir/"
    fi
}

#
function purge_dir() {
    echo "Clean up target dir: $1"
    rm -rf "$1"/*
}

# install package backup original folder
function install() {
    stop_zgateway
    if [ -f "$target_dir/$version_file" ]; then
        purge_dir $target_dir
    else
        echo "No version file found. Backup target dir."
        if [ ! -d "$backup_dir" ]; then
            mkdir "$backup_dir"
            scopy $target_dir $backup_dir
            purge_dir $target_dir
            #cp -r "$target_dir"/* "$backup_dir/"
        else
            echo "Ups... Backup dir already exist: $backup_dir"
        fi
    fi
    #cp -r "$source_dir"/* "$target_dir/"
    scopy $source_dir $target_dir

    chmod -R 755 "$target_dir"
    chown -R root:shell "$target_dir"
    
    start_zgateway
}

# restore original folder
function restore() {
    if [ -f "$target_dir/$version_file" ]; then
        if [ -d "$backup_dir" ]; then
            stop_zgateway
            echo "Restore backup to $target_dir"
            rm -rf $target_dir
            mv $backup_dir $target_dir
            start_zgateway
        else
            echo "Backup dir does not exist: $backup_dir"
            exit 1
        fi
    else
        echo "There is no version file, unable to restore."
        exit 1
    fi
}

# main
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <install|restore> <target path> <source path>"
    exit 1
fi

version_file="zgateway_version"

command=$1
target_dir=$2
backup_dir="${target_dir}_original"

if [ "$command" == "install" ]; then
    source_dir=$3

    if [ ! -d "$source_dir" ]; then
        echo "Source dir does not exist: $source_dir"
        exit 1
    fi

    if [ ! -d "$target_dir" ]; then
        echo "Target dir does not exist: $target_dir"
        exit 1
    fi

    install
elif [ "$command" == "restore" ]; then
    restore
else
    echo "Unknown command: $command"
    echo "Usage: $0 <install|restore> <target path> <source path>"
    exit 1
fi

echo "Operation finished succesfully."