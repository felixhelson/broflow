import type { Partner } from '../store/partnersStore';

export const mockPartner: Partner = {
  id: 'demo-partner-1',
  name: 'Sophia',
  avatarColor: '#E84C8B',
  avgCycleLength: 28,
  avgPeriodLength: 5,
  lastPeriodStart: '2026-02-19',
  birthday: null,
  notes: null,
  cycleStatus: {
    currentPhase: 'LUTEAL',
    currentDay: 24,
    daysUntilPeriod: 4,
    daysUntilOvulation: 18,
    cycleProgress: 86,
    periodStartPredicted: '2026-03-19',
    ovulationWindowStart: '2026-03-01',
    ovulationWindowEnd: '2026-03-03',
    moodAlert: {
      level: 'medium',
      title: 'Emotions running high',
      message: 'She may feel more sensitive or irritable right now — PMS is kicking in. A little patience and a thoughtful gesture goes a long way.',
      emoji: '💛',
    },
    giftRecommendations: [
      { category: 'CHOCOLATE', reason: 'Cravings are real in the luteal phase', urgency: 'now' },
      { category: 'WELLNESS', reason: 'Warmth and relaxation help with cramps', urgency: 'soon' },
      { category: 'TEA', reason: 'Herbal teas ease bloating and mood', urgency: 'anytime' },
    ],
    funFact: 'During the luteal phase, body temperature rises by 0.3–0.6°C after ovulation — which is why she might feel warmer than usual.',
    adviceForToday: "Her period is 4 days away — this is the ideal window to show up before she even asks. Order something warm and comforting, clear your schedule for the weekend, and check in without her having to prompt you.",
  },
};

export const mockUser = {
  id: 'demo-user-1',
  email: 'demo@broflow.app',
  firstName: 'Marcus',
  profileType: 'SINGLE',
  pointsBalance: 0,
};

export const mockGifts = [
  // CHOCOLATE
  {
    id: 'gift-1',
    name: 'Belgian Chocolate Dipped Strawberries',
    category: 'CHOCOLATE',
    priceInCents: 6500,
    imageUrl: 'https://www.edibleblooms.com.au/cdn/shop/files/ChocStrawberries-Alt3.jpg?v=1772067978',
    description: 'A dozen fresh strawberries dipped in the finest Belgian milk chocolate, created fresh daily. Our bestselling gift — a dozen reasons to celebrate.',
    business: { name: 'Edible Blooms', location: 'Brisbane, QLD' },
    sponsor: null,
    reviews: [
      { author: 'Sarah M.', rating: 5, text: 'I was spoiled with the most beautiful birthday surprise from Edible Blooms Brisbane! The presentation was stunning and every item felt so carefully chosen.' },
      { author: 'Jessica T.', rating: 5, text: 'Had the absolute best first experience with Edible Blooms for my partner\'s birthday last week. So beautifully packaged and the sweets were delicious and fresh!' },
    ],
  },
  {
    id: 'gift-2',
    name: 'Sip & Savour Bundle',
    category: 'CHOCOLATE',
    priceInCents: 2700,
    imageUrl: 'https://cdn.shopify.com/s/files/1/0915/1807/5179/files/Pana_Organic_Bundle_Chai_3_45g.jpg?v=1754288968',
    description: 'New to Pana Organic or a long-time fan? Curated with care — 45g chocolate blocks paired with Chai Masala or rich Hot Chocolate Blend. Perfect for slow afternoons and cozy evenings.',
    business: { name: 'Pana Chocolate', location: 'Melbourne, VIC' },
    sponsor: null,
    reviews: [
      { author: 'Emma R.', rating: 5, text: 'Omg no words. It was like eating hot cross buns. Honestly didn\'t want to share it.' },
      { author: 'Claire B.', rating: 5, text: 'This combo is my favourite! Can\'t get enough! I have to hide it from my kids or it will be gone in a blink!!' },
    ],
  },
  // FLOWERS
  {
    id: 'gift-3',
    name: 'Small Colour Bouquet',
    category: 'FLOWERS',
    priceInCents: 7500,
    imageUrl: 'https://dailyblooms.com.au/cdn/shop/files/Small-Colour-Handheld-Summer-LR-2026_97894285-8097-4e20-a0f3-dfa70a2f21a2_grande.jpg?v=1771033864',
    description: 'Thoughtfully sized and full of character — bursting with vibrant seasonal blooms. Compact, but delivers on colour, charm, and that instant \'just because\' joy. Same-day delivery across major Australian cities.',
    business: { name: 'Daily Blooms', location: 'Brisbane, QLD' },
    sponsor: null,
    reviews: [
      { author: 'Natalie K.', rating: 5, text: 'I just wanted to say a huge thank you for all your support in delivering such beautiful flowers. You\'ve helped make the distance between my partner and me a little easier.' },
      { author: 'Olivia S.', rating: 5, text: 'Just amazing. Ordered on the day and delivered same day. Such an easy process, kept in the loop with a tracking link. Great product as well.' },
    ],
  },
  {
    id: 'gift-4',
    name: 'Florist\'s Pick Bouquet',
    category: 'FLOWERS',
    priceInCents: 7900,
    imageUrl: 'https://www.floraly.com.au/cdn/shop/files/0704_IMG_8781_FLORIST_PICK_1.png?v=1751885016',
    description: 'Soft pink Big Mammas, dainty daisy chrysanthemums, and bold pink Ice Proteas that make a real statement. Accents of Thryptomene and woolly bush for fresh, seasonal texture. Changes monthly.',
    business: { name: 'Floraly', location: 'Sydney, NSW' },
    sponsor: null,
    reviews: [
      { author: 'Amanda P.', rating: 5, text: 'This is the first time I have ever ordered from Floraly and it has been great. I will be ordering often now — thank you.' },
      { author: 'James W.', rating: 5, text: 'My daughter and wife loved the flowers which is really the only thing that matters!' },
    ],
  },
  // WELLNESS
  {
    id: 'gift-5',
    name: 'Little Box of Calm',
    category: 'WELLNESS',
    priceInCents: 5000,
    imageUrl: 'https://www.perfectpotion.com.au/cdn/shop/files/Littleboxofcalm-_1seller.webp?v=1761517481',
    description: 'A mini soul-soothing ritual. Give the gift of peace and instant relaxation — lush florals to inhale and feel stress melt away. Gently encourages her to find calm on the go.',
    business: { name: 'Perfect Potion', location: 'Brisbane, QLD' },
    sponsor: null,
    reviews: [
      { author: 'Margaret L.', rating: 5, text: 'A lovely relaxing duo of spray and roll-on. Just right for packing into a travel pack. The beautiful lingering fragrance was light and refreshing. My granddaughter loved it.' },
      { author: 'Diane F.', rating: 5, text: 'What a wonderful box of surprises. Will use all often. Thank you.' },
    ],
  },
  // SKINCARE
  {
    id: 'gift-7',
    name: 'Delightful Bites Gift Hamper',
    category: 'FOOD',
    priceInCents: 5500,
    imageUrl: 'https://byronbaygifts.com.au/cdn/shop/products/byron-bay-gifts-gift-hampers-delightful-bites-gift-hamper-gf-gb0031-39153865359582.png?v=1712885125',
    description: 'Perfectly curated assortment of Byron Bay Cookies, Wallaby Bites, Falwasser Crispbread, Wattle Tree Creek and Byron Bay Bliss Balls. All Australian, all delicious.',
    business: { name: 'Byron Bay Gifts', location: 'Byron Bay, NSW' },
    sponsor: null,
    reviews: [
      { author: 'Helen C.', rating: 5, text: 'The gift hamper recipient was very happy with the hamper and all in it. I was very happy with the selection offered, the affordability and the service.' },
      { author: 'Patricia M.', rating: 5, text: 'Placed this order on Saturday and it was delivered on Thursday as hoped! The recipient is very happy with her gift and so am I. Thank you so much 🙏' },
    ],
  },
  {
    id: 'gift-8',
    name: 'Helping Hands Kit',
    category: 'SKINCARE',
    priceInCents: 6500,
    imageUrl: 'https://u1nb1km7t5q7.cloudfront.net/6sbiaAhfdZKDLzX79ZefSQ/5fefd63675481e7c98f72f7a8a0f9e21/Aesop_Kits_Gift_Kits_2025-26__Helping_Hands_Trio_GL_Web_Front_Large_1800X1093px.png',
    description: 'A trio of assistants to hydrate busy palms and fingers, each with a unique aroma. Iconic Aesop quality in a beautifully presented kit.',
    business: { name: 'Aesop', location: 'Melbourne, VIC' },
    sponsor: null,
    reviews: [
      { author: 'Sophie A.', rating: 5, text: 'Great place, high end products!' },
      { author: 'Laura H.', rating: 5, text: 'I\'m in love with this kit! Smells so fresh and nice.' },
    ],
  },
  // CANDLES
  {
    id: 'gift-9',
    name: 'A Tahaa Affair Scent Stems',
    category: 'CANDLES',
    priceInCents: 1699,
    imageUrl: 'https://www.glasshousefragrances.com/cdn/shop/files/fgr005tahaa-glasshouse-diffuser-scent-stems-a-tahaa-affair-refill-packshot-front-1800x2250-02_21411d4a-3a29-4da6-815e-4a11fd627e5c.jpg',
    description: 'Ambrosial with heavenly caramel and coconut — it\'ll take you to the beaches of Tahaa. 5 replacement scent stems so the ambience never ends.',
    business: { name: 'Glasshouse Fragrances', location: 'Sydney, NSW' },
    sponsor: null,
    reviews: [
      { author: 'Melissa T.', rating: 5, text: 'This scent is always so reliable and I always get told my house smells amazing when I use them!!' },
      { author: 'Karen B.', rating: 5, text: 'Lovely scent and long lasting. Glasshouse always make beautiful fragrances.' },
    ],
  },
  {
    id: 'gift-10',
    name: 'Summer Salt Self Care Pack',
    category: 'WELLNESS',
    priceInCents: 2900,
    imageUrl: 'https://www.summersaltbody.com/cdn/shop/files/Self_Care_Pack.jpg?v=1732177232',
    description: 'A thoughtfully curated self-care pack with Summer Salt Body products. Great same-day service and a beautiful alternative to sending flowers.',
    business: { name: 'Pookipoiga', location: 'Brisbane, QLD' },
    sponsor: null,
    reviews: [
      { author: 'Tegan R.', rating: 5, text: 'What can I say!!!! I could not have planned it better if I tried.' },
      { author: 'Brooke H.', rating: 5, text: 'Really great same-day service, and a good alternative to sending flowers! I\'ve been a gift recipient and have bought from here a few times too.' },
    ],
  },
  // TEA
  {
    id: 'gift-11',
    name: 'New York Breakfast Tea Cube',
    category: 'TEA',
    priceInCents: 2200,
    imageUrl: 'https://www.t2tea.com/cdn/shop/files/B125AE020_new_york_breakfast_tea_bag_1.png?v=1771585919',
    description: 'A pancake-inspired tea made with full-bodied black tea, maple syrup flavours and cinnamon. 25 tea bags in a beautiful gift cube.',
    business: { name: 'T2 Tea', location: 'Melbourne, VIC' },
    sponsor: null,
    reviews: [
      { author: 'Fiona M.', rating: 5, text: 'Delicious. Lovely tea for the evening. Comforting.' },
      { author: 'Stephanie G.', rating: 5, text: 'Great flavour, definitely one of my favourites.' },
    ],
  },
  {
    id: 'gift-12',
    name: 'A Little Joy Box',
    category: 'FOOD',
    priceInCents: 3900,
    imageUrl: 'https://wishingyouwell.com.au/cdn/shop/files/the_little_joy_box.png?v=1773488223',
    description: 'A little gift with a big message. Features a delicate inspirational ceramic trinket and indulgent Loco Love butter caramel pecan chocolate. Sweet, meaningful and beautifully boxed.',
    business: { name: 'Wishing You Well Gifts', location: 'Adelaide, SA' },
    sponsor: null,
    reviews: [
      { author: 'Christine L.', rating: 5, text: 'Kathy and the team at Wishing You Well go above and beyond with their customer service, communication and thoughtfully sourced and beautifully packaged gifts! 10/10 recommend!!' },
      { author: 'Barbara N.', rating: 5, text: 'My experience with Wishing You Well was absolutely 5 star service! Looking for a gift and they delivered perfectly.' },
    ],
  },
  // FOOD
  {
    id: 'gift-13',
    name: 'Flowers & Chocolate Bundle',
    category: 'FOOD',
    priceInCents: 9900,
    imageUrl: 'https://dailyblooms.com.au/cdn/shop/products/DB_Mothers-Day-Ecomm_MAR23_IMG_3021_WEB_grande.jpg?v=1681693784',
    description: 'Fresh seasonal bouquet paired with fairy floss and premium chocolates. Same-day delivery available across major Australian cities.',
    business: { name: 'Daily Blooms', location: 'Brisbane, QLD' },
    sponsor: null,
    reviews: [
      { author: 'Natalie K.', rating: 5, text: 'Just amazing. Ordered on the day and delivered same day. Such an easy process, kept in the loop with a tracking link.' },
      { author: 'Olivia S.', rating: 5, text: 'I just wanted to say a huge thank you for delivering such beautiful flowers. You\'ve helped make the distance between my partner and me a little easier.' },
    ],
  },
  {
    id: 'gift-14',
    name: 'Gourmet Comfort Food Hamper',
    category: 'FOOD',
    priceInCents: 8500,
    imageUrl: 'https://byronbaygifts.com.au/cdn/shop/files/byron-bay-gifts-em-gift-hampers-gourmet-food-hampers-gb0046-39287238066398.png?v=1712892416',
    description: 'Locally sourced Australian treats — crackers, dips, chutney, and sweets. Zero effort required from her.',
    business: { name: 'Byron Bay Gifts', location: 'Byron Bay, NSW' },
    sponsor: null,
    reviews: [
      { author: 'Helen C.', rating: 5, text: 'The gift hamper recipient was very happy with the hamper and all in it. Very happy with the selection, affordability and service.' },
      { author: 'Patricia M.', rating: 5, text: 'Placed this order on Saturday and it arrived as hoped. The recipient is very happy with her gift and so am I! Thank you so much 🙏' },
    ],
  },
];

// Reward gifts — redeemable for 500 points (free)
export const mockRewardGifts = [
  {
    id: 'reward-1',
    name: 'Artisan Chocolate Gift Box',
    category: 'CHOCOLATE',
    priceInCents: 3499,
    description: 'Single-origin chocolate collection — a thoughtful free gift for showing up consistently.',
    business: { name: 'Pana Chocolate' },
    isReward: true,
  },
  {
    id: 'reward-2',
    name: 'Calm & Comfort Tea Collection',
    category: 'TEA',
    priceInCents: 3200,
    description: 'Chamomile, peppermint, and ginger blends. A perfect free treat for her.',
    business: { name: 'T2 Tea' },
    isReward: true,
  },
];
