import io from "socket.io-client";

const socket = io(
  "https://625f-2601-19b-280-4960-cd3e-4a80-f38-4949.ngrok-free.app"
);

export default socket;
