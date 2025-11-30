import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                setUser(JSON.parse(storedUser));
                // Optional: Verify token with backend here
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email, password, role) => {
        try {
            // Different endpoints based on role? 
            // Backend has /api/auth/login for generic login (student/trainer/admin?)
            // Let's check backend auth.controller.js again. 
            // It seems /api/auth/login handles students and trainers.
            // /api/auth/admin-login handles admins.

            let endpoint = '/auth/login';
            if (role === 'admin') {
                // Admin login requires secret key, handled separately in AdminLogin component usually, 
                // but we can unify here if we pass secretKey.
                // For now, let's assume this login is for Student/Trainer.
                // Admin login might need a separate function or parameter.
            }

            const response = await api.post(endpoint, { email, password, role }); // Role might not be needed for login if email is unique across tables? 
            // Wait, backend loginValidator checks email/password. 
            // Auth controller checks both 'users' table (student/trainer) and 'admins' table?
            // Actually, looking at previous analysis, there is `adminLogin` and `login`.
            // `login` checks `users` table. `users` table has `role` column.

            const { token, user: userData } = response.data;

            // Role mismatch check removed to allow backend to determine role
            // if (userData.role !== role) {
            //     throw new Error("Role mismatch");
            // }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            toast.success(`Welcome back, ${userData.name}!`);
            return true;
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.response?.data?.message || "Login failed");
            return false;
        }
    };

    const adminLogin = async (email, password, secretKey) => {
        try {
            const response = await api.post('/auth/admin-login', { email, password, secretKey });
            const { token, user: userData } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            toast.success("Admin access granted");
            return true;
        } catch (error) {
            console.error("Admin login error:", error);
            toast.error(error.response?.data?.message || "Admin login failed");
            return false;
        }
    }

    const register = async (name, email, password, role, phone) => {
        console.log("AuthContext register called", { name, email, role });
        try {
            const res = await api.post('/auth/register', { name, email, password, role, phone });
            console.log("Register API response:", res.data);
            toast.success("Registration successful! Please login.");
            return true;
        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error.response?.data?.message || "Registration failed");
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        toast.info("Logged out successfully");
    };

    const updateUser = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, login, adminLogin, register, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
