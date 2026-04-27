import { db } from "../db/index.js";
import { protectedProcedure, publicProcedure, router } from "./init.js";

export const appRouter = router({
  ping: publicProcedure.query(async () => ({ pong: (await db.execute('SELECT 1')).at(0) })),
  me: protectedProcedure.query(({ ctx }) => ctx.user),
});

export type AppRouter = typeof appRouter;
