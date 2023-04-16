<template>
  <v-card
    :class="classes"
    :text="props.yellow ? '' : props.text"
    variant="outlined"
    max-width="700px"
    :hover="props.selectable"
    :ripple="false"
  >
    <v-card-title v-if="props.yellow"><v-icon>mdi-plus</v-icon></v-card-title>
  </v-card>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    text: string;
    light?: boolean;
    yellow?: boolean;
    selectable?: boolean;
    faded?: boolean;
  }>(),
  {
    text: "...",
    light: false,
    yellow: false,
    selectable: false,
    faded: false
  }
);

const classes = computed(() => {
  const arr = ["card"];
  if (props.yellow && props.light) arr.push("card-yellow-filled");
  else if (props.light) arr.push("card-light");
  else if (props.yellow) arr.push("card-yellow-outline");

  if (props.selectable) arr.push("card-selectable");
  if (props.faded) arr.push("card-faded");
  return arr;
});
</script>

<style scoped>
.card {
  transition: 1s;
  margin: auto;
}

.card-light {
  background-color: white;
  border-color: white;
  color: black;
}

.card-yellow-outline {
  color: yellow;
}

.card-yellow-filled {
  background-color: yellow;
  border-color: yellow;
  color: black;
}

.card-selectable:hover {
  scale: 1.1;
}

.card-faded {
  opacity: 0.7;
}
</style>
