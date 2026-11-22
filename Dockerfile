# Built with the toolkit, API client and node SDK sources as the extra build
# contexts `toolkit`, `api-client` and `node-sdk` (docker-compose.yaml sets them
# to the sermas-toolkit-web, sermas-api-client and sermas-toolkit-node-sdk
# checkouts).
#
# Every package is a devDependency, so adapter-node bundles what the server
# imports into build/: the runtime image needs no node_modules.
FROM node:24-slim AS build
WORKDIR /app/sermas-kiosk
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund
COPY --from=toolkit src /app/sermas-toolkit-web/src
COPY --from=api-client src /app/sermas-api-client/src
COPY --from=node-sdk src /app/sermas-toolkit-node-sdk/src
COPY . .
ENV TOOLKIT_DIR=/app/sermas-toolkit-web
ENV API_CLIENT_DIR=/app/sermas-api-client
ENV NODE_SDK_DIR=/app/sermas-toolkit-node-sdk
RUN npm run build

FROM node:24-slim
WORKDIR /app
COPY --from=build /app/sermas-kiosk/package.json ./
COPY --from=build /app/sermas-kiosk/build ./build
ENV NODE_ENV=production
USER node
CMD ["node", "build"]
