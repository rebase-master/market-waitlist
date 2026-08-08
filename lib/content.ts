import type { FinancingPurpose, ReferralSource } from './validation'

// All user-facing copy for the page, per language. One dictionary drives both the
// English (/) and Arabic (/ar) routes, so the two can never structurally diverge.
export type Content = {
  lang: 'en' | 'ar'
  dir: 'ltr' | 'rtl'
  langSwitch: { href: string; label: string }
  meta: { title: string; description: string; inLanguage: string }
  hero: { title: string; subline: string; trust: string[] }
  form: FormContent
  trust: { title: string; body: string }[]
  faqTitle: string
  faq: { q: string; a: string }[]
  disclaimer: string
  copyright: string
}

export type FormContent = {
  fullName: string
  fullNamePlaceholder: string
  phone: string
  phonePlaceholder: string
  phoneHint: string
  email: string
  emailOptional: string
  emailPlaceholder: string
  referral: string
  referralPlaceholder: string
  referralOptions: Record<ReferralSource, string>
  purpose: string
  purposeOptional: string
  purposePreferNot: string
  purposeOptions: Record<FinancingPurpose, string>
  cta: string
  ctaSending: string
  microcopy: string
  successTitle: string
  successReturning: string
  successBody: string
  share: string
  shareHint: string
  shareText: string // contains a {url} token the client replaces
  errors: {
    fullName: string
    phone: string
    email: string
    contact: string
    referralSource: string
    server: string
  }
}

export const EN: Content = {
  lang: 'en',
  dir: 'ltr',
  langSwitch: { href: '/ar', label: 'العربية' },
  meta: {
    title: 'Amanah — Shariah-compliant financing for Egypt | Join the waitlist',
    description:
      'Halal, interest-free financing built for Egypt. No riba, no hidden fees, pay with mobile money. Join the waitlist for early access.',
    inLanguage: 'en-EG',
  },
  hero: {
    title: 'Halal financing, built for Egypt.',
    subline:
      'Shariah-compliant, interest-free financing you manage from your phone — pay with Vodafone Cash, InstaPay, or Fawry. Join the waitlist for early access.',
    trust: ['No riba, ever', 'One clear fee', 'Built for mobile money'],
  },
  form: {
    fullName: 'Full name',
    fullNamePlaceholder: 'Your name',
    phone: 'Mobile number',
    phonePlaceholder: '010 1234 5678',
    phoneHint: 'Any Egyptian mobile — 010, 011, 012, or 015 (e.g. 010 1234 5678).',
    email: 'Email',
    emailOptional: '(optional if you gave a number)',
    emailPlaceholder: 'you@email.com',
    referral: 'How did you hear about us?',
    referralPlaceholder: 'Choose one…',
    referralOptions: {
      friend_family: 'A friend or family member',
      facebook: 'Facebook',
      instagram: 'Instagram',
      tiktok: 'TikTok',
      search: 'Google / search',
      news: 'A news site or blog',
      other: 'Somewhere else',
    },
    purpose: 'What would you use financing for?',
    purposeOptional: '(optional)',
    purposePreferNot: 'Prefer not to say',
    purposeOptions: {
      electronics: 'Electronics (phone, laptop)',
      home_appliances: 'Home appliances',
      furniture: 'Furniture',
      education: 'Education / tuition',
      medical: 'Medical',
      vehicle: 'Vehicle',
      other: 'Something else',
    },
    cta: 'Join the waitlist',
    ctaSending: 'Adding you…',
    microcopy: 'No spam. We’ll only message you about early access.',
    successTitle: 'You’re on the list.',
    successReturning: 'You’re already on the list.',
    successBody: 'We’ll message you when early access opens in Egypt.',
    share: 'Share on WhatsApp',
    shareHint: 'Move up the list — invite a friend.',
    shareText:
      'I just joined the Amanah waitlist — halal, interest-free financing for Egypt. Join me: {url}',
    errors: {
      fullName: 'Please enter your full name.',
      phone: 'Enter a valid Egyptian mobile (010, 011, 012, or 015).',
      email: 'That email doesn’t look right.',
      contact: 'Enter an email or a mobile number so we can reach you.',
      referralSource: 'Please choose how you heard about us.',
      server: 'Could not save your details. Please try again in a moment.',
    },
  },
  trust: [
    {
      title: 'No riba, ever',
      body: 'Financing structured on Murabaha — a transparent profit rate, never interest.',
    },
    { title: 'One clear fee', body: 'A single admin fee, shown upfront. No compounding, no hidden costs.' },
    {
      title: 'Built for mobile money',
      body: 'Works with Vodafone Cash, InstaPay, and Fawry — no bank account needed.',
    },
  ],
  faqTitle: 'Questions',
  faq: [
    {
      q: 'Is this really interest-free?',
      a: 'Yes. Amanah uses Shariah-compliant structures such as Murabaha — a fixed, transparent profit or admin fee agreed upfront, never riba (interest).',
    },
    {
      q: 'When does it launch in Egypt?',
      a: 'We’re rolling out in phases. Join the waitlist and we’ll message you the moment early access opens in your area.',
    },
    {
      q: 'How is my data used?',
      a: 'Only to contact you about early access. We don’t sell your details or send marketing spam.',
    },
  ],
  disclaimer:
    'Amanah is a waitlist for a product in development — not yet a licensed financial service in Egypt. We’ll only contact you about early access.',
  copyright: '© 2026 Amanah',
}

export const AR: Content = {
  lang: 'ar',
  dir: 'rtl',
  langSwitch: { href: '/', label: 'English' },
  meta: {
    title: 'أمانة — تمويل متوافق مع الشريعة في مصر | سجّل في قائمة الانتظار',
    description:
      'تمويل حلال بدون فوائد، مصمّم لمصر. بدون ربا وبدون رسوم خفية، وادفع عبر المحافظ الإلكترونية. سجّل في قائمة الانتظار للحصول على وصول مبكر.',
    inLanguage: 'ar-EG',
  },
  hero: {
    title: 'تمويل حلال، مصمّم لمصر.',
    subline:
      'تمويل متوافق مع الشريعة وبدون فوائد، تديره من هاتفك — ادفع عبر فودافون كاش أو إنستاباي أو فوري. سجّل في قائمة الانتظار للحصول على وصول مبكر.',
    trust: ['بدون ربا إطلاقًا', 'رسوم إدارية واضحة', 'مصمّم للمحافظ الإلكترونية'],
  },
  form: {
    fullName: 'الاسم الكامل',
    fullNamePlaceholder: 'اسمك',
    phone: 'رقم الموبايل',
    phonePlaceholder: '010 1234 5678',
    phoneHint: 'أي رقم موبايل مصري — 010 أو 011 أو 012 أو 015 (مثال: 010 1234 5678).',
    email: 'البريد الإلكتروني',
    emailOptional: '(اختياري إذا أدخلت رقمًا)',
    emailPlaceholder: 'you@email.com',
    referral: 'كيف عرفت عنّا؟',
    referralPlaceholder: 'اختر…',
    referralOptions: {
      friend_family: 'صديق أو أحد أفراد العائلة',
      facebook: 'فيسبوك',
      instagram: 'إنستغرام',
      tiktok: 'تيك توك',
      search: 'جوجل / البحث',
      news: 'موقع إخباري أو مدوّنة',
      other: 'مكان آخر',
    },
    purpose: 'فيمَ ستستخدم التمويل؟',
    purposeOptional: '(اختياري)',
    purposePreferNot: 'أفضّل عدم الإجابة',
    purposeOptions: {
      electronics: 'إلكترونيات (هاتف، لابتوب)',
      home_appliances: 'أجهزة منزلية',
      furniture: 'أثاث',
      education: 'تعليم / مصاريف دراسية',
      medical: 'علاج طبي',
      vehicle: 'مركبة',
      other: 'شيء آخر',
    },
    cta: 'سجّل في قائمة الانتظار',
    ctaSending: 'جارٍ التسجيل…',
    microcopy: 'بدون رسائل مزعجة. سنراسلك فقط بخصوص الوصول المبكر.',
    successTitle: 'أنت الآن في القائمة.',
    successReturning: 'أنت مسجّل بالفعل.',
    successBody: 'سنراسلك عند فتح الوصول المبكر في مصر.',
    share: 'شارك عبر واتساب',
    shareHint: 'تقدّم في القائمة — ادعُ صديقًا.',
    shareText: 'انضممتُ إلى قائمة انتظار أمانة — تمويل حلال بدون فوائد في مصر. انضم إليّ: {url}',
    errors: {
      fullName: 'من فضلك أدخل اسمك الكامل.',
      phone: 'أدخل رقم موبايل مصري صحيح (010 أو 011 أو 012 أو 015).',
      email: 'يبدو أن البريد الإلكتروني غير صحيح.',
      contact: 'أدخل بريدًا إلكترونيًا أو رقم موبايل حتى نتمكن من التواصل معك.',
      referralSource: 'من فضلك اختر كيف عرفت عنّا.',
      server: 'تعذّر حفظ بياناتك. من فضلك حاول مرة أخرى بعد لحظات.',
    },
  },
  trust: [
    { title: 'بدون ربا إطلاقًا', body: 'تمويل قائم على المرابحة — ربح واضح ومتفق عليه، وليس فائدة.' },
    { title: 'رسوم إدارية واضحة', body: 'رسم إداري واحد يُعرض مقدمًا. بدون فوائد مركّبة وبدون تكاليف خفية.' },
    {
      title: 'مصمّم للمحافظ الإلكترونية',
      body: 'يعمل مع فودافون كاش وإنستاباي وفوري — دون الحاجة إلى حساب بنكي.',
    },
  ],
  faqTitle: 'أسئلة شائعة',
  faq: [
    {
      q: 'هل هو فعلًا بدون فوائد؟',
      a: 'نعم. تعتمد أمانة على صيغ متوافقة مع الشريعة مثل المرابحة — ربح أو رسم إداري ثابت وواضح يُتفق عليه مقدمًا، وليس ربا (فائدة).',
    },
    {
      q: 'متى ينطلق في مصر؟',
      a: 'نطلق على مراحل. سجّل في قائمة الانتظار وسنراسلك فور فتح الوصول المبكر في منطقتك.',
    },
    {
      q: 'كيف تُستخدم بياناتي؟',
      a: 'فقط للتواصل معك بخصوص الوصول المبكر. لا نبيع بياناتك ولا نرسل رسائل دعائية مزعجة.',
    },
  ],
  disclaimer:
    'أمانة هي قائمة انتظار لمنتج قيد التطوير — وليست بعد خدمة مالية مرخّصة في مصر. سنتواصل معك فقط بخصوص الوصول المبكر.',
  copyright: '© 2026 أمانة',
}
