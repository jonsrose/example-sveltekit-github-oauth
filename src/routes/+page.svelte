<script lang="ts">
	import { enhance } from "$app/forms";

	import type { PageData } from "./$types";

	export let data: PageData;

	$: image = data.user?.githubId ? `https://avatars.githubusercontent.com/u/${data.user.githubId}` : '';
</script>

{#if data.user}
	<h1>Hi, {data.user.username}!</h1>
	{#if image}
		<img src={image} height="100px" width="100px" alt="profile" />
	{/if}
	<p>Email: {data.user.email}</p>
	<form method="post" use:enhance>
		<button>Sign out</button>
	</form>
{:else}
	<h1>Welcome, Guest!</h1>
	<p>Please sign in to view your profile.</p>
	<!-- Add a sign-in button or link here -->
{/if}
