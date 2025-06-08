import { type Writable, writable } from 'svelte/store';
import type { Factory, RawMaterialInput } from '../models/Factory.ts'; // Added RawMaterialInput

function createBrowserTokenStore(): Writable<Factory[]> {
	const local = localStorage.getItem('factories');
	if (!local) {
		localStorage.setItem('factories', JSON.stringify([]));
	}

	const store = writable<Factory[]>(
		(JSON.parse(localStorage.getItem('factories')!) as Factory[]) ?? []
	);

	// Store the token in LocalStorage whenever it´s updated
	store.subscribe((val) => {
		if (!localStorage) return;
		if (!val) return localStorage.removeItem('factories');
		localStorage.setItem('factories', JSON.stringify(val));
	});

	return store;
}

function createRawMaterialInputStore(): Writable<RawMaterialInput[]> {
	const local = localStorage.getItem('rawMaterialInputs');
	if (!local) {
		localStorage.setItem('rawMaterialInputs', JSON.stringify([]));
	}

	const store = writable<RawMaterialInput[]>(
		(JSON.parse(localStorage.getItem('rawMaterialInputs')!) as RawMaterialInput[]) ?? []
	);

	store.subscribe((val) => {
		if (!localStorage) return;
		if (!val) return localStorage.removeItem('rawMaterialInputs');
		localStorage.setItem('rawMaterialInputs', JSON.stringify(val));
	});

	return store;
}

export const factories = createBrowserTokenStore();
export const editingFactoryId: Writable<string | null> = writable(null);
export const rawMaterialInputs = createRawMaterialInputStore();
