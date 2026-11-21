# Built with the toolkit and API client sources as the extra build contexts
# `toolkit` and `api-client` (docker-compose.yaml sets them to the
# sermas-toolkit-web and sermas-api-client checkouts).
FROM node:24-slim AS build
WORKDIR /app/sermas-kiosk
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund
COPY --from=toolkit src /app/sermas-toolkit-web/src
COPY --from=api-client src /app/sermas-api-client/src
COPY . .
ENV TOOLKIT_DIR=/app/sermas-toolkit-web
ENV API_CLIENT_DIR=/app/sermas-api-client
RUN npm run build && npm prune --omit=dev --no-audit --no-fund

FROM node:24-slim
WORKDIR /app
COPY --from=build /app/sermas-kiosk/package.json ./
COPY --from=build /app/sermas-kiosk/node_modules ./node_modules
COPY --from=build /app/sermas-kiosk/build ./build
ENV NODE_ENV=production
USER node
CMD ["node", "build"]
