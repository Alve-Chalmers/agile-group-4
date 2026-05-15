import { db } from './index.js';
import { category } from './schema.js';

const daysToSeconds = (days: number) => days * 24 * 60 * 60;

const categories = [
  {
    name: 'Milk',
    defaultShelfLifeSeconds: daysToSeconds(7),
  },
  {
    name: 'Yogurt',
    defaultShelfLifeSeconds: daysToSeconds(14),
  },
  {
    name: 'Cheese',
    defaultShelfLifeSeconds: daysToSeconds(21),
  },
  {
    name: 'Eggs',
    defaultShelfLifeSeconds: daysToSeconds(21),
  },
  {
    name: 'Butter',
    defaultShelfLifeSeconds: daysToSeconds(30),
  },
  {
    name: 'Chicken',
    defaultShelfLifeSeconds: daysToSeconds(2),
  },
  {
    name: 'Beef',
    defaultShelfLifeSeconds: daysToSeconds(3),
  },
  {
    name: 'Fish',
    defaultShelfLifeSeconds: daysToSeconds(2),
  },
  {
    name: 'Leafy Greens',
    defaultShelfLifeSeconds: daysToSeconds(5),
  },
  {
    name: 'Vegetables',
    defaultShelfLifeSeconds: daysToSeconds(7),
  },
  {
    name: 'Fresh Fruit',
    defaultShelfLifeSeconds: daysToSeconds(7),
  },
  {
    name: 'Berries',
    defaultShelfLifeSeconds: daysToSeconds(4),
  },
  {
    name: 'Bread',
    defaultShelfLifeSeconds: daysToSeconds(5),
  },
  {
    name: 'Cooked Leftovers',
    defaultShelfLifeSeconds: daysToSeconds(4),
  },
  {
    name: 'Frozen Food',
    defaultShelfLifeSeconds: daysToSeconds(90),
  },
  {
    name: 'Dry Pasta',
    defaultShelfLifeSeconds: daysToSeconds(365),
  },
  {
    name: 'Rice',
    defaultShelfLifeSeconds: daysToSeconds(365),
  },
  {
    name: 'Canned Food',
    defaultShelfLifeSeconds: daysToSeconds(730),
  },
  {
    name: 'Sauces',
    defaultShelfLifeSeconds: daysToSeconds(90),
  },
  {
    name: 'Juice',
    defaultShelfLifeSeconds: daysToSeconds(7),
  },
  {
    name: "Other",
    defaultShelfLifeSeconds: daysToSeconds(9999),
  }
];

async function seed() {
  await db.insert(category).values(categories).onConflictDoNothing();

  console.log('Seeded categories');
}

seed()
  .catch((error) => {
    console.error('Seed failed');
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
