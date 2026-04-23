import { protectedProcedure, publicProcedure, router } from "./init.js";

export const appRouter = router({
  ping: publicProcedure.query(() => ({ pong: true as const })),
  me: protectedProcedure.query(({ ctx }) => ctx.user),
  hej: publicProcedure.query(() => ({ hej: "hej världen!" as const })),
});

export type AppRouter = typeof appRouter;
