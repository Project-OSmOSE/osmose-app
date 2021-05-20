# Front dockerfile

# Build stage
FROM node:16-alpine3.13 as build

WORKDIR /opt

COPY frontend/package.json .

RUN npm install

COPY frontend .

RUN npm run build

# Deploy stage
FROM nginxinc/nginx-unprivileged:1.20-alpine

COPY ./dockerfiles/nginx.conf.template /etc/nginx/templates/default.conf.template

COPY --from=build /opt/build /usr/share/nginx/html
