#!/usr/bin/env bash
echo copying "plugins" to "www" 
cp -r platforms/browser/platform_www/plugins www
echo fix "favicon"
rm platforms/browser/platform_www/favicon.ico
cp www/favicon.ico platforms/browser/platform_www