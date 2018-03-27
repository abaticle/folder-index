FROM node:carbon
MAINTAINER abaticle

WORKDIR /usr/src/app

COPY . .


VOLUME /volume1
VOLUME /volume2
VOLUME /volume3
VOLUME /volume4

RUN npm install

EXPOSE 8080 

CMD [ "npm", "start" ]