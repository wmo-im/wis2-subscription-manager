FROM node:14
WORKDIR /app
COPY package*.json ./
RUN apt-get update && apt-get install -y dpkg fakeroot rpm && apt-get clean
RUN npm install
RUN npm install --save-dev electron-installer-debian
COPY . .