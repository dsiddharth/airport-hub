#!/bin/bash
sudo apt-get install -y git libao-dev libssl-dev libcrypt-openssl-rsa-perl libio-socket-inet6-perl libwww-perl avahi-utils libmodule-build-perl libavahi-compat-libdnssd-dev nodejs vim
npm install
sudo cp airplay.service /etc/systemd/system
sudo systemctl daemon-reload
sudo systemctl start airplay
sudo systemctl enable airplay
