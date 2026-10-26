import { useContext } from "react";
import { AuthContext } from "./authContextDef";

export const useAuthContext = () => useContext(AuthContext);
