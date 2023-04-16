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

    <AdminEditDialog
      :id="selectedCard ? selectedCard._id : null"
      :modelValue="!!selectedCard"
      @update:modelValue="(newValue) => (selectedCard = newValue)"
      @save="
        () => {
          if (selectedCard && selectedCard._id) cardsCRUD.update();
          else if (selectedCard && !selectedCard._id) cardsCRUD.create();
        }
      "
      @delete="
        () => {
          if (selectedCard && selectedCard._id) cardsCRUD.delete();
        }
      "
    >
      <template v-slot:title
        ><h3>Karte {{ selectedCard ? selectedCard._id : "" }}</h3>
      </template>

      <template v-slot:text>
        <v-textarea
          v-if="selectedCard"
          filled
          label="Text"
          auto-grow
          v-model="selectedCard.text"
        ></v-textarea>
      </template>
    </AdminEditDialog>

    <AdminEditDialog
      :id="selectedQuestion ? selectedQuestion._id : null"
      :modelValue="!!selectedQuestion"
      @update:modelValue="(newValue) => (selectedQuestion = newValue)"
      @save="
        () => {
          if (selectedQuestion && selectedQuestion._id) questionsCRUD.update();
          else if (selectedQuestion && !selectedQuestion._id)
            questionsCRUD.create();
        }
      "
      @delete="
        () => {
          if (selectedQuestion && selectedQuestion._id) questionsCRUD.delete();
        }
      "
    >
      <template v-slot:title
        ><h3>Karte {{ selectedQuestion ? selectedQuestion._id : "" }}</h3>
      </template>

      <template v-slot:text>
        <v-textarea
          v-if="selectedQuestion"
          filled
          label="Text"
          auto-grow
          v-model="selectedQuestion.text"
        ></v-textarea>

        <v-slider
          v-if="selectedQuestion"
          v-model="selectedQuestion.num"
          label="# Karten"
          min="1"
          max="3"
          step="1"
          thumb-label
        ></v-slider>
      </template>
    </AdminEditDialog>

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
              <v-row>
                <v-col>
                  <Card
                    :yellow="true"
                    :light="true"
                    :selectable="true"
                    :faded="false"
                    @click="cardsCRUD.selectNew()"
                  />
                </v-col>
              </v-row>
              <v-row v-for="card in cards" :key="card._id">
                <v-col>
                  <Card
                    :text="card.text"
                    :light="true"
                    :selectable="true"
                    :faded="false"
                    @click="cardsCRUD.select(card._id)"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-progress-linear
                  v-if="!cardsAllLoaded"
                  indeterminate
                  color="yellow darken-2"
                ></v-progress-linear>
              </v-row>
            </div>
            <div v-if="tab == 'questions'">
              <v-row>
                <v-col cols="1"> </v-col>
                <v-col>
                  <Card
                    :yellow="true"
                    :light="false"
                    :selectable="true"
                    :faded="false"
                    @click="questionsCRUD.selectNew()"
                  />
                </v-col>
              </v-row>
              <v-row v-for="question in questions" :key="question._id">
                <v-col cols="1" align-self="center" class="question-num">
                  <h3>{{ question.num }}</h3>
                </v-col>
                <v-col>
                  <Card
                    :text="question.text"
                    :light="false"
                    :selectable="true"
                    :faded="false"
                    @click="questionsCRUD.select(question._id)"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-progress-linear
                  v-if="!allQuestionsLoaded"
                  indeterminate
                  color="yellow darken-2"
                ></v-progress-linear>
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
import AdminEditDialog from "@/components/AdminEditDialog.vue";
import AppBar from "@/components/AppBar.vue";
import Card from "@/components/Card.vue";
import { useStore } from "@/store/app";
import { onMounted, ref } from "vue";
import CRUDObject from "../utils/CRUDObject";

const store = useStore();
const adminPwd = ref("");
const name = ref("");
const isAdmin = ref(false);
const showAlert = ref(false);
const tab = ref("game");

type QuestionType = {
  _id: string;
  num: number;
  text: string;
};
const questionsCRUD = new CRUDObject<QuestionType>("questions", {
  _id: "",
  text: "",
  num: 1
});
const questions = questionsCRUD.all;
const selectedQuestion = questionsCRUD.selected;
const allQuestionsLoaded = questionsCRUD.allLoaded;

type CardType = {
  _id: string;
  text: string;
};
const cardsCRUD = new CRUDObject<CardType>("cards", { _id: "", text: "" });
const cards = cardsCRUD.all;
const selectedCard = cardsCRUD.selected;
const cardsAllLoaded = cardsCRUD.allLoaded;

onMounted(async () => {
  cardsCRUD.load();
  questionsCRUD.load();
  isAdmin.value = await isAdminCheck();
});

window.onscroll = () => {
  let bottomOfWindow =
    document.documentElement.scrollTop + window.innerHeight ===
    document.documentElement.offsetHeight;

  if (bottomOfWindow) {
    if (tab.value === "cards") {
      cardsCRUD.load();
    } else if (tab.value === "questions") {
      questionsCRUD.load();
    }
  }
};

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
