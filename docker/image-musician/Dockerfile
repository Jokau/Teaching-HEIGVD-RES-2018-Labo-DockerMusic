FROM node:8.11.2
MAINTAINER Joel Kaufmann <joel.kaufmann@heig-vd.ch>

COPY src /opt/app/

RUN npm install --save uuid

ENTRYPOINT ["node", "/opt/app/musician.js"]