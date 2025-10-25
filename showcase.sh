#!/usr/bin/env bash
clear

./splash
sleep 1
./splash e >"$HOME/.config/ghostty/themes/splash"
echo "Reload your config in 2 seconds"
sleep 2

neofetch
