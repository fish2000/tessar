#!/bin/sh
# from the question http://stackoverflow.com/q/11092358/298171:
# This script is run by Supervisor to start PostgreSQL 9.1 in foreground mode

# budget hack; asking "are we deployed"
if [ ! -d /System ]; then
    echo "WE ARE DEPLOYED (`date`)"
    echo "Launching postgresql under supervisory control"
    
    if [ -d /var/run/postgresql ]; then
        chmod 2775 /var/run/postgresql
    else
        install -d -m 2775 -o postgres -g postgres /var/run/postgresql
    fi
    
    echo "Starting postgresql as user 'tessar'..."
    exec su tessar -c "/usr/lib/postgresql/9.1/bin/postgres -D /home/tessar/tessar -c config_file=/home/tessar/tessar/postgresql.conf"
fi