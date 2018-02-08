#!/bin/sh

./stop.sh

./gradlew :sonar-application:build $*
