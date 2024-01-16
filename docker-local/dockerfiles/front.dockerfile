# Front dockerfile
FROM node:16-alpine3.13

WORKDIR /opt

USER root

COPY frontend/package*.json .
RUN npm install

ENTRYPOINT npm start --host 0.0.0.0 --port 3000 --disableHostCheck true
