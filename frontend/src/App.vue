<template>
  <v-app>
		<v-navigation-drawer app>
		</v-navigation-drawer>
		
		<v-app-bar app>
		</v-app-bar>

		<v-main>
			<v-container fluid>
				<router-view></router-view>
			</v-container>
		</v-main>

		<v-footer app>
			<div class="footer-text">ERDKERN Producations</div>
		</v-footer>
	</v-app>
</template>

<script lang="ts" setup>
//
</script>

<style scoped>
.footer-text {
	margin-left: auto;
}
</style>