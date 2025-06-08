<script lang="ts" generics="T">
	let className = '';

	export { className as class };

	export let textColumn: keyof T | undefined | string = undefined;
	export let value: T;
	export let items: T[];
</script>

<select bind:value on:blur class={className}>
	{#each items as item}
		<option value={item}>
			{#if textColumn}
				{item[textColumn]}
			{:else}
				{item}
			{/if}
		</option>
	{/each}
</select>
