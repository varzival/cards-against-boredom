<template>
  <v-app>
    <v-alert
      v-model="store.showAlert"
      closable
      :title="store.alertMessage.title"
      :text="store.alertMessage.message"
      type="error"
      style="position: absolute; top: 10vh; right: 5vw; z-index: 9999999"
    >
    </v-alert>

    <router-view></router-view>

    <v-footer app v-if="!mobile">
      <div class="footer-text">
        made by
        <a target="_blank" href="https://github.com/varzival">Varzival</a>
      </div>
    </v-footer>
  </v-app>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, watch } from "vue";
import client from "./socket/colyseus";
import { useStore } from "./store/app";
import { useDisplay } from "vuetify";
import isAdminCheck from "./utils/adminCheck";

const { mobile } = useDisplay();
const store = useStore();

async function initSocket() {
  if (!client.connected) {
    try {
      const reconnectionToken = await client.connect(
        store.name,
        store.uniqueId,
        store.reconnectionToken
      );
      if (reconnectionToken) {
        store.setReconnectionToken(reconnectionToken);
      }
      // TODO handle connection error, handle name already taken

      client.room?.onStateChange((state) => {
        // fix for firefox
        // if (!store.name) {
        //   const sessionId = client.room?.sessionId;
        //   const nameAfterReconnect =
        //     client.room?.state.users.get(sessionId)?.name;
        //   store.setName(nameAfterReconnect ?? store.name);
        // }
        console.log("onStateChange", state);

        const players = Array.from(state.users.values() as any[]);
        const self = players.find((p) => p.name === store.name);
        if (!self) {
          console.error("self not found in players");
          return;
        }

        store.setState({
          ...state,
          players: players.map((p) => {
            return {
              name: p.name,
              points: p.points,
              active: p.active,
              selectionMade: false
            };
          }),
          hand: self.cards.map((c: any) => ({ text: c.text })),
          question: state.questions?.map((q: any) => ({
            text: q.text,
            num: q.num
          }))[0], // TODO
          voteOptions: state.voteOptions.map((o: any) =>
            o.cards.map((c: any) => c.text)
          ),
          voteResults: state.voteResults.map((r: any) => ({
            owner: r.owner,
            vote: r.vote,
            players: r.players.map((p: any) => p)
          }))
        });
        console.log(store.voteResults);
      });

      client.room?.onError((code, message) => {
        console.error(`[colyseus] ${code} - ${message}`);
      });

      client.room?.onLeave((data) => {
        console.log("onLeave", data);
        store.reset();
        client.resetRoom();
      });
    } catch (e) {
      console.error("connection error", e);
      store.setName("");
      // TODO: maybe not reset it in case that the server is down
      // but then the server needs to persist this value
      store.setReconnectionToken("");
      store.setAlertMessage(
        "Verbindung fehlgeschlagen",
        "Server ist nicht erreichbar :-("
      );
    }
  }
}

onMounted(() => {
  nextTick(async () => {
    if (store.reconnectionToken) {
      initSocket();
    }
  });
  document.title = `Cards against ${
    import.meta.env.VITE_APP_TITLE ?? "BOREDOM"
  }`;
  isAdminCheck();
});

watch(
  () => store.name,
  (newValue) => {
    if (newValue && !client.connected) {
      initSocket();
    }
  }
);
</script>

<style scoped>
.footer-text {
  margin-left: auto;
}

h1 {
  margin-left: 20px;
}
</style>
