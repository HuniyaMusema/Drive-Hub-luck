const dictionaries = {
  en: {
    // Auth / Registration
    'Welcome to Gech Car Lottery': 'Welcome to Gech Car Lottery',
    'Your account has been created successfully. Welcome to the Gech Car Lottery!': 'Your account has been created successfully. Welcome to the Gech Car Lottery!',
    
    // Payments
    payment_approved_title: 'Payment Approved',
    payment_approved_msg: 'Your lottery number is confirmed',
    ticket_assigned_title: 'Ticket Assigned',
    ticket_assigned_msg: 'Your lottery ticket number has been assigned.',
    payment_rejected_title: 'Payment Rejected',
    payment_rejected_msg: 'Your payment was rejected. Reason: {rejection_reason}',
    
    // Lottery
    lottery_draw_title: 'Lottery Draw Completed',
    lottery_draw_msg: 'Winner has been selected',

    // Rejection Reasons
    "Screenshot is blurry or unreadable": "Screenshot is blurry or unreadable",
    "Transaction reference not found": "Transaction reference not found",
    "Wrong amount transferred": "Wrong amount transferred",
    "Receipt appears to be edited": "Receipt appears to be edited",
    "Payment sent to wrong account": "Payment sent to wrong account",
    "Duplicate submission": "Duplicate submission",
  },
  am: {
    'Welcome to Gech Car Lottery': 'ወደ ገች የመኪና ሎተሪ እንኳን በደህና መጡ',
    'Your account has been created successfully. Welcome to the Gech Car Lottery!': 'የእርስዎ አካውንት በተሳካ ሁኔታ ተፈጥሯል። ወደ ገች የመኪና ሎተሪ እንኳን በደህና መጡ!',
    
    payment_approved_title: 'ክፍያ ጸድቋል',
    payment_approved_msg: 'የሎተሪ ቁጥርዎ ተረጋግጧል',
    ticket_assigned_title: 'ቲኬት ተሰጥቷል',
    ticket_assigned_msg: 'የሎተሪ ቲኬት ቁጥርዎ ተመድቧል::',
    payment_rejected_title: 'ክፍያ ውድቅ ተደርጓል',
    payment_rejected_msg: 'ክፍያዎ ውድቅ ተደርጓል። ምክንያት: {rejection_reason}',
    
    lottery_draw_title: 'የሎተሪ ዕጣ ወጥቷል',
    lottery_draw_msg: 'አሸናፊ ተመርጧል',

    // Rejection Reasons
    "Screenshot is blurry or unreadable": "ቅጂው ብዥ ያለ ወይም የማይነበብ ነው",
    "Transaction reference not found": "የግብይት ማጣቀሻ አልተገኘም",
    "Wrong amount transferred": "የተላከው ገንዘብ ትክክል አይደለም",
    "Receipt appears to be edited": "ደረሰኙ የታረመ ይመስላል",
    "Payment sent to wrong account": "ክፍያ ወደተሳሳተ አካውንት ተልኳል",
    "Duplicate submission": "ተደጋጋሚ ማስረከብ",
  },
  om: {
    'Welcome to Gech Car Lottery': 'Baga gara Gech Car Lottery nagaan dhuftan',
    'Your account has been created successfully. Welcome to the Gech Car Lottery!': 'Herregni keessan milkaa\'inaan uumameera. Baga gara Gech Car Lottery nagaan dhuftan!',
    
    payment_approved_title: 'Kaffaltii Raggaasifame',
    payment_approved_msg: 'Lakkoofsi lootarii keessan mirkanaa\'eera',
    ticket_assigned_title: 'Tikeetiin Ramadameera',
    ticket_assigned_msg: 'Lakkoofsi tikeetii lootarii keessanii ramadameera.',
    payment_rejected_title: 'Kaffaltiin Kuffisame',
    payment_rejected_msg: 'Kaffaltiin keessan kuffisameera. Sababa: {rejection_reason}',
    
    lottery_draw_title: 'Qurxiin Lootarii Raawwateera',
    lottery_draw_msg: 'Mo\'ataan filatameera',

    // Rejection Reasons
    "Screenshot is blurry or unreadable": "Suuraan hin mul'atu ykn hin dubbifamu",
    "Transaction reference not found": "Lakkoofsi wabii hin argamne",
    "Wrong amount transferred": "Maallaqa sirrii hin taane darbe",
    "Receipt appears to be edited": "Nagaheen kan gulaalame fakkaata",
    "Payment sent to wrong account": "Kaffaltiin gara herrega dogoggoraatti ergame",
    "Duplicate submission": "Irra deebiin gulufee",
  }
};

const translate = (lang, key, params = {}) => {
  const dictionary = dictionaries[lang] || dictionaries.en;
  let text = dictionary[key] || dictionaries.en[key] || key;
  
  if (params && typeof params === 'object') {
    for (const [k, v] of Object.entries(params)) {
      if (typeof v === 'string' || typeof v === 'number') {
        // Try to translate the value itself if it's in the dictionary (useful for presets like rejection reasons)
        const translatedVal = dictionary[String(v)] || dictionaries.en[String(v)] || String(v);
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), translatedVal);
      }
    }
  }
  return text;
};

module.exports = { translate };
