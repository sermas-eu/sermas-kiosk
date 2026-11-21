// The kiosk compiles @sermas/toolkit from its sources (sermas-toolkit-web),
// in dev and in the image. TOOLKIT_DIR points at that checkout.
import path from "node:path";

export const toolkitDir = path.resolve(
  process.env.TOOLKIT_DIR || "../sermas-toolkit-web",
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
  "@sermas/api-client",
  "@mediapipe/tasks-audio",
  "@mediapipe/tasks-vision",
  "@ricky0123/vad-web",
  "@undecaf/zbar-wasm",
  "@lookingglass/webxr",
];
