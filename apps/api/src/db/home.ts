import { db } from './index.js';
import { home, userHome } from './schema.js';

export async function createHomeForUser(userId: string) {
  return await db.transaction(async (tx) => {
    const [createdHome] = await tx.insert(home).values({}).returning();
    await tx.insert(userHome).values({ userId, homeId: createdHome.id });
    return createdHome;
  });
}
