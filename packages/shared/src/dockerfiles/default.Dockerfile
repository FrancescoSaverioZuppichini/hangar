FROM e2bdev/code-interpreter:latest

RUN apt-get update && apt-get install -y curl wget tmux && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV BUN_NO_INSTALL_CONFIRMATION=1

RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.3.6" && \
    mv /root/.bun/bin/bun /usr/local/bin/ && \
    ln -s /usr/local/bin/bun /usr/local/bin/bunx

RUN curl -fsSL https://opencode.ai/install | bash && \
    mv /root/.local/bin/opencode /usr/local/bin/ 2>/dev/null || \
    mv /root/.opencode/bin/opencode /usr/local/bin/ 2>/dev/null || \
    find /root -name "opencode" -type f -exec mv {} /usr/local/bin/ \;

ENV OPENVSCODE_SERVER_VERSION=1.106.3

RUN wget -q https://github.com/gitpod-io/openvscode-server/releases/download/openvscode-server-v${OPENVSCODE_SERVER_VERSION}/openvscode-server-v${OPENVSCODE_SERVER_VERSION}-linux-x64.tar.gz -O /tmp/openvscode-server.tar.gz && \
    tar -xzf /tmp/openvscode-server.tar.gz -C /opt && \
    mv /opt/openvscode-server-v${OPENVSCODE_SERVER_VERSION}-linux-x64 /opt/openvscode-server && \
    rm /tmp/openvscode-server.tar.gz && \
    ln -s /opt/openvscode-server/bin/openvscode-server /usr/local/bin/openvscode-server

WORKDIR /home/user/app

RUN bun add -g typescript

RUN mkdir -p /home/user/.openvscode-server/extensions && \
    openvscode-server --install-extension bradlc.vscode-tailwindcss --extensions-dir /home/user/.openvscode-server/extensions && \
    openvscode-server --install-extension esbenp.prettier-vscode --extensions-dir /home/user/.openvscode-server/extensions && \
    openvscode-server --install-extension dbaeumer.vscode-eslint --extensions-dir /home/user/.openvscode-server/extensions && \
    openvscode-server --install-extension akamud.vscode-theme-onedark --extensions-dir /home/user/.openvscode-server/extensions && \
    openvscode-server --install-extension pkief.material-icon-theme --extensions-dir /home/user/.openvscode-server/extensions && \
    chown -R user:user /home/user/.openvscode-server

RUN mkdir -p /home/user/.local/share/opencode /home/user/.config/opencode
RUN chown -R user:user /home/user/.local/share/opencode /home/user/.config/opencode

COPY startup.sh /opt/startup.sh
RUN chmod +x /opt/startup.sh

WORKDIR /home/user/app
RUN chown -R user:user /home/user/app
USER user
