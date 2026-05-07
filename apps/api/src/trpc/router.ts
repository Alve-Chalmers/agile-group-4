import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { product, userHome } from "../db/schema.js";
import { protectedProcedure, publicProcedure, router } from "./init.js";

export const getHome = async (userId: string) => {
  const { home } = (await db.query.userHome.findFirst({
    where: eq(userHome.userId, userId),
    columns: {},
    with: {
      home: {
        with: {
          products: true,
        },
      },
    },
  })) ?? { home: null };
  return home;
};

export const homeRouter = router({
  getHome: protectedProcedure.query(async ({ ctx }) => getHome(ctx.user.id)),
  changeProduct : protectedProcedure.input(z.object({
    id : z.number(),
    name: z.string(),
    //category: z.string(),
    expiresAt: z.coerce.string()
  }),
).mutation(async ({ ctx, input}) => {
  const home = await getHome(ctx.user.id);
  if (!home) {
        throw new TRPCError({ code: "NOT_FOUND" });
    }
  
  const [result] = await db.update(product).set({name : input.name, 
    //category : input.category, 
    expiresAt : new Date(input.expiresAt)}).where(and(and(eq(product.homeId, home?.id), eq(product.id, input.id)))).returning()
  if (!result) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }
}),
  addProduct: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        category: z.string(),
        expiresAt: z.coerce.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const home = await getHome(ctx.user.id);
      if (!home) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      await db.insert(product).values({
        homeId: home.id,
        name: input.name,
        category: input.category,
        expiresAt: new Date(input.expiresAt),
      });
    }),
    removeProduct: protectedProcedure.input(z.object({id: z.string(),}),)
    .mutation(async ({ctx, input}) => {
      const home = await getHome(ctx.user.id);
      if (!home) {
        throw new TRPCError({ code : "NOT_FOUND"});
      }
      await db.delete(product).where(and(
          eq(product.id, parseInt(input.id)),
          eq(product.homeId, home.id)
        )
      );
      }),
    });

export const appRouter = router({
  ping: publicProcedure.query(() => ({ pong: true as const })),
  me: protectedProcedure.query(({ ctx }) => ctx.user),
  home: homeRouter,
});

export type AppRouter = typeof appRouter;
