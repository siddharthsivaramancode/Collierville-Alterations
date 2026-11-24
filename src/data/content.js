export const BUSINESS = {
  name: 'Collierville Alterations',
  street: '567 W Poplar Ave, Suite 1',
  city: 'Collierville',
  state: 'TN',
  zip: '38017',
  addressLine: '567 W Poplar Ave, Suite 1, Collierville, TN 38017',
  phone: '(901) 457-5312',
  phoneHref: 'tel:+19014575312',
  email: 'colliervillealterations@gmail.com',
  emailHref: 'mailto:colliervillealterations@gmail.com',
  note: 'Conveniently located across from Walmart on West Poplar',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Collierville+Alterations+567+W+Poplar+Ave+Suite+1+Collierville+TN+38017',
  googleReviewsUrl:
    'https://www.google.com/maps/search/?api=1&query=Collierville+Alterations+Collierville+TN+reviews',
  yelpUrl:
    'https://www.yelp.com/search?find_desc=Collierville+Alterations&find_loc=Collierville%2C+TN',
};

export const GARMENTS = [
  {
    id: 'bridal',
    number: '01',
    name: 'Bridal & Formal Gowns',
    short: 'Bridal & Formal',
    tagline: 'Wedding, prom, pageant and black-tie silhouettes.',
    turnaround: '2–4 weeks',
    turnaroundNote: 'Bridal work preferred 6–8 weeks before the event.',
    includes: [
      'Bust, waist and side-seam shaping',
      'Hems, trains and bridal bustling',
      'Straps, cups and bodice support',
      'Final steam and press before the day',
    ],
    bring: [
      'Your gown and the exact shoes you will wear',
      'The undergarments and bra you plan to use',
      'Veil, sash or jewelry for the final look',
      'A friend or mom for a second set of eyes',
      'Your event date — we plan fittings backward from it',
    ],
    note: 'Bridal alterations are quoted in person after pinning.',
    modalValue: 'Bridal & formal gown',
  },
  {
    id: 'suits',
    number: '02',
    name: 'Suits & Blazers',
    short: 'Suits & Blazers',
    tagline: 'A jacket that sits on your shoulders, not near them.',
    turnaround: '1–2 weeks',
    turnaroundNote: 'Simple sleeve and waist work is often faster.',
    includes: [
      'Waist suppression and center-back shaping',
      'Sleeve taper and cuff alignment',
      'Trouser break, seat and rise adjustments',
      'Shoulder, armhole and collar balance',
    ],
    bring: [
      'The suit jacket and trousers',
      'The dress shoes you will wear',
      'The shirt and tie you plan to pair',
      'Any jacket you are matching it to',
    ],
    note: 'Formalwear is quoted in person so the fit — not a price list — leads.',
    modalValue: 'Suit or blazer',
  },
  {
    id: 'pants',
    number: '03',
    name: 'Pants, Jeans & Hems',
    short: 'Pants & Jeans',
    tagline: 'The everyday alterations that make a wardrobe feel yours.',
    turnaround: '3–7 days',
    turnaroundNote: 'Denim hems and simple hems move quickly.',
    includes: [
      'Original denim hem preservation',
      'Waist, seat and thigh adjustments',
      'Tapering, cuffs and lining changes',
      'Flat-front and pleat refinements',
    ],
    bring: [
      'The pants or jeans',
      'The shoes you will wear with them',
      'A belt if the waist is the concern',
      'A photo of the break or style you prefer',
    ],
    note: 'Denim is hemmed to keep the original stitching and faded edge.',
    modalValue: 'Pants, jeans or hems',
  },
  {
    id: 'repair',
    number: '04',
    name: 'Zippers & Garment Repair',
    short: 'Zippers & Repair',
    tagline: 'A quiet rescue for the pieces you keep reaching for.',
    turnaround: '3–7 days',
    turnaroundNote: 'Specialty zippers or parts may add time.',
    includes: [
      'Invisible, metal and molded zipper replacement',
      'Seam, lining and pocket repair',
      'Buttons, hooks and closures reset',
      'Discreet patches and restyling',
    ],
    bring: [
      'The garment and any spare buttons or fabric',
      'The shoes or underlayer if fit is involved',
      'A note on delicate, vintage or heavily beaded pieces',
    ],
    note: 'If a zipper is failing the week of an event, call first.',
    modalValue: 'Zipper or garment repair',
  },
  {
    id: 'rush',
    number: '05',
    name: 'Rush / Last-Minute Alterations',
    short: 'Rush Alterations',
    tagline: 'For the week the calendar gets away from you.',
    turnaround: '24–72 hours',
    turnaroundNote: 'Subject to availability — call before coming in.',
    includes: [
      'Same-week fitting slots when the bench allows',
      'Simple hems and zippers prioritized',
      'Event-week rescue for bridal and formalwear',
      'Honest guidance when time is too tight',
    ],
    bring: [
      'The garment and your event date and time',
      'The shoes you will wear',
      'A phone number we can reach you on',
      'Call the studio before you drive over',
    ],
    note: 'Rush work is never promised until Kelly sees the garment.',
    modalValue: 'Rush / last-minute alteration',
  },
];

export const REVIEWS = [
  {
    quote:
      'Kelly saved my wedding dress with less than two weeks to go. Her pinning was exact and the final fit looked custom-made.',
    author: 'Verified Local Client',
    source: 'Bridal alteration',
  },
  {
    quote:
      "Super fast turnaround on my husband's suit pants and blazer sleeves before a formal event. Best tailor in Collierville.",
    author: 'Google Reviewer',
    source: 'Google review',
  },
  {
    quote:
      "Reasonable, honest, and pays incredible attention to detail. I wouldn't trust anyone else with formal wear.",
    author: 'Yelp Reviewer',
    source: 'Yelp review',
  },
];

export const PROCESS = [
  {
    number: '01',
    title: 'Walk In or Request Fitting',
    copy: 'Tell us about the garment and your event. We will find a studio day that leaves room for proper work.',
  },
  {
    number: '02',
    title: 'On-Body Pinning by Kelly',
    copy: 'Every alteration starts on your body, in your shoes, with Kelly pinning the fit by hand.',
  },
  {
    number: '03',
    title: 'Precision Tailoring',
    copy: 'Fifteen-plus years of bench work: seams opened, shaped and closed again to follow your frame.',
  },
  {
    number: '04',
    title: 'Final Try-On & Pickup',
    copy: 'You try it on once more, we check the movement and finish, then it is pressed and ready to go.',
  },
];

export const MILESTONES = [
  {
    stage: 'First Fitting',
    window: '6–8 Weeks Out',
    copy: 'Structure, hem and bustle decisions are pinned while there is room to be deliberate.',
  },
  {
    stage: 'Second Fitting',
    window: '3–4 Weeks Out',
    copy: 'Refinements are checked on the body and the fit is dialed in before the final countdown.',
  },
  {
    stage: 'Final Try-On & Steam',
    window: '1 Week Out',
    copy: 'A last walk, a last check, and a fresh press so the garment is ready before the day arrives.',
  },
];

export const GARMENT_OPTIONS = [
  'Bridal & formal gown',
  'Suit or blazer',
  'Pants, jeans or hems',
  'Zipper or garment repair',
  'Rush / last-minute alteration',
  'Something else',
];
