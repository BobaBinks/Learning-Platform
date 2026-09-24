import { createContext } from "react";
import api from "../axiosInstances/api.jsx";

export const AuthContext = createContext(null)
export const ThemeContext = createContext('dark')

