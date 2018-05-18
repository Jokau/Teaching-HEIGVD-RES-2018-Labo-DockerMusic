FROM node:8.11.2
MAINTAINER Joel Kaufmann <joel.kaufmann@heig-vd.ch>

EXPOSE 2205

COPY src /opt/app/

RUN npm install --save moment
RUN npm install --save net

ENTRYPOINT ["node", "/opt/app/auditor.js"]