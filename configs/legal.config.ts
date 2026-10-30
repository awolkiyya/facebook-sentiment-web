
export const legalConfig = {
    brand: {
      name: "CivicPulse",
      description: "Adama City Social Intelligence",
      copyrightName: "Adama City Administration",
      homeHref: "/",
      signInHref: "/login",
    },
  
    contact: {
      privacyEmail: "awolabdulbaasit143@gmail.com",
      supportEmail: "awolabdulbaasit143@gmail.com",
      phone: "+251911996750",
      phoneDisplay: "+251 911 996 750",
    },
  
    dates: {
      lastUpdated: "October 30, 2026",
    },
  
    routes: {
      terms: "/terms",
      privacy: "/privacy-policy",
      dataDeletion: "/data-deletion",
    },
  
    navigation: {
      header: [
        {
          label: "Privacy Policy",
          href: "/privacy-policy",
        },
        {
          label: "Data Deletion",
          href: "/data-deletion",
        },
        {
          label: "Terms of Service",
          href: "/terms",
        },
      ],
  
      footer: [
        {
          label: "Terms of Service",
          href: "/terms",
        },
        {
          label: "Privacy Policy",
          href: "/privacy-policy",
        },
        {
          label: "Data Deletion",
          href: "/data-deletion",
        },
      ],
    },
  
    trust: {
      message:
        "Adama City Social Intelligence is committed to transparency, accountability, and responsible data practices.",
  
      indicators: [
        "Transparent data practices",
        "Responsible platform use",
      ],
    },
  } as const;
  
  export type LegalRoute = keyof typeof legalConfig.routes;
  
  export const getLegalRoute = (route: LegalRoute) =>
    legalConfig.routes[route];
  