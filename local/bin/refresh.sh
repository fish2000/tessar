#!/usr/bin/env bash

host="localhost"
port="8000"

if [ ! -d /System ]; then
    host="162.242.210.219"
    port="80"
fi

user="fish"
path="/admin/tika/document/"
session="REFRESH"

URL="http://${host}:${port}${path}"
SESSION_JSON="$(echo ~)/.httpie/sessions/${host}_${port}/${session}.json"


sleep 5

http --session $session GET $URL > /dev/null

CSRFTOKEN=`${VIRTUAL_ENV}/bin/node -e \
        "console.log(JSON.parse(\
            require('fs').readFileSync('${SESSION_JSON}',
                { 'encoding': 'UTF-8' })).cookies.csrftoken.value);"`

PASSWORD=$(cat ${VIRTUAL_ENV}/.password)

echo "+ URL: ${URL}"
echo "+ CSRFTOKEN: ${CSRFTOKEN}"
echo "+ PASSWORD: ${PASSWORD}"

http --form --follow --session $session POST $URL this_is_the_login_form=1 username=$user password=$PASSWORD next=$path csrfmiddlewaretoken=$CSRFTOKEN > /dev/null

#http --session $session --headers GET $URL
http --session $session --headers GET $URL | grep "200 OK"

return 0
exit 0