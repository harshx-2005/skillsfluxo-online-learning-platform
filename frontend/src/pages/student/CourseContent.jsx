import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getAssetUrl } from '../../utils/api';
import { toast } from 'react-toastify';
import { FaPlay } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const CourseContent = () => {
    const { courseId } = useParams();
    const { user } = useAuth();
    const [allVideos, setAllVideos] = useState([]);
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [batches, setBatches] = useState([]);

    // Initialize selectedBatchId from localStorage if available
    const [selectedBatchId, setSelectedBatchId] = useState(() => {
        const saved = localStorage.getItem(`lastBatch_${courseId}`);
        return saved ? parseInt(saved) : null;
    });

    const [showBatchSelection, setShowBatchSelection] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await api.get(`/student/course/${courseId}/content`);
                const videoList = response.data.videos || [];
                const batchList = response.data.batches || [];

                setAllVideos(videoList);
                setBatches(batchList);

                // Logic for initial view
                if (batchList.length > 0) {
                    // If we have a saved batch ID, check if it's valid
                    const savedBatchId = localStorage.getItem(`lastBatch_${courseId}`);
                    if (savedBatchId && batchList.find(b => b.id === parseInt(savedBatchId))) {
                        setSelectedBatchId(parseInt(savedBatchId));
                        setShowBatchSelection(false);
                    } else {
                        setShowBatchSelection(true);
                    }
                } else {
                    // No batches (only default videos)
                    setFilteredVideos(videoList);
                    if (videoList.length > 0) setCurrentVideo(videoList[0]);
                    setShowBatchSelection(false);
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching content:", error);
                toast.error("Failed to load course content");
                setLoading(false);
            }
        };
        fetchContent();
    }, [courseId]);

    useEffect(() => {
        if (selectedBatchId && allVideos.length > 0) {
            const batchVideos = allVideos.filter(v => v.batch_id === selectedBatchId || v.is_default === 1);
            setFilteredVideos(batchVideos);

            // Only set current video if it's not already set or if it's not in the current list
            if (batchVideos.length > 0) {
                if (!currentVideo || !batchVideos.find(v => v.id === currentVideo.id)) {
                    setCurrentVideo(batchVideos[0]);
                }
            } else {
                setCurrentVideo(null);
            }
        } else if (!selectedBatchId && !showBatchSelection && allVideos.length > 0) {
            setFilteredVideos(allVideos);
            if (!currentVideo && allVideos.length > 0) {
                setCurrentVideo(allVideos[0]);
            }
        }
    }, [selectedBatchId, allVideos, showBatchSelection, currentVideo]);

    const handleBatchSelect = (batchId) => {
        setSelectedBatchId(batchId);
        localStorage.setItem(`lastBatch_${courseId}`, batchId);
        setShowBatchSelection(false);
    };

    const handleBackToBatches = () => {
        setShowBatchSelection(true);
        setSelectedBatchId(null);
        localStorage.removeItem(`lastBatch_${courseId}`);
        setCurrentVideo(null); // Reset video when going back
    };

    const handleNext = () => {
        const currentIndex = filteredVideos.findIndex(v => v.id === currentVideo.id);
        if (currentIndex < filteredVideos.length - 1) {
            setCurrentVideo(filteredVideos[currentIndex + 1]);
        }
    };

    const handlePrev = () => {
        const currentIndex = filteredVideos.findIndex(v => v.id === currentVideo.id);
        if (currentIndex > 0) {
            setCurrentVideo(filteredVideos[currentIndex - 1]);
        }
    };



    const formatDuration = (seconds) => {
        if (!seconds) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const selectedBatch = batches.find(b => b.id === selectedBatchId);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-orange"></div>
            </div>
        );
    }

    // Batch Selection Screen
    if (showBatchSelection) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white p-6">
                <div className="max-w-4xl mx-auto">
                    <button onClick={() => navigate('/student/dashboard')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Dashboard
                    </button>

                    <h1 className="text-3xl font-bold mb-2">Select Your Batch</h1>
                    <p className="text-gray-400 mb-8">Choose a batch to view its course content and videos.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {batches.map(batch => (
                            <div key={batch.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 hover:border-neon-blue hover:shadow-[0_0_20px_rgba(0,243,255,0.1)] transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-xs font-bold text-neon-blue uppercase tracking-wider bg-neon-blue/10 px-2 py-1 rounded">
                                            {batch.course_name}
                                        </span>
                                        <h2 className="text-xl font-bold mt-2 group-hover:text-neon-blue transition-colors">{batch.title}</h2>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-neon-blue group-hover:text-black transition-colors">
                                        <FaPlay className="ml-1" />
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-gray-400 mb-6">
                                    <div className="flex justify-between">
                                        <span>Start Date:</span>
                                        <span className="text-white">{new Date(batch.start_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>End Date:</span>
                                        <span className="text-white">{new Date(batch.end_date).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleBatchSelect(batch.id)}
                                    className="w-full bg-gray-800 hover:bg-neon-blue hover:text-black text-white font-bold py-3 rounded-lg transition-all"
                                >
                                    Continue Learning
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Player Screen
    return (
        <div className="lg:h-[calc(100vh-64px)] min-h-[calc(100vh-64px)] bg-[#0f0f0f] text-white flex flex-col lg:overflow-hidden font-sans">
            {/* Player Header */}
            <div className="h-14 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-gray-800/50 flex items-center px-4 justify-between flex-shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => batches.length > 1 ? handleBackToBatches() : navigate('/student/home?tab=my_courses')} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">SkillsFluxo Player</h1>
                        {selectedBatch && (
                            <p className="text-xs text-neon-blue hidden md:block font-medium tracking-wide">
                                {selectedBatch.course_name} • {selectedBatch.title}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {batches.length > 1 && (
                        <button onClick={handleBackToBatches} className="text-xs bg-gray-800/50 hover:bg-neon-blue/20 hover:text-neon-blue border border-gray-700 hover:border-neon-blue/50 px-3 py-1.5 rounded-full transition-all duration-300">
                            Switch Batch
                        </button>
                    )}
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-600 ring-2 ring-transparent hover:ring-neon-blue/50 transition-all">
                        {user?.profile_pic ? (
                            <img
                                src={getAssetUrl(user.profile_pic)}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-neon-orange to-red-600 flex items-center justify-center text-sm font-bold text-white">
                                {user?.name?.[0] || 'S'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden relative">
                {/* Main Content Area */}
                <div className="flex-1 lg:overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#0f0f0f] to-[#141414]">
                    <div className="max-w-[1280px] mx-auto p-4 lg:p-6">

                        {/* Video Player Container */}
                        <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] mb-6 relative group border border-gray-800/50">
                            {currentVideo ? (
                                <video
                                    key={currentVideo.id}
                                    src={getAssetUrl(currentVideo.url)}
                                    controls
                                    autoPlay
                                    onEnded={handleNext}
                                    className="w-full h-full object-contain"
                                    poster={getAssetUrl(currentVideo.thumbnail)}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 flex-col gap-3 bg-[#0a0a0a]">
                                    <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-2">
                                        <FaPlay className="text-3xl opacity-30 ml-1" />
                                    </div>
                                    <p className="font-medium tracking-wide">Select a video to start watching</p>
                                </div>
                            )}
                        </div>

                        {/* Video Info Section */}
                        <div className="flex flex-col gap-6 animate-fadeIn">
                            {/* Title and Navigation Row */}
                            <div className="flex justify-between items-start border-b border-gray-800/50 pb-6">
                                <h1 className="text-2xl md:text-3xl font-bold leading-tight flex-1 mr-6 text-white">
                                    {currentVideo?.title || "Select a video"}
                                </h1>
                                <div className="flex gap-3 flex-shrink-0">
                                    <button
                                        onClick={handlePrev}
                                        disabled={!currentVideo || filteredVideos.findIndex(v => v.id === currentVideo.id) === 0}
                                        className="bg-gray-800/50 hover:bg-gray-700/80 disabled:opacity-30 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-gray-700 hover:border-gray-600 backdrop-blur-sm"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={!currentVideo || filteredVideos.findIndex(v => v.id === currentVideo.id) === filteredVideos.length - 1}
                                        className="bg-gradient-to-r from-neon-orange to-orange-600 hover:from-orange-500 hover:to-orange-700 disabled:opacity-30 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-900/20 hover:shadow-orange-900/40"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>

                            {/* Description Box - Glassmorphism */}
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
                                <div className="flex items-center gap-3 mb-3">
                                    <h3 className="font-bold text-gray-200 group-hover:text-white transition-colors">Description</h3>
                                </div>
                                <p className="text-gray-400 leading-relaxed whitespace-pre-line group-hover:text-gray-300 transition-colors text-sm md:text-base">
                                    {currentVideo?.description || "No description available for this video."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Playlist */}
                <div className={`w-full lg:w-[400px] bg-[#0a0a0a] border-l border-gray-800/50 flex flex-col ${isSidebarOpen ? 'block' : 'hidden lg:block'} shadow-2xl z-20 h-auto lg:h-full`}>
                    <div className="p-5 border-b border-gray-800/50 flex justify-between items-center bg-[#0a0a0a]/95 backdrop-blur">
                        <div>
                            <h3 className="font-bold text-lg text-white">
                                {selectedBatch ? `${selectedBatch.title}` : 'Course Content'}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider font-bold">Playlist</p>
                        </div>
                        <span className="text-xs font-bold bg-gray-800 px-2 py-1 rounded text-gray-300">{filteredVideos.length} videos</span>
                    </div>

                    <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {filteredVideos.length > 0 ? (
                            filteredVideos.map((video, index) => (
                                <button
                                    key={video.id}
                                    onClick={() => setCurrentVideo(video)}
                                    className={`w-full flex gap-3 p-3 rounded-xl transition-all duration-300 group ${currentVideo?.id === video.id
                                        ? 'bg-gradient-to-r from-neon-blue/10 to-transparent border border-neon-blue/20 shadow-[0_0_15px_rgba(0,243,255,0.05)]'
                                        : 'hover:bg-white/5 border border-transparent hover:border-white/5'
                                        }`}
                                >
                                    <div className="relative w-32 h-20 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-all">
                                        {video.thumbnail ? (
                                            <img src={getAssetUrl(video.thumbnail)} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-900">
                                                <FaPlay className="opacity-50" />
                                            </div>
                                        )}
                                        {currentVideo?.id === video.id && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                                                <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center animate-pulse">
                                                    <FaPlay className="text-neon-blue text-xs ml-0.5" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-left flex flex-col justify-center">
                                        <h4 className={`text-sm font-bold line-clamp-2 mb-1 transition-colors ${currentVideo?.id === video.id ? 'text-neon-blue' : 'text-gray-300 group-hover:text-white'}`}>
                                            {video.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 mb-1 line-clamp-1 group-hover:text-gray-400 transition-colors">
                                            {video.description || `Lesson ${index + 1}`}
                                        </p>
                                        {currentVideo?.id === video.id && (
                                            <p className="text-[10px] text-neon-blue font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse"></span> Now Playing
                                            </p>
                                        )}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center mb-2">
                                    <svg className="w-6 h-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </div>
                                No videos available for this batch.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseContent;
