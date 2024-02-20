<script lang="ts">
	import "../app.pcss";
	import {page} from '$app/stores'
	interface NavItem {
		name: string,
		routeId: string
	}
	const navigation_sections: NavItem[] =  [
		{name: "Home", routeId: "/"},
		{name: "Goals", routeId: "/goals"},
		{name: "Rules", routeId: "/rules"},
	]

	


</script>
<div class = " bg-orange-50 min-h-screen w-screen " data-sveltekit-preload-data="hover">
{#snippet navItem(item: NavItem, selected: boolean)}
	<a href="{item.routeId}" class:underline={selected}  class="mr-6" >{item.name}</a>
{/snippet}
<div class="bg-orange-50">
	<div class="w-max m-auto px-4 py-2 border-b">
	{#each navigation_sections as item}
    {@render navItem(item, item.routeId === $page.route.id)}
  {/each}
  </div>
</div>

	<div class="container m-auto max-w-screen-lg pt-10">
		<slot />
	</div>
</div>
