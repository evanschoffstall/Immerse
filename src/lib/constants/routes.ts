export const ROUTES = {
  campaigns: {
    list: "/campaigns",
    detail: (id: string) => `/campaigns/${id}`,
    new: "/campaigns/new",
    story: (id: string) => `/campaigns/${id}/story`,
    beings: (id: string) => `/campaigns/${id}/beings`,
    quests: (id: string) => `/campaigns/${id}/quests`,
    calendar: (id: string) => `/campaigns/${id}/calendar`,
    images: (id: string) => `/campaigns/${id}/images`,
    settings: (id: string) => `/campaigns/${id}/settings`,
  },
  auth: {
    login: "/login",
    register: "/register",
    logout: "/logout",
  },
  api: {
    register: "/api/auth/register",
    upload: "/api/upload",
  },
} as const;
