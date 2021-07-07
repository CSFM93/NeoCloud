FROM ubuntu:18.04

RUN apt-get update

# Install required programs
# feel free to remove the ones that you don't need
RUN apt-get install ca-certificates software-properties-common curl wget htop git zip nano ncdu build-essential chrpath libssl-dev libxft-dev pkg-config glib2.0-dev libexpat1-dev gobject-introspection python-gi-dev apt-transport-https libgirepository1.0-dev libtiff5-dev libjpeg-turbo8-dev libgsf-1-dev fail2ban nginx -y

# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs
RUN node -v
RUN npm -v
RUN npm i -g nodemon
RUN nodemon -v

WORKDIR /usr/src/app

# Install Neofs-cli
RUN wget https://github.com/nspcc-dev/neofs-node/releases/download/v0.21.0/neofs-cli-linux-amd64.tar.gz -O neofs-cli.tar.gz
Run tar -xf neofs-cli.tar.gz
Run chmod +x neofs-cli
Run mv neofs-cli /usr/bin/
Run echo 'export PATH="$PATH:/usr/bin/neofs-cli"' >> ~/.profile
RUN ["/bin/bash", "-c", "source ~/.profile"]

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3021
CMD [ "node", "server.js" ]