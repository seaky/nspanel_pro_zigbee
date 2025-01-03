#!/bin/sh

# param1: process name
wait_for_kill() {
    local _proc=1
    local _wait_cnt=0
    while [ $_proc -gt 0 ]
    do
        _proc=`ps -ef | grep -w '$1' | grep -v "grep" | wc -l`
        _wait_cnt=$(( _wait_cnt + 1 ))
        if [ _wait_cnt -eq 10 ]
        then
            _proc=0
        else
            sleep 5
        fi
    done
}

# Super copy function is able to exclude directories.
# 
# param #1: source dir
# param #2: target dir
# param #n: exclude dir
scopy() {
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

# Cleans up entire directory
# 
# param #1: dir
purge_dir() {
    echo "Clean up dir: $1"
    rm -rf "$1"/*
}

# Backup source directory to target dir
# 
# param #1: directory to backup
# param #2: backup directory
backup_dir() {
    if [ ! -d "$2" ]; then
        mkdir "$2"
        scopy $1 $2
        purge_dir $1
    else
        echo "Ups... Backup dir already exist: $2"
        echo "No backup was made"
    fi
}

# Handle stoppable script commands
handle_start_stop_command() {
    command=$1
    if [ "$command" == "stop" ]; then
        stop
    else
        start
    fi    
}
