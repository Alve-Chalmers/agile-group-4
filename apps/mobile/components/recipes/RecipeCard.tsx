import type { SearchRecipesByIngredientsResponse } from '@0waste/spoonacular-api';
import { Image, Text } from 'react-native';
import { View } from '../Themed';

export type RecipeCardProps = {
  recipe: SearchRecipesByIngredientsResponse[number];
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <View className="flex-1 bg-background-50 rounded-lg p-4">
      <View className="w-48 rounded-lg h-48">
        <Image source={{ uri: recipe.image }} />
      </View>
      <Text>{recipe.title}</Text>
      <Text>{recipe.usedIngredientCount} ingredients used</Text>
    </View>
  );
}
