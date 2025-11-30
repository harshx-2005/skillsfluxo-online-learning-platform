import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getAssetUrl } from '../../utils/api';
import { FaArrowLeft, FaPlay, FaThumbsUp } from 'react-icons/fa';

const AdminVideoPlayer = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch current video and default videos for "Up Next"
                const [videoRes, defaultRes] = await Promise.all([
                    api.get(`/videos/view/${videoId}`),
                    api.get('/videos/getDefault')
                ]);

                setVideo(videoRes.data);

                // Filter out current video from recommendations
                const allDefaults = Array.isArray(defaultRes.data) ? defaultRes.data : (defaultRes.data.videos || []);
                const others = allDefaults.filter(v => v.id !== parseInt(videoId));
                setRelatedVideos(others);

                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load video. It might not be available or you don't have permission.");
                setLoading(false);
            }
        };
        fetchData();
    }, [videoId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-neon-orange"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl font-bold mb-4 text-red-500">Error</h2>
                <p className="mb-6">{error}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded-lg transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white pb-20">
            {/* Navbar Placeholder */}
            <div className="p-4 border-b border-gray-800 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                    <FaArrowLeft className="text-xl" />
                </button>
                <h1 className="text-xl font-bold truncate">Playing: {video.title || video.name}</h1>
            </div>

            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Video Player Area */}
                    <div className="lg:col-span-2">
                        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 mb-6">
                            <video
                                src={video.url}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>

                        <div className="mb-8">
                            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-white">{video.title || video.name}</h1>

                            <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
                                <h3 className="font-bold mb-2 text-lg">Description</h3>
                                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {video.description || "No description available for this video."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Up Next) */}
                    <div className="lg:col-span-1">
                        <h3 className="text-xl font-bold mb-4">Up Next</h3>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                            {relatedVideos.length > 0 ? (
                                relatedVideos.map(vid => (
                                    <div
                                        key={vid.id}
                                        onClick={() => navigate(`/admin/video/${vid.id}`)}
                                        className="bg-dark-card p-3 rounded-lg border border-gray-800 flex gap-3 hover:bg-gray-800 transition-colors cursor-pointer group"
                                    >
                                        <div className="w-32 h-20 bg-gray-800 rounded overflow-hidden flex-shrink-0 relative group">
                                            <img
                                                src={getAssetUrl(vid.thumbnail || vid.course_thumbnail)}
                                                alt={vid.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                style={{ display: (vid.thumbnail || vid.course_thumbnail) ? 'block' : 'none' }}
                                            />
                                            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center" style={{ display: (vid.thumbnail || vid.course_thumbnail) ? 'none' : 'flex' }}>
                                                <FaPlay className="text-gray-700" />
                                            </div>

                                            {/* Persistent Play Button Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
                                                <div className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-sm group-hover:bg-neon-orange transition-colors">
                                                    <FaPlay className="ml-0.5 text-xs" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm line-clamp-2 mb-1 group-hover:text-neon-orange transition-colors">{vid.title || vid.name}</h4>
                                            <p className="text-xs text-gray-400 line-clamp-1">{vid.course_name || "SkillFluxo"}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm">No other videos available.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminVideoPlayer;
