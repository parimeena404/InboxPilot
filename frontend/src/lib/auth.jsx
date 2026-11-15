import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    // undefined = checking, null = signed out, object = signed in
    const [user, setUser] = useState(undefined);

    useEffect(() => {
        api.get("/auth/me")
            .then((d) => setUser(d.data))
            .catch(() => setUser(null));
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        setUser(data.user);
        return data.user;
    };

    const demoLogin = async (role) => {
        const { data } = await api.post("/auth/demo", { role });
        setUser(data.user);
        return data.user;
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } finally {
            setUser(null);
        }
    };

    const refresh = async () => {
        try {
            const { data } = await api.get("/auth/me");
            setUser(data);
        } catch {
            setUser(null);
        }
    };

    return (
        <AuthCtx.Provider value={{ user, setUser, login, demoLogin, logout, refresh }}>
            {children}
        </AuthCtx.Provider>
    );
}

export const useAuth = () => useContext(AuthCtx);
