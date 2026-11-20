# Built with the toolkit sources as the extra build context `toolkit`
# (docker-compose.yaml sets it to the sermas-toolkit-web checkout).
FROM node:24-slim AS build
WORKDIR /app/sermas-kiosk
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund
COPY --from=toolkit src /app/sermas-toolkit-web/src
COPY . .
ENV TOOLKIT_DIR=/app/sermas-toolkit-web
RUN npm run build && npm prune --omit=dev --no-audit --no-fund

FROM node:24-slim
WORKDIR /app
COPY --from=build /app/sermas-kiosk/package.json ./
COPY --from=build /app/sermas-kiosk/node_modules ./node_modules
COPY --from=build /app/sermas-kiosk/build ./build
ENV NODE_ENV=production
USER node
CMD ["node", "build"]
