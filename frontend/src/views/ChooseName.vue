<template>
  <v-main>
    <v-container fluid>
      <v-row align="center" justify="center">
        <v-spacer></v-spacer>
        <v-col>
          <h2 style="font-size: 50px">Cards against</h2>
        </v-col>
        <v-spacer></v-spacer>
      </v-row>
      <v-row align="center" justify="center" style="margin-bottom: 100px">
        <v-spacer></v-spacer>
        <v-col>
          <h1 style="font-size: calc(15vw)">{{ title }}</h1>
        </v-col>
        <v-spacer></v-spacer>
      </v-row>
      <v-row>
        <v-col cols="0" md="4"></v-col>
        <v-col>
          <v-row class="name-input" align="center" justify="center">
            <v-col cols="12" md="10">
              <v-text-field
                v-model="name"
                label="Name"
                :rules="rules"
                hide-details="auto"
                @keyup.enter="setName"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="2">
              <v-btn
                class="button-center"
                @click="setName"
                :disabled="!name || !(name.length <= 30)"
              >
                Los!
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="0" md="4"></v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import { useStore } from "@/store/app";
import { ref } from "vue";

const store = useStore();

const name = ref("");
const title = ref(import.meta.env.VITE_APP_TITLE ?? "BOREDOM");

const rules = ref([
  (value: string) => !!value || "Required.",
  (value: string) => (value && value.length <= 30) || "übertreib nicht"
]);

function setName() {
  store.setName(name.value);
  store.addPlayer(name.value);
}
</script>

<style scoped>
@keyframes slideInFromTop {
  100% {
    top: 0;
  }
}

@keyframes fadeIn {
  100% {
    opacity: 1;
  }
}

h1,
h2 {
  text-align: center;
}

h1 {
  opacity: 0;
  animation: 2s ease-out 1.5s 1 fadeIn;
  animation-fill-mode: forwards;
}

h2 {
  position: relative;
  top: -200px;
  animation: 1s ease-out 0.5s 1 slideInFromTop;
  animation-fill-mode: forwards;
}

.name-input {
  opacity: 0;
  animation: 0.5s linear 3.5s 1 fadeIn;
  animation-fill-mode: forwards;
}

.button-center {
  display: block;
  margin-left: auto;
}
</style>
