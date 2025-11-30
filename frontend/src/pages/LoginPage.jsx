import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            if (user.role === 'student') navigate('/student/home');
            else if (user.role === 'trainer') navigate('/trainer/home');
            else if (user.role === 'admin') navigate('/admin/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await login(email, password);
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 pt-12 pb-12">
            <div className="bg-[#111] border border-gray-800 p-8 rounded-3xl w-full max-w-md animate-fade-in-up shadow-2xl">
                <h2 className="text-3xl font-bold text-center mb-2 text-white">Welcome Back</h2>
                <p className="text-gray-300 text-center mb-8">Login to access your account</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-neon-blue focus:border-transparent outline-none transition-all placeholder-gray-500"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-neon-blue focus:border-transparent outline-none transition-all placeholder-gray-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary text-white font-bold py-3.5 rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-neon-blue hover:text-white font-medium transition-colors">
                        Register here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
