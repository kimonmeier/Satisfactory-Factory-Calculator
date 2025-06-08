<script lang="ts">
	import FactoryForm from '$lib/components/FactoryForm.svelte';
	import FactoryList from '$lib/components/FactoryList.svelte';
	import ResourceSummary from '$lib/components/ResourceSummary.svelte'; // Import the new component
	import RawMaterialInputForm from '$lib/components/RawMaterialInputForm.svelte';
</script>

<h1 class="mb-6 text-center text-3xl font-bold">Satisfactory Fabrik Manager</h1>
<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
	<div>
		<FactoryForm />
	</div>
	<div>
		<RawMaterialInputForm />
	</div>
</div>
<FactoryList />
<ResourceSummary />
