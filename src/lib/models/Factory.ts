export interface Item {
	mDisplayName: string;
	ClassName: string; // Unique identifier for the item (e.g., Desc_IronPlate_C)
	isOre: boolean;
}

export interface Ingredient {
	item: Item;
	count: number;
}

export interface RecipeProduct {
	item: Item;
	ClassName: string;
	count: number;
}

export interface Recipe {
	recipeClassName: string; // Unique identifier for the recipe itself (e.g., Recipe_IronPlate_C)
	mDisplayName: string; // Display name of the recipe (e.g., "Iron Plate")
	products: RecipeProduct[]; // List of products produced by this recipe
	Ingredients: Ingredient[];
	mManufactoringDuration: number;
}

export interface Factory {
	id: string;
	name: string;
	outputItemClassName: string; // ClassName of the item being produced
	selectedRecipeClassName: string; // ClassName of the recipe used
	outputCount: number; // Desired items per minute for the product
	floor?: number;
}

export interface RawMaterialInput {
	item: Item;
	amount: number;
}
