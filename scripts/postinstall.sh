#!/usr/bin/env sh

VANTUI_SRC="node_modules/@vant/weapp/"
VANTUI_DIR="vant"
COMPONENTS_DIR="src/components/"

if [ ! -d ${VANTUI_SRC} ];
then
  yarn install
fi

rm -rf ${COMPONENTS_DIR}${VANTUI_DIR}

cp -r ${VANTUI_SRC}"dist" ${COMPONENTS_DIR}${VANTUI_DIR}
