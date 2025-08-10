import { sentryRollupPlugin } from "@sentry/rollup-plugin";

export default defineNitroConfig({
  srcDir: "server",
  experimental: {
    openAPI: true,
  },
  runtimeConfig: {
    CLOUD_FUNCTION_SECRET: process.env.CLOUD_FUNCTION_SECRET,
    PROXY_URL: process.env.PROXY_URL,
    INTERNAL_SECRET: process.env.INTERNAL_SECRET,
    gcf: {
      queueWorkerUrl: process.env.CLOUD_FUNCTION_QUEUE_URL,
      usernameWorkerUrl: process.env.CLOUD_FUNCTION_USERNAME_URL,
    },
    public: {
      // To fulfill Supabase helpers
      SENTRY_DSN: process.env.SENTRY_DSN,
      supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY,
        clientOptions: {
          auth: {
            flowType: "pkce",
            autoRefreshToken: false,
            detectSessionInUrl: false,
            persistSession: false, // Server side sessions are not supported
          },
        },
      },
    },
    supabase: {
      serviceKey: process.env.SUPABASE_SERVICE_KEY,
    },
  },
  openAPI: {
    production: false,
    route: "/_docs/openapi.json",
    ui: {
      scalar: {
        route: "/_docs/scalar",
      },
      swagger: {
        route: "/_docs/swagger",
      },
    },
  },
  storage: {
    redis: {
      driver: "redis",
      url: process.env.REDIS_URL,
    },
  },
  rollupConfig: {
    plugins: [
      // Put the Sentry rollup plugin after all other plugins
      sentryRollupPlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: "threadseeker",
        project: "javascript-nuxt",
      }),
    ],
  },
  compatibilityDate: "2025-02-06",
});
