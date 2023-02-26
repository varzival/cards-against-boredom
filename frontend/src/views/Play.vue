<template>
	<v-navigation-drawer app>
		</v-navigation-drawer>

		<v-app-bar app>
			<h1 style="margin-left: auto; margin-right: auto;">Wähle eine Karte!</h1>
		</v-app-bar>

		<v-main>
			<v-container fluid>
				<v-row>
					<v-spacer></v-spacer>
					<v-col cols="auto">
							<Card text="Sorry Herr Leherer, aber ich konnte meine Hausaufgaben nicht machen wegen _." style="margin: 100px 0;" />
							<Card text="ANTWORT 1." light />
							<Card text="ANTWORT 2." light />
							<Card text="ANTWORT 3." light />
					</v-col>
					<v-spacer></v-spacer>
				</v-row>
			</v-container>
		</v-main>
</template>

<script lang="ts" setup>
import Card from '@/components/Card.vue';

//
</script>

<style scoped>
</style>