#!/usr/bin/env bash
ffmpeg -i $1 -vcodec copy $2.mp4;
rm $1;
