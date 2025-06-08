<script lang="ts">
	import { factories, rawMaterialInputs } from '$lib/stores/FactoryStore';
	import { AllItems, AllRecipes } from '$lib/stores/Const';
	import type { Item, Recipe } from '$lib/models/Factory'; // Added Recipe

	interface ResourceBalanceDetail {
		item: Item;
		balance: number;
		isOre: boolean; // Added to distinguish ores from crafted items
	}

	let calculatedBalances: ResourceBalanceDetail[] = [];
	let anySurplusOrDeficit = false; // Used to control main display

	$: {
		const producedMap = new Map<string, number>();
		const consumedMap = new Map<string, number>();

		// Account for manually specified raw material inputs
		for (const rawInput of $rawMaterialInputs) {
			const currentProduced = producedMap.get(rawInput.item.ClassName) || 0;
			producedMap.set(rawInput.item.ClassName, currentProduced + rawInput.amount);
		}

		for (const factory of $factories) {
			// Aggregate produced items using recipe.products
			const recipe = AllRecipes.find((r) => r.recipeClassName === factory.selectedRecipeClassName);
			if (recipe && recipe.products.length > 0) {
				const mainProduct = recipe.products.find(
					(p) => p.ClassName === factory.outputItemClassName
				);
				if (!mainProduct) continue;
				const productionScale = factory.outputCount / mainProduct.count;

				// Add all products produced by this recipe (scaled)
				for (const prod of recipe.products) {
					const currentProduced = producedMap.get(prod.ClassName) || 0;
					producedMap.set(prod.ClassName, currentProduced + prod.count * productionScale);
				}

				// Aggregate consumed items (ingredients)
				for (const ingredient of recipe.Ingredients) {
					if (!ingredient.item) {
						console.warn(
							'Ingredient without item found in recipe:',
							recipe.recipeClassName,
							ingredient
						);
						continue;
					}
					const currentConsumed = consumedMap.get(ingredient.item.ClassName) || 0;
					consumedMap.set(
						ingredient.item.ClassName,
						currentConsumed + ingredient.count * productionScale
					);
				}
			}
		}

		const balances: ResourceBalanceDetail[] = [];
		const allInvolvedItemClassNames = new Set([
			...Array.from(producedMap.keys()),
			...Array.from(consumedMap.keys()),
			...$rawMaterialInputs.map((input) => input.item.ClassName)
		]);

		allInvolvedItemClassNames.forEach((className) => {
			const item = AllItems.find((i) => i.ClassName === className);
			if (item) {
				const totalProduced = producedMap.get(className) || 0;
				const totalConsumed = consumedMap.get(className) || 0;
				const balance = totalProduced - totalConsumed;

				if (Math.abs(balance) > 0.001) {
					balances.push({ item, balance, isOre: item.isOre });
				}
			}
		});
		calculatedBalances = balances
			.filter((x) => x.item)
			.sort((a, b) => a.item.mDisplayName.localeCompare(b.item.mDisplayName));
	}

	$: surplusOres = calculatedBalances.filter((b) => b.balance > 0 && b.isOre);
	$: surplusCrafted = calculatedBalances.filter((b) => b.balance > 0 && !b.isOre);
	$: deficitOres = calculatedBalances.filter((b) => b.balance < 0 && b.isOre);
	$: deficitCrafted = calculatedBalances.filter((b) => b.balance < 0 && !b.isOre);

	$: anySurplusOrDeficit =
		surplusOres.length > 0 ||
		surplusCrafted.length > 0 ||
		deficitOres.length > 0 ||
		deficitCrafted.length > 0;

	// Swiss number formatting helper
	function formatSwissNumber(num: number): string {
		return num.toLocaleString('de-CH');
	}

	// Helper: Find the original ore for a given item by tracing recipes
	function findOriginOre(itemClassName: string, visited = new Set<string>()): Item | undefined {
		const item = AllItems.find((i) => i.ClassName === itemClassName);
		if (!item) return undefined;
		if (item.isOre) return item;
		if (visited.has(itemClassName)) return undefined; // Prevent cycles
		visited.add(itemClassName);
		const producingRecipes = AllRecipes.filter((r) =>
			r.products.some((p) => p.ClassName === itemClassName)
		);
		for (const recipe of producingRecipes) {
			for (const ingredient of recipe.Ingredients) {
				const origin = findOriginOre(ingredient.item.ClassName, visited);
				if (origin) return origin;
			}
		}
		return undefined;
	}

	// Group crafted items by their origin ore
	function groupByOriginOre(entries: { item: Item; balance: number; isOre: boolean }[]) {
		const groups: Record<string, { ore: Item; entries: typeof entries }> = {};
		for (const entry of entries) {
			const originOre = findOriginOre(entry.item.ClassName);
			const key = originOre ? originOre.ClassName : 'unknown';
			if (!groups[key]) {
				groups[key] = { ore: originOre, entries: [] };
			}
			groups[key].entries.push(entry);
		}
		return groups;
	}

	$: groupedSurplusCrafted = groupByOriginOre(surplusCrafted);
	$: groupedDeficitCrafted = groupByOriginOre(deficitCrafted);
</script>

{#if anySurplusOrDeficit}
	<div class="mb-8 rounded-lg bg-white p-6 shadow dark:bg-slate-800">
		<h2 class="mb-4 text-xl font-semibold dark:text-gray-100">Gesamte Ressourcenbilanz</h2>

		{#if surplusOres.length > 0}
			<div class="mb-6">
				<h3 class="mb-2 text-lg font-semibold text-green-700 dark:text-green-400">
					Überschuss Rohmaterialien
				</h3>
				<table class="min-w-full table-auto text-sm">
					<thead class="bg-gray-100 dark:bg-gray-800">
						<tr>
							<th class="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300"
								>Ressource</th
							>
							<th class="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300"
								>Überschuss / Minute</th
							>
						</tr>
					</thead>
					<tbody class="bg-white dark:bg-gray-800">
						{#each surplusOres as entry (entry.item.ClassName)}
							<tr
								class="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-600"
							>
								<td class="px-4 py-2 dark:text-gray-200">{entry.item.mDisplayName}</td>
								<td class="px-4 py-2 text-green-600 dark:text-green-400"
									>+{formatSwissNumber(Number(entry.balance.toFixed(2)))}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

		{#if surplusCrafted.length > 0}
			<div class="mb-6">
				<h3 class="mb-2 text-lg font-semibold text-green-700 dark:text-green-400">
					Überschuss Hergestellte Produkte
				</h3>
				{#each Object.values(groupedSurplusCrafted) as group}
					<div class="mb-2">
						<div class="font-semibold text-green-800 dark:text-green-300">
							{#if group.ore}
								{group.ore.mDisplayName}
							{:else}
								Unbekanntes Ursprungs-Erz
							{/if}
						</div>
						<table class="min-w-full table-auto text-sm">
							<thead class="bg-gray-100 dark:bg-gray-800">
								<tr>
									<th class="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300"
										>Ressource</th
									>
									<th class="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300"
										>Überschuss / Minute</th
									>
								</tr>
							</thead>
							<tbody class="bg-white dark:bg-gray-800">
								{#each group.entries as entry (entry.item.ClassName)}
									<tr
										class="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-600"
									>
										<td class="px-4 py-2 dark:text-gray-200">{entry.item.mDisplayName}</td>
										<td class="px-4 py-2 text-green-600 dark:text-green-400">
											+{formatSwissNumber(Number(entry.balance.toFixed(2)))}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/each}
			</div>
		{/if}

		{#if deficitOres.length > 0}
			<div class="mb-6">
				<h3 class="mb-2 text-lg font-semibold text-red-700 dark:text-red-400">
					Defizit Rohmaterialien
				</h3>
				<table class="min-w-full table-auto text-sm">
					<thead class="bg-gray-100 dark:bg-gray-700">
						<tr>
							<th class="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300"
								>Ressource</th
							>
							<th class="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300"
								>Benötigt / Minute</th
							>
						</tr>
					</thead>
					<tbody class="bg-white dark:bg-gray-800">
						{#each deficitOres as entry (entry.item.ClassName)}
							<tr
								class="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-600"
							>
								<td class="px-4 py-2 dark:text-gray-200">{entry.item.mDisplayName}</td>
								<td class="px-4 py-2 text-red-600 dark:text-red-400"
									>{formatSwissNumber(Number(entry.balance.toFixed(2)))} (Bedarf: {formatSwissNumber(
										Number(Math.abs(entry.balance).toFixed(2))
									)})</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

		{#if deficitCrafted.length > 0}
			<div>
				<h3 class="mb-2 text-lg font-semibold text-red-700 dark:text-red-400">
					Defizit Hergestellte Produkte
				</h3>
				{#each Object.values(groupedDeficitCrafted) as group}
					<div class="mb-2">
						<div class="font-semibold text-red-800 dark:text-red-300">
							{#if group.ore}
								{group.ore.mDisplayName}
							{:else}
								Unbekanntes Ursprungs-Erz
							{/if}
						</div>
						<table class="min-w-full table-auto text-sm">
							<thead class="bg-gray-100 dark:bg-gray-700">
								<tr>
									<th class="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300"
										>Ressource</th
									>
									<th class="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300"
										>Benötigt / Minute</th
									>
								</tr>
							</thead>
							<tbody class="bg-white dark:bg-gray-800">
								{#each group.entries as entry (entry.item.ClassName)}
									<tr
										class="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-600"
									>
										<td class="px-4 py-2 dark:text-gray-200">{entry.item.mDisplayName}</td>
										<td class="px-4 py-2 text-red-600 dark:text-red-400"
											>{formatSwissNumber(Number(entry.balance.toFixed(2)))} (Bedarf: {formatSwissNumber(
												Number(Math.abs(entry.balance).toFixed(2))
											)})</td
										>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{:else if $factories.length > 0}
	<div class="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
		<h2 class="mb-3 text-xl font-semibold dark:text-gray-100">Gesamte Ressourcenbilanz</h2>
		<p class="text-gray-500 dark:text-gray-400">
			Alle Ressourcen sind perfekt ausbalanciert oder es gibt keine Produktion/Verbrauch.
		</p>
	</div>
{/if}
