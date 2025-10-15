import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Quote from '../models/Quote.js';
import Message from '../models/Message.js';
import Subscription from '../models/Subscription.js';

// Load environment variables
dotenv.config();

const loveQuotes = [
  {
    title: "Love is patient",
    content: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.",
    author: "1 Corinthians 13:4",
    type: "love",
    language: "en",
    tags: ["patience", "kindness", "biblical"],
    priority: 10
  },
  {
    title: "Love conquers all",
    content: "Love conquers all things; let us too surrender to love.",
    author: "Virgil",
    type: "love",
    language: "en",
    tags: ["conquest", "surrender", "classic"],
    priority: 9
  },
  {
    title: "The greatest thing",
    content: "The greatest thing you'll ever learn is just to love and be loved in return.",
    author: "Moulin Rouge",
    type: "love",
    language: "en",
    tags: ["learning", "reciprocal", "movie"],
    priority: 8
  },
  {
    title: "Love yourself first",
    content: "You yourself, as much as anybody in the entire universe, deserve your love and affection.",
    author: "Buddha",
    type: "love",
    language: "en",
    tags: ["self-love", "deserve", "buddhist"],
    priority: 9
  },
  {
    title: "Love is friendship",
    content: "Love is friendship that has caught fire. It is quiet understanding, mutual confidence, sharing and forgiving.",
    author: "Ann Landers",
    type: "love",
    language: "en",
    tags: ["friendship", "understanding", "forgiveness"],
    priority: 8
  },
  {
    title: "Love is not possession",
    content: "If you love something, let it go. If it comes back to you, it's yours. If it doesn't, it never was.",
    author: "Richard Bach",
    type: "love",
    language: "en",
    tags: ["freedom", "letting-go", "possession"],
    priority: 7
  },
  {
    title: "Love is the answer",
    content: "Love is the answer, and you know that for sure. Love is a flower, you've got to let it grow.",
    author: "John Lennon",
    type: "love",
    language: "en",
    tags: ["answer", "growth", "flower", "lennon"],
    priority: 8
  },
  {
    title: "Love is a verb",
    content: "Love is a verb. Love - the feeling - is a fruit of love, the verb.",
    author: "Stephen Covey",
    type: "love",
    language: "en",
    tags: ["action", "verb", "feeling"],
    priority: 7
  },
  {
    title: "Love is like the wind",
    content: "Love is like the wind, you can't see it but you can feel it.",
    author: "Nicholas Sparks",
    type: "love",
    language: "en",
    tags: ["wind", "invisible", "feeling"],
    priority: 6
  },
  {
    title: "Love is the only force",
    content: "Love is the only force capable of transforming an enemy into a friend.",
    author: "Martin Luther King Jr.",
    type: "love",
    language: "en",
    tags: ["transformation", "enemy", "friend", "mlk"],
    priority: 9
  },
  {
    title: "Love is unconditional",
    content: "True love is unconditional. It is not based on what the other person does or doesn't do.",
    author: "Unknown",
    type: "love",
    language: "en",
    tags: ["unconditional", "true-love"],
    priority: 8
  },
  {
    title: "Love is the bridge",
    content: "Love is the bridge between you and everything.",
    author: "Rumi",
    type: "love",
    language: "en",
    tags: ["bridge", "connection", "rumi"],
    priority: 9
  },
  {
    title: "Love is the greatest gift",
    content: "The greatest gift you can give someone is your time, your attention, your love, and your concern.",
    author: "Joel Osteen",
    type: "love",
    language: "en",
    tags: ["gift", "time", "attention"],
    priority: 8
  },
  {
    title: "Love is a choice",
    content: "Love is a choice you make from moment to moment.",
    author: "Barbara De Angelis",
    type: "love",
    language: "en",
    tags: ["choice", "moment", "decision"],
    priority: 7
  },
  {
    title: "Love is the foundation",
    content: "Love is the foundation of everything. Love is the foundation of life.",
    author: "Unknown",
    type: "love",
    language: "en",
    tags: ["foundation", "life", "everything"],
    priority: 6
  }
];

const bibleQuotes = [
  {
    title: "John 3:16",
    content: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    author: "John 3:16",
    type: "bible",
    language: "en",
    tags: ["salvation", "eternal-life", "sacrifice"],
    priority: 10
  },
  {
    title: "Jeremiah 29:11",
    content: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.",
    author: "Jeremiah 29:11",
    type: "bible",
    language: "en",
    tags: ["plans", "hope", "future", "prosperity"],
    priority: 10
  },
  {
    title: "Philippians 4:13",
    content: "I can do all things through Christ who strengthens me.",
    author: "Philippians 4:13",
    type: "bible",
    language: "en",
    tags: ["strength", "christ", "capability"],
    priority: 9
  },
  {
    title: "Proverbs 3:5-6",
    content: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    author: "Proverbs 3:5-6",
    type: "bible",
    language: "en",
    tags: ["trust", "guidance", "understanding"],
    priority: 9
  },
  {
    title: "Romans 8:28",
    content: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    author: "Romans 8:28",
    type: "bible",
    language: "en",
    tags: ["purpose", "good", "calling"],
    priority: 8
  },
  {
    title: "Isaiah 40:31",
    content: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
    author: "Isaiah 40:31",
    type: "bible",
    language: "en",
    tags: ["hope", "strength", "eagles", "renewal"],
    priority: 8
  },
  {
    title: "Matthew 11:28",
    content: "Come to me, all you who are weary and burdened, and I will give you rest.",
    author: "Matthew 11:28",
    type: "bible",
    language: "en",
    tags: ["rest", "burden", "weary", "jesus"],
    priority: 9
  },
  {
    title: "Psalm 23:1",
    content: "The Lord is my shepherd, I lack nothing.",
    author: "Psalm 23:1",
    type: "bible",
    language: "en",
    tags: ["shepherd", "provision", "psalm"],
    priority: 8
  },
  {
    title: "Galatians 5:22-23",
    content: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.",
    author: "Galatians 5:22-23",
    type: "bible",
    language: "en",
    tags: ["fruit", "spirit", "virtues"],
    priority: 7
  },
  {
    title: "2 Corinthians 5:17",
    content: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!",
    author: "2 Corinthians 5:17",
    type: "bible",
    language: "en",
    tags: ["new-creation", "transformation", "christ"],
    priority: 8
  },
  {
    title: "Ephesians 2:8-9",
    content: "For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast.",
    author: "Ephesians 2:8-9",
    type: "bible",
    language: "en",
    tags: ["grace", "salvation", "faith", "gift"],
    priority: 8
  },
  {
    title: "Joshua 1:9",
    content: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
    author: "Joshua 1:9",
    type: "bible",
    language: "en",
    tags: ["courage", "strength", "presence", "command"],
    priority: 9
  },
  {
    title: "Psalm 46:1",
    content: "God is our refuge and strength, an ever-present help in trouble.",
    author: "Psalm 46:1",
    type: "bible",
    language: "en",
    tags: ["refuge", "strength", "help", "trouble"],
    priority: 8
  },
  {
    title: "1 John 4:19",
    content: "We love because he first loved us.",
    author: "1 John 4:19",
    type: "bible",
    language: "en",
    tags: ["love", "first-love", "response"],
    priority: 7
  },
  {
    title: "Matthew 6:26",
    content: "Look at the birds of the air; they do not sow or reap or store away in barns, and yet your heavenly Father feeds them. Are you not much more valuable than they?",
    author: "Matthew 6:26",
    type: "bible",
    language: "en",
    tags: ["birds", "provision", "value", "father"],
    priority: 7
  },
  {
    title: "Hebrews 11:1",
    content: "Now faith is confidence in what we hope for and assurance about what we do not see.",
    author: "Hebrews 11:1",
    type: "bible",
    language: "en",
    tags: ["faith", "confidence", "hope", "assurance"],
    priority: 8
  }
];

// Swahili translations for some quotes
const loveQuotesSwahili = [
  {
    title: "Upendo ni uvumilivu",
    content: "Upendo ni uvumilivu, upendo ni wema. Hauonwi na wivu, haujivuni, haujipazi.",
    author: "1 Wakorintho 13:4",
    type: "love",
    language: "sw",
    tags: ["uvumilivu", "wema", "kibiblia"],
    priority: 10
  },
  {
    title: "Upendo unashinda yote",
    content: "Upendo unashinda mambo yote; na sisi tuongoke kwa upendo.",
    author: "Virgil",
    type: "love",
    language: "sw",
    tags: ["ushindi", "kuongoka", "kikabla"],
    priority: 9
  },
  {
    title: "Kitu kikubwa zaidi",
    content: "Kitu kikubwa zaidi utakachojifunza ni kupenda na kupendwa.",
    author: "Moulin Rouge",
    type: "love",
    language: "sw",
    tags: ["kujifunza", "kurudiana", "filamu"],
    priority: 8
  }
];

const bibleQuotesSwahili = [
  {
    title: "Yohana 3:16",
    content: "Maana Mungu aliupenda ulimwengu hata akamtoa Mwanawe pekee, ili kila mtu amwaminiye asipotee, bali awe na uzima wa milele.",
    author: "Yohana 3:16",
    type: "bible",
    language: "sw",
    tags: ["wokovu", "uzima-wa-milele", "dhabihu"],
    priority: 10
  },
  {
    title: "Yeremia 29:11",
    content: "Maana mimi najua mawazo yangu juu yenu, asema Bwana, mawazo ya amani, si ya maovu, ili nipeni tumaini na mwisho.",
    author: "Yeremia 29:11",
    type: "bible",
    language: "sw",
    tags: ["mawazo", "tumaini", "mwisho", "ustawi"],
    priority: 10
  },
  {
    title: "Wafilipi 4:13",
    content: "Ninaweza kufanya mambo yote kwa Kristo anayenipa nguvu.",
    author: "Wafilipi 4:13",
    type: "bible",
    language: "sw",
    tags: ["nguvu", "kristo", "uwezo"],
    priority: 9
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional - remove this in production)
    console.log('Clearing existing data...');
    await Quote.deleteMany({});
    console.log('Cleared existing quotes');

    // Insert love quotes (English)
    console.log('Inserting English love quotes...');
    const insertedLoveQuotes = await Quote.insertMany(loveQuotes);
    console.log(`Inserted ${insertedLoveQuotes.length} English love quotes`);

    // Insert Bible quotes (English)
    console.log('Inserting English Bible quotes...');
    const insertedBibleQuotes = await Quote.insertMany(bibleQuotes);
    console.log(`Inserted ${insertedBibleQuotes.length} English Bible quotes`);

    // Insert Swahili love quotes
    console.log('Inserting Swahili love quotes...');
    const insertedLoveQuotesSwahili = await Quote.insertMany(loveQuotesSwahili);
    console.log(`Inserted ${insertedLoveQuotesSwahili.length} Swahili love quotes`);

    // Insert Swahili Bible quotes
    console.log('Inserting Swahili Bible quotes...');
    const insertedBibleQuotesSwahili = await Quote.insertMany(bibleQuotesSwahili);
    console.log(`Inserted ${insertedBibleQuotesSwahili.length} Swahili Bible quotes`);

    // Create sample admin user
    console.log('Creating sample admin user...');
    const adminUser = new User({
      phoneNumber: '254700000000',
      name: 'Admin User',
      isActive: true,
      preferences: {
        language: 'en',
        deliveryTime: '09:00'
      },
      totalSpent: 0
    });
    await adminUser.save();
    console.log('Created sample admin user');

    // Create sample regular user
    console.log('Creating sample regular user...');
    const regularUser = new User({
      phoneNumber: '254711111111',
      name: 'John Doe',
      isActive: true,
      preferences: {
        language: 'en',
        deliveryTime: '09:00'
      },
      subscriptionHistory: [{
        type: 'love',
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        isActive: true,
        billingCycle: 'daily'
      }],
      totalSpent: 5
    });
    await regularUser.save();
    console.log('Created sample regular user');

    // Create sample subscription
    console.log('Creating sample subscription...');
    const sampleSubscription = new Subscription({
      userId: regularUser._id,
      phoneNumber: regularUser.phoneNumber,
      type: 'love',
      billingCycle: 'daily',
      cost: 5,
      currency: 'KES',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      nextBillingDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isAutoRenew: true,
      totalPaid: 5,
      paymentHistory: [{
        amount: 5,
        currency: 'KES',
        status: 'successful',
        paymentDate: new Date()
      }]
    });
    await sampleSubscription.save();
    console.log('Created sample subscription');

    // Create sample messages
    console.log('Creating sample messages...');
    const sampleMessages = [
      {
        recipient: regularUser.phoneNumber,
        content: 'Welcome to Daily Love Quotes! 🥰\n\n"Love is patient, love is kind."\n\nYou will receive daily love quotes at 09:00. Cost: Ksh 5/day.',
        type: 'welcome',
        channel: 'sms',
        status: 'delivered',
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        recipient: regularUser.phoneNumber,
        content: '🥰 Daily Love Quote\n\n"Love conquers all things; let us too surrender to love."\n\n- Virgil\n\nTo unsubscribe, text STOP.',
        type: 'love',
        channel: 'sms',
        status: 'delivered',
        sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      }
    ];
    await Message.insertMany(sampleMessages);
    console.log('Created sample messages');

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`\nTotal quotes inserted: ${insertedLoveQuotes.length + insertedBibleQuotes.length + insertedLoveQuotesSwahili.length + insertedBibleQuotesSwahili.length}`);
    console.log('- English love quotes:', insertedLoveQuotes.length);
    console.log('- English Bible quotes:', insertedBibleQuotes.length);
    console.log('- Swahili love quotes:', insertedLoveQuotesSwahili.length);
    console.log('- Swahili Bible quotes:', insertedBibleQuotesSwahili.length);
    console.log('\nSample data created for testing and development.');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
