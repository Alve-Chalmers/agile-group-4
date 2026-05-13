import { env } from '@/env.js';
import * as client from '@0waste/spoonacular-api';
import { TRPCError } from '@trpc/server';
import z from 'zod';
import { protectedProcedure, router } from '../init.js';

export const recipeRouter = router({
  getRecipesForIngredients: protectedProcedure
    .input(z.object({ ingredients: z.string().array() }))
    .query(async ({ ctx, input }) => {
      const { data: recipes, error } = await client.searchRecipesByIngredients({
        query: {
          ingredients: input.ingredients.join(','),
        },
        auth: env.SPOONACULAR_API_KEY,
      });
      if (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '' + error });
      }
      return recipes;
    }),
});
