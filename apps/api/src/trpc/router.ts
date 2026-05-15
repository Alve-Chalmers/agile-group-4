import { google } from '@ai-sdk/google';
import { TRPCError } from '@trpc/server';
import { generateText, Output } from 'ai';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { category, product, userHome } from '../db/schema.js';
import { protectedProcedure, publicProcedure, router } from './init.js';

const receiptScanResultSchema = z.object({
  items: z.array(
    z.object({
      name: z
        .string()
        .describe("The name of the product, in english, and normalized, example: 'Tomato'"),
      category: z.string().nullable(),
      expiresAt: z.string().transform((value) => new Date(value)),
    }),
  ),
});

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
  changeProduct: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        category: z.string(),
        expiresAt: z.coerce.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const home = await getHome(ctx.user.id);
      if (!home) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const [result] = await db
        .update(product)
        .set({ name: input.name, category: input.category, expiresAt: new Date(input.expiresAt) })
        .where(and(and(eq(product.homeId, home?.id), eq(product.id, input.id))))
        .returning();
      if (!result) {
        throw new TRPCError({ code: 'NOT_FOUND' });
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
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      await db.insert(product).values({
        homeId: home.id,
        name: input.name,
        category: input.category,
        expiresAt: new Date(input.expiresAt),
      });
    }),
  removeProduct: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const home = await getHome(ctx.user.id);
      if (!home) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      await db
        .delete(product)
        .where(and(eq(product.id, parseInt(input.id)), eq(product.homeId, home.id)));
    }),
  scanReceipt: protectedProcedure
    .input(
      z.object({
        imageBase64: z.string(),
        mediaType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
      }),
    )
    .mutation(async ({ input }) => {

      const categories = (await db.query.category.findMany()).map(e => e.name);
      try {
        const { output: parsed } = await generateText({
          model: google('gemini-3.1-flash-lite'),

          output: Output.object({
            schema: receiptScanResultSchema,
            name: 'receipt_items',
            description: 'Food and grocery line items parsed from a receipt image',
          }),
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  image: input.imageBase64,
                  mediaType: input.mediaType,
                },
                {
                  type: 'text',
                  text: `Extract all food/grocery items from this receipt.
Return an object matching the schema: items is an array of { name, category (or null), expiresAt (ISO date string) }.
For expiresAt, estimate a reasonable expiry date based on the product type.
the available categories are: ${categories.join(', ')}; if a category doesn't fit, set it to null.
Today is ${new Date().toISOString().split('T')[0]}.`,
                },
              ],
            },
          ],
        });

        return { items: parsed.items };
      } catch (error) {
        console.error('Receipt vision model error:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to call AI API' });
      }
    }),
});

export const categoryRouter = router({
  getCategories: publicProcedure.query(async () => {
    return await db.select().from(category);
  }),
});

export const appRouter = router({
  ping: publicProcedure.query(() => ({ pong: true as const })),
  me: protectedProcedure.query(({ ctx }) => ctx.user),
  home: homeRouter,
  category: categoryRouter,
});

export type AppRouter = typeof appRouter;
