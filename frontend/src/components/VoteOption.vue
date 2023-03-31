<template>
  <v-row
    v-for="card in props.cards"
    @click="selectVoteOption()"
    @mouseover="hover = true"
    @mouseleave="hover = false"
    dense
  >
    <v-col>
      <Card
        :text="card"
        light
        :faded="
          store.selectedVoteOption !== null &&
          store.selectedVoteOption !== props.idx
        "
        :class="selectable ? (hover ? ['card-scaled'] : []) : []"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import Card from "@/components/Card.vue";
import { useStore } from "@/store/app";
import { ref } from "vue";

const emit = defineEmits<{
  (e: "vote"): void;
}>();

const props = withDefaults(
  defineProps<{
    cards: Array<string>;
    idx: number;
    selectable: boolean;
  }>(),
  { selectable: true }
);

const store = useStore();

function selectVoteOption() {
  if (!props.selectable) return;
  store.selectedVoteOption = props.idx;
  emit("vote");
}

const hover = ref(false);
</script>

<style scoped>
.card-scaled {
  scale: 1.1;
}
</style>
