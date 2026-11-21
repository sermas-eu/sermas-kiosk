import type { LayoutServerLoad } from "./$types";
import * as envPrivate from '$app/env/private';
import * as envPublic from '$app/env/public';
import { getAvatarToken } from "@sermas/sermas-toolkit-node-sdk";

export const load: LayoutServerLoad = async ({ params }) => {
  // setHeaders({
  //   'Cross-Origin-Opener-Policy': 'same-origin',
  //   'Cross-Origin-Embedder-Policy': 'require-corp',
  //   'Cross-origin-resource-policy': 'cross-origin'
  // })
  return await getAvatarToken(params.appId, {
    PUBLIC_AUTH_URL: envPublic.PUBLIC_AUTH_URL,
    PUBLIC_AUTH_REALM: envPublic.PUBLIC_AUTH_REALM,
    PRIVATE_AUTH_CLIENT_ID: envPrivate.PRIVATE_AUTH_CLIENT_ID,
    PRIVATE_AUTH_CLIENT_SECRET: envPrivate.PRIVATE_AUTH_CLIENT_SECRET,
    PRIVATE_API_BASE_URL: envPrivate.PRIVATE_API_BASE_URL,
  });
};
