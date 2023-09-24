import { io } from "socket.io-client";

export interface Socket {
  emit: Function;
  on: Function;
  connect: Function;
  connected: boolean;
}

export let socket = {
  emit: () => {},
  on: () => {},
  connect: () => {},
  connected: false
} as Socket;

export function createSocket(name: string, uniqueId: string) {
  const newSocket = io("/", {
    autoConnect: false,
    query: { name: name, uniqueId: uniqueId }
  });

  newSocket.onAny((event, ...args) => {
    console.log(event, args);
  });

  socket = newSocket;
}
