<template>
	<v-card class="card" :text="props.text" variant="outlined" min-width="200px" :hover="true">
	</v-card>
</template>

<script lang="ts" setup>
const props = defineProps<{
	text: string;
}>()
</script>

<style scoped>
	.card {
		margin: 10px;
	}
</style>