import { createContext } from "react";

export const AuthContext = createContext({
  user: null,
  isLoginModalOpen: false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
  loginWithEmail: () => {},
  loginWithGoogle: () => {},
  loginWithPhone: () => {},
  logout: () => {}
});
