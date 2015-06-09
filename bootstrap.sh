#!/usr/bin/env bash
sudo apt-get update;
sudo apt-get -y install curl build-essential libpcre3 libpcre3-dev libssl-dev unzip make ffmpeg libavcodec-extra-53 python-software-properties
sudo add-apt-repository ppa:jon-severinsson/ffmpeg;
sudo apt-get update;
sudo apt-get install -y ffmpeg frei0r-plugins;


wget http://nginx.org/download/nginx-1.9.1.tar.gz
wget https://github.com/arut/nginx-rtmp-module/archive/master.zip
unzip master.zip
tar -zxvf nginx-1.9.1.tar.gz
cd nginx-1.9.1
./configure --with-http_ssl_module --add-module=../nginx-rtmp-module-master
make
sudo make install
sudo /usr/local/nginx/sbin/nginx
chmod +x /vagrant/process.sh

# alternative ffmpeg, more time consuming, smaller files, (-crf number) higher = worse quality
# ffmpeg -i Test2.mp4 -vcodec libx264 -crf 40 Test2-small.mp4

cat <<EOT >> /usr/local/nginx/conf/nginx.conf
user root;
rtmp {
        server {
                listen 1935;
                chunk_size 4096;
                application live {
                        live on;
                        wait_video on;
                        record all;
                        record_interval 10s;
                        record_path /vagrant/streams;
                        record_suffix -%d-%b-%y-%T.flv;
                        exec_record_done bash -c "/vagrant/process.sh \$path \$dirname/\$basename";
                }

        }
}
EOT
sudo /usr/local/nginx/sbin/nginx -s stop
sudo /usr/local/nginx/sbin/nginx
