import { create } from 'zustand';
import axios from 'axios';

interface User {
    _id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (username: string, password: string) => Promise<void>;
    register: (userData: { username: string; email: string; firstname: string; lastname: string; password: string }) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,

    login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post('http://localhost:3000/api/auth/signin', {
                username,
                password
            }, { withCredentials: true });

            // Assuming the response includes user data or we need to fetch it
            const userResponse = await axios.get('http://localhost:3000/api/user/me', {
                withCredentials: true
            });

            set({
                user: userResponse.data,
                token: response.data.token || null, // Adjust based on your backend response
                isLoading: false
            });

            // Store token if needed
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof axios.AxiosError 
                ? error.response?.data?.message || 'Login failed'
                : 'Login failed';
            set({
                error: errorMessage,
                isLoading: false
            });
            throw error;
        }
    },

    register: async (userData: { username: string; email: string; firstname: string; lastname: string; password: string }) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post('http://localhost:3000/api/auth/signup', {
                username: userData.username,
                email: userData.email,
                firstname: userData.firstname,
                lastname: userData.lastname,
                password: userData.password
            }, { withCredentials: true });

            // Assuming the response includes user data or we need to fetch it
            const userResponse = await axios.get('http://localhost:3000/api/user/me', {
                withCredentials: true
            });

            set({
                user: userResponse.data,
                token: response.data.token || null,
                isLoading: false
            });

            // Store token if needed
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof axios.AxiosError 
                ? error.response?.data?.message || 'Registration failed'
                : 'Registration failed';
            set({
                error: errorMessage,
                isLoading: false
            });
            throw error;
        }
    },

    logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('token');
        // Clear cookies by making a logout request
        axios.post('http://localhost:3000/api/auth/signout', {}, { withCredentials: true });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await axios.get('http://localhost:3000/api/user/me', {
                withCredentials: true
            });
            set({ user: response.data, token });
        } catch {
            // Token invalid, clear it
            localStorage.removeItem('token');
            set({ user: null, token: null });
        }
    }
}));