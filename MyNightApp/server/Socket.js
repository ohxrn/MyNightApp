import io from "socket.io-client";

const socket = io(
  "https://99af-2601-19b-280-4960-1d91-5f7b-b451-5fae.ngrok-free.app"
);

export default socket;
