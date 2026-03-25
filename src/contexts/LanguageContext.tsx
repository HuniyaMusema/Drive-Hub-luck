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
    // Nav
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
    heroTagline: "Car Sales · Rental · Lottery",
    heroTitle: "Drive Your Dream, Starting Today",
    heroDesc: "Browse premium vehicles for sale or rent, and try your luck in our exciting car lottery — all in one place.",
    browseCars: "Browse Cars",
    enterLottery: "Join Lottery",
    vehicles: "Vehicles",
    happyClients: "Happy Clients",
    lotteryDraws: "Lottery Draws",

    // Featured
    featured: "Featured",
    handpickedVehicles: "Handpicked Vehicles",
    viewAll: "View all",
    viewDetails: "View Details",
    sale: "Sale",
    rental: "Rental",

    // Services
    whatWeOffer: "What We Offer",
    threeWays: "Three Ways to Drive",
    buyACar: "Buy a Car",
    buyACarDesc: "Browse our curated inventory of premium vehicles with transparent pricing and detailed specs.",
    rentACar: "Rent a Car",
    rentACarDesc: "Flexible daily rentals with competitive rates. Pick up today, return when you're done.",
    carLottery: "Car Lottery",
    carLotteryDesc: "Select your lucky numbers, pay your ticket, and stand a chance to win incredible prizes.",

    // Lottery section (landing)
    howItWorks: "How It Works",
    winYourNextRide: "Win Your Next Ride",
    lotteryLandingDesc: "Our car lottery gives everyone a fair shot at winning premium vehicles. Here's how to enter.",
    pickYourNumbers: "Pick Your Numbers",
    pickNumbersDesc: "Choose from the available number grid — each number is yours exclusively.",
    confirmAndPay: "Confirm & Pay",
    confirmPayDesc: "Upload your payment receipt and wait for admin approval.",
    winBig: "Win Big",
    winBigDesc: "When the draw happens, matching numbers take home the grand prize.",
    enterTheLottery: "Enter the Lottery",

    // Trust
    verifiedVehicles: "Verified Vehicles",
    averageResponse: "Average Response",
    customerRating: "Customer Rating",

    // Lottery page
    lotteryTagline: "Gech (ጌች) Lottery",
    lotteryTitle: "Pick a Number, Win a Ride",
    lotteryDesc: "Our car lottery is your chance to drive home in a premium vehicle. Select your lucky numbers, confirm your ticket, and wait for the draw.",
    currentDraw: "Current Draw",
    grandPrize: "Grand Prize: 2025 Apex GT Coupe",
    ticketPrice: "Ticket Price",
    numberRange: "Number Range",
    ticketsLeft: "Tickets Left",
    selectYourNumbers: "Select Your Numbers",
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

    // Lottery Select
    backToLottery: "Back to Lottery",
    pickUpTo5: "Pick up to 5 numbers. Gray numbers are already taken.",
    available: "Available",
    selected: "Selected",
    taken: "Taken",
    yourSelection: "Your Selection",
    noNumbersSelected: "No numbers selected yet.",
    tickets: "Tickets",
    priceEach: "Price each",
    total: "Total",
    confirmSelection: "Confirm Selection",
    numbersReserved: "Numbers Reserved!",
    youSelected: "You selected:",
    completePayment: "Complete your payment to confirm your participation.",
    goToPayment: "Go to Payment",

    // Cars pages
    inventory: "Inventory",
    searchVehicles: "Search vehicles...",
    filters: "Filters",
    brand: "Brand",
    all: "All",
    noVehiclesMatch: "No vehicles match your criteria.",
    clearFilters: "Clear Filters",
    forSale: "For Sale",
    forRent: "For Rent",
    sold: "Sold",
    rented: "Rented",
    unavailable: "Unavailable",
    contactToBuy: "Contact to Buy",
    noLongerAvailable: "No Longer Available",
    bookRental: "Book Rental",
    currentlyRented: "Currently Rented",
    paymentInfo: "Payment Info",
    backToSales: "Back to Sales",
    backToRentals: "Back to Rentals",
    vehicleNotFound: "Vehicle Not Found",
    backToListings: "Back to Listings",
    year: "Year",
    mileage: "Mileage",
    fuel: "Fuel",
    transmission: "Transmission",
    seats: "Seats",
    rentNow: "Rent Now",
    searchRentals: "Search rentals...",
    rentalsLabel: "Rentals",

    // Car Detail
    specifications: "Specifications",

    // Payment
    payment: "Payment",
    paymentPageDesc: "Upload your payment receipt to confirm your purchase or lottery entry.",
    submitPaymentReceipt: "Submit Payment Receipt",
    referenceNumber: "Reference Number",
    receiptImage: "Receipt Image",
    clickToUpload: "Click to upload receipt",
    uploadHint: "PNG, JPG up to 5MB",
    submitReceipt: "Submit Receipt",
    paymentHistory: "Payment History",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    homeLink: "Home",

    // Dashboard
    welcomeBack: "Welcome back",
    activitySummary: "Here's a summary of your activity.",
    activeRentals: "Active Rentals",
    lotteryEntries: "Lottery Entries",
    pendingPayments: "Pending Payments",
    quickActions: "Quick Actions",
    browseCarsForSale: "Browse Cars for Sale",
    enterLotteryAction: "Enter Lottery",
    myProfile: "My Profile",

    // Auth
    welcomeBackLogin: "Welcome Back",
    signInToAccount: "Sign in to your Gech (ጌች) account",
    demoAccounts: "Demo Accounts",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot password?",
    signIn: "Sign In",
    noAccount: "Don't have an account?",
    createOne: "Create one",
    createAccount: "Create Account",
    joinGech: "Join Gech (ጌች) to buy, rent, or win",
    firstName: "First Name",
    lastName: "Last Name",
    phone: "Phone",
    haveAccount: "Already have an account?",
    signInLink: "Sign in",
    atLeast8: "At least 8 characters",
    containsNumber: "Contains a number",
    containsUppercase: "Contains uppercase",

    // Footer
    footerDesc: "Your trusted partner for car sales, rentals, and exciting lottery draws. Premium vehicles, transparent pricing.",
    quickLinks: "Quick Links",
    aboutUs: "About Us",
    account: "Account",
    logIn: "Log In",
    register: "Register",
    dashboard: "Dashboard",
    contactFooter: "Contact",
    allRightsReserved: "All rights reserved.",

    // Contact page
    contactTagline: "Get in Touch",
    contactTitle: "Contact Us",
    contactDesc: "Have questions about our cars, rentals, or lottery? We'd love to hear from you.",
    phoneLabel: "Phone",
    phoneTap: "Tap to call on mobile",
    telegramLabel: "Telegram",
    telegramTap: "Opens Telegram app",
    emailLabel: "Email",
    addressLabel: "Address",
    addressValue: "Jemo3 beside Taf gas station",
    hoursLabel: "Business Hours",
    hoursValue: "Mon–Sat: 8:00 AM – 6:00 PM",
    savedCars: "Saved Cars",
    noSavedCars: "You haven't saved any cars yet.",
    signInToSave: "Please sign in to save cars.",
  },
  am: {
    // Nav
    home: "መነሻ",
    cars: "መኪናዎች",
    rentals: "ኪራይ",
    lottery: "ሎተሪ",
    contact: "ያግኙን",
    login: "ግባ",
    signUp: "ተመዝገብ",
    carsForSale: "ለሽያጭ መኪናዎች",
    carsForRent: "ለኪራይ መኪናዎች",

    // Hero
    heroTagline: "ጌች የመኪና አገልግሎት",
    heroTitle: "ህልมዎን ይንዱ፣ ዛሬ ይጀምሩ",
    heroDesc: "ፕሪሚየም ተሽከርካሪዎችን ይግዙ ወይም ይከራዩ፣ በአስደሳች የመኪና ሎተሪያችንም ዕድልዎን ይሞክሩ።",
    browseCars: "መኪናዎችን ይመልከቱ",
    enterLottery: "ሎተሪ ይግቡ",
    vehicles: "ተሽከርካሪዎች",
    happyClients: "ደስተኛ ደንበኞች",
    lotteryDraws: "የሎተሪ ዕጣዎች",

    // Featured
    featured: "ተለይተው የቀረቡ",
    handpickedVehicles: "በጥንቃቄ የተመረጡ ተሽከርካሪዎች",
    viewAll: "ሁሉንም ይመልከቱ",
    viewDetails: "ዝርዝር ይመልከቱ",
    sale: "ሽያጭ",
    rental: "ኪራይ",

    // Services
    whatWeOffer: "አገልግሎቶቻችን",
    threeWays: "ሶስት የመንዳት መንገዶች",
    buyACar: "መኪና ይግዙ",
    buyACarDesc: "ፕሪሚየም ተሽከርካሪዎችን ግልጽ ዋጋና ዝርዝር መግለጫ ጋር ይመልከቱ።",
    rentACar: "መኪና ይከራዩ",
    rentACarDesc: "ተወዳዳሪ ዋጋ ያላቸው ተለዋዋጭ ዕለታዊ ኪራዮች። ዛሬ ይውሰዱ፣ ሲጨርሱ ይመልሱ።",
    carLottery: "የመኪና ሎተሪ",
    carLotteryDesc: "ዕድለኛ ቁጥሮችዎን ይምረጡ፣ ትኬትዎን ይክፈሉ፣ አስደናቂ ሽልማቶችን ለማሸነፍ ዕድል ያግኙ።",

    // Lottery section (landing)
    howItWorks: "እንዴት ይሠራል",
    winYourNextRide: "ቀጣዩን መኪናዎን ያሸንፉ",
    lotteryLandingDesc: "የመኪና ሎተሪያችን ሁሉንም ሰው ፕሪሚየም ተሽከርካሪ ለማሸነፍ ፍትሃዊ ዕድል ይሰጣል።",
    pickYourNumbers: "ቁጥሮችዎን ይምረጡ",
    pickNumbersDesc: "ከሚገኙ ቁጥሮች ይምረጡ — እያንዳንዱ ቁጥር የእርስዎ ብቻ ነው።",
    confirmAndPay: "ያረጋግጡ እና ይክፈሉ",
    confirmPayDesc: "የክፍያ ደረሰኝዎን ያስገቡ እና የአስተዳዳሪ ማጽደቅ ይጠብቁ።",
    winBig: "ትልቅ ያሸንፉ",
    winBigDesc: "ዕጣው ሲወጣ ተመሳሳይ ቁጥሮች ዋናውን ሽልማት ይወስዳሉ።",
    enterTheLottery: "ሎተሪ ይግቡ",

    // Trust
    verifiedVehicles: "የተረጋገጡ ተሽከርካሪዎች",
    averageResponse: "አማካይ ምላሽ",
    customerRating: "የደንበኛ ደረጃ",

    // Lottery page
    lotteryTagline: "ጌች ሎተሪ",
    lotteryTitle: "ቁጥር ይምረጡ፣ መኪና ያሸንፉ",
    lotteryDesc: "የመኪና ሎተሪያችን ፕሪሚየም ተሽከርካሪ ወደ ቤት ለመንዳት እድል ነው። ዕድለኛ ቁጥሮችዎን ይምረጡ፣ ትኬትዎን ያረጋግጡ እና ዕጣውን ይጠብቁ።",
    currentDraw: "ወቅታዊ ዕጣ",
    grandPrize: "ዋና ሽልማት: 2025 Apex GT Coupe",
    ticketPrice: "የትኬት ዋጋ",
    numberRange: "የቁጥር ክልል",
    ticketsLeft: "የቀሩ ትኬቶች",
    selectYourNumbers: "ቁጥሮችዎን ይምረጡ",
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

    // Lottery Select
    backToLottery: "ወደ ሎተሪ ተመለስ",
    pickUpTo5: "እስከ 5 ቁጥሮች ይምረጡ። ግራጫ ቁጥሮች ቀድሞ ተይዘዋል።",
    available: "ያልተያዘ",
    selected: "የተመረጠ",
    taken: "የተያዘ",
    yourSelection: "ምርጫዎ",
    noNumbersSelected: "ገና ቁጥር አልተመረጠም።",
    tickets: "ትኬቶች",
    priceEach: "የእያንዳንዱ ዋጋ",
    total: "ጠቅላላ",
    confirmSelection: "ምርጫ ያረጋግጡ",
    numbersReserved: "ቁጥሮች ተይዘዋል!",
    youSelected: "የመረጡት:",
    completePayment: "ተሳትፎዎን ለማረጋገጥ ክፍያዎን ያጠናቅቁ።",
    goToPayment: "ወደ ክፍያ ይሂዱ",

    // Cars pages
    inventory: "ዝርዝር",
    searchVehicles: "ተሽከርካሪዎችን ይፈልጉ...",
    filters: "ማጣሪያዎች",
    brand: "ብራንድ",
    all: "ሁሉም",
    noVehiclesMatch: "ከመስፈርትዎ ጋር የሚመሳሰል ተሽከርካሪ የለም።",
    clearFilters: "ማጣሪያዎችን ያጽዱ",
    forSale: "ለሽያጭ",
    forRent: "ለኪራይ",
    sold: "ተሽጧል",
    rented: "ተከራይቷል",
    unavailable: "የማይገኝ",
    contactToBuy: "ለመግዛት ያግኙን",
    noLongerAvailable: "ከእንግዲህ አይገኝም",
    bookRental: "ኪራይ ያስይዙ",
    currentlyRented: "በአሁኑ ጊዜ ተከራይቷል",
    paymentInfo: "የክፍያ መረጃ",
    backToSales: "ወደ ሽያጭ ተመለስ",
    backToRentals: "ወደ ኪራይ ተመለስ",
    vehicleNotFound: "ተሽከርካሪ አልተገኘም",
    backToListings: "ወደ ዝርዝሮች ተመለስ",
    year: "ዓመት",
    mileage: "ኪ.ሜ.",
    fuel: "ነዳጅ",
    transmission: "ስርጭት",
    seats: "መቀመጫዎች",
    rentNow: "አሁን ይከራዩ",
    searchRentals: "ኪራይ ይፈልጉ...",
    rentalsLabel: "ኪራዮች",

    // Car Detail
    specifications: "ዝርዝር መግለጫዎች",

    // Payment
    payment: "ክፍያ",
    paymentPageDesc: "ግዢዎን ወይም የሎተሪ ተሳትፎዎን ለማረጋገጥ የክፍያ ደረሰኝዎን ያስገቡ።",
    submitPaymentReceipt: "የክፍያ ደረሰኝ ያስገቡ",
    referenceNumber: "ማጣቀሻ ቁጥር",
    receiptImage: "የደረሰኝ ምስል",
    clickToUpload: "ደረሰኝ ለማስገባት ይጫኑ",
    uploadHint: "PNG, JPG እስከ 5MB",
    submitReceipt: "ደረሰኝ ያስገቡ",
    paymentHistory: "የክፍያ ታሪክ",
    pending: "በመጠባበቅ ላይ",
    approved: "ጸድቋል",
    rejected: "ተቀባይነት አላገኘም",
    homeLink: "መነሻ",

    // Dashboard
    welcomeBack: "እንኳን ደና ተመለሱ",
    activitySummary: "የእንቅስቃሴዎ ማጠቃለያ።",
    activeRentals: "ንቁ ኪራዮች",
    lotteryEntries: "የሎተሪ ተሳትፎዎች",
    pendingPayments: "በመጠባበቅ ያሉ ክፍያዎች",
    quickActions: "ፈጣን ድርጊቶች",
    browseCarsForSale: "ለሽያጭ መኪናዎችን ይመልከቱ",
    enterLotteryAction: "ሎተሪ ይግቡ",
    myProfile: "መገለጫዬ",

    // Auth
    welcomeBackLogin: "እንኳን ደና ተመለሱ",
    signInToAccount: "ወደ ጌች መለያዎ ይግቡ",
    demoAccounts: "የማሳያ መለያዎች",
    email: "ኢሜይል",
    password: "የይለፍ ቃል",
    forgotPassword: "የይለፍ ቃል ረሱ?",
    signIn: "ግባ",
    noAccount: "መለያ የለዎትም?",
    createOne: "ይፍጠሩ",
    createAccount: "መለያ ይፍጠሩ",
    joinGech: "ለመግዛት፣ ለመከራየት ወይም ለማሸነፍ ጌችን ይቀላቀሉ",
    firstName: "ስም",
    lastName: "የአባት ስም",
    phone: "ስልክ",
    haveAccount: "ቀድሞ መለያ አለዎት?",
    signInLink: "ይግቡ",
    atLeast8: "ቢያንስ 8 ቁምፊዎች",
    containsNumber: "ቁጥር ይዟል",
    containsUppercase: "ትልቅ ፊደል ይዟል",

    // Footer
    footerDesc: "ለመኪና ሽያጭ፣ ኪራይ እና አስደሳች የሎተሪ ዕጣዎች ታማኝ አጋርዎ።",
    quickLinks: "ፈጣን ማገናኛዎች",
    aboutUs: "ስለ እኛ",
    account: "መለያ",
    logIn: "ግባ",
    register: "ተመዝገብ",
    dashboard: "ዳሽቦርድ",
    contactFooter: "ያግኙን",
    allRightsReserved: "ሁሉም መብቶች የተጠበቁ ናቸው።",

    // Contact page
    contactTagline: "ያግኙን",
    contactTitle: "እኛን ያነጋግሩ",
    contactDesc: "ስለ መኪናዎቻችን፣ ኪራዮቻችን ወይም ሎተሪ ጥያቄ አለዎት? ከእርስዎ ለመስማት ደስ ይለናል።",
    phoneLabel: "ስልክ",
    phoneTap: "በሞባይል ላይ ለመደወል ይንኩ",
    telegramLabel: "ቴሌግራም",
    telegramTap: "የቴሌግራም መተግበሪያ ይከፈታል",
    emailLabel: "ኢሜይል",
    addressLabel: "አድራሻ",
    addressValue: "ጀሞ3 ጣፍ ነዳጅ መሸጫ አጠገብ",
    hoursLabel: "የስራ ሰዓት",
    hoursValue: "ሰኞ–ቅዳሜ: 8:00 ጠ. – 6:00 ከሰ.",
    savedCars: "የተቀመጡ መኪናዎች",
    noSavedCars: "እስካሁን ምንም የተቀመጡ መኪናዎች የሉም።",
    signInToSave: "መኪናዎችን ለማስቀመጥ እባክዎ ይግቡ።",
  },
  om: {
    // Nav
    home: "Fuula Jalqabaa",
    cars: "Konkolaataa",
    rentals: "Kireeffannaa",
    lottery: "Lootarii",
    contact: "Nu Quunnamaa",
    login: "Seeni",
    signUp: "Galmaa'i",
    carsForSale: "Konkolaataa Gurgurtaaf",
    carsForRent: "Konkolaataa Kireeffannaaf",

    // Hero
    heroTagline: "Gech Tajaajila Konkolaataa",
    heroTitle: "Abjuu Kee Oofadhu, Har'a Jalqabi",
    heroDesc: "Konkolaataa piriimiyeemii bitadhaa ykn kireeffadhaa, lootarii konkolaataa keenya keessattis carraa keessan yaalaa.",
    browseCars: "Konkolaataa Ilaali",
    enterLottery: "Lootarii Seeni",
    vehicles: "Konkolaataawwan",
    happyClients: "Maamiltootaa Gammadan",
    lotteryDraws: "Qurxii Lootarii",

    // Featured
    featured: "Filataman",
    handpickedVehicles: "Konkolaataawwan Filataman",
    viewAll: "Hunda ilaali",
    viewDetails: "Bal'inaan ilaali",
    sale: "Gurgurtaa",
    rental: "Kireeffannaa",

    // Services
    whatWeOffer: "Maal Dhiyeessina",
    threeWays: "Karaa Sadiin Oofuu",
    buyACar: "Konkolaataa Bitadhu",
    buyACarDesc: "Konkolaataawwan piriimiyeemii gatii ifaa fi ibsa bal'aa waliin sakattaʼi.",
    rentACar: "Konkolaataa Kireeffadhu",
    rentACarDesc: "Kireeffannaa guyyaa gatii dorgomaa qabu. Har'a fuudhi, yeroo xumurtu deebisi.",
    carLottery: "Lootarii Konkolaataa",
    carLotteryDesc: "Lakkoofsa carraa kee filadhu, tikeetii kee kaffalti, badhaasa dinqisiisaa moʼachuuf carraa argadhu.",

    // Lottery section (landing)
    howItWorks: "Akkamitti Hojjeta",
    winYourNextRide: "Konkolaataa Itti Aanu Kee Moʼi",
    lotteryLandingDesc: "Lootariin konkolaataa keenyaa namoota hundaaf carraa walqixaa konkolaataa piriimiyeemii moʼachuuf kenna.",
    pickYourNumbers: "Lakkoofsa Kee Filadhu",
    pickNumbersDesc: "Lakkoofsa argaman keessaa filadhu — tokko tokkoon kan kee qofa.",
    confirmAndPay: "Mirkaneessi & Kaffali",
    confirmPayDesc: "Ragaa kaffaltii kee galchii mirkaneessa bulchiinsaa eegi.",
    winBig: "Guddaa Moʼi",
    winBigDesc: "Yeroo qurxiin godhamtu, lakkoofsoonni walsiman badhaasa guddaa fudhatu.",
    enterTheLottery: "Lootarii Seeni",

    // Trust
    verifiedVehicles: "Konkolaataa Mirkanaaʼe",
    averageResponse: "Deebii Giddugaleessa",
    customerRating: "Sadarkaa Maamiltoo",

    // Lottery page
    lotteryTagline: "Lootarii Gech",
    lotteryTitle: "Lakkoofsa Filadhu, Konkolaataa Moʼi",
    lotteryDesc: "Lootariin konkolaataa keenyaa carraa konkolaataa piriimiyeemii gara manaatti oofuuf ta'a. Lakkoofsa carraa keessan filadhaa, tikeetii keessan mirkaneessaa, qurxii eegadhaa.",
    currentDraw: "Qurxii Ammaa",
    grandPrize: "Badhaasa Guddaa: 2025 Apex GT Coupe",
    ticketPrice: "Gatii Tikeetii",
    numberRange: "Daangaa Lakkoofsa",
    ticketsLeft: "Tikeetii Hafe",
    selectYourNumbers: "Lakkoofsa Keessan Filadhaa",
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

    // Lottery Select
    backToLottery: "Gara Lootarii Deebi'i",
    pickUpTo5: "Hanga lakkoofsa 5 filadhu. Lakkoofsoonni bifa daalachaa qabaman duraan qabamaniiru.",
    available: "Argamaa",
    selected: "Filatame",
    taken: "Qabame",
    yourSelection: "Filannoo Kee",
    noNumbersSelected: "Ammaaf lakkoofsi hin filatamne.",
    tickets: "Tikeetiiwwan",
    priceEach: "Gatii tokkoo",
    total: "Ida'ama",
    confirmSelection: "Filannoo Mirkaneessi",
    numbersReserved: "Lakkoofsoonni Qabamaniiru!",
    youSelected: "Kan filattes:",
    completePayment: "Hirmaannaa kee mirkaneessuuf kaffaltii kee xumuri.",
    goToPayment: "Gara Kaffaltii Deemi",

    // Cars pages
    inventory: "Kuusaa",
    searchVehicles: "Konkolaataa barbaadi...",
    filters: "Calaqqisiisaa",
    brand: "Maqaa",
    all: "Hunda",
    noVehiclesMatch: "Konkolaataan ulaagaa kee guutu hin argamne.",
    clearFilters: "Calaqqisiisaa Haquu",
    forSale: "Gurgurtaaf",
    forRent: "Kireeffannaaf",
    sold: "Gurgurame",
    rented: "Kireeffatame",
    unavailable: "Hin argamu",
    contactToBuy: "Bituuf Nu Quunnamaa",
    noLongerAvailable: "Dhaabbateera",
    bookRental: "Kireeffannaa Qabadhu",
    currentlyRented: "Yeroo ammaa kireeffatameera",
    paymentInfo: "Odeeffannoo Kaffaltii",
    backToSales: "Gara Gurgurtaa Deebi'i",
    backToRentals: "Gara Kireeffannaa Deebi'i",
    vehicleNotFound: "Konkolaataan hin argamne",
    backToListings: "Gara Tarreetti Deebi'i",
    year: "Waggaa",
    mileage: "KM",
    fuel: "Boba'aa",
    transmission: "Dabarsa",
    seats: "Teessoo",
    rentNow: "Amma Kireeffadhu",
    searchRentals: "Kireeffannaa barbaadi...",
    rentalsLabel: "Kireeffannaa",

    // Car Detail
    specifications: "Ibsa Bal'aa",

    // Payment
    payment: "Kaffaltii",
    paymentPageDesc: "Bitaa ykn hirmaannaa lootarii keessan mirkaneessuuf ragaa kaffaltii keessan galchaa.",
    submitPaymentReceipt: "Ragaa Kaffaltii Galchaa",
    referenceNumber: "Lakkoofsa Wabii",
    receiptImage: "Suuraa Ragaa",
    clickToUpload: "Ragaa galchuuf tuqaa",
    uploadHint: "PNG, JPG hanga 5MB",
    submitReceipt: "Ragaa Galchaa",
    paymentHistory: "Seenaa Kaffaltii",
    pending: "Eeggataa",
    approved: "Fudhatame",
    rejected: "Didame",
    homeLink: "Fuula Jalqabaa",

    // Dashboard
    welcomeBack: "Baga nagaan deebitee",
    activitySummary: "Cuunfaa sochii keetii.",
    activeRentals: "Kireeffannaa Hojii irra jiru",
    lotteryEntries: "Hirmaannaa Lootarii",
    pendingPayments: "Kaffaltii Eeggataa",
    quickActions: "Tarkaanfiiwwan Ariifataa",
    browseCarsForSale: "Konkolaataa Gurgurtaaf Ilaali",
    enterLotteryAction: "Lootarii Seeni",
    myProfile: "Piroofaayilii Koo",

    // Auth
    welcomeBackLogin: "Baga Nagaan Deebitee",
    signInToAccount: "Herrega Gech keetti seeni",
    demoAccounts: "Herrega Agarsiisaa",
    email: "Imeelii",
    password: "Jecha Darbii",
    forgotPassword: "Jecha darbii dagattee?",
    signIn: "Seeni",
    noAccount: "Herrega hin qabduu?",
    createOne: "Uumi",
    createAccount: "Herrega Uumi",
    joinGech: "Bituuf, kireeffachuuf ykn moʼachuuf Gech makali",
    firstName: "Maqaa",
    lastName: "Maqaa Abbaa",
    phone: "Bilbila",
    haveAccount: "Duraan herrega qabdaa?",
    signInLink: "Seeni",
    atLeast8: "Yoo xiqqaate arfii 8",
    containsNumber: "Lakkoofsa of keessaa qaba",
    containsUppercase: "Qubee guddaa of keessaa qaba",

    // Footer
    footerDesc: "Gurgurtaa, kireeffannaa fi qurxii lootarii konkolaataatiif michuu amanamaa keessan.",
    quickLinks: "Geessituu Ariifataa",
    aboutUs: "Waa'ee Keenyaa",
    account: "Herrega",
    logIn: "Seeni",
    register: "Galmaaʼi",
    dashboard: "Daashboordii",
    contactFooter: "Nu Quunnamaa",
    allRightsReserved: "Mirgi hundi kan eegame.",

    // Contact page
    contactTagline: "Nu Quunnamaa",
    contactTitle: "Nu Quunnamaa",
    contactDesc: "Konkolaataa, kireeffannaa ykn lootarii irratti gaaffii qabduu? Isin dhagaʼuuf ni gammadna.",
    phoneLabel: "Bilbila",
    phoneTap: "Mobaayila irratti bilbiluuf tuqi",
    telegramLabel: "Teleegiraamii",
    telegramTap: "Apiliikeeshinii Teleegiraamii bana",
    emailLabel: "Imeelii",
    addressLabel: "Teessoo",
    addressValue: "Jemo3 buufata boba'aa Taf bukkee",
    hoursLabel: "Saʼaatii Hojii",
    hoursValue: "Wiixata–Sanbata: 8:00 WD – 6:00 WB",
    savedCars: "Konkolaataa Olka'ame",
    noSavedCars: "Hamma yoonaatti konkolaataa olkaa'ame hin qabdu.",
    signInToSave: "Konkolaataa olkaasuuf maaloo seenaa.",
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
