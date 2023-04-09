<template>
  <PlayerOverview
    :modelValue="drawer"
    @update:modelValue="(newValue: boolean) => (drawer = newValue)"
  ></PlayerOverview>

  <v-app-bar app>
    <v-app-bar-nav-icon
      v-if="mobile"
      variant="text"
      @click.stop="drawer = !drawer"
    ></v-app-bar-nav-icon>
    <h1 style="margin-left: auto; margin-right: auto">{{ text }}</h1>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useDisplay } from "vuetify/lib/framework.mjs";
import PlayerOverview from "./PlayerOverview.vue";

const { mobile } = useDisplay();

const { text } = defineProps<{ text: string }>();

const drawer = ref(!mobile.value);
</script>
