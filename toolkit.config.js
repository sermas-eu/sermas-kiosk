// The kiosk compiles @sermas/toolkit from its sources (sermas-toolkit-web),
// in dev and in the image. TOOLKIT_DIR points at that checkout.
import path from "node:path";

export const toolkitDir = path.resolve(
  process.env.TOOLKIT_DIR || "../sermas-toolkit-web",
);

// @sermas/api-client from its sources too (sermas-api-client); API_CLIENT_DIR
// points at that checkout
export const apiClientDir = path.resolve(
  process.env.API_CLIENT_DIR || "../sermas-api-client",
);

// the server side's token helpers from the node SDK's sources
// (sermas-toolkit-node-sdk); NODE_SDK_DIR points at that checkout
export const nodeSdkDir = path.resolve(
  process.env.NODE_SDK_DIR || "../sermas-toolkit-node-sdk",
);

/** @param {string} p */
const src = (p) => path.join(toolkitDir, "src", p);

// keep in line with "exports" in sermas-toolkit-web/package.json
export const toolkitAliases = {
  "@sermas/toolkit/utils": src("utils.ts"),
  "@sermas/toolkit/detectors/face-landmarker": src(
    "detection/video/mediapipe/v2/face-landmarker/index.ts",
  ),
  "@sermas/toolkit/detection": src("detection/index.ts"),
  "@sermas/toolkit/events": src("events.ts"),
  "@sermas/toolkit/dto": src("dto.ts"),
  "@sermas/toolkit/ui": src("ui.ts"),
  "@sermas/toolkit/avatar": src("avatar/index.ts"),
  "@sermas/toolkit/settings": src("settings.ts"),
  "@sermas/toolkit": src("index.ts"),
  "@sermas/api-client": path.join(apiClientDir, "src", "index.ts"),
  "@sermas/sermas-toolkit-node-sdk/auth": path.join(
    nodeSdkDir,
    "src",
    "modules",
    "auth.ts",
  ),
};

// the toolkit's runtime dependencies resolve to the kiosk's single copy
export const toolkitDedupe = [
  "three",
  "mqtt",
  "keycloak-js",
  "axios",
  "buffer",
  "eventemitter2",
  "ulidx",
  "jwt-decode",
  "@mediapipe/tasks-audio",
  "@mediapipe/tasks-vision",
  "@ricky0123/vad-web",
  "@undecaf/zbar-wasm",
  "@lookingglass/webxr",
];
