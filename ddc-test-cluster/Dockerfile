FROM node:16.8.0-alpine

WORKDIR /lib

COPY verdaccio.yaml /lib/verdaccio/config.yaml

RUN npm i -g verdaccio
RUN npm i -g verdaccio-auth-memory

CMD verdaccio -c /lib/verdaccio/config.yaml
