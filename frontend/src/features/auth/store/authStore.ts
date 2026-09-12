import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User, rememberMe?: boolean) => void;
  logout: () => void;
}

const getInitialState = () => {
  try {
    const localData = localStorage.getItem('stockrm-auth');
    if (localData) return JSON.parse(localData);
    
    const sessionData = sessionStorage.getItem('stockrm-auth');
    if (sessionData) return JSON.parse(sessionData);

    // Xóa fallback cu c?a persist middleware n?u có
    const oldPersist = localStorage.getItem('stockrm-auth-storage');
    if (oldPersist) {
      const parsed = JSON.parse(oldPersist);
      if (parsed?.state?.token) {
        return parsed.state;
      }
    }
  } catch (e) {
    console.error('Error reading auth state', e);
  }
  return { token: null, user: null, isAuthenticated: false };
};

export const useAuthStore = create<AuthState>((set) => {
  const initialState = getInitialState();

  return {
    token: initialState.token || null,
    user: initialState.user || null,
    isAuthenticated: initialState.isAuthenticated || false,
    
    login: (token: string, user: User, rememberMe: boolean = false) => {
      const data = { token, user, isAuthenticated: true };
      
      if (rememberMe) {
        localStorage.setItem('stockrm-auth', JSON.stringify(data));
      } else {
        sessionStorage.setItem('stockrm-auth', JSON.stringify(data));
      }
      
      set(data);
    },
    
    logout: () => {
      localStorage.removeItem('stockrm-auth');
      sessionStorage.removeItem('stockrm-auth');
      localStorage.removeItem('stockrm-auth-storage'); 
      
      set({ token: null, user: null, isAuthenticated: false });
    },
  };
});
