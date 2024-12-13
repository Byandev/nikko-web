// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  runtimeConfig: {
    public: {
      apiURL: process.env.API_URL,
      REVERB_APP_KEY: process.env.REVERB_APP_KEY,
      REVERB_HOST: process.env.REVERB_HOST,
      REVERB_PORT: process.env.REVERB_PORT,
      REVERB_SCHEME: process.env.REVERB_SCHEME,
    },
  },

  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],

  modules: [
    "@sidebase/nuxt-auth",
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "nuxt-lodash",
    "nuxt-svgo",
    "nuxt-headlessui",
  ],

  auth: {
    baseURL: process.env.API_URL,
    provider: {
      type: "local",
      pages: {
        login: "/login",
      },
      endpoints: {
        signIn: { path: "v1/auth/login", method: "post" },
        signOut: { path: "v1/auth/logout", method: "post" },
        signUp: { path: "v1/auth/register", method: "post" },
        getSession: { path: "v1/auth/profile", method: "get" },
      },
      token: {
        signInResponseTokenPointer: "/data/access_token",
        cookieName: process.env.AUTH_COOKIE_NAME || "accessToken",
        maxAgeInSeconds: 604800,
      },
    },
    globalAppMiddleware: true,
  },
})
