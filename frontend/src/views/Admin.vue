<template>
  <PlayerOverview></PlayerOverview>

  <v-app-bar app>
    <h1 style="margin-left: auto; margin-right: auto">Adminbereich</h1>
  </v-app-bar>

  <v-main>
    <v-container fluid>
      <v-row>
        <v-col></v-col>
        <v-col>
          <v-row class="name-input" align="center">
            <v-col cols="10" align-self="center">
              <v-text-field
                v-model="adminPwd"
                type="password"
                label="Passwort"
                :rules="rules"
                hide-details="auto"
              ></v-text-field>
            </v-col>
            <v-col cols="2" align-self="center">
              <v-btn
                @click="login()"
                :disabled="!adminPwd || !(adminPwd.length <= 30)"
              >
                Los!
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
        <v-col></v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import PlayerOverview from "@/components/PlayerOverview.vue";
import { socket } from "@/socket";
import { useStore } from "@/store/app";
import { ref } from "vue";

const store = useStore();
const adminPwd = ref("");

const rules = ref([
  (value: string) => !!value || "Required.",
  (value: string) => (value && value.length <= 30) || "übertreib nicht"
]);

function login() {
  fetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      password: adminPwd.value
    })
  });
}
</script>
