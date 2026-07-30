import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEMO_PASSWORD = 'password123'

function birthdateForAge(age: number): Date {
  const d = new Date()
  d.setFullYear(d.getFullYear() - age)
  d.setMonth(0, 15)
  return d
}

const DEMO_USERS = [
  {
    email: 'aisha@demo.jodi', name: 'Aisha', age: 25, city: 'Brooklyn', verified: true,
    chips: 'punjabi, muslim, hyderabadi at heart', familyCloseness: 'very close', faith: 'practising, relaxed',
    languages: 'hindi, urdu, english', kids: 'serious, not rushing',
    prompts: [
      { question: 'we’ll get along if', answer: 'you can debate biryani rankings without taking it personally' },
      { question: 'first thing people notice', answer: 'i talk with my hands and i will knock over your drink' },
      { question: 'a cause i care about', answer: 'teaching my little cousins they can just… pick their own life' },
    ],
  },
  {
    email: 'dev@demo.jodi', name: 'Dev', age: 29, city: 'Queens', verified: true,
    chips: 'gujarati, sunday cook, foodie', familyCloseness: 'very close', faith: 'cultural, not strict',
    languages: 'gujarati, hindi, english', kids: 'kids someday',
    prompts: [
      { question: 'the way to my heart is', answer: 'a plate of your nani’s cooking and zero small talk' },
      { question: 'i geek out on', answer: 'regional gujarati thali variations. i have a spreadsheet.' },
      { question: 'dating me is like', answer: 'a very calm person driving you to the airport at 4am' },
    ],
  },
  {
    email: 'zoya@demo.jodi', name: 'Zoya', age: 26, city: 'Hoboken', verified: true,
    chips: 'urdu poetry, qawwali nights, grad student', familyCloseness: 'close, not clingy', faith: 'spiritual, not strict',
    languages: 'urdu, hindi, english', kids: 'something serious',
    prompts: [
      { question: 'together, we could', answer: 'lose an entire evening arguing about which ghazal is the saddest' },
      { question: 'my simple pleasure', answer: 'nusrat at full volume in a car going nowhere' },
      { question: 'unusual skill', answer: 'i can clock which city your urdu is from in one sentence' },
    ],
  },
  {
    email: 'karan@demo.jodi', name: 'Karan', age: 28, city: 'Jersey City', verified: false,
    chips: 'tamil, runner, filter coffee only', familyCloseness: 'close-knit', faith: 'agnostic',
    languages: 'tamil, english', kids: 'open to serious',
    prompts: [
      { question: 'my most controversial take', answer: 'filter kaapi > every fancy pour-over you’ve ever paid $7 for' },
      { question: 'i’m looking for', answer: 'someone who’ll come to the 6am run and complain the whole time' },
      { question: 'green flag i look for', answer: 'calls their parents without being guilted into it' },
    ],
  },
  {
    email: 'meera@demo.jodi', name: 'Meera', age: 27, city: 'Manhattan', verified: true,
    chips: 'bengali, old cinema, two cats', familyCloseness: 'fairly close', faith: 'relaxed',
    languages: 'bengali, hindi, english', kids: 'serious, not rushing',
    prompts: [
      { question: 'a shared value matters more than', answer: 'a shared netflix password — but ideally we have both' },
      { question: 'my happy place', answer: 'a rep cinema at 2pm on a weekday, entirely alone' },
      { question: 'two truths and a lie', answer: 'i’ve met ray’s cinematographer, i have two cats, i can drive' },
    ],
  },
  {
    email: 'neha@demo.jodi', name: 'Neha', age: 26, city: 'Edison', verified: false,
    chips: 'punjabi, bhangra, med school', familyCloseness: 'very close', faith: 'sikh, practising',
    languages: 'punjabi, hindi, english', kids: 'kids someday',
    prompts: [
      { question: 'small world if', answer: 'you also grew up in the edison masjid/gurdwara crowd' },
      { question: 'my love language is', answer: 'unsolicited home remedies for literally everything' },
      { question: 'a hot take', answer: 'punjabi mcs deserved better than being reduced to one song' },
    ],
  },
  {
    email: 'simran@demo.jodi', name: 'Simran', age: 27, city: 'Astoria', verified: true,
    chips: 'sikh, live music, indie', familyCloseness: 'close, not clingy', faith: 'sikh, relaxed',
    languages: 'punjabi, english', kids: 'open to serious',
    prompts: [
      { question: 'green flag i look for', answer: 'someone who’ll stand in the pit with me and not complain' },
      { question: 'first date energy', answer: 'a gig, then greasy food, then arguing about the setlist' },
      { question: 'i geek out on', answer: 'prateek kuhad b-sides nobody asked about' },
    ],
  },
  {
    email: 'priya@demo.jodi', name: 'Priya', age: 24, city: 'Bay Area', verified: true,
    chips: 'telugu, classical dance, engineer', familyCloseness: 'very close', faith: 'hindu, practising',
    languages: 'telugu, hindi, english', kids: 'serious, not rushing',
    prompts: [
      { question: 'unusual skill', answer: 'i can still do a full bharatanatyam adavu after 15 years off' },
      { question: 'my simple pleasure', answer: 'sunday dosa with my amma on video call' },
      { question: 'dating me is like', answer: 'a very structured itinerary that somehow still has room for spontaneity' },
    ],
  },
  {
    email: 'raj@demo.jodi', name: 'Raj', age: 30, city: 'Toronto', verified: false,
    chips: 'gujarati, cricket, startup life', familyCloseness: 'close-knit', faith: 'cultural, not strict',
    languages: 'gujarati, hindi, english', kids: 'kids someday',
    prompts: [
      { question: 'my most controversial take', answer: 'test cricket is better than every t20 game combined' },
      { question: 'the way to my heart is', answer: 'debugging my code without being asked, honestly' },
      { question: 'i’m looking for', answer: 'someone who’ll call me out when i’m being a workaholic' },
    ],
  },
  {
    email: 'sana@demo.jodi', name: 'Sana', age: 28, city: 'London', verified: true,
    chips: 'pakistani, poetry, chai snob', familyCloseness: 'very close', faith: 'muslim, practising',
    languages: 'urdu, punjabi, english', kids: 'something serious',
    prompts: [
      { question: 'we’ll get along if', answer: 'you know the difference between doodh patti and karak and have opinions' },
      { question: 'a cause i care about', answer: 'getting more girls in my family into engineering, not just medicine' },
      { question: 'two truths and a lie', answer: 'i’ve memorised 40 ghalib couplets, i hate cricket, i can’t swim' },
    ],
  },
]

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10)

  for (const u of DEMO_USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash,
        name: u.name,
        birthdate: birthdateForAge(u.age),
        city: u.city,
        verified: u.verified,
        chips: u.chips,
        familyCloseness: u.familyCloseness,
        faith: u.faith,
        languages: u.languages,
        kids: u.kids,
      },
    })

    const existingPrompts = await prisma.prompt.count({ where: { userId: user.id } })
    if (existingPrompts === 0) {
      await prisma.prompt.createMany({
        data: u.prompts.map((p, i) => ({ userId: user.id, question: p.question, answer: p.answer, order: i })),
      })
    }
  }

  console.log(`Seeded ${DEMO_USERS.length} demo profiles. Every demo account's password is "${DEMO_PASSWORD}".`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
