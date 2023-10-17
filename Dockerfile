FROM nginx:1.25

# Setup Node.js to compile front-end application using Webpack.
RUN apt-get update && apt-get install -y ca-certificates curl gnupg
RUN mkdir -p /etc/apt/keyrings && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update && apt-get install -y nodejs
RUN useradd --create-home --shell /bin/bash dotline-client

COPY . /home/dotline-client
RUN chown -R dotline-client /home/dotline-client
RUN chmod +x /home/dotline-client/docker_start.sh

USER dotline-client
WORKDIR /home/dotline-client

# Cleanup directories.
RUN rm -rf /home/dotline-client/node_modules
RUN rm -rf /home/dotline-client/config

RUN npm install --ignore-scripts

USER root

CMD ["sh", "/home/dotline-client/docker_start.sh"]
