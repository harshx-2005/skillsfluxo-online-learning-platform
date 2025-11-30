import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaPlayCircle, FaClock, FaSignal, FaStar, FaQuoteLeft, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaCode, FaPaintBrush, FaChartLine, FaRobot } from 'react-icons/fa';

const LandingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'student') navigate('/student/home');
            else if (user.role === 'trainer') navigate('/trainer/dashboard');
            else if (user.role === 'admin') navigate('/admin/dashboard');
        }
    }, [user, navigate]);

    // Mock data for display purposes
    const popularCourses = [
        { id: 1, title: "Complete Web Development Bootcamp", instructor: "Sarah Johnson", rating: 4.8, students: "12k", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", price: "$89" },
        { id: 2, title: "Machine Learning A-Z: Hands-On Python", instructor: "Dr. Andrew Ng", rating: 4.9, students: "18k", image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", price: "$99" },
        { id: 3, title: "Advanced React Native & Redux", instructor: "David Miller", rating: 4.7, students: "8k", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", price: "$79" },
    ];

    const categories = [
        { name: "Web Development", icon: <FaCode />, count: "150+ Courses" },
        { name: "Data Science & AI", icon: <FaRobot />, count: "80+ Courses" },
        { name: "Design & Creative", icon: <FaPaintBrush />, count: "120+ Courses" },
        { name: "Business & Marketing", icon: <FaChartLine />, count: "100+ Courses" },
    ];

    const testimonials = [
        { name: "Michael Chen", role: "Software Engineer", text: "SkillsFluxo transformed my career. The courses are practical, up-to-date, and the instructors are world-class.", image: "https://randomuser.me/api/portraits/men/32.jpg" },
        { name: "Jessica Williams", role: "UX Designer", text: "I went from zero to hired in 6 months. The project-based learning approach is exactly what I needed.", image: "https://randomuser.me/api/portraits/women/44.jpg" },
        { name: "David Miller", role: "Data Analyst", text: "The community support is amazing. Whenever I got stuck, there was always someone to help me out.", image: "https://randomuser.me/api/portraits/men/85.jpg" },
    ];

    return (
        <div className="min-h-screen text-white font-sans selection:bg-neon-orange selection:text-white pb-20">

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center text-center px-4">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505]"></div>
                </div>

                <div className="relative z-10 max-w-5xl w-full animate-fade-in-up">
                    <div className="inline-block mb-6 px-6 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-sm text-neon-orange font-bold uppercase tracking-wider shadow-lg">
                        🚀 Launch your career today
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight drop-shadow-2xl">
                        Unlock Your Potential with <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-orange to-red-500">Limitless Learning</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-medium">
                        Join millions of learners worldwide. Master new skills in coding, design, business, and more with our expert-led courses.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link to="/register" className="btn-primary px-10 py-5 rounded-full font-bold text-xl transition-all transform hover:-translate-y-1 shadow-[0_0_20px_rgba(255,95,31,0.4)] hover:shadow-[0_0_30px_rgba(255,95,31,0.6)]">
                            Start Learning for Free
                        </Link>
                    </div>
                </div>
            </div>

            {/* Categories Section */}
            <div className="py-10 relative z-10">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center md:text-left">
                        <h2 className="text-3xl font-bold mb-2">Top Categories</h2>
                        <p className="text-gray-400">Explore our most popular learning paths</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((cat, index) => (
                            <div key={index} className="glass-panel p-6 rounded-2xl border border-white/20 hover:border-neon-orange transition-all duration-300 group cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(255,95,31,0.3)]">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl text-white mb-4 group-hover:bg-neon-orange transition-colors">
                                    {cat.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
                                <p className="text-gray-400 text-sm">{cat.count}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Popular Courses Section */}
            <div className="py-20 container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Courses</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">Discover the courses that are trending right now. Hand-picked for you.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {popularCourses.map((course) => (
                        <div key={course.id} className="glass-panel rounded-2xl overflow-hidden border border-gray-800 hover:border-neon-orange transition-all duration-300 group hover:shadow-xl hover:shadow-neon-orange/10 hover:-translate-y-1">
                            <div className="relative h-56 overflow-hidden">
                                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 border border-white/10">
                                    <FaStar className="text-yellow-400" /> {course.rating}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-neon-orange transition-colors">{course.title}</h3>
                                <p className="text-sm text-gray-400 mb-4">by {course.instructor}</p>
                                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-neon-orange font-bold text-lg">Free</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="py-20 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">What Our Students Say</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <div key={i} className="glass-panel p-8 rounded-2xl relative">
                                <FaQuoteLeft className="text-4xl text-white/10 absolute top-6 right-6" />
                                <p className="text-gray-300 mb-6 leading-relaxed relative z-10">"{t.text}"</p>
                                <div className="flex items-center gap-4">
                                    <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-neon-orange" />
                                    <div>
                                        <h4 className="font-bold text-white">{t.name}</h4>
                                        <p className="text-xs text-gray-400">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-20 px-4">
                <div className="container mx-auto glass-panel rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-orange/20 to-red-600/20 opacity-30"></div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10">Ready to Start Your Journey?</h2>
                    <p className="text-white/90 text-xl mb-10 max-w-2xl mx-auto relative z-10">Join thousands of students who are already learning and growing with SkillsFluxo.</p>
                    <Link to="/register" className="relative z-10 bg-white text-neon-orange hover:bg-gray-100 px-10 py-4 rounded-full font-bold text-lg transition-all shadow-xl">
                        Get Started for Free
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="glass-panel mt-20 border-t border-white/10 pt-20 pb-10">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div>
                            <div className="text-2xl font-bold tracking-tighter mb-6">
                                <span className="text-white">Skills</span><span className="text-neon-orange">Fluxo</span>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                Empowering learners worldwide with accessible, high-quality education. Start your journey today.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6">Platform</h4>
                            <ul className="space-y-4 text-gray-400">
                                <li><Link to="/courses" className="hover:text-neon-orange transition-colors">Browse Courses</Link></li>
                                <li><Link to="/mentors" className="hover:text-neon-orange transition-colors">Mentors</Link></li>
                                <li><Link to="/pricing" className="hover:text-neon-orange transition-colors">Pricing</Link></li>
                                <li><Link to="/business" className="hover:text-neon-orange transition-colors">For Business</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6">Company</h4>
                            <ul className="space-y-4 text-gray-400">
                                <li><Link to="/about" className="hover:text-neon-orange transition-colors">About Us</Link></li>
                                <li><Link to="/careers" className="hover:text-neon-orange transition-colors">Careers</Link></li>
                                <li><Link to="/blog" className="hover:text-neon-orange transition-colors">Blog</Link></li>
                                <li><Link to="/contact" className="hover:text-neon-orange transition-colors">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-6">Connect</h4>
                            <div className="flex gap-4 mb-6">
                                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-neon-orange hover:text-white transition-all"><FaFacebook /></a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-neon-orange hover:text-white transition-all"><FaTwitter /></a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-neon-orange hover:text-white transition-all"><FaInstagram /></a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-neon-orange hover:text-white transition-all"><FaLinkedin /></a>
                            </div>
                            <p className="text-gray-500 text-sm">Subscribe to our newsletter</p>
                            <div className="mt-2 flex">
                                <input type="email" placeholder="Email address" className="bg-black/50 text-white px-4 py-2 rounded-l-lg outline-none border border-white/10 focus:border-neon-orange w-full" />
                                <button className="bg-neon-orange px-4 py-2 rounded-r-lg text-white font-bold hover:bg-orange-600 transition-colors">→</button>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
                        <p>&copy; 2024 SkillsFluxo. All rights reserved.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
