import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import CourseCard from '../../components/CourseCard';
import { FaBook, FaLayerGroup, FaVideo, FaClock } from 'react-icons/fa';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total_courses: 0, total_batches: 0, total_videos: 0 });
    const [myCourses, setMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/student/dashboard');
                const data = response.data;

                setStats(data.stats || { total_courses: 0, total_batches: 0, total_videos: 0 });
                setMyCourses(data.myCourses?.courses || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-neon-orange"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white py-8">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/student/home')}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors border border-white/10"
                            title="Back to Home"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                My Dashboard
                            </h1>
                            <p className="text-gray-400 text-sm">Welcome back, continue your learning journey.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-[#111] p-6 rounded-xl border border-gray-800 flex items-center justify-between card-hover cursor-pointer group">
                        <div>
                            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2 group-hover:text-neon-blue transition-colors">Enrolled Courses</h3>
                            <p className="text-4xl font-bold text-white">{stats.total_courses}</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 text-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <FaBook />
                        </div>
                    </div>

                    <div className="bg-[#111] p-6 rounded-xl border border-gray-800 flex items-center justify-between card-hover cursor-pointer group">
                        <div>
                            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2 group-hover:text-neon-purple transition-colors">Active Batches</h3>
                            <p className="text-4xl font-bold text-white">{stats.total_batches}</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 text-xl group-hover:bg-green-500 group-hover:text-white transition-all">
                            <FaLayerGroup />
                        </div>
                    </div>

                    <div className="bg-[#111] p-6 rounded-xl border border-gray-800 flex items-center justify-between card-hover cursor-pointer group">
                        <div>
                            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2 group-hover:text-neon-orange transition-colors">Videos Available</h3>
                            <p className="text-4xl font-bold text-white">{stats.total_videos}</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 text-xl group-hover:bg-purple-500 group-hover:text-white transition-all">
                            <FaVideo />
                        </div>
                    </div>
                </div>

                {/* My Courses Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <span className="w-1 h-8 bg-neon-blue rounded-full"></span>
                        <span className="text-white">Continue Learning</span>
                    </h2>
                    {myCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {myCourses.map(course => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    isEnrolled={true}
                                    onContinue={() => navigate(`/student/course/${course.id}/content`)}
                                />
                            ))}
                        </div>
                    ) : (

                        <div className="text-center py-20 bg-[#111] rounded-2xl border border-gray-800">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-500 text-3xl">
                                <FaBook />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Courses Yet</h3>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">You haven't enrolled in any courses yet. Explore our catalog to start learning.</p>
                            <button
                                onClick={() => navigate('/student/home?tab=browse')}
                                className="btn-primary px-8 py-3 rounded-full text-white font-bold hover:scale-105 transition-transform"
                            >
                                Browse Courses
                            </button>
                        </div>
                    )}

                </div>
            </div >
        </div >
    );
};

export default StudentDashboard;
