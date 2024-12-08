import { ENVIRONMENTS } from "./../config/environment";
import { io } from "socket.io-client";

export const socket = io(ENVIRONMENTS.APP.SOCKET_URL, {
  autoConnect: false,
});

// use socket.connect() to connect , manually
