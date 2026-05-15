import { deleteAccountForUser } from '../db/delete-account-for-user.js';
import { protectedProcedure, router } from './init.js';

export const accountRouter = router({
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await deleteAccountForUser(ctx.user.id);
  }),
});