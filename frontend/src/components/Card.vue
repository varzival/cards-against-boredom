<template>
  <v-card
    :class="classes"
    :text="props.text"
    variant="outlined"
    max-width="700px"
    :hover="props.light"
    :ripple="false"
  >
  </v-card>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    text: string;
    light: boolean;
    selectable: boolean;
    faded: boolean;
  }>(),
  {
    text: "...",
    light: false,
    selectable: false,
    faded: false
  }
);

const classes = computed(() => {
  const arr = ["card"];
  if (props.light) arr.push("card-light");
  if (props.selectable) arr.push("card-selectable");
  if (props.faded) arr.push("card-faded");
  return arr;
});
</script>

<style scoped>
.card {
  transition: 1s;
}

.card-light {
  background-color: white;
  border-color: white;
  color: black;
}

.card-selectable:hover {
  scale: 1.1;
}

.card-faded {
  opacity: 0.7;
}
</style>
