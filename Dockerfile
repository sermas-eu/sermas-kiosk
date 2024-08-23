FROM node:18 AS build

ARG BUILD_FROM_TS=0

WORKDIR /app
ADD ./package.json .
RUN npm i
ADD . .

RUN BUILD_FROM_TS=${BUILD_FROM_TS} npm run build

FROM node:18 AS dev
WORKDIR /app

COPY --from=build /app /app
RUN rm -rf /app/src

ENTRYPOINT [ "node" ]
CMD [ "-r", "dotenv/config", "./build" ]
