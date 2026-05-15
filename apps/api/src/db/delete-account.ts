import { and, eq, ne } from 'drizzle-orm';

import { home, product, user, userHome } from './schema.js';

type DeleteAccountTx = {
  query: {
    userHome: {
      findFirst: (args: { where?: unknown }) => Promise<{ homeId: number; userId: string } | undefined>;
    };
  };
  delete: (table: typeof home | typeof product | typeof userHome | typeof user) => {
    where: (condition: unknown) => Promise<unknown>;
  };
};

export async function deleteAccountInTransaction(tx: DeleteAccountTx, userId: string) {
  const userHomeRow = await tx.query.userHome.findFirst({
    where: eq(userHome.userId, userId),
  });

  if (userHomeRow) {
    const anotherUserStillLinked = await tx.query.userHome.findFirst({
      where: and(eq(userHome.homeId, userHomeRow.homeId), ne(userHome.userId, userId)),
    });

    if (!anotherUserStillLinked) {
      await tx.delete(product).where(eq(product.homeId, userHomeRow.homeId));
      await tx.delete(userHome).where(eq(userHome.userId, userId));
      await tx.delete(home).where(eq(home.id, userHomeRow.homeId));
    } else {
      await tx.delete(userHome).where(eq(userHome.userId, userId));
    }
  }

  await tx.delete(user).where(eq(user.id, userId));
}
