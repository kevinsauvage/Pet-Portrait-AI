const siteMetadata = {
  about: {
    short:
      process.env.NEXT_PUBLIC_SITE_ABOUT_SHORT ||
      'PetPortrait AI transforms your beloved pets into stunning, museum-quality artwork using cutting-edge AI. Upload a photo, choose a style, and receive a one-of-a-kind portrait — printed on premium canvas, poster, or as a digital download.',
  },
  companyName:
    process.env.NEXT_PUBLIC_SITE_NAME || 'PetPortrait AI',
  email: process.env.NEXT_PUBLIC_SITE_EMAIL || 'hello@petportraitai.com',
  facebook: process.env.NEXT_PUBLIC_SITE_FACEBOOK || 'https://www.facebook.com/petportraitai',
  instagram: process.env.NEXT_PUBLIC_SITE_INSTAGRAM || 'https://www.instagram.com/petportraitai',
  linkedin: process.env.NEXT_PUBLIC_SITE_LINKEDIN || 'https://www.linkedin.com/company/petportraitai',
  phoneNumber: process.env.NEXT_PUBLIC_SITE_PHONE || '',
  siteLogo:
    process.env.NEXT_PUBLIC_SITE_LOGO ||
    `${process.env.NEXT_PUBLIC_BASE_URL || 'https://petportraitai.com'}/images/logo.png`,
  siteLogoSquare:
    process.env.NEXT_PUBLIC_SITE_LOGO_SQUARE ||
    `${process.env.NEXT_PUBLIC_BASE_URL || 'https://petportraitai.com'}/images/logox200.png`,
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://petportraitai.com',
  twitter: process.env.NEXT_PUBLIC_SITE_TWITTER || 'https://twitter.com/petportraitai',
  twitterHandle: process.env.NEXT_PUBLIC_SITE_TWITTER_HANDLE || '@petportraitai',
};

export default siteMetadata;
