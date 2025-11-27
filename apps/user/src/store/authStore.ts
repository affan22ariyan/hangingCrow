import { create } from 'zustand';

interface AuthState {
    token: string | null;
    user: any | null;
    balance: number;
    setToken: (token: string) => void;
    setUser: (user: any) => void;
    setBalance: (balance: number) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem('token'),
    user: null,
    balance: 0,
    setToken: (token) => {
        localStorage.setItem('token', token);
        set({ token });
    },
    setUser: (user) => set({ user }),
    setBalance: (balance) => set({ balance }),
    logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null, balance: 0 });
    },
}));
