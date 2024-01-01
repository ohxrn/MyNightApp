import { makeObservable, observable, action } from "mobx";
import io from "socket.io-client";
import { createContext, useContext } from "react";

class SocketStore {
  socket = null;

  constructor() {
    makeObservable(this, {
      socket: observable,
      setSocket: action,
      connectSocket: action,
      disconnectSocket: action,
    });
  }

  setSocket(socket) {
    this.socket = socket;
  }

  connectSocket() {
    if (!this.socket) {
      this.socket = io(
        "https://e907-2601-19b-280-4960-cd3e-4a80-f38-4949.ngrok-free.app"
      );
      this.socket.on("connect", () => {
        console.log("Socket connected in store");
        // Additional logic after socket connection
      });
    }
  }

  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      console.log("Socket disconnected!");
    }
  }
}

const socketStore = new SocketStore();

export const socket = socketStore.socket;
export default socketStore;
