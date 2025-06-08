<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { editingFactoryId, factories } from '$lib/stores/FactoryStore';
	import Select from './select/Select.svelte';
	import { AllItems, AllRecipes } from '$lib/stores/Const';
	import type { Item, Factory, Recipe } from '$lib/models/Factory';

	let fabrikName = '';
	let selectedOutputItem: Item | undefined = undefined;
	let selectedRecipe: Recipe | undefined = undefined; // To store the chosen recipe object
	let currentOutputCount: number = 1; // Default to 1 to avoid disabled state initially
	let currentFloor: number | undefined = undefined;
	let currentEditingFactory: Factory | null = null;

	let availableRecipesForItem: Recipe[] = [];

	// When selectedOutputItem changes, update availableRecipesForItem and selectedRecipe
	$: {
		if (selectedOutputItem) {
			availableRecipesForItem = AllRecipes.filter((r) =>
				r.products.some((p) => p.ClassName === selectedOutputItem!.ClassName)
			).sort((a, b) => a.mDisplayName.localeCompare(b.mDisplayName));

			console.log('Available Recipe:', availableRecipesForItem);
			if (availableRecipesForItem.length === 1) {
				selectedRecipe = availableRecipesForItem[0];
			} else {
				// If current selectedRecipe is not in the new list of availableRecipesForItem, reset it
				if (
					selectedRecipe &&
					!availableRecipesForItem.find(
						(r) => r.recipeClassName === selectedRecipe!.recipeClassName
					)
				) {
					selectedRecipe = undefined;
				}
				// If there was an editing factory, try to re-select its recipe
				else if (
					currentEditingFactory &&
					selectedOutputItem.ClassName === currentEditingFactory.outputItemClassName
				) {
					const previouslySelected = availableRecipesForItem.find(
						(r) => r.recipeClassName === currentEditingFactory!.selectedRecipeClassName
					);
					if (previouslySelected) selectedRecipe = previouslySelected;
				}
			}
		} else {
			availableRecipesForItem = [];
			selectedRecipe = undefined;
		}
	}

	editingFactoryId.subscribe(async (id) => {
		if (id) {
			currentEditingFactory = $factories.find((f) => f.id === id) || null;
			if (currentEditingFactory) {
				fabrikName = currentEditingFactory.name;
				selectedOutputItem = AllItems.find(
					(i) => i.ClassName === currentEditingFactory!.outputItemClassName
				);
				currentOutputCount = currentEditingFactory.outputCount;
				currentFloor = currentEditingFactory.floor;
				// availableRecipesForItem will update reactively based on selectedOutputItem.
				// Then, we might need to explicitly set selectedRecipe if it wasn't auto-set.
				await tick(); // Ensure availableRecipesForItem is populated
				if (selectedOutputItem && currentEditingFactory.selectedRecipeClassName) {
					const recipeToSelect = availableRecipesForItem.find(
						(r) => r.recipeClassName === currentEditingFactory!.selectedRecipeClassName
					);
					if (recipeToSelect) {
						selectedRecipe = recipeToSelect;
					}
				}
			}
		} else {
			resetForm();
		}
	});

	function resetForm() {
		fabrikName = '';
		selectedOutputItem = undefined;
		selectedRecipe = undefined;
		availableRecipesForItem = [];
		currentOutputCount = 1;
		currentFloor = undefined;
		currentEditingFactory = null;
	}

	function handleSubmit() {
		if (!selectedOutputItem || !selectedRecipe) {
			return;
		}

		console.log('Selected Recipe:', selectedRecipe);

		const factoryData = {
			name: fabrikName,
			outputItemClassName: selectedOutputItem.ClassName,
			selectedRecipeClassName: selectedRecipe.recipeClassName,
			outputCount: currentOutputCount,
			floor: currentFloor
		};

		if (currentEditingFactory) {
			$factories = $factories.map((f) =>
				f.id === currentEditingFactory!.id ? { ...currentEditingFactory, ...factoryData } : f
			);
		} else {
			const newFactory: Factory = {
				id: Date.now().toString() + Math.random().toString(36).substring(2),
				...factoryData
			};
			$factories = [...$factories, newFactory];
		}

		editingFactoryId.set(null);
		resetForm();
	}

	function handleCancel() {
		editingFactoryId.set(null);
		resetForm();
	}

	onMount(async () => {
		if ($editingFactoryId) {
			currentEditingFactory = $factories.find((f) => f.id === $editingFactoryId) || null;
			if (currentEditingFactory) {
				fabrikName = currentEditingFactory.name;
				selectedOutputItem = AllItems.find(
					(i) => i.ClassName === currentEditingFactory!.outputItemClassName
				);
				currentOutputCount = currentEditingFactory.outputCount;
				currentFloor = currentEditingFactory.floor;
				await tick(); // Ensure reactive updates for availableRecipesForItem
				if (selectedOutputItem && currentEditingFactory.selectedRecipeClassName) {
					const recipeToSelect = availableRecipesForItem.find(
						(r) => r.recipeClassName === currentEditingFactory!.selectedRecipeClassName
					);
					if (recipeToSelect) {
						selectedRecipe = recipeToSelect;
					}
				}
			}
		}
	});

	// Filter AllItems to only those that can be produced by at least one recipe
	$: producibleItems = AllItems.filter((item) =>
		AllRecipes.some((recipe) => recipe.products.some((p) => p.ClassName === item.ClassName))
	).sort((a, b) => a.mDisplayName.localeCompare(b.mDisplayName));
</script>

<div
	class="mb-8 space-y-4 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 dark:shadow-gray-700/50"
>
	<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100">
		{#if currentEditingFactory}Fabrik bearbeiten{:else}Neue Fabrik hinzufügen{/if}
	</h2>
	<input
		type="text"
		placeholder="Fabrikname"
		bind:value={fabrikName}
		class="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
	/>

	<div>
		<label for="floor-input" class="mt-4 block font-semibold text-gray-700 dark:text-gray-300"
			>Etage (optional):</label
		>
		<input
			id="floor-input"
			type="number"
			min="0"
			placeholder="z.B. 1"
			bind:value={currentFloor}
			class="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
		/>
	</div>

	<div>
		<label class="mt-4 block font-semibold text-gray-700 dark:text-gray-300"
			>Output-Ressource:</label
		>
		<Select
			items={producibleItems}
			bind:value={selectedOutputItem}
			textColumn="mDisplayName"
			class="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
		/>
	</div>

	{#if selectedOutputItem && availableRecipesForItem.length > 0}
		<div>
			<label class="mt-4 block font-semibold text-gray-700 dark:text-gray-300"
				>Rezept auswählen:</label
			>
			{#if availableRecipesForItem.length === 1}
				<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
					Automatisch ausgewählt: {availableRecipesForItem[0].mDisplayName}
				</p>
			{:else}
				<Select
					items={availableRecipesForItem}
					bind:value={selectedRecipe}
					textColumn="mDisplayName"
					class="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
				/>
			{/if}
		</div>
	{/if}

	{#if selectedRecipe}
		<div>
			<label class="mt-4 block font-semibold text-gray-700 dark:text-gray-300"
				>Output Menge pro Minute:</label
			>
			<input
				type="number"
				min="1"
				bind:value={currentOutputCount}
				class="mt-1 w-24 rounded border border-gray-300 bg-white p-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
				title="Output Count"
			/>
		</div>
	{/if}

	<div class="mt-6 flex space-x-2 pt-2">
		<button
			class="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
			on:click={handleSubmit}
			disabled={!fabrikName || !selectedOutputItem || !selectedRecipe || currentOutputCount <= 0}
		>
			{#if currentEditingFactory}Fabrik aktualisieren{:else}Hinzufügen{/if}
		</button>
		{#if currentEditingFactory || fabrikName || selectedOutputItem || currentOutputCount > 1 || currentFloor !== undefined}
			<button
				class="rounded bg-gray-300 px-4 py-2 text-black transition hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
				on:click={handleCancel}
			>
				Abbrechen
			</button>
		{/if}
	</div>
</div>
