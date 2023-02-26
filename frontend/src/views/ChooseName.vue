<template>
<v-main>
			<v-container fluid>
					<v-row align="center" justify="center">
						<v-spacer></v-spacer>
						<v-col>
							<h2 style="font-size: 50px;">Cards against</h2>
						</v-col>
						<v-spacer></v-spacer>
					</v-row>
					<v-row align="center" justify="center" style="margin-bottom: 100px;">
						<v-spacer></v-spacer>
						<v-col>
							<h1 style="font-size: 250px;">KERN</h1>
						</v-col>
						<v-spacer></v-spacer>
					</v-row>
				<v-row>
					<v-col></v-col>
					<v-col>
						<v-row>
							<v-col cols="10" align-self="center">
								<v-text-field
									v-model="name"
									label="Name"
									:rules="rules"
									hide-details="auto"
								></v-text-field>
							</v-col>
							<v-col cols="2" align-self="center">
								<v-btn @click="setName()" :disabled="!name || !(name.length <= 30)">
									Los!
								</v-btn>
							</v-col>
						</v-row>
					</v-col>
					<v-col></v-col>
				</v-row>	
			</v-container>
</v-main>
</template>

<script lang="ts" setup>
import { useStore } from '@/store/app';
import { ref } from 'vue';

const store = useStore();

const name = ref("");

const rules = ref([
	(value: string) => !!value || "Required.",
	(value: string) => (value && value.length <= 30) || "übertreib nicht"
])

function setName() {
	store.setName(name.value);
}
</script>

<style scoped>
	h1, h2 {
		text-align: center;
	}
</style>