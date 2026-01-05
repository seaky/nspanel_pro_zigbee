#!/bin/sh

echo "Run V1 pm script"
BASEDIR="$2"
PM_SCRIPT="$BASEDIR/pm/pm.sh"

if [ ! -f "$PM_SCRIPT" ]; then
    echo "/pm/pm.sh not found: $PM_SCRIPT" >&2
    exit 1
fi
echo "Detected pm file location is $PM_SCRIPT"
sh "$PM_SCRIPT" $@

