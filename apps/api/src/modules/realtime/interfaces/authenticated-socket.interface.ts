import { Socket } from "socket.io";
import { CurrentUserData } from "../../auth/interfaces/current-user.interface";

export interface AuthenticatedSocket extends Socket {
  data: {
    currentUser: CurrentUserData;
  };
}