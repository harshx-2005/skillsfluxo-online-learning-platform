import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { FaArrowLeft, FaPlay, FaVideo, FaUsers, FaUserGraduate } from 'react-icons/fa';

const TrainerBatchDetails = () => {
    const { batchId } = useParams();
    const [videos, setVideos] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [videosRes, studentsRes] = await Promise.all([
                    api.get(`/trainer/batches/${batchId}/videos`),
                    api.get(`/trainer/batches/${batchId}/students`)
                ]);

                const fetchedVideos = videosRes.data.videos || [];
                setVideos(fetchedVideos);
                setStudents(studentsRes.data.students || []);

                if (fetchedVideos.length > 0) {
                    setSelectedVideo(fetchedVideos[0]);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching batch details:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [batchId]);

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
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
                >
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Batches
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area (Player + Students) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Video Player Section */}
                        <div>
                            {selectedVideo ? (
                                <div className="bg-dark-card rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
                                    <div className="aspect-video bg-black">
                                        <video
                                            key={selectedVideo.id}
                                            src={selectedVideo.url || selectedVideo.video_url} // Handle both potential property names
                                            controls
                                            className="w-full h-full"
                                            poster={selectedVideo.thumbnail || null}
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h2 className="text-2xl font-bold text-white mb-2">{selectedVideo.name || selectedVideo.title}</h2>
                                        <p className="text-gray-400 whitespace-pre-wrap">{selectedVideo.description}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-dark-card rounded-xl border border-gray-800 p-10 text-center flex flex-col items-center justify-center aspect-video">
                                    <FaVideo className="text-6xl text-gray-700 mb-4" />
                                    <p className="text-gray-400 text-xl">No videos available in this batch.</p>
                                </div>
                            )}
                        </div>

                        {/* Enrolled Students Section */}
                        <div className="bg-dark-card rounded-xl border border-gray-800 p-6">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-neon-purple">
                                <FaUsers /> Enrolled Students ({students.length})
                            </h3>

                            {students.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {students.map(student => (
                                        <div key={student.id} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                                                {student.profile_pic ? (
                                                    <img src={student.profile_pic.startsWith('http') ? student.profile_pic : `http://localhost:5000${student.profile_pic}`} alt={student.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <FaUserGraduate />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">{student.name}</h4>
                                                <p className="text-sm text-gray-400">{student.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No students enrolled in this batch yet.</p>
                            )}
                        </div>

                    </div>

                    {/* Sidebar (Playlist) */}
                    <div className="lg:col-span-1">
                        <div className="bg-dark-card rounded-xl border border-gray-800 p-4 sticky top-24">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <FaPlay className="text-neon-purple" /> Batch Videos
                            </h3>
                            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                                {videos.map(video => (
                                    <div
                                        key={video.id}
                                        onClick={() => setSelectedVideo(video)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex gap-3 group ${selectedVideo?.id === video.id ? 'bg-gray-800 border-neon-purple' : 'bg-gray-900/50 border-gray-800 hover:bg-gray-800'}`}
                                    >
                                        <div className="w-28 h-16 bg-black rounded overflow-hidden flex-shrink-0 relative">
                                            {video.thumbnail ? (
                                                <img
                                                    src={video.thumbnail}
                                                    alt={video.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                                    <FaVideo className="text-gray-600" />
                                                </div>
                                            )}
                                            {/* Play Overlay */}
                                            <div className={`absolute inset-0 flex items-center justify-center bg-black/40 ${selectedVideo?.id === video.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                                <FaPlay className="text-white text-sm" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-bold text-sm line-clamp-2 mb-1 ${selectedVideo?.id === video.id ? 'text-neon-purple' : 'text-gray-200 group-hover:text-white'}`}>
                                                {video.name || video.title}
                                            </h4>
                                            <p className="text-xs text-gray-500 truncate">
                                                {new Date(video.created_at || Date.now()).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {videos.length === 0 && (
                                    <p className="text-gray-500 text-center py-4">No videos found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerBatchDetails;
