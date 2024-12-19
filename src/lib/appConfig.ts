export const appConfig = {
    i18n: {
      // locales: ["en", "de", "es"] as const,
      locales: ["en", "zh", "tw", "ko", "ja", "pt", "es", "de", "fr", "vi", "ar", "nl", "pl"] as const,
      defaultLocale: "en" as const,
      localeLabels: {
        en: "English",
        zh: "简体中文",
        tw: "繁体中文",
        ko: "한국어",
        ja: "日本語",
        pt: "Português",
        es: "Español",
        de: "Deutsch",
        fr: "Français",
        vi: "Tiếng Việt",
        ar: "العربية",
        nl: "Nederlands",
        pl: "Polski",
      },
      localeDetection: false,
      localeCurrencies: {
        /* This only works with Stripe for now. For LemonSqueezy, we need to set the currency in the LemonSqueezy dashboard and there can only be one. */
        en: "USD",
        de: "USD",
        es: "USD",
      },
    },
    auth: {
      oAuthProviders: ["google", "github"],
    },
  };
  
