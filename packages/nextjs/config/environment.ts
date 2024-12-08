export const ENVIRONMENTS = {
  APP: {
    BASEURL: process.env.NEXT_PUBLIC_BASE_URL,
    SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
    APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  },
  OPENAI: {
    API_KEY: process.env.OPENAI_API_KEY,
  },
};
