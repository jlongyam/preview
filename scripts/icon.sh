#!/usr/bin/env bash

## -- android asset -- ##

# xxxhdpi
cp assets/image/android/res/mipmap-xxxhdpi/ic_launcher.png res/android/icon
mv res/android/icon/ic_launcher.png res/android/icon/xxxhdpi.png
# xxhdpi
cp assets/image/android/res/mipmap-xxhdpi/ic_launcher.png res/android/icon
mv res/android/icon/ic_launcher.png res/android/icon/xxhdpi.png
# xhdpi
cp assets/image/android/res/mipmap-xhdpi/ic_launcher.png res/android/icon
mv res/android/icon/ic_launcher.png res/android/icon/xhdpi.png
# ldpi
echo mising size for andrid - ldpi.png 
# mdpi
cp assets/image/android/res/mipmap-mdpi/ic_launcher.png res/android/icon
mv res/android/icon/ic_launcher.png res/android/icon/mdpi.png
# hdpi
cp assets/image/android/res/mipmap-hdpi/ic_launcher.png res/android/icon
mv res/android/icon/ic_launcher.png res/android/icon/hdpi.png

## -- ios asset -- ##

# icon-20.png
cp assets/image/ios/AppIcon-20~ipad.png res/ios/icon/tpl.png
mv res/ios/icon/tpl.png res/ios/icon/icon-20.png
# icon-20@2x.png
cp assets/image/ios/AppIcon-20@2x~ipad.png res/ios/icon/tpl.png
mv res/ios/icon/tpl.png res/ios/icon/icon-20@2x.png
# icon-40.png
cp assets/image/ios/AppIcon-40~ipad.png res/ios/icon/tpl.png
mv res/ios/icon/tpl.png res/ios/icon/icon-40.png
# icon-40@2x.png
cp assets/image/ios/AppIcon-40@2x~ipad.png res/ios/icon/tpl.png
mv res/ios/icon/tpl.png res/ios/icon/icon-40@2x.png
# icon-50.png
echo mising size for ios - icon-50.png
# icon-50@2x.png
echo mising size for ios - icon-50@2x.png
# icon-60.png
echo mising size for ios - icon-60.png
# icon-60@2x.png
cp assets/image/ios/AppIcon-60@2x~car.png res/ios/icon/tpl.png
mv res/ios/icon/tpl.png res/ios/icon/icon-60@2x.png
# icon-60@3x.png
cp assets/image/ios/AppIcon-60@3x~car.png res/ios/icon/tpl.png
mv res/ios/icon/tpl.png res/ios/icon/icon-60@3x.png
# icon-72.png
echo mising size for ios - icon-72.png
# icon-72@2x.png
echo mising size for ios - icon-72@2x.png
# icon-76.png
echo mising size for ios - icon-76.png
# icon-76@2x.png
echo mising size for ios - icon-76@2x.png
# icon-83.5@2x~ipad.png
cp assets/image/ios/AppIcon-83.5@2x~ipad.png res/ios/icon/tpl.png
mv res/ios/icon/tpl.png res/ios/icon/icon-83.5@2x~ipad.png
# icon-1024.png
cp assets/image/ios/AppIcon~ios-marketing.png res/ios/icon/tpl.png
mv res/ios/icon/tpl.png res/ios/icon/icon-1024.png
# icon-small.png
cp assets/image/ios/AppIcon-29.png res/ios/icon/tpl.png
mv res/ios/icon/tpl.png res/ios/icon/icon-small.png
# icon-small@2x.png
cp assets/image/ios/AppIcon-29@2x.png res/ios/icon/tpl.png
mv res/ios/icon/tpl.png res/ios/icon/icon-small@2x.png
# icon-small@3x.png
cp assets/image/ios/AppIcon-29@3x.png res/ios/icon/tpl.png
mv res/ios/icon/tpl.png res/ios/icon/icon-small@3x.png
# icon.png
echo mising size for ios - icon.png
# icon@2x.png
echo mising size for ios - icon@2x.png
