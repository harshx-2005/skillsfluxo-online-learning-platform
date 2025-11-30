import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Register form submitted", { name, email, role, phone });
        setIsSubmitting(true);
        try {
            const success = await register(name, email, password, role, phone);
            console.log("Register result:", success);
            setIsSubmitting(false);
            if (success) {
                console.log("Navigating to login");
                navigate('/login');
            }
        } catch (err) {
            console.error("Register submit error:", err);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 pt-12 pb-12">
            <div className="bg-[#111] border border-gray-800 p-8 rounded-3xl w-full max-w-md animate-fade-in-up shadow-2xl">
                <h2 className="text-3xl font-bold text-center mb-2 text-white">Create Account</h2>
                <p className="text-gray-300 text-center mb-8">Join SkillsFluxo today</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">I want to join as a</label>
                        <div className="grid grid-cols-2 gap-4 p-1 bg-white/5 rounded-xl border border-white/10">
                            <button
                                type="button"
                                onClick={() => setRole('student')}
                                className={`py-2.5 rounded-lg text-sm font-bold transition-all ${role === 'student'
                                    ? 'bg-neon-orange text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Student
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('trainer')}
                                className={`py-2.5 rounded-lg text-sm font-bold transition-all ${role === 'trainer'
                                    ? 'bg-neon-purple text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Trainer
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-neon-blue focus:border-transparent outline-none transition-all placeholder-gray-500"
                            placeholder="John Doe"
                        />
                    </div>

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
                        <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-neon-blue focus:border-transparent outline-none transition-all placeholder-gray-500"
                            placeholder="+1 234 567 8900"
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
                        {isSubmitting ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-neon-blue hover:text-white font-medium transition-colors">
                        Login here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
