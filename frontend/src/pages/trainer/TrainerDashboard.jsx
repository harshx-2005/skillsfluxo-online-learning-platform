import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { FaLayerGroup, FaVideo, FaClock, FaChalkboardTeacher, FaArrowLeft } from 'react-icons/fa';
import CourseCard from '../../components/CourseCard';

const TrainerDashboard = () => {
    const [stats, setStats] = useState({ total_batches: 0, total_videos: 0, total_students: 0 });

    const [myCourses, setMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Dashboard Data
                const dashboardRes = await api.get('/trainer/dashboard');
                setStats(dashboardRes.data);

                // Fetch My Assigned Courses
                const coursesRes = await api.get('/trainer/courses');
                setMyCourses(coursesRes.data.courses || []);

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
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-neon-purple"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white p-8 pt-16">
            <div className="container mx-auto">
                <button
                    onClick={() => navigate('/trainer/home')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors group"
                >
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Home
                </button>

                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue">
                        Trainer Dashboard
                    </h1>
                    <button
                        onClick={() => navigate('/trainer/upload-video')}
                        className="bg-neon-purple hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20"
                    >
                        <FaVideo /> Upload New Video
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-neon-purple transition-all shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 text-sm font-bold uppercase">Active Batches</h3>
                            <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple">
                                <FaLayerGroup />
                            </div>
                        </div>
                        <p className="text-4xl font-bold text-white">{stats.total_batches}</p>
                    </div>

                    <div className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-neon-blue transition-all shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 text-sm font-bold uppercase">Total Students</h3>
                            <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue">
                                <FaLayerGroup />
                            </div>
                        </div>
                        <p className="text-4xl font-bold text-white">{stats.total_students}</p>
                    </div>

                    <div className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-pink-500 transition-all shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-400 text-sm font-bold uppercase">Videos Uploaded</h3>
                            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500">
                                <FaVideo />
                            </div>
                        </div>
                        <p className="text-4xl font-bold text-white">{stats.total_videos}</p>
                    </div>
                </div>

                {/* My Assigned Courses Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <FaChalkboardTeacher className="text-neon-blue" /> My Assigned Courses
                    </h2>
                    {myCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {myCourses.map(course => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    isEnrolled={true}
                                    onContinue={() => navigate(`/trainer/course/${course.id}`)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-dark-card rounded-xl border border-gray-800">
                            <p className="text-gray-400 mb-4">You are not assigned to any courses yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
