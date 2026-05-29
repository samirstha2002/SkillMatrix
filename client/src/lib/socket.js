import { io } from "socket.io-client";
 
const socket = io("http://localhost:5000", {
  autoConnect: false, // ✅ Don't connect at import time (token may not exist yet)
  auth: (cb) => {
    // ✅ Token is read lazily at connection time, not at module load
    cb({ token: sessionStorage.getItem("token") });
  },
});
 
export default socket;