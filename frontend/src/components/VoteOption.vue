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
        :class="hover ? ['card-scaled'] : []"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import Card from "@/components/Card.vue";
import { useStore } from "@/store/app";
import { ref } from "vue";

const props = defineProps<{
  cards: Array<string>;
  idx: number;
}>();

const store = useStore();

function selectVoteOption() {
  store.selectedVoteOption = props.idx;
}

const hover = ref(false);
</script>

<style scoped>
.card-scaled {
  scale: 1.1;
}
</style>
