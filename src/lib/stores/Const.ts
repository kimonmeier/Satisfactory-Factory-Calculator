import recipesData from '../data/recipes.json' with { type: 'json' };
import itemData from '../data/items.json' with { type: 'json' };
import oresData from '../data/ores.json' with { type: 'json' }; // Import ores
import type { Ingredient, Item, Recipe } from '../models/Factory.ts';

// 1. Define AllItems first, incorporating both items and ores
const mappedItemData = itemData
	.filter((item) => item.mDisplayName && item.ClassName)
	.map((item) => ({
		mDisplayName: item.mDisplayName,
		ClassName: item.ClassName,
		IsOre: false
	}));

const mappedOresData = oresData
	.filter((ore) => ore.mDisplayName && ore.ClassName)
	.map((ore) => ({
		mDisplayName: ore.mDisplayName,
		ClassName: ore.ClassName,
		IsOre: true
	}));

// Combine ores and items. If ClassName is duplicated, itemData will overwrite oreData due to order.
const combinedRawItems = [...mappedOresData, ...mappedItemData];

const uniqueItemsMap = new Map<
	string,
	{ mDisplayName: string; ClassName: string; IsOre: boolean }
>();
combinedRawItems.forEach((item) => {
	uniqueItemsMap.set(item.ClassName, item);
});

export const AllItems: Item[] = Array.from(uniqueItemsMap.values())
	.map(
		(item) =>
			({
				mDisplayName: item.mDisplayName,
				ClassName: item.ClassName,
				isOre: item.IsOre
			}) as Item
	)
	.sort((a, b) => a.mDisplayName.localeCompare(b.mDisplayName));

// 2. Define parseZutatForIngredients (which uses the populated AllItems)
function parseZutatForIngredients(str: string): Ingredient[] {
	const matches = [
		...str.matchAll(/\(ItemClass=".*?Desc_([a-zA-Z0-9_]+)_C.*?",Amount=(\d+)\)/g)
	].map<{
		ClassName: string; // This is the partial ClassName like "OreIron" or "IronIngot"
		Count: number;
	}>((m) => {
		return {
			ClassName: m[1],
			Count: parseInt(m[2])
		};
	});

	// console.log('Matches for Ingredients:', matches); // Corrected console log message

	const retVal: Ingredient[] = [];
	for (const match of matches) {
		// item.ClassName (e.g., "Desc_OreIron_C") ends with match.ClassName + "_C" (e.g., "OreIron_C")
		const foundItem = AllItems.find(
			(item) => item.ClassName && item.ClassName.endsWith('Desc_' + match.ClassName + '_C')
		);

		if (foundItem) {
			retVal.push({
				item: foundItem,
				count: match.Count
			});
		} else {
			// If an ingredient item is not found in AllItems, log a warning and skip it.
			console.warn(
				`Ingredient item with partial ClassName ending in '${match.ClassName}_C' not found in AllItems. Skipping this ingredient.`
			);
		}
	}

	return retVal;
}

// 3. Define AllRecipes (which calls parseZutatForIngredients)
export const AllRecipes = recipesData
	.filter(
		(recipeFromJson) =>
			recipeFromJson.mDisplayName && recipeFromJson.mProduct && recipeFromJson.ClassName
	) // Ensure recipe ClassName from JSON exists
	.map((recipeFromJson) => {
		// console.log('Processing Recipe:', recipeFromJson.mDisplayName); // Changed log message slightly
		const ingredients = parseZutatForIngredients(recipeFromJson.mIngredients ?? '');

		// Parse all products (can be multiple)
		const productMatches = [
			...(recipeFromJson.mProduct?.matchAll(
				/\(ItemClass=".*?\.([a-zA-Z0-9_]+_C)'.*?",Amount=(\d+)\)/g
			) ?? [])
		];

		const products = productMatches
			.map((m) => {
				const className = m[1];
				const count = parseInt(m[2]);
				const item = AllItems.find((item) => item.ClassName === className);
				if (!item) {
					console.warn(
						`Product item ${className} for recipe ${recipeFromJson.mDisplayName} (JSON ClassName: ${recipeFromJson.ClassName}) not found in AllItems. Skipping this product.`
					);
					return null;
				}
				return {
					item,
					ClassName: className,
					count
				};
			})
			.filter((x) => x) as { item: Item; ClassName: string; count: number }[];

		if (products.length === 0) {
			console.warn(
				`Could not parse any products for recipe: ${recipeFromJson.mDisplayName} (JSON ClassName: ${recipeFromJson.ClassName}). Skipping this recipe.`
			);
			return null;
		}

		return {
			recipeClassName: recipeFromJson.ClassName,
			mDisplayName: recipeFromJson.mDisplayName,
			products,
			Ingredients: ingredients,
			mManufactoringDuration: Number.parseFloat(recipeFromJson.mManufactoringDuration)
		} as Recipe;
	})
	.filter((recipe) => recipe !== null) as Recipe[]; // Filter out any nulls from skipped recipes
