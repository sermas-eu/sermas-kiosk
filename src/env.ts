import { defineEnvVars } from "@sveltejs/kit/env";

// read when the server starts; every value is optional
const optional = (value: string | undefined) => value || undefined;

export const variables = defineEnvVars({
  PUBLIC_TOOLKIT_URL: {
    public: true,
    schema: optional,
    description: "SERMAS API base URL for the browser (default http://localhost:8080)",
  },
  PUBLIC_AUTH_URL: { public: true, schema: optional, description: "Keycloak base URL" },
  PUBLIC_AUTH_REALM: { public: true, schema: optional, description: "Keycloak realm" },
  PUBLIC_AUTH_CLIENT_ID: { public: true, schema: optional, description: "Keycloak public client" },
  PUBLIC_PRIVACY_POLICY_URL: {
    public: true,
    schema: optional,
    description: "Privacy policy link (default /privacy-policy.pdf)",
  },
  PRIVATE_API_BASE_URL: { schema: optional, description: "SERMAS API base URL for the server side" },
  PRIVATE_AUTH_CLIENT_ID: { schema: optional, description: "Keycloak client used to mint app tokens" },
  PRIVATE_AUTH_CLIENT_SECRET: { schema: optional, description: "Secret of PRIVATE_AUTH_CLIENT_ID" },
  PRIVATE_AUTH_ROBOT_CLIENT_SECRET: { schema: optional, description: "Secret of the robot client" },
});
