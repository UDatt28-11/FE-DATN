import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import authService from '../service/authService';

// 1. Định nghĩa kiểu dữ liệu cho Context
interface AuthContextType {
    isLoggedIn: boolean;
    user: any | null;
    login: (user: any, token: string) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Định nghĩa Props cho Provider
interface AuthProviderProps {
    children: ReactNode;
}

// 3. Tạo Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    // Kiểm tra trạng thái đăng nhập khi component mount
    useEffect(() => {
        const token = authService.getToken();
        const userData = authService.getCurrentUser();

        if (token && userData) {
            setIsLoggedIn(true);
            setUser(userData);
        }

        setLoading(false);
    }, []);

    // Logic đăng nhập
    const login = (userData: any, token: string) => {
        console.log("LOGIN: Thiết lập trạng thái đăng nhập = TRUE.");
        setIsLoggedIn(true);
        setUser(userData);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(userData));
    };

    // Logic đăng xuất
    const logout = async () => {
        console.log("LOGOUT: Thiết lập trạng thái đăng nhập = FALSE.");
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoggedIn(false);
            setUser(null);
        }
    };

    const value = useMemo(() => ({
        isLoggedIn,
        user,
        login,
        logout,
        loading,
    }), [isLoggedIn, user, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// 4. Custom Hook để sử dụng Context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
