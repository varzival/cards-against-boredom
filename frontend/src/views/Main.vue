<template>
  <Play v-if="store.name"></Play>
  <ChooseName v-else></ChooseName>
</template>

<script lang="ts" setup>
import Play from "@/views/Play.vue";
import ChooseName from "@/views/ChooseName.vue";
import { useStore } from "@/store/app";

const store = useStore();
</script>
