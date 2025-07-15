// Assume user information is managed by Context or global state

import { useContext } from "react";
import { UserContext } from "../UserContext"; // You need to implement UserContext

export function useUser() {
  return useContext(UserContext);
}