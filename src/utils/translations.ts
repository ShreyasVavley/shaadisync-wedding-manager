import type { SupportedLanguage } from '../types/wedding';

export interface TranslationStrings {
  headerBadge: string;
  togetherFamilies: string;
  weddingInvitation: string;
  dearGuest: string;
  willYouAttend: string;
  yesAttend: string;
  noDecline: string;
  confirmHeadcount: string;
  reservingPlates: string;
  guestsCount: string;
  dietPreference: string;
  dietSubtitle: string;
  veg: string;
  vegDesc: string;
  nonVeg: string;
  nonVegDesc: string;
  jain: string;
  jainDesc: string;
  ceremoniesTitle: string;
  ceremoniesSubtitle: string;
  expectedArrival: string;
  selectTime: string;
  songRequest: string;
  songPlaceholder: string;
  blessingsPrompt: string;
  blessingsPlaceholder: string;
  submitConfirm: string;
  submitDecline: string;
  submitting: string;
  successTitle: string;
  successConfirmed: string;
  successDeclined: string;
  viewGatePass: string;
  venueDirections: string;
  changeRSVP: string;
  footerBranding: string;
}

export const translations: Record<SupportedLanguage, TranslationStrings> = {
  en: {
    headerBadge: 'WEDDING GUESTS · CONCEPT',
    togetherFamilies: 'Together With Their Families',
    weddingInvitation: 'Wedding Invitation',
    dearGuest: 'Dear',
    willYouAttend: 'Will You Attend?',
    yesAttend: 'YES',
    noDecline: 'NO',
    confirmHeadcount: 'Number of Guests',
    reservingPlates: 'Confirm',
    guestsCount: 'Guests',
    dietPreference: 'Food Preference',
    dietSubtitle: 'Helps the catering team prepare fresh',
    veg: 'Vegetarian',
    vegDesc: 'Paneer & Dal Makhani',
    nonVeg: 'Non-Veg',
    nonVegDesc: 'Butter Chicken & Kebabs',
    jain: 'Strict Jain',
    jainDesc: 'No Onion / Garlic',
    ceremoniesTitle: 'Select Functions You Will Attend',
    ceremoniesSubtitle: 'Helps individual banquet kitchens prepare exact portions',
    expectedArrival: 'EXPECTED ARRIVAL',
    selectTime: 'SELECT EXPECTED REACHING TIME',
    songRequest: 'Sangeet Song Request (Optional)',
    songPlaceholder: 'e.g. Gallan Goodiyaan, Tauba Tauba',
    blessingsPrompt: 'Send your blessings to Aarav & Riya',
    blessingsPlaceholder: 'We will miss you! Leave a warm blessing or note for the couple...',
    submitConfirm: 'Confirm RSVP & Attendance',
    submitDecline: 'Submit Blessings',
    submitting: 'Saving...',
    successTitle: 'RSVP Recorded Successfully',
    successConfirmed: 'See you there',
    successDeclined: 'Thank you for your blessings',
    viewGatePass: '🎟️ View Digital Gate Pass & Valet QR',
    venueDirections: 'Get Venue Directions',
    changeRSVP: 'Change or Update RSVP',
    footerBranding: 'INVITES & RSVPS OVER CHAT • ZERO WASTAGE',
  },
  hi: {
    headerBadge: 'शुभ विवाह · आमंत्रण',
    togetherFamilies: 'परिवार सहित सप्रेम निमंत्रण',
    weddingInvitation: 'विवाह निमंत्रण पत्रिका',
    dearGuest: 'आदरणीय',
    willYouAttend: 'क्या आप पधारेंगे?',
    yesAttend: 'हाँ, अवश्य आएंगे',
    noDecline: 'नहीं आ पाएंगे',
    confirmHeadcount: 'अतिथियों की कुल संख्या',
    reservingPlates: 'पुष्टि करें',
    guestsCount: 'अतिथि',
    dietPreference: 'भोजन की पसंद (केटरिंग हेतु)',
    dietSubtitle: 'भोजन की ताज़ा तैयारी एवं बर्बादी रोकने हेतु',
    veg: 'शुद्ध शाकाहारी',
    vegDesc: 'पनीर एवं दाल मखनी',
    nonVeg: 'मांसाहारी',
    nonVegDesc: 'कबाब एवं चिकन/मटन',
    jain: 'शुद्ध जैन आहार',
    jainDesc: 'बिना प्याज, लहसुन व कंदमूल',
    ceremoniesTitle: 'समारोह जिनका आप हिस्सा बनेंगे',
    ceremoniesSubtitle: 'प्रत्येक कार्यक्रम में भोजन व्यवस्था सुनिश्चित करने हेतु',
    expectedArrival: 'अनुमानित आगमन समय',
    selectTime: 'पहुंचने का समय चुनें',
    songRequest: 'संगीत में आपका पसंदीदा गाना (वैकल्पिक)',
    songPlaceholder: 'उदा. गल्लां गूड़ियां, लंदन ठुमकदा',
    blessingsPrompt: 'आरव एवं रिया को अपना आशीर्वाद व शुभकामनाएं भेजें',
    blessingsPlaceholder: 'आपकी कमी खलेगी! कृपया वर-वधू हेतु अपना मंगल संदेश लिखें...',
    submitConfirm: 'उपस्थिति एवं भोजन थाली की पुष्टि करें',
    submitDecline: 'शुभकामनाएं प्रेषित करें',
    submitting: 'दर्ज हो रहा है...',
    successTitle: 'आमंत्रण स्वीकृति सफलतापूर्वक दर्ज!',
    successConfirmed: 'समारोह में आपके स्वागत हेतु प्रतीक्षारत',
    successDeclined: 'आपके मंगल आशीर्वाद हेतु धन्यवाद',
    viewGatePass: '🎟️ डिजिटल प्रवेश पास एवं वैले क्यूआर देखें',
    venueDirections: 'समारोह स्थल का गूगल मैप्स मार्ग',
    changeRSVP: 'स्वीकृति विवरण में बदलाव करें',
    footerBranding: 'डिजिटल विवाह प्रबंधन • शून्य अन्न बर्बादी',
  },
  gu: {
    headerBadge: 'શુભ લગ્ન · આમંત્રણ',
    togetherFamilies: 'પરિવાર સહિત સ્નેહભર્યું આમંત્રણ',
    weddingInvitation: 'લગ્ન કંકોતરી',
    dearGuest: 'સ્નેહીશ્રી',
    willYouAttend: 'શું આપ પધારશો?',
    yesAttend: 'હા, જરૂર આવીશું',
    noDecline: 'નહીં આવી શકીએ',
    confirmHeadcount: 'કુલ મહેમાનોની સંખ્યા',
    reservingPlates: 'ખાતરી કરો',
    guestsCount: 'મહેમાનો',
    dietPreference: 'ભોજનની પસંદગી (કેટરિંગ માટે)',
    dietSubtitle: 'રસોડામાં તાજું ભોજન તૈયાર કરવા અને બગાડ અટકાવવા માટે',
    veg: 'શુદ્ધ શાકાહારી',
    vegDesc: 'પનીર અને દાલ મખની',
    nonVeg: 'નોન-વેજ',
    nonVegDesc: 'ચિકન અને કબાબ',
    jain: 'ચુસ્ત જૈન ભોજન',
    jainDesc: 'ડુંગળી, લસણ અને કંદમૂળ વગર',
    ceremoniesTitle: 'આપ જે પ્રસંગોમાં હાજરી આપશો તે પસંદ કરો',
    ceremoniesSubtitle: 'દરેક ઉત્સવમાં યોગ્ય વ્યવસ્થા માટે મદદરૂપ થશે',
    expectedArrival: 'અપેક્ષિત આગમન સમય',
    selectTime: 'આગમન સમય પસંદ કરો',
    songRequest: 'સંગીત સંધ્યાનું મનપસંદ ગીત (વૈકલ્પિક)',
    songPlaceholder: 'દા.ત. ઢોલીડા, વાગ્યો રે ઢોલ',
    blessingsPrompt: 'આરવ અને રિયાને આશીર્વાદ અને શુભેચ્છાઓ મોકલો',
    blessingsPlaceholder: 'આપની ખોટ સાલશે! વર-કન્યા માટે સ્નેહ સંદેશ લખો...',
    submitConfirm: 'ઉપસ્થિતિ અને ભોજન થાળીની ખાતરી કરો',
    submitDecline: 'શુભેચ્છાઓ મોકલો',
    submitting: 'નોંધાઈ રહ્યું છે...',
    successTitle: 'સ્વીકૃતિ સફળતાપૂર્વક નોંધાઈ ગઈ છે!',
    successConfirmed: 'આપના સ્વાગત માટે આતુર છીએ',
    successDeclined: 'આપના આશીર્વાદ બદલ આભાર',
    viewGatePass: '🎟️ ડિજિટલ એન્ટ્રી પાસ અને પાર્કિંગ ક્યૂઆર જુઓ',
    venueDirections: 'વેન્યૂ ગૂગલ મેપ્સ માર્ગદર્શન',
    changeRSVP: 'વિગતોમાં ફેરફાર કરો',
    footerBranding: 'ડિજિટલ લગ્ન વ્યવસ્થા • શૂન્ય અન્ન બગાડ',
  },
  pa: {
    headerBadge: 'ਸ਼ੁਭ ਵਿਆਹ · ਸੱਦਾ ਪੱਤਰ',
    togetherFamilies: 'ਸਮੂਹ ਪਰਿਵਾਰ ਵੱਲੋਂ ਨਿੱਘਾ ਸੱਦਾ',
    weddingInvitation: 'ਵਿਆਹ ਦਾ ਸੱਦਾ ਪੱਤਰ',
    dearGuest: 'ਸਤਿਕਾਰਯੋਗ',
    willYouAttend: 'ਕੀ ਤੁਸੀਂ ਸ਼ਾਮਲ ਹੋਵੋਗੇ?',
    yesAttend: 'ਹਾਂ, ਜ਼ਰੂਰ ਆਵਾਂਗੇ',
    noDecline: 'ਨਹੀਂ ਆ ਸਕਾਂਗੇ',
    confirmHeadcount: 'ਮਹਿਮਾਨਾਂ ਦੀ ਕੁੱਲ ਗਿਣਤੀ',
    reservingPlates: 'ਪੁਸ਼ਟੀ ਕਰੋ',
    guestsCount: 'ਮਹਿਮਾਨ',
    dietPreference: 'ਖਾਣੇ ਦੀ ਪਸੰਦ (ਕੈਟਰਿੰਗ ਲਈ)',
    dietSubtitle: 'ਤਾਜ਼ਾ ਖਾਣਾ ਤਿਆਰ ਕਰਨ ਅਤੇ ਅੰਨ ਦੀ ਬਰਬਾਦੀ ਰੋਕਣ ਲਈ',
    veg: 'ਸ਼ੁੱਧ ਸ਼ਾਕਾਹਾਰੀ',
    vegDesc: 'ਸ਼ਾਹੀ ਪਨੀਰ ਅਤੇ ਦਾਲ ਮਖਣੀ',
    nonVeg: 'ਨਾਨ-ਵੈੱਜ',
    nonVegDesc: 'ਬਟਰ ਚਿਕਨ ਅਤੇ ਕਬਾਬ',
    jain: 'ਜੈਨ ਖਾਣਾ',
    jainDesc: 'ਬਿਨਾਂ ਪਿਆਜ਼ ਤੇ ਲਸਣ',
    ceremoniesTitle: 'ਜਿਨ੍ਹਾਂ ਰਸਮਾਂ ਵਿੱਚ ਤੁਸੀਂ ਸ਼ਾਮਲ ਹੋਵੋਗੇ',
    ceremoniesSubtitle: 'ਹਰ ਸਮਾਗਮ ਵਿੱਚ ਸਹੀ ਪ੍ਰਬੰਧ ਲਈ ਸਹਾਇਕ ਹੈ',
    expectedArrival: 'ਪਹੁੰਚਣ ਦਾ ਅੰਦਾਜ਼ਨ ਸਮਾਂ',
    selectTime: 'ਪਹੁੰਚਣ ਦਾ ਸਮਾਂ ਚੁਣੋ',
    songRequest: 'ਸੰਗੀਤ ਨਾਈਟ ਲਈ ਮਨਪਸੰਦ ਗੀਤ',
    songPlaceholder: 'ਜਿਵੇਂ: ਗੱਲਾਂ ਗੂੜ੍ਹੀਆਂ, ਮੁੰਡਿਆਂ ਤੋਂ ਬਚ ਕੇ',
    blessingsPrompt: 'ਆਰਵ ਅਤੇ ਰੀਆ ਨੂੰ ਆਪਣੀਆਂ ਅਸੀਸਾਂ ਭੇਜੋ',
    blessingsPlaceholder: 'ਤੁਹਾਡੀ ਘਾਟ ਰੜਕੇਗੀ! ਜੋੜੀ ਲਈ ਸ਼ੁਭਕਾਮਨਾਵਾਂ ਲਿਖੋ...',
    submitConfirm: 'ਹਾਜ਼ਰੀ ਅਤੇ ਖਾਣੇ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
    submitDecline: 'ਅਸੀਸਾਂ ਭੇਜੋ',
    submitting: 'ਦਰਜ ਹੋ ਰਿਹਾ ਹੈ...',
    successTitle: 'ਹਾਜ਼ਰੀ ਦੀ ਪੁਸ਼ਟੀ ਸਫਲਤਾਪੂਰਵਕ ਦਰਜ ਹੋਈ!',
    successConfirmed: 'ਵਿਆਹ ਵਿੱਚ ਤੁਹਾਡਾ ਇੰਤਜ਼ਾਰ ਰਹੇਗਾ',
    successDeclined: 'ਤੁਹਾਡੀਆਂ ਅਸੀਸਾਂ ਲਈ ਬਹੁਤ-ਬਹੁਤ ਧੰਨਵਾਦ',
    viewGatePass: '🎟️ ਡਿਜੀਟਲ ਗੇਟ ਪਾਸ ਅਤੇ ਵੈਲੇ ਕਿਊਆਰ ਵੇਖੋ',
    venueDirections: 'ਸਥਾਨ ਦਾ ਗੂਗਲ ਮੈਪਸ ਰਸਤਾ',
    changeRSVP: 'ਵੇਰਵਿਆਂ ਵਿੱਚ ਤਬਦੀਲੀ ਕਰੋ',
    footerBranding: 'ਡਿਜੀਟਲ ਵਿਆਹ ਪ੍ਰਬੰਧ • ਜ਼ੀਰੋ ਫੂਡ ਵੇਸਟੇਜ',
  },
};
