#!/bin/sh

BUILD_NUMBER=$(cat .build)

# increment build number
BUILD_NUMBER=$(($BUILD_NUMBER + 1))

# write build number
echo $BUILD_NUMBER > .build
echo $BUILD_NUMBER