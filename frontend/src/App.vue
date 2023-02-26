<template>
  <v-app>
		<router-view></router-view>

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

h1 {
	margin-left: 20px;
}
</style>