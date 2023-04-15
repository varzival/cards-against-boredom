<template>
  <AppBar text="Adminbereich">
    <div v-if="isAdmin && store.name" class="tabs">
      <v-tabs v-model="tab" align-with-title grow>
        <v-tab value="game">Spiel</v-tab>
        <v-tab value="cards">Karten</v-tab>
        <v-tab value="questions">Fragen</v-tab>
      </v-tabs>
    </div>
  </AppBar>

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
      <v-row v-if="isAdmin && store.name">
        <v-col cols="1" md="4"></v-col>
        <v-col cols="10" md="4" align="center">
          <div class="tab-items">
            <div v-if="tab === 'game'">
              <template v-if="store.gameStarted">
                <h2>Spiel läuft!</h2>
                <div style="margin-top: 10px">
                  <v-btn @click="stopGame"> Spiel stoppen! </v-btn>
                </div>
              </template>
              <v-btn v-else @click="startGame"> Spiel starten! </v-btn>
            </div>
            <div v-if="tab == 'cards'">
              <v-row v-for="card in cards" :key="card.id">
                <v-col>
                  <Card
                    :text="card.text"
                    :light="true"
                    :selectable="true"
                    :faded="false"
                  />
                </v-col>
              </v-row>
            </div>
            <div v-if="tab == 'questions'">
              <v-row v-for="question in questions" :key="question.id">
                <v-col cols="1" align-self="center" class="question-num">
                  <h3>{{ question.num }}</h3>
                </v-col>
                <v-col>
                  <Card
                    :text="question.text"
                    :light="false"
                    :selectable="true"
                    :faded="false"
                  />
                </v-col>
              </v-row>
            </div>
          </div>
        </v-col>
        <v-col cols="1" md="4"></v-col>
      </v-row>
      <v-row v-else justify="start">
        <v-col cols="0" md="4"></v-col>
        <v-col cols="12" md="4">
          <v-row
            v-if="!store.name"
            class="name-input"
            align="center"
            justify="center"
          >
            <v-col cols="12" md="10">
              <v-text-field
                v-model="name"
                label="Name"
                :rules="rules"
                hide-details="auto"
              ></v-text-field>
            </v-col>
            <v-col cols="0" md="2"></v-col>
          </v-row>

          <v-row class="name-input" align="center" justify="center">
            <v-col cols="12" md="10" align-self="center">
              <v-text-field
                @keyup.enter="login"
                v-model="adminPwd"
                type="password"
                label="Passwort"
                :rules="rules"
                hide-details="auto"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="2" align-self="center">
              <v-btn
                @click="login"
                :disabled="
                  !adminPwd ||
                  !(adminPwd.length <= 30) ||
                  (!store.name && !name)
                "
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
import AppBar from "@/components/AppBar.vue";
import Card from "@/components/Card.vue";
import { useStore } from "@/store/app";
import { onMounted, ref } from "vue";

const store = useStore();
const adminPwd = ref("");
const name = ref("");
const isAdmin = ref(false);
const showAlert = ref(false);
const tab = ref("game");
const cards = ref<Array<{ id: string; text: string }>>([
  { id: "1", text: "test 1" },
  { id: "2", text: "test 2" },
  { id: "3", text: "test 3" }
]);
const questions = ref<Array<{ id: string; num: number; text: string }>>([
  { id: "1", num: 1, text: "test 1" },
  { id: "2", num: 2, text: "test 2" },
  { id: "3", num: 3, text: "test 3" }
]);

const rules = ref([
  (value: string) => !!value || "Required.",
  (value: string) => (value && value.length <= 30) || "übertreib nicht"
]);

async function login() {
  if (
    !adminPwd.value ||
    !(adminPwd.value.length <= 30) ||
    (!store.name && !name)
  ) {
    console.error("invalid login");
    return;
  }

  if (name.value) store.setName(name.value);

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

<style scoped>
.tabs {
  width: 100%;
}

.tab-items {
  margin-top: 20px;
  width: 100%;
}

.question-num {
  text-align: center;
  font-weight: bold;
  color: red;
}
</style>
