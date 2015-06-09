#!/usr/bin/env bash
ffmpeg -i $1 -vcodec copy $2-large.mp4;
# ffmpeg -i $2-large.mp4 -vcodec libx264 -crf 20 $2-small.mp4
rm $1;
# rm $2-large.mp4;
