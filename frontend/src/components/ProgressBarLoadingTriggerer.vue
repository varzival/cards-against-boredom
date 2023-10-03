<template>
  <v-progress-linear
    ref="progressBar"
    indeterminate
    color="yellow darken-2"
  ></v-progress-linear>
</template>

<script setup lang="ts">
import { useIntersectionObserver, useIntervalFn } from "@vueuse/core";
import { ref } from "vue";

const emit = defineEmits<{ (e: "intersect"): void }>();

const progressBar = ref<any>(null);
defineExpose({ progressBar });

const isIntersectActive = ref<boolean>(false);
useIntersectionObserver(progressBar, ([{ isIntersecting }]) => {
  isIntersectActive.value = isIntersecting;
});

useIntervalFn(() => {
  if (isIntersectActive.value) emit("intersect");
}, 200);
</script>
