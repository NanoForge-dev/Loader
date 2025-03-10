#! /bin/bash

for FILE in `find $1 -name "*.js"` ; do
  npx javascript-obfuscator $FILE --output $FILE --compact true --self-defending false --rename-globals true
done