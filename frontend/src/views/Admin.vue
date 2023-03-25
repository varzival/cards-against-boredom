<template>
  <PlayerOverview></PlayerOverview>

  <v-app-bar app>
    <h1 style="margin-left: auto; margin-right: auto">Adminbereich</h1>
  </v-app-bar>

  <v-main>
    <v-alert
      v-model="showAlert"
      closable
      title="ALAAARM!!"
      text="Login fehlgeschlagen."
      type="error"
      style="position: absolute; top: 10vh; right: 5vw; z-index: 9999999"
    >
    </v-alert>
    <v-container fluid>
      <v-row v-if="isAdmin">
        <v-col cols="0" md="4"></v-col>
        <v-col cols="12" md="4" align="center">
          <template v-if="store.gameStarted">
            <h2>Spiel läuft!</h2>
            <div style="margin-top: 10px">
              <v-btn @click="stopGame()"> Spiel stoppen! </v-btn>
            </div>
          </template>
          <v-btn v-else @click="startGame()"> Spiel starten! </v-btn>
        </v-col>
        <v-col cols="0" md="4"></v-col>
      </v-row>
      <v-row v-else justify="start">
        <v-col cols="0" md="4"></v-col>
        <v-col cols="12" md="4">
          <v-row class="name-input" align="center" justify="center">
            <v-col cols="12" md="10" align-self="center">
              <v-text-field
                v-model="adminPwd"
                type="password"
                label="Passwort"
                :rules="rules"
                hide-details="auto"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="2" align-self="center">
              <v-btn
                @click="login()"
                :disabled="!adminPwd || !(adminPwd.length <= 30)"
              >
                Los!
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="0" lg="4"></v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import PlayerOverview from "@/components/PlayerOverview.vue";
import { useStore } from "@/store/app";
import { onMounted, ref } from "vue";

const store = useStore();
const adminPwd = ref("");
const isAdmin = ref(false);
const showAlert = ref(false);

const rules = ref([
  (value: string) => !!value || "Required.",
  (value: string) => (value && value.length <= 30) || "übertreib nicht"
]);

async function login() {
  try {
    await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        password: adminPwd.value
      })
    });
    isAdmin.value = await isAdminCheck();
    if (!isAdmin.value) {
      adminPwd.value = "";
      showAlert.value = true;
      setTimeout(() => {
        showAlert.value = false;
      }, 5000);
    }
  } catch (e) {
    adminPwd.value = "";
    showAlert.value = true;
    setTimeout(() => {
      showAlert.value = false;
    }, 5000);
  }
}

async function startGame() {
  await fetch("/api/game/start", {
    method: "POST"
  });
}

async function stopGame() {
  await fetch("/api/game/stop", {
    method: "POST"
  });
}

async function isAdminCheck() {
  try {
    const response = await fetch("/api/auth/is_admin");
    if (response.status <= 299) return true;
    else return false;
  } catch (e) {
    return false;
  }
}

onMounted(async () => {
  isAdmin.value = await isAdminCheck();
});
</script>
