import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAssetUrl } from '../utils/api';
import { useState } from 'react';
import { FaBars, FaTimes, FaUser } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="relative w-full z-50 bg-[#111] border-b border-gray-800 py-4">
            <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
                <Link to="/" className="text-2xl font-extrabold tracking-tighter">
                    Skills<span className="text-neon-blue">Fluxo</span>
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white text-2xl focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <FaTimes /> : <FaBars />}
                </button>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {!user && (
                        <>
                            <Link to="/login" className="text-gray-300 hover:text-white transition-colors font-medium">Login</Link>
                            <Link to="/register" className="btn-primary px-6 py-2 rounded-full text-white font-bold transition-transform hover:scale-105">
                                Get Started
                            </Link>
                        </>
                    )}

                    {user && (
                        <>
                            <Link to="/" className="text-gray-300 hover:text-white transition-colors font-medium">Home</Link>
                            <Link
                                to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'trainer' ? '/trainer/dashboard' : '/student/dashboard'}
                                className="text-gray-300 hover:text-white transition-colors font-medium"
                            >
                                Dashboard
                            </Link>
                            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                                <Link
                                    to={user.role === 'admin' ? '/admin/profile' : user.role === 'trainer' ? '/trainer/profile' : '/student/profile'}
                                    className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-lg transition-colors cursor-pointer"
                                >
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-neon-blue/50 shadow-[0_0_10px_rgba(0,242,255,0.2)]">
                                        {user.profile_pic ? (
                                            <img
                                                src={getAssetUrl(user.profile_pic)}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                            />
                                        ) : null}
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400" style={{ display: user.profile_pic ? 'none' : 'flex' }}>
                                            <span className="text-xs font-bold">{user.name?.charAt(0) || 'U'}</span>
                                        </div>
                                    </div>
                                    <div className="hidden lg:block">
                                        <p className="text-sm font-bold text-white leading-tight">{user.name}</p>
                                        <p className="text-[10px] text-neon-blue font-medium uppercase tracking-wider">{user.role || 'Student'}</p>
                                    </div>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 flex items-center justify-center transition-all border border-white/5 hover:border-red-500/50"
                                    title="Logout"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Mobile Menu Dropdown */}
                {isOpen && (
                    <div className="absolute top-full left-0 w-full mt-4 glass-panel bg-[#050505]/95 backdrop-blur-xl rounded-2xl flex flex-col items-center gap-6 py-8 md:hidden animate-fade-in shadow-2xl border border-white/10">
                        {!user && (
                            <>
                                <Link to="/login" onClick={() => setIsOpen(false)} className="text-xl text-gray-300 hover:text-white">Login</Link>
                                <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary px-8 py-3 rounded-full text-white font-bold">
                                    Get Started
                                </Link>
                            </>
                        )}

                        {user && (
                            <div className="flex flex-col items-center gap-4 w-full px-6">
                                <Link to="/" onClick={() => setIsOpen(false)} className="text-xl text-gray-300 hover:text-white">Home</Link>
                                <Link
                                    to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'trainer' ? '/trainer/dashboard' : '/student/dashboard'}
                                    onClick={() => setIsOpen(false)}
                                    className="text-xl text-gray-300 hover:text-white"
                                >
                                    Dashboard
                                </Link>
                                <div className="w-full h-px bg-white/10 my-2"></div>

                                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-neon-blue shadow-[0_0_15px_rgba(0,242,255,0.3)]">
                                    {user.profile_pic ? (
                                        <img
                                            src={getAssetUrl(user.profile_pic)}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                        />
                                    ) : null}
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400" style={{ display: user.profile_pic ? 'none' : 'flex' }}>
                                        <span className="text-2xl font-bold">{user.name?.charAt(0) || 'U'}</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-white">{user.name}</p>
                                    <p className="text-sm text-neon-blue uppercase tracking-wider">{user.role || 'Student'}</p>
                                </div>

                                <Link
                                    to={user.role === 'admin' ? '/admin/profile' : user.role === 'trainer' ? '/trainer/profile' : '/student/profile'}
                                    onClick={() => setIsOpen(false)}
                                    className="mt-4 w-full py-3 rounded-xl bg-white/5 text-white font-bold border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <FaUser /> My Profile
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="mt-4 w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-bold border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <FaTimes /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
