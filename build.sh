#!/bin/sh

export currentTime=`date "+%Y%m%d%H%M%S"`
echo $currentTime

rm -rf ../../master/scripts
rm -rf ../../master/styles
mkdir ../../master/scripts
mkdir ../../master/styles

glue ./images --css=./styles --img=./images
mv ./styles/images.css ./styles/images.styl

sed -e "s/v\=999/v\=$currentTime/g" ./views/index.jade | jade $1 > ../../master/index.html

#jade ./views/index.jade -O ../../master
#stylus ./styles/crafity.styl -o ../../master -c
stylus ./styles/crafity.styl -o ../../master/styles -c


#curl http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js > ./scripts/jquery.min.js
#curl https://raw.github.com/k33g/gh3/master/gh3.js > ./scripts/gh3.js
#curl https://raw.github.com/coreyti/showdown/master/compressed/showdown.js > ./scripts/showdown.js
#curl http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.1/underscore-min.js > ./scripts/underscore-min.js

cat ./scripts/es5-shim.js ./scripts/jquery.min.js ./scripts/showdown.js ./scripts/underscore-min.js ./scripts/gh3.js ./scripts/github.js > ./scripts/crafity.temp
uglifyjs -nc ./scripts/crafity.temp > ../../master/scripts/crafity-min.js

cp -R ./scripts/modernizr-latest.js ../../master/scripts
cp ./images/Beehive_background_small.jpg ../../master/images
cp ./favicon.ico ../../master
cp ./CNAME ../../master
mv ./images/images.png ../../master/images

rm ./scripts/crafity.temp
echo done
