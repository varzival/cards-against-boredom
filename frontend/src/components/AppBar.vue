<template>
  <PlayerOverview
    :modelValue="drawer"
    @update:modelValue="(newValue: boolean) => (drawer = newValue)"
    :admin="admin"
  ></PlayerOverview>

  <v-app-bar app>
    <v-app-bar-nav-icon
      v-if="mobile"
      variant="text"
      @click.stop="drawer = !drawer"
    ></v-app-bar-nav-icon>
    <h1 style="margin-left: auto; margin-right: auto; font-size: 1.5em">
      {{ text }}
    </h1>

    <template v-slot:extension v-if="!hideTabs">
      <slot></slot>
    </template>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useDisplay } from "vuetify/lib/framework.mjs";
import PlayerOverview from "./PlayerOverview.vue";

const { mobile } = useDisplay();

const { text, admin, hideTabs } = withDefaults(
  defineProps<{ text: string; admin?: boolean; hideTabs?: boolean }>(),
  { text: "", admin: false, hideTabs: false }
);

const drawer = ref(!mobile.value);
</script>

<style scoped>
.appbar {
  overflow: hidden;
}
</style>
