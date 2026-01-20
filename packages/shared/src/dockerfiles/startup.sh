#!/bin/bash
tmux new-session -d -s main -x 120 -y 30 || true
tmux new-window -t main -n dev
tmux send-keys -t main:dev "cd /home/user/app && bun dev" Enter
bunx @zuppif/termx --port 7681 &
opencode web --port 4096 --hostname 0.0.0.0 &
exec openvscode-server --host 0.0.0.0 --port 8080 --without-connection-token /home/user/app
