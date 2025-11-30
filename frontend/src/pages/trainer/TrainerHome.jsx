import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getAssetUrl } from '../../utils/api';
import { FaVideo, FaUsers, FaChalkboardTeacher, FaPlay, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const TrainerHome = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('browse');

    // Featured Course State
    const [featuredCourse, setFeaturedCourse] = useState(null);

    // Browse Courses State (Server-side Pagination)
    const [allCourses, setAllCourses] = useState([]);
    const [browsePage, setBrowsePage] = useState(1);
    const [browseTotalPages, setBrowseTotalPages] = useState(1);

    // My Courses State (Client-side Pagination)
    const [allMyCourses, setAllMyCourses] = useState([]); // Store ALL fetched courses
    const [myCourses, setMyCourses] = useState([]); // Store CURRENT PAGE courses
    const [myCoursesPage, setMyCoursesPage] = useState(1);
    const [myCoursesTotalPages, setMyCoursesTotalPages] = useState(1);

    // Recommended Videos State (Client-side Pagination)
    const [allRecVideos, setAllRecVideos] = useState([]); // Store ALL fetched videos
    const [recommendedVideos, setRecommendedVideos] = useState([]); // Store CURRENT PAGE videos
    const [recPage, setRecPage] = useState(1);
    const [recTotalPages, setRecTotalPages] = useState(1);

    // My Uploads State (Server-side Pagination)
    const [videos, setVideos] = useState([]);
    const [videoPage, setVideoPage] = useState(1);
    const [videoTotalPages, setVideoTotalPages] = useState(1);

    const ITEMS_PER_PAGE = 12;

    // Initial Data Load
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                // Fetch first page of server-paginated endpoints and ALL data for client-paginated endpoints
                const [allCoursesRes, myCoursesRes, recRes, videosRes] = await Promise.all([
                    api.get(`/trainer/all-courses?page=1&limit=${ITEMS_PER_PAGE}`),
                    api.get('/trainer/courses'), // Returns all courses
                    api.get('/videos/getDefault'), // Returns all default videos
                    api.get(`/trainer/uploaded-videos?page=1&limit=${ITEMS_PER_PAGE}`)
                ]);

                // 1. Browse Courses (Server-side)
                setAllCourses(allCoursesRes.data.courses || []);
                setBrowseTotalPages(allCoursesRes.data.totalPages || 1);

                // Set Featured Course
                if (allCoursesRes.data.courses && allCoursesRes.data.courses.length > 0) {
                    setFeaturedCourse(allCoursesRes.data.courses[0]);
                }

                // 2. My Courses (Client-side)
                const myCoursesData = myCoursesRes.data.courses || [];
                setAllMyCourses(myCoursesData);
                setMyCoursesTotalPages(Math.ceil(myCoursesData.length / ITEMS_PER_PAGE) || 1);
                setMyCourses(myCoursesData.slice(0, ITEMS_PER_PAGE));

                // 3. Recommended Videos (Client-side)
                const recData = Array.isArray(recRes.data) ? recRes.data : (recRes.data.videos || []);
                setAllRecVideos(recData);
                setRecTotalPages(Math.ceil(recData.length / ITEMS_PER_PAGE) || 1);
                setRecommendedVideos(recData.slice(0, ITEMS_PER_PAGE));

                // 4. My Uploads (Server-side)
                setVideos(videosRes.data.videos || []);
                setVideoTotalPages(videosRes.data.totalPages || 1);

            } catch (error) {
                console.error("Error loading initial data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // Pagination Effects

    // 1. Browse Courses (Server-side)
    useEffect(() => {
        if (browsePage === 1 && !loading) return;
        const fetchBrowse = async () => {
            try {
                const res = await api.get(`/trainer/all-courses?page=${browsePage}&limit=${ITEMS_PER_PAGE}`);
                setAllCourses(res.data.courses || []);
                setBrowseTotalPages(res.data.totalPages || 1);
            } catch (e) { console.error(e); }
        };
        if (!loading) fetchBrowse();
    }, [browsePage]);

    // 2. My Courses (Client-side)
    useEffect(() => {
        if (allMyCourses.length === 0) return;
        const start = (myCoursesPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        setMyCourses(allMyCourses.slice(start, end));
    }, [myCoursesPage, allMyCourses]);

    // 3. Recommended Videos (Client-side)
    useEffect(() => {
        if (allRecVideos.length === 0) return;
        const start = (recPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        setRecommendedVideos(allRecVideos.slice(start, end));
    }, [recPage, allRecVideos]);

    // 4. My Uploads (Server-side)
    useEffect(() => {
        if (videoPage === 1 && !loading) return;
        const fetchVideos = async () => {
            try {
                const res = await api.get(`/trainer/uploaded-videos?page=${videoPage}&limit=${ITEMS_PER_PAGE}`);
                setVideos(res.data.videos || []);
                setVideoTotalPages(res.data.totalPages || 1);
            } catch (e) { console.error(e); }
        };
        if (!loading) fetchVideos();
    }, [videoPage]);


    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-neon-purple"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-20">
            {/* Hero Section (Featured Course) */}
            {featuredCourse && (
                <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent z-10"></div>
                    <img
                        src={featuredCourse.thumbnail ? getAssetUrl(featuredCourse.thumbnail) : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"}
                        alt={featuredCourse.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 z-20">
                        <div className="container mx-auto max-w-7xl">
                            <div className="max-w-3xl animate-fade-in-up">
                                <span className="inline-block px-4 py-1.5 bg-neon-orange/20 border border-neon-orange/50 text-neon-orange text-xs font-bold rounded-full mb-6 backdrop-blur-md">
                                    FEATURED COURSE
                                </span>
                                <h1 className="text-4xl md:text-7xl font-extrabold mb-6 text-white leading-tight">{featuredCourse.name}</h1>
                                <p className="text-gray-200 text-lg md:text-xl mb-10 line-clamp-2 max-w-2xl">{featuredCourse.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 md:px-8 max-w-7xl mt-8 relative z-30">
                {/* Tab Navigation */}
                <div className="flex justify-center mb-12">
                    <div className="bg-[#111] border border-gray-800 p-1.5 rounded-full inline-flex shadow-xl flex-wrap gap-2 justify-center">
                        <button
                            onClick={() => setActiveTab('browse')}
                            className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'browse' ? 'bg-white text-black shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        >
                            Browse Courses
                        </button>
                        <button
                            onClick={() => setActiveTab('my_courses')}
                            className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'my_courses' ? 'bg-white text-black shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        >
                            My Courses
                        </button>
                        <button
                            onClick={() => setActiveTab('recommended')}
                            className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'recommended' ? 'bg-white text-black shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        >
                            Recommended
                        </button>
                        <button
                            onClick={() => setActiveTab('uploads')}
                            className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'uploads' ? 'bg-white text-black shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        >
                            My Uploads
                        </button>
                    </div>
                </div>

                {/* Browse Courses Tab */}
                {activeTab === 'browse' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
                            <h2 className="text-3xl font-bold flex items-center gap-3">
                                <span className="w-1 h-8 bg-yellow-400 rounded-full"></span>
                                <span className="text-white">Explore All Courses</span>
                            </h2>
                        </div>
                        {allCourses.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                                    {allCourses.map(course => (
                                        <div
                                            key={course.id}
                                            className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-default flex flex-col h-full"
                                        >
                                            <div className="h-48 bg-gray-900 relative overflow-hidden group">
                                                {course.thumbnail ? (
                                                    <img src={getAssetUrl(course.thumbnail)} alt={course.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                                        <FaChalkboardTeacher className="text-4xl text-gray-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5 flex flex-col flex-grow">
                                                <h3 className="text-xl font-bold text-white mb-2">{course.name}</h3>
                                                <p className="text-gray-400 text-sm line-clamp-3 mb-4">{course.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Pagination */}
                                {browseTotalPages > 1 && (
                                    <div className="flex justify-center items-center gap-4">
                                        <button
                                            onClick={() => setBrowsePage(prev => Math.max(prev - 1, 1))}
                                            disabled={browsePage === 1}
                                            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        <span className="text-gray-400 font-medium">Page {browsePage} of {browseTotalPages}</span>
                                        <button
                                            onClick={() => setBrowsePage(prev => Math.min(prev + 1, browseTotalPages))}
                                            disabled={browsePage === browseTotalPages}
                                            className="w-10 h-10 rounded-full bg-[#111] border border-gray-800 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <FaChevronRight />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 bg-[#111] rounded-2xl border border-gray-800">
                                <p className="text-gray-400 text-lg">No courses available.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* My Courses Tab */}
                {activeTab === 'my_courses' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
                            <h2 className="text-3xl font-bold flex items-center gap-3">
                                <span className="w-1 h-8 bg-neon-blue rounded-full"></span>
                                <span className="text-white">Assigned Courses</span>
                            </h2>
                        </div>
                        {myCourses.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                                    {myCourses.map(course => (
                                        <div
                                            key={course.id}
                                            onClick={() => navigate(`/trainer/course/${course.id}`)}
                                            className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer flex flex-col h-full card-hover"
                                        >
                                            <div className="h-48 bg-gray-900 relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                                                {course.thumbnail ? (
                                                    <img src={getAssetUrl(course.thumbnail)} alt={course.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                                        <FaChalkboardTeacher className="text-4xl text-gray-600" />
                                                    </div>
                                                )}
                                                <div className="absolute bottom-4 left-4 z-20">
                                                    <span className="inline-block px-2 py-1 bg-neon-blue/20 text-neon-blue text-xs font-bold rounded mb-2 border border-neon-blue/30">
                                                        ASSIGNED
                                                    </span>
                                                    <h3 className="text-xl font-bold text-white leading-tight group-hover:text-neon-blue transition-colors">{course.name}</h3>
                                                </div>
                                            </div>
                                            <div className="p-5 flex flex-col flex-grow">
                                                <p className="text-gray-400 text-sm line-clamp-3 mb-4">{course.description}</p>
                                                <div className="mt-auto pt-4 border-t border-gray-800 flex justify-between items-center">
                                                    <span className="text-xs text-gray-500 font-medium">Click to view batches</span>
                                                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-neon-blue group-hover:text-black transition-colors">
                                                        <FaChevronRight className="text-xs" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Pagination */}
                                {myCoursesTotalPages > 1 && (
                                    <div className="flex justify-center items-center gap-4">
                                        <button
                                            onClick={() => setMyCoursesPage(prev => Math.max(prev - 1, 1))}
                                            disabled={myCoursesPage === 1}
                                            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        <span className="text-gray-400 font-medium">Page {myCoursesPage} of {myCoursesTotalPages}</span>
                                        <button
                                            onClick={() => setMyCoursesPage(prev => Math.min(prev + 1, myCoursesTotalPages))}
                                            disabled={myCoursesPage === myCoursesTotalPages}
                                            className="w-10 h-10 rounded-full bg-[#111] border border-gray-800 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <FaChevronRight />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 bg-[#111] rounded-2xl border border-gray-800">
                                <p className="text-gray-400 text-lg">You are not assigned to any courses yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Recommended Tab */}
                {activeTab === 'recommended' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
                            <h2 className="text-3xl font-bold flex items-center gap-3">
                                <span className="w-1 h-8 bg-neon-orange rounded-full"></span>
                                <span className="text-white">Recommended Videos</span>
                            </h2>
                        </div>
                        {recommendedVideos.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                                    {recommendedVideos.map(video => (
                                        <div
                                            key={video.id}
                                            className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer flex flex-col h-full card-hover"
                                            onClick={() => navigate(`/trainer/video/${video.id}`)}
                                        >
                                            <div className="h-48 bg-gray-900 relative overflow-hidden group">
                                                <img
                                                    src={getAssetUrl(video.thumbnail || video.course_thumbnail)}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                    style={{ display: (video.thumbnail || video.course_thumbnail) ? 'block' : 'none' }}
                                                />
                                                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center" style={{ display: (video.thumbnail || video.course_thumbnail) ? 'none' : 'flex' }}>
                                                    <FaPlay className="text-gray-700 text-4xl" />
                                                </div>
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
                                                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:bg-neon-orange group-hover:border-neon-orange">
                                                        <FaPlay className="ml-1 text-xl" />
                                                    </div>
                                                </div>
                                                <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded border border-white/10">
                                                    Free Preview
                                                </span>
                                            </div>
                                            <div className="p-5 flex flex-col flex-grow">
                                                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-neon-orange transition-colors">{video.title || video.name}</h3>
                                                <p className="text-gray-400 text-sm line-clamp-2">{video.description || "Watch this video."}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Pagination */}
                                {recTotalPages > 1 && (
                                    <div className="flex justify-center items-center gap-4">
                                        <button
                                            onClick={() => setRecPage(prev => Math.max(prev - 1, 1))}
                                            disabled={recPage === 1}
                                            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        <span className="text-gray-400 font-medium">Page {recPage} of {recTotalPages}</span>
                                        <button
                                            onClick={() => setRecPage(prev => Math.min(prev + 1, recTotalPages))}
                                            disabled={recPage === recTotalPages}
                                            className="w-10 h-10 rounded-full bg-[#111] border border-gray-800 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <FaChevronRight />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 bg-[#111] rounded-2xl border border-gray-800">
                                <p className="text-gray-400 text-lg">No recommended videos found.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* My Uploads Tab */}
                {activeTab === 'uploads' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
                            <h2 className="text-3xl font-bold flex items-center gap-3">
                                <span className="w-1 h-8 bg-neon-purple rounded-full"></span>
                                <span className="text-white">Your Videos</span>
                            </h2>
                        </div>

                        {videos.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                                    {videos.map(video => (
                                        <div
                                            key={video.id}
                                            className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer flex flex-col h-full card-hover"
                                            onClick={() => navigate(`/trainer/video/${video.id}`)}
                                        >
                                            <div className="h-48 bg-gray-900 relative overflow-hidden group">
                                                <img
                                                    src={getAssetUrl(video.thumbnail)}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                    style={{ display: video.thumbnail ? 'block' : 'none' }}
                                                />
                                                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center" style={{ display: video.thumbnail ? 'none' : 'flex' }}>
                                                    <FaVideo className="text-gray-700 text-4xl" />
                                                </div>
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
                                                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:bg-neon-purple group-hover:border-neon-purple">
                                                        <FaPlay className="ml-1 text-xl" />
                                                    </div>
                                                </div>
                                                <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded border border-white/10">
                                                    {new Date(video.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="p-5 flex flex-col flex-grow">
                                                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-neon-purple transition-colors">{video.title || video.name}</h3>
                                                <p className="text-gray-400 text-sm line-clamp-2">{video.description || "No description provided."}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Pagination */}
                                {videoTotalPages > 1 && (
                                    <div className="flex justify-center items-center gap-4">
                                        <button
                                            onClick={() => setVideoPage(prev => Math.max(prev - 1, 1))}
                                            disabled={videoPage === 1}
                                            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        <span className="text-gray-400 font-medium">Page {videoPage} of {videoTotalPages}</span>
                                        <button
                                            onClick={() => setVideoPage(prev => Math.min(prev + 1, videoTotalPages))}
                                            disabled={videoPage === videoTotalPages}
                                            className="w-10 h-10 rounded-full bg-[#111] border border-gray-800 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <FaChevronRight />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 bg-[#111] rounded-2xl border border-gray-800">
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
                )}
            </div>
        </div>
    );
};

export default TrainerHome;
