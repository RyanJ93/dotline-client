#!/bin/bash

cd /home/dotline-client && npm run webpack-prod
cp -r /home/dotline-client/public/* /usr/share/nginx/html
nginx -g 'daemon off;'
