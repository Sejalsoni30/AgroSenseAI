import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appName: "AgroSenseAI",
      tagline: "Confidence-Aware & Explainable Irrigation Intelligence",
      nav: {
        dashboard: "Dashboard",
        irrigationIntel: "Irrigation Intelligence",
        farmManagement: "Farm & Zones",
        reliabilityCenter: "Data Reliability",
        whatIfSimulator: "What-If Simulator",
        waterManagement: "Water Management",
        decisionHistory: "Audit & History",
        farmerAssistant: "Farmer Assistant",
        settings: "Settings",
        logout: "Logout",
        login: "Sign In",
        register: "Register"
      },
      decision: {
        IRRIGATE: "IRRIGATE",
        NO_IRRIGATION_NEEDED: "NO IRRIGATION NEEDED",
        INSUFFICIENT_DATA_VERIFY_MANUALLY: "INSUFFICIENT DATA (VERIFY MANUALLY)"
      },
      badges: {
        demo: "DEMO DATA",
        measured: "MEASURED",
        manual: "MANUAL",
        api: "OPEN-METEO API",
        estimated: "ESTIMATED",
        simulated: "SIMULATED"
      }
    }
  },
  hi: {
    translation: {
      appName: "एग्रो-सेंस एआई",
      tagline: "सटीक एवं विश्वसनीय सिंचाई सलाह प्रणाली",
      nav: {
        dashboard: "डैशबोर्ड",
        irrigationIntel: "सिंचाई परामर्श",
        farmManagement: "खेत और क्षेत्र",
        reliabilityCenter: "डेटा विश्वसनीयता",
        whatIfSimulator: "सिमुलेटर (क्या-अगर)",
        waterManagement: "जल प्रबंधन",
        decisionHistory: "निर्णय इतिहास",
        farmerAssistant: "किसान सहायक",
        settings: "सेटिंग्स",
        logout: "लॉगआउट",
        login: "साइन इन",
        register: "पंजीकरण"
      },
      decision: {
        IRRIGATE: "सिंचाई करें",
        NO_IRRIGATION_NEEDED: "सिंचाई की आवश्यकता नहीं है",
        INSUFFICIENT_DATA_VERIFY_MANUALLY: "अपर्याप्त डेटा (खेत में जांचें)"
      },
      badges: {
        demo: "डेमो डेटा",
        measured: "मापा गया",
        manual: "मैन्युअल",
        api: "मौसम एपीआई",
        estimated: "अनुमानित",
        simulated: "सिम्युलेटेड"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('agrosense_lang') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

