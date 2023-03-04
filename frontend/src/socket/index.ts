import { io } from "socket.io-client";

export interface Socket {
  emit: Function;
  on: Function;
  connect: Function;
  connected: boolean;
}

/*
let emitQueue = [] as Array<>;
let onQueue = [] as Array<>;
*/

export let socket = {
  emit: () => {},
  on: () => {},
  connect: () => {},
  connected: false
} as Socket;

export function createSocket(name: string) {
  // TODO use auth data here
  const URL = process.env.VUE_APP_BACKEND_URL || "http://localhost:5000";
  const newSocket = io(URL, { autoConnect: false, query: { name: name } });

  newSocket.onAny((event, ...args) => {
    console.log(event, args);
  });

  socket = newSocket;
}
