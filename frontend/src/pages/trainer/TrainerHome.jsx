import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getAssetUrl } from '../../utils/api';
import { FaVideo, FaUsers, FaChalkboardTeacher, FaPlay, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const TrainerHome = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalCourses: 0,
        totalVideos: 0
    });
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [videoPage, setVideoPage] = useState(1);
    const [videoTotalPages, setVideoTotalPages] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
        fetchUploadedVideos();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/trainer/dashboard');
            setStats(res.data.stats || { totalStudents: 0, totalCourses: 0, totalVideos: 0 });
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        }
    };

    const fetchUploadedVideos = async (page = 1) => {
        try {
            const res = await api.get(`/trainer/uploaded-videos?page=${page}&limit=8`);
            setVideos(res.data.videos || []);
            setVideoTotalPages(res.data.totalPages || 1);
            setVideoPage(page);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching uploaded videos:", error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-neon-purple"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white p-4 md:p-8 pt-24">
            <div className="container mx-auto max-w-7xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Trainer Dashboard</h1>
                    <button
                        onClick={() => navigate('/trainer/upload-video')}
                        className="bg-neon-purple text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-purple-600 transition-colors"
                    >
                        <FaPlus /> Upload Video
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-dark-card p-6 rounded-xl border border-gray-800 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-2xl">
                            <FaUsers />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Students</p>
                            <h3 className="text-2xl font-bold text-white">{stats.totalStudents}</h3>
                        </div>
                    </div>
                    <div className="bg-dark-card p-6 rounded-xl border border-gray-800 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-2xl">
                            <FaChalkboardTeacher />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Active Batches</p>
                            <h3 className="text-2xl font-bold text-white">{stats.totalBatches || stats.totalCourses}</h3>
                        </div>
                    </div>
                    <div className="bg-dark-card p-6 rounded-xl border border-gray-800 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-2xl">
                            <FaVideo />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Uploaded Videos</p>
                            <h3 className="text-2xl font-bold text-white">{stats.totalVideos}</h3>
                        </div>
                    </div>
                </div>

                {/* Recent Uploads Section */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <FaPlay className="text-neon-purple" /> Recent Uploads
                    </h2>

                    {videos.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {videos.map(video => (
                                    <div
                                        key={video.id}
                                        className="bg-dark-card rounded-xl overflow-hidden border border-gray-800 group hover:border-neon-purple transition-all cursor-pointer"
                                        onClick={() => navigate(`/trainer/video/${video.id}`)}
                                    >
                                        <div className="aspect-video bg-black relative overflow-hidden">
                                            {video.thumbnail ? (
                                                <img
                                                    src={getAssetUrl(video.thumbnail)}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                    <FaVideo className="text-4xl" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <FaPlay className="text-white text-3xl" />
                                            </div>
                                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                                {new Date(video.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-white mb-1 line-clamp-1">{video.title}</h3>
                                            <p className="text-gray-400 text-sm line-clamp-2">{video.description || "No description provided."}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {videoTotalPages > 1 && (
                                <div className="flex justify-center items-center gap-4">
                                    <button
                                        onClick={() => fetchUploadedVideos(videoPage - 1)}
                                        disabled={videoPage === 1}
                                        className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <span className="text-gray-400">Page {videoPage} of {videoTotalPages}</span>
                                    <button
                                        onClick={() => fetchUploadedVideos(videoPage + 1)}
                                        disabled={videoPage === videoTotalPages}
                                        className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 bg-dark-card rounded-xl border border-gray-800">
                            <FaVideo className="text-6xl text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-400 text-xl">No videos uploaded yet.</p>
                            <button
                                onClick={() => navigate('/trainer/upload-video')}
                                className="mt-4 text-neon-purple hover:text-white font-bold"
                            >
                                Upload your first video
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerHome;
