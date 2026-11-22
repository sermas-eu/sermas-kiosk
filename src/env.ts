import { defineEnvVars } from "@sveltejs/kit/env";

// read when the server starts; every value is optional
const optional = (value: string | undefined) => value || undefined;

export const variables = defineEnvVars({
  PUBLIC_TOOLKIT_URL: {
    public: true,
    schema: optional,
    description: "SERMAS API base URL for the browser (default http://localhost:8080)",
  },
  PUBLIC_AUTH_URL: {
    public: true,
    schema: optional,
    description: "Token endpoint base URL: the API's /api/auth/oidc (default auth), or Keycloak's with AUTH_PROVIDER=keycloak",
  },
  PUBLIC_AUTH_REALM: { public: true, schema: optional, description: "Auth realm (AUTH_KEYCLOAK_REALM in the API)" },
  PUBLIC_AUTH_CLIENT_ID: { public: true, schema: optional, description: "Keycloak public client" },
  PUBLIC_PRIVACY_POLICY_URL: {
    public: true,
    schema: optional,
    description: "Privacy policy link (default /privacy-policy.pdf)",
  },
  PRIVATE_API_BASE_URL: { schema: optional, description: "SERMAS API base URL for the server side" },
  PRIVATE_AUTH_CLIENT_ID: { schema: optional, description: "Client used to mint app tokens (the API's kiosk client)" },
  PRIVATE_AUTH_CLIENT_SECRET: { schema: optional, description: "Secret of PRIVATE_AUTH_CLIENT_ID" },
  PRIVATE_AUTH_ROBOT_CLIENT_SECRET: { schema: optional, description: "Secret of the robot client" },
});
