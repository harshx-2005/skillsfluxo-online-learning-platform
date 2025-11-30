import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaLayerGroup, FaClipboardList, FaUsersCog, FaExchangeAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total_students: 0,
        total_trainers: 0,
        total_courses: 0,
        total_batches: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/dashboard');
                setStats(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching admin stats:", error);
                // toast.error("Failed to load dashboard stats");
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const StatCard = ({ icon: Icon, title, value, color }) => (
        <div className="bg-dark-card p-6 rounded-xl border border-gray-800 flex items-center gap-4 shadow-lg">
            <div className={`p-4 rounded-full ${color} bg-opacity-20`}>
                <Icon className={`text-3xl ${color.replace('bg-', 'text-')}`} />
            </div>
            <div>
                <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-gray-400 mt-1">Welcome back, <span className="text-neon-orange">{user?.name}</span></p>
                </div>
                <div className="flex gap-4">
                    <Link to="/admin/users" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                        <FaUsersCog /> Manage Users
                    </Link>
                    <Link to="/admin/enrollments" className="bg-neon-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-orange-900/20">
                        <FaClipboardList /> Enrollment Requests
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Link to="/admin/courses" className="bg-dark-card p-4 rounded-lg border border-gray-800 hover:border-neon-orange transition-all flex items-center justify-center gap-2 text-gray-300 hover:text-white">
                    <FaBook /> Manage Courses
                </Link>
                <Link to="/admin/assignments" className="bg-dark-card p-4 rounded-lg border border-gray-800 hover:border-neon-orange transition-all flex items-center justify-center gap-2 text-gray-300 hover:text-white">
                    <FaExchangeAlt /> User Assignments
                </Link>
                <Link to="/admin/videos" className="bg-dark-card p-4 rounded-lg border border-gray-800 hover:border-neon-orange transition-all flex items-center justify-center gap-2 text-gray-300 hover:text-white">
                    <FaBook /> Manage Videos
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-orange"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard icon={FaUserGraduate} title="Total Students" value={stats.total_students} color="bg-blue-500" />
                    <StatCard icon={FaChalkboardTeacher} title="Total Trainers" value={stats.total_trainers} color="bg-purple-500" />
                    <StatCard icon={FaBook} title="Total Courses" value={stats.total_courses} color="bg-green-500" />
                    <StatCard icon={FaLayerGroup} title="Total Batches" value={stats.total_batches} color="bg-orange-500" />
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
