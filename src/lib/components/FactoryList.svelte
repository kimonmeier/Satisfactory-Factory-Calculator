<script lang="ts">
	import type { Ingredient, Item, Factory, Recipe } from '$lib/models/Factory'; // Added Recipe
	import { AllItems, AllRecipes } from '$lib/stores/Const'; // Added AllItems
	import { factories, editingFactoryId } from '$lib/stores/FactoryStore';

	let filterText = '';

	$: filteredFactories = $factories.filter((fab) => {
		if (!filterText.trim()) return true;
		const searchTerm = filterText.toLowerCase();
		const outputItem = AllItems.find((i) => i.ClassName === fab.outputItemClassName);
		return (
			fab.name.toLowerCase().includes(searchTerm) ||
			(outputItem && outputItem.mDisplayName.toLowerCase().includes(searchTerm)) ||
			(fab.floor !== undefined && fab.floor !== null && fab.floor.toString().includes(searchTerm))
		);
	});

	function getZutaten(factory: Factory): Ingredient[] {
		const recipe = AllRecipes.find((r) => r.recipeClassName === factory.selectedRecipeClassName);
		if (!recipe || !recipe.products.length) return [];

		// Find the product entry for this factory's output
		const mainProduct = recipe.products.find((p) => p.ClassName === factory.outputItemClassName);
		if (!mainProduct || mainProduct.count === 0) return [];

		return recipe.Ingredients.map((ingredient) => ({
			item: ingredient.item,
			count: ingredient.count * (factory.outputCount / mainProduct.count)
		}));
	}

	function editFactory(id: string) {
		editingFactoryId.set(id);
		window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to see the form
	}

	function deleteFactory(id: string) {
		$factories = $factories.filter((f) => f.id !== id);
		if ($editingFactoryId === id) {
			editingFactoryId.set(null); // Clear editing state if the edited factory is deleted
		}
	}

	// Swiss number formatting helper
	function formatSwissNumber(num: number): string {
		return num.toLocaleString('de-CH');
	}
</script>

<div class="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
	<h2 class="mb-3 text-xl font-semibold dark:text-gray-100">Alle Fabriken</h2>

	<div class="mb-4">
		<input
			type="text"
			placeholder="Filter Fabriken..."
			bind:value={filterText}
			class="w-full rounded border p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
		/>
	</div>

	{#if filteredFactories.length === 0}
		<p class="text-gray-500 dark:text-gray-400">
			{#if $factories.length === 0}
				Keine Fabriken vorhanden.
			{:else}
				Keine Fabriken entsprechen dem Filter.
			{/if}
		</p>
	{:else}
		<ul class="space-y-4">
			{#each filteredFactories as fab (fab.id)}
				{@const outputItem = AllItems.find((i) => i.ClassName === fab.outputItemClassName)}
				{@const recipeUsed = AllRecipes.find(
					(r) => r.recipeClassName === fab.selectedRecipeClassName
				)}
				<li class="rounded border bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
					<div class="flex items-center justify-between">
						<strong class="text-lg dark:text-gray-100">{fab.name}</strong>
						<div class="space-x-2">
							<button
								on:click={() => editFactory(fab.id)}
								class="rounded bg-yellow-500 px-3 py-1 text-xs text-white transition hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
							>
								Bearbeiten
							</button>
							<button
								on:click={() => deleteFactory(fab.id)}
								class="rounded bg-red-500 px-3 py-1 text-xs text-white transition hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
							>
								Löschen
							</button>
						</div>
					</div>
					{#if fab.floor !== undefined && fab.floor !== null}
						<div class="mt-1">
							<span class="text-xs text-gray-600 dark:text-gray-400">Etage: {fab.floor}</span>
						</div>
					{/if}
					<div class="mt-2">
						<span class="text-sm font-semibold dark:text-gray-200"
							>Input ({recipeUsed?.mDisplayName ?? 'Unbekanntes Rezept'}):</span
						>
						{#if getZutaten(fab).length > 0}
							<table class="mt-1 w-full text-sm">
								<thead>
									<tr>
										<th class="pr-2 pb-1 text-left font-medium text-gray-600 dark:text-gray-300"
											>Ressource</th
										>
										<th class="pb-1 text-left font-medium text-gray-600 dark:text-gray-300"
											>Anzahl/min</th
										>
									</tr>
								</thead>
								<tbody>
									{#each getZutaten(fab) as res}
										<tr>
											<td class="py-0.5 pr-2 dark:text-gray-200"
												>{res.item?.mDisplayName ?? 'Unbekanntes Item'}</td
											>
											<td class="py-0.5 dark:text-gray-200"
												>{formatSwissNumber(Number(res.count.toFixed(2)))}</td
											>
										</tr>
									{/each}
								</tbody>
							</table>
						{:else}
							<p class="text-xs text-gray-500 dark:text-gray-400">
								Keine Inputs für dieses Rezept definiert oder Rezept nicht gefunden.
							</p>
						{/if}
					</div>
					<div class="mt-2">
						<span class="text-sm font-semibold dark:text-gray-200">
							Output: {outputItem?.mDisplayName ?? 'Unbekanntes Item'}
							{#if fab.outputCount}
								&nbsp;({formatSwissNumber(fab.outputCount)} pro Minute)
							{/if}
							{#if recipeUsed && recipeUsed.products.length > 1}
								<span class="ml-2 text-xs text-gray-500 dark:text-gray-400">
									Weitere Produkte: {recipeUsed.products
										.filter((p) => p.ClassName !== fab.outputItemClassName)
										.map((p) => `${p.item.mDisplayName} (${formatSwissNumber(p.count)})`)
										.join(', ')}
								</span>
							{/if}
						</span>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
