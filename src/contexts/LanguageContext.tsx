import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "am" | "om";

interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
}

export const languages: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "am", label: "Amharic", nativeLabel: "አማርኛ" },
  { code: "om", label: "Afaan Oromoo", nativeLabel: "Afaan Oromoo" },
];

const translations: Record<Language, Record<string, string>> = {
  en: {
    home: "Home",
    cars: "Cars",
    rentals: "Rentals",
    lottery: "Lottery",
    contact: "Contact",
    login: "Login",
    signUp: "Sign Up",
    carsForSale: "Cars for Sale",
    carsForRent: "Cars for Rent",
    // Hero
    heroTagline: "Gech (ጌች) Automotive",
    heroTitle: "Drive Your Dream, Win Your Ride",
    heroDesc: "Buy premium vehicles, rent luxury cars, or try your luck in our exclusive car lottery — all in one place.",
    browseCars: "Browse Cars",
    enterLottery: "Enter Lottery",
    // Lottery
    lotteryTagline: "Gech (ጌች) Lottery",
    lotteryTitle: "Pick a Number, Win a Ride",
    lotteryDesc: "Our car lottery is your chance to drive home in a premium vehicle. Select your lucky numbers, confirm your ticket, and wait for the draw.",
    currentDraw: "Current Draw",
    grandPrize: "Grand Prize: 2025 Apex GT Coupe",
    ticketPrice: "Ticket Price",
    numberRange: "Number Range",
    ticketsLeft: "Tickets Left",
    selectYourNumbers: "Select Your Numbers",
    howItWorks: "How It Works",
    step: "Step",
    chooseNumbers: "Choose Your Numbers",
    chooseNumbersDesc: "Browse the number grid and pick any available number. Each number can only be claimed once.",
    submitPayment: "Submit Payment",
    submitPaymentDesc: "Upload your payment receipt with a reference number. An admin will verify your payment.",
    waitForDraw: "Wait for the Draw",
    waitForDrawDesc: "Once all tickets are sold or the deadline passes, we draw the winning number live.",
    lotteryRules: "Lottery Rules",
    rule1: "Each participant may purchase up to 5 tickets per draw.",
    rule2: "Numbers are reserved upon payment approval — not upon selection.",
    rule3: "The draw date is announced once all tickets are sold or the deadline arrives.",
    rule4: "Winners must claim their prize within 30 days of the draw.",
    rule5: "All decisions by Gech (ጌች) administration are final.",
    // Footer
    footerDesc: "Premium car sales, rentals, and lottery — all in one destination.",
    quickLinks: "Quick Links",
    legalTitle: "Legal",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    allRightsReserved: "All rights reserved.",
  },
  am: {
    home: "መነሻ",
    cars: "መኪናዎች",
    rentals: "ኪራይ",
    lottery: "ሎተሪ",
    contact: "ያግኙን",
    login: "ግባ",
    signUp: "ተመዝገብ",
    carsForSale: "ለሽያጭ መኪናዎች",
    carsForRent: "ለኪራይ መኪናዎች",
    heroTagline: "ጌች የመኪና አገልግሎት",
    heroTitle: "ህልምዎን ይንዱ፣ መኪናዎን ያሸንፉ",
    heroDesc: "ፕሪሚየም ተሽከርካሪዎችን ይግዙ፣ የቅንጦት መኪናዎችን ይከራዩ ወይም በልዩ የመኪና ሎተሪያችን ዕድልዎን ይሞክሩ።",
    browseCars: "መኪናዎችን ይመልከቱ",
    enterLottery: "ሎተሪ ይግቡ",
    lotteryTagline: "ጌች ሎተሪ",
    lotteryTitle: "ቁጥር ይምረጡ፣ መኪና ያሸንፉ",
    lotteryDesc: "የመኪና ሎተሪያችን ፕሪሚየም ተሽከርካሪ ወደ ቤት ለመንዳት እድል ነው። ዕድለኛ ቁጥሮችዎን ይምረጡ፣ ትኬትዎን ያረጋግጡ እና ዕጣውን ይጠብቁ።",
    currentDraw: "ወቅታዊ ዕጣ",
    grandPrize: "ዋና ሽልማት: 2025 Apex GT Coupe",
    ticketPrice: "የትኬት ዋጋ",
    numberRange: "የቁጥር ክልል",
    ticketsLeft: "የቀሩ ትኬቶች",
    selectYourNumbers: "ቁጥሮችዎን ይምረጡ",
    howItWorks: "እንዴት ይሠራል",
    step: "ደረጃ",
    chooseNumbers: "ቁጥሮችዎን ይምረጡ",
    chooseNumbersDesc: "የቁጥር ፍርግርግ ውስጥ ያስሱ እና ማንኛውንም ያልተያዘ ቁጥር ይምረጡ።",
    submitPayment: "ክፍያ ያስገቡ",
    submitPaymentDesc: "የክፍያ ደረሰኝዎን ከማጣቀሻ ቁጥር ጋር ያስገቡ። አስተዳዳሪ ክፍያዎን ያረጋግጣል።",
    waitForDraw: "ዕጣውን ይጠብቁ",
    waitForDrawDesc: "ሁሉም ትኬቶች ከተሸጡ ወይም የጊዜ ገደቡ ካለፈ በኋላ ዕጣውን በቀጥታ እንጫናለን።",
    lotteryRules: "የሎተሪ ደንቦች",
    rule1: "እያንዳንዱ ተሳታፊ በአንድ ዕጣ እስከ 5 ትኬቶች መግዛት ይችላል።",
    rule2: "ቁጥሮች የሚያዙት ክፍያ ሲፀድቅ ነው — ሲመርጡ አይደለም።",
    rule3: "የዕጣ ቀን ሁሉም ትኬቶች ሲሸጡ ወይም የጊዜ ገደቡ ሲደርስ ይገለጻል።",
    rule4: "አሸናፊዎች ሽልማታቸውን ከዕጣው በ30 ቀናት ውስጥ መጠየቅ አለባቸው።",
    rule5: "ሁሉም ውሳኔዎች በጌች አስተዳደር የመጨረሻ ናቸው።",
    footerDesc: "ፕሪሚየም የመኪና ሽያጭ፣ ኪራይ እና ሎተሪ — ሁሉም በአንድ ቦታ።",
    quickLinks: "ፈጣን ማገናኛዎች",
    legalTitle: "ህጋዊ",
    privacy: "የግላዊነት ፖሊሲ",
    terms: "የአገልግሎት ውል",
    allRightsReserved: "ሁሉም መብቶች የተጠበቁ ናቸው።",
  },
  om: {
    home: "Fuula Jalqabaa",
    cars: "Konkolaataa",
    rentals: "Kireeffannaa",
    lottery: "Lootarii",
    contact: "Nu Quunnamaa",
    login: "Seeni",
    signUp: "Galmaa'i",
    carsForSale: "Konkolaataa Gurgurtaaf",
    carsForRent: "Konkolaataa Kireeffannaaf",
    heroTagline: "Gech Tajaajila Konkolaataa",
    heroTitle: "Abjuu Kee Oofadhu, Konkolaataa Kee Moʼi",
    heroDesc: "Konkolaataa piriimiyeemii bitadhaa, konkolaataa miidhagaa kireeffadhaa ykn lootarii konkolaataa addaa keenyaan carraa keessan yaalaa.",
    browseCars: "Konkolaataa Ilaali",
    enterLottery: "Lootarii Seeni",
    lotteryTagline: "Lootarii Gech",
    lotteryTitle: "Lakkoofsa Filadhu, Konkolaataa Moʼi",
    lotteryDesc: "Lootariin konkolaataa keenyaa carraa konkolaataa piriimiyeemii gara manaatti oofuuf ta'a. Lakkoofsa carraa keessan filadhaa, tikeetii keessan mirkaneessaa, qurxii eegadhaa.",
    currentDraw: "Qurxii Ammaa",
    grandPrize: "Badhaasa Guddaa: 2025 Apex GT Coupe",
    ticketPrice: "Gatii Tikeetii",
    numberRange: "Daangaa Lakkoofsa",
    ticketsLeft: "Tikeetii Hafe",
    selectYourNumbers: "Lakkoofsa Keessan Filadhaa",
    howItWorks: "Akkamitti Hojjeta",
    step: "Tarkaanfii",
    chooseNumbers: "Lakkoofsa Keessan Filadhaa",
    chooseNumbersDesc: "Saaphana lakkoofsa keessa sakattaʼaa fi lakkoofsa kamiyyuu hin qabamne filadhaa.",
    submitPayment: "Kaffaltii Galchaa",
    submitPaymentDesc: "Ragaa kaffaltii keessan lakkoofsa wabii waliin galchaa. Bulchiinsi kaffaltii keessan ni mirkaneessa.",
    waitForDraw: "Qurxii Eegadhaa",
    waitForDrawDesc: "Erga tikeetiin hundi gurguramee ykn beellama booda, lakkoofsa moʼataa kallattiin ni harkifna.",
    lotteryRules: "Seerota Lootarii",
    rule1: "Hirmaataan tokko tokko qurxii tokkootti tikeetii hanga 5 bitachuu ni dandaʼa.",
    rule2: "Lakkoofsoonni kan qabaman yeroo kaffaltiin fudhatamu — yeroo filatanitti miti.",
    rule3: "Guyyaan qurxii yeroo tikeetiin hundi gurguramee ykn beellamni gaʼu ni beeksifama.",
    rule4: "Moʼattoonni badhaasa isaanii guyyaa 30 keessatti gaafachuu qabu.",
    rule5: "Murtiin hundi bulchiinsa Gech kan xumuraati.",
    footerDesc: "Gurgurtaa, kireeffannaa fi lootarii konkolaataa piriimiyeemii — hundi bakka tokkotti.",
    quickLinks: "Geessituu Ariifataa",
    legalTitle: "Seeraa",
    privacy: "Imaammata Dhuunfaa",
    terms: "Haala Tajaajilaa",
    allRightsReserved: "Mirgi hundi kan eegame.",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("gech-lang");
    return (saved as Language) || "en";
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("gech-lang", lang);
  };

  const t = (key: string) => translations[language]?.[key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
