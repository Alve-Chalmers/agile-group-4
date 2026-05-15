import { deleteAccountInTransaction } from './delete-account.js';
import { db } from './index.js';

export async function deleteAccountForUser(userId: string) {
  return await db.transaction(async (tx) => deleteAccountInTransaction(tx, userId));
}