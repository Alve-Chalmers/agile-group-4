import tw from '@/lib/tailwind';
import type { SearchRecipesByIngredientsResponse } from '@0waste/spoonacular-api';
import { Image } from 'expo-image';
import { HeartIcon } from 'lucide-react-native';
import { Text } from '../Text';
import { View } from '../Themed';

export type RecipeCardProps = {
  recipe: SearchRecipesByIngredientsResponse[number];
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <View style={tw.style('rounded-lg gap-1 bg-inherit')}>
      <Image source={{ uri: recipe.image }} style={tw.style('w-48 h-36 object-cover rounded-lg')} />
      <Text className="pt-1 text-background-100 w-48 text-ellipsis overflow-hidden">
        {recipe.title}
      </Text>
      <View style={tw.style('flex-row items-center gap-2 text-background-400 bg-inherit')}>
        <Text>{recipe.usedIngredientCount} used</Text>
        <Text>•</Text>
        <View style={tw.style('flex-row items-center gap-1 bg-inherit')}>
          <HeartIcon size={14} strokeWidth={3} />
          <Text>{recipe.likes}</Text>
        </View>
      </View>
    </View>
  );
}
