import type { LayoutServerLoad } from "./$types";
import * as envPrivate from "$app/env/private";
import { getAvatarTokenWithClientSecret } from "@sermas/sermas-toolkit-node-sdk/auth";

export const load: LayoutServerLoad = async ({ params }) => {
  return await getAvatarTokenWithClientSecret(
    params.appId,
    {
      PRIVATE_AUTH_CLIENT_ID: "robot",
      PRIVATE_API_BASE_URL: envPrivate.PRIVATE_API_BASE_URL,
    },
    envPrivate.PRIVATE_AUTH_ROBOT_CLIENT_SECRET
  );
};
