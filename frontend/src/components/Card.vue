<template>
	<v-card :class="classes" :text="props.text" variant="outlined" max-width="700px" :hover="props.light">
	</v-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(defineProps<{
	text: string;
	light: boolean;
}>(), {
	text: "...",
	light: false
})

const classes = computed(() => {
	const arr = ["card"];
	if (props.light) arr.push("card-light")
	return arr;
})
</script>

<style scoped>
	.card {
		margin: 10px;
	}

	.card-light {
		background-color: white;
		border-color: white;
		color: black;
		transition: 1s;
	}

	.card-light:hover {
		scale: 1.1;
	}
</style>