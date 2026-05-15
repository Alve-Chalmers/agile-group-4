import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { product, userHome } from '../db/schema.js';
import { protectedProcedure, publicProcedure, router } from './init.js';

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
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: input.mediaType,
                    data: input.imageBase64,
                  },
                },
                {
                  type: 'text',
                  text: `Extract all food/grocery items from this receipt.
  Return ONLY a JSON array, no other text, no markdown:
  [{"name": "string", "category": "string or null", "expiresAt": "ISO date string"}]
  For expiresAt, estimate a reasonable expiry date based on the product type.
  Today is ${new Date().toISOString().split('T')[0]}.`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Anthropic error:', response.status, errorBody);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to call AI API' });
      }

      const data = await response.json() as { content: { text: string }[] };
      const text = data.content[0].text;

      try {
        const items = JSON.parse(text) as { name: string; category: string | null; expiresAt: string }[];
        return { items };
      } catch {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to parse AI response' });
      }
    }),
});

export const appRouter = router({
  ping: publicProcedure.query(() => ({ pong: true as const })),
  me: protectedProcedure.query(({ ctx }) => ctx.user),
  home: homeRouter,
});

export type AppRouter = typeof appRouter;
