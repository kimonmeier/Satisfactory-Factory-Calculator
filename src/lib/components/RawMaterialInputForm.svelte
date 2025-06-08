<script lang="ts">
	import { rawMaterialInputs } from '$lib/stores/FactoryStore';
	import { AllItems } from '$lib/stores/Const';
	import type { Item, RawMaterialInput } from '$lib/models/Factory';
	import Select from './select/Select.svelte';

	let selectedOre: Item | undefined = undefined;
	let inputAmount: number = 0;

	const availableOres = AllItems.filter((item) => item.isOre).sort((a, b) =>
		a.mDisplayName.localeCompare(b.mDisplayName)
	);

	function handleAddInput() {
		if (!selectedOre || inputAmount <= 0) {
			alert('Please select an ore and enter a valid amount.');
			return;
		}

		// Check if this ore input already exists, if so, update it. Otherwise, add new.
		const existingInputIndex = $rawMaterialInputs.findIndex(
			(input) => input.item.ClassName === selectedOre!.ClassName
		);

		if (existingInputIndex !== -1) {
			$rawMaterialInputs[existingInputIndex].amount = inputAmount;
			$rawMaterialInputs = [...$rawMaterialInputs]; // Trigger store update
		} else {
			const newInput: RawMaterialInput = {
				item: selectedOre,
				amount: inputAmount
			};
			$rawMaterialInputs = [...$rawMaterialInputs, newInput];
		}

		// Reset form
		selectedOre = undefined;
		inputAmount = 0;
	}

	function handleAddToInput() {
		if (!selectedOre || inputAmount <= 0) {
			alert('Please select an ore and enter a valid amount.');
			return;
		}

		// Check if this ore input already exists, if so, update it. Otherwise, add new.
		const existingInputIndex = $rawMaterialInputs.findIndex(
			(input) => input.item.ClassName === selectedOre!.ClassName
		);

		if (existingInputIndex !== -1) {
			$rawMaterialInputs[existingInputIndex].amount += inputAmount;
			$rawMaterialInputs = [...$rawMaterialInputs]; // Trigger store update
		} else {
			const newInput: RawMaterialInput = {
				item: selectedOre,
				amount: inputAmount
			};
			$rawMaterialInputs = [...$rawMaterialInputs, newInput];
		}

		// Reset form
		selectedOre = undefined;
		inputAmount = 0;
	}

	function handleDeleteInput(className: string) {
		$rawMaterialInputs = $rawMaterialInputs.filter((input) => input.item.ClassName !== className);
	}

	// Swiss number formatting helper
	function formatSwissNumber(num: number): string {
		return num.toLocaleString('de-CH');
	}
</script>

<div
	class="mb-8 space-y-4 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 dark:shadow-gray-700/50"
>
	<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100">
		Rohmaterialeingabe definieren
	</h2>

	<div>
		<label class="block font-semibold text-gray-700 dark:text-gray-300">Rohmaterial (Erz):</label>
		<Select
			items={availableOres}
			bind:value={selectedOre}
			textColumn="mDisplayName"
			class="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
		/>
	</div>

	<div>
		<label class="mt-4 block font-semibold text-gray-700 dark:text-gray-300"
			>Menge pro Minute:</label
		>
		<input
			type="number"
			min="0"
			bind:value={inputAmount}
			class="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
		/>
	</div>

	<div class="mt-4 flex gap-2">
		<button
			class="rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
			on:click={handleAddInput}
			disabled={!selectedOre || inputAmount <= 0}
		>
			Eingabe Hinzufügen/Aktualisieren
		</button>
		<button
			class="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
			on:click={handleAddToInput}
			disabled={!selectedOre || inputAmount <= 0}
		>
			Eingabe Addieren
		</button>
	</div>

	{#if $rawMaterialInputs.length > 0}
		<div class="mt-6">
			<h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
				Aktuelle Rohmaterialeingaben:
			</h3>
			<ul class="mt-2 space-y-2">
				{#each $rawMaterialInputs as input (input.item.ClassName)}
					<li class="flex items-center justify-between rounded-md bg-gray-50 p-3 dark:bg-gray-700">
						<span class="dark:text-gray-200"
							>{input.item.mDisplayName}: {formatSwissNumber(input.amount)}/min</span
						>
						<button
							on:click={() => handleDeleteInput(input.item.ClassName)}
							class="rounded bg-red-500 px-2 py-1 text-xs text-white transition hover:bg-red-600"
						>
							Löschen
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
