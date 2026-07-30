import type { ChatContact, ChatMessage, LikeEntry, Profile, ProfileExtras } from './types'

export const GRADIENTS = {
  pom: 'linear-gradient(150deg,#E5326E,#8E1247)',
  amber: 'linear-gradient(150deg,#F5A524,#C2571A)',
  green: 'linear-gradient(150deg,#16A6A0,#0B5A56)',
  plum: 'linear-gradient(150deg,#7B3FA0,#3E1A63)',
  indigo: 'linear-gradient(150deg,#3B4CC0,#1B2478)',
  teal: 'linear-gradient(150deg,#0E9B8E,#064F49)',
  rose: 'linear-gradient(150deg,#F26C8A,#A32B4F)',
} as const

const G = GRADIENTS

export const PROFILES: Profile[] = [
  {
    name: 'Aisha', age: 25, city: 'Brooklyn', dist: '2 mi away', mono: 'A', grad: G.pom, verified: true, score: 94,
    chips: ['punjabi', 'muslim', 'hyderabadi at heart'], promptQ: 'we’ll get along if',
    promptA: 'you can debate biryani rankings without taking it personally', voice: '0:11', mutual: true,
  },
  {
    name: 'Dev', age: 29, city: 'Queens', dist: '5 mi away', mono: 'D', grad: G.indigo, verified: true, score: 88,
    chips: ['gujarati', 'sunday cook', 'foodie'], promptQ: 'the way to my heart is',
    promptA: 'a plate of your nani’s cooking and zero small talk', voice: '0:09', mutual: false,
  },
  {
    name: 'Zoya', age: 26, city: 'Hoboken', dist: '3 mi away', mono: 'Z', grad: G.plum, verified: true, score: 91,
    chips: ['urdu poetry', 'qawwali nights', 'grad student'], promptQ: 'together, we could',
    promptA: 'lose an entire evening arguing about which ghazal is the saddest', voice: '0:14', mutual: true,
  },
  {
    name: 'Karan', age: 28, city: 'Jersey City', dist: '4 mi away', mono: 'K', grad: G.green, verified: false, score: 79,
    chips: ['tamil', 'runner', 'filter coffee only'], promptQ: 'my most controversial take',
    promptA: 'filter kaapi > every fancy pour-over you’ve ever paid $7 for', voice: '0:08', mutual: false,
  },
  {
    name: 'Meera', age: 27, city: 'Manhattan', dist: '6 mi away', mono: 'M', grad: G.amber, verified: true, score: 86,
    chips: ['bengali', 'old cinema', 'two cats'], promptQ: 'a shared value matters more than',
    promptA: 'a shared netflix password — but ideally we have both', voice: '0:12', mutual: true,
  },
]

export const EXTRAS: Record<string, ProfileExtras> = {
  Aisha: {
    prompts: [
      { q: 'we’ll get along if', a: 'you can debate biryani rankings without taking it personally' },
      { q: 'first thing people notice', a: 'i talk with my hands and i will knock over your drink' },
      { q: 'a cause i care about', a: 'teaching my little cousins they can just… pick their own life' },
    ],
    compat: [['family closeness', 'both very close', 96], ['faith', 'practising, relaxed', 92], ['what you want', 'serious, not rushing', 94], ['day to day', 'night owls, big eaters', 88]],
  },
  Dev: {
    prompts: [
      { q: 'the way to my heart is', a: 'a plate of your nani’s cooking and zero small talk' },
      { q: 'i geek out on', a: 'regional gujarati thali variations. i have a spreadsheet.' },
      { q: 'dating me is like', a: 'a very calm person driving you to the airport at 4am' },
    ],
    compat: [['family closeness', 'both very close', 94], ['faith', 'cultural, not strict', 86], ['what you want', 'kids someday', 90], ['day to day', 'sunday cooks', 84]],
  },
  Zoya: {
    prompts: [
      { q: 'together, we could', a: 'lose an entire evening arguing about which ghazal is the saddest' },
      { q: 'my simple pleasure', a: 'nusrat at full volume in a car going nowhere' },
      { q: 'unusual skill', a: 'i can clock which city your urdu is from in one sentence' },
    ],
    compat: [['languages', 'hindi and urdu both', 98], ['faith', 'spiritual, not strict', 90], ['what you want', 'something serious', 88], ['staying put', 'neither wants to leave', 92]],
  },
  Karan: {
    prompts: [
      { q: 'my most controversial take', a: 'filter kaapi > every fancy pour-over you’ve ever paid $7 for' },
      { q: 'i’m looking for', a: 'someone who’ll come to the 6am run and complain the whole time' },
      { q: 'green flag i look for', a: 'calls their parents without being guilted into it' },
    ],
    compat: [['family closeness', 'both close-knit', 88], ['faith', 'you two differ here', 54], ['what you want', 'open to serious', 76], ['day to day', 'early risers', 82]],
  },
  Meera: {
    prompts: [
      { q: 'a shared value matters more than', a: 'a shared netflix password — but ideally we have both' },
      { q: 'my happy place', a: 'a rep cinema at 2pm on a weekday, entirely alone' },
      { q: 'two truths and a lie', a: 'i’ve met ray’s cinematographer, i have two cats, i can drive' },
    ],
    compat: [['family closeness', 'both fairly close', 84], ['faith', 'both relaxed', 88], ['what you want', 'serious', 92], ['day to day', 'old films, two cats', 80]],
  },
}

export const LIKES_DATA: LikeEntry[] = [
  { mono: 'S', grad: G.teal, hint: 'loves live music', city: 'Astoria', rose: true },
  { mono: 'A', grad: G.rose, hint: 'punjabi · doctor', city: 'Newark', rose: false },
  { mono: 'P', grad: G.plum, hint: 'gym + gulab jamun', city: 'Edison', rose: false },
  { mono: 'N', grad: G.amber, hint: 'bengali · architect', city: 'Brooklyn', rose: false },
  { mono: 'R', grad: G.indigo, hint: 'reads a lot', city: 'Hoboken', rose: false },
  { mono: 'T', grad: G.green, hint: 'tamil · treks a lot', city: 'Queens', rose: false },
]

export const CHAT_DATA: ChatContact[] = [
  { name: 'Aisha', mono: 'A', grad: G.pom, online: true },
  { name: 'Neha', mono: 'N', grad: G.teal, online: false },
  { name: 'Simran', mono: 'S', grad: G.plum, online: true },
]

export const INITIAL_THREADS: Record<string, ChatMessage[]> = {
  Aisha: [
    { me: false, text: 'ok your voice note genuinely made me laugh, the biryani take is bold' },
    { me: true, text: 'i stand by it. hyderabadi supremacy, i don’t make the rules' },
    { me: false, text: 'we’re gonna fight about this and i’m kinda into it. chai this weekend?' },
  ],
  Neha: [
    { me: false, text: 'wait you’re also from the edison masjid crowd?? small world' },
    { me: true, text: 'HAH yes. did we maybe go to the same eid mela in like 2011' },
  ],
  Simran: [
    { me: false, text: 'saw you like prateek kuhad too, instant green flag' },
  ],
}

export const CHAT_LIST_FALLBACK: Record<string, string> = {
  Aisha: 'chai this weekend?',
  Neha: 'same eid mela in 2011 lol',
  Simran: 'instant green flag',
}

export const REPLY_BANK = [
  "haha ok you're actually funny",
  "stop that's so real",
  'ok so when are we getting chai',
  'adding that to the green flag list ngl',
]

export const ME_PREFS = [
  { k: 'family', v: 'very close' },
  { k: 'faith', v: 'spiritual' },
  { k: 'languages', v: 'hindi · urdu' },
  { k: 'kids', v: 'someday' },
]
