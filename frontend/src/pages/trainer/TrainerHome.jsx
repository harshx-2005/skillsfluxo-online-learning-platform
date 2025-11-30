import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import CourseCard from '../../components/CourseCard';
import { FaVideo, FaSearch, FaChevronLeft, FaChevronRight, FaStar, FaPlay, FaFire, FaChalkboardTeacher } from 'react-icons/fa';

const TrainerHome = () => {
    const [allCourses, setAllCourses] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [defaultVideos, setDefaultVideos] = useState([]);
    const [myVideos, setMyVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'browse';
    const navigate = useNavigate();

    // Search and Pagination State
    const [courseSearch, setCourseSearch] = useState('');
    const [coursePage, setCoursePage] = useState(1);
    const [courseTotalPages, setCourseTotalPages] = useState(1);

    const [videoSearch, setVideoSearch] = useState('');
    const [videoPage, setVideoPage] = useState(1);
    const [videoTotalPages, setVideoTotalPages] = useState(1);

    // Recommended Videos State (Client-side Search & Pagination)
    const [recommendedSearch, setRecommendedSearch] = useState('');
    const [recommendedPage, setRecommendedPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch Initial All Courses
                fetchCourses();

                // Fetch My Assigned Courses
                const coursesRes = await api.get('/trainer/courses');
                setMyCourses(coursesRes.data.courses || []);

                // Fetch Initial My Videos
                fetchVideos();

                // Fetch Default Videos
                const defaultRes = await api.get('/videos/getDefault');
                setDefaultVideos(Array.isArray(defaultRes.data) ? defaultRes.data : (defaultRes.data.videos || []));

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // Fetch Courses with Search & Pagination
    const fetchCourses = async (page = 1, search = '') => {
        try {
            const res = await api.get(`/trainer/all-courses?page=${page}&search=${search}`);
            setAllCourses(res.data.courses || []);
            setCourseTotalPages(res.data.totalPages || 1);
            setCoursePage(page);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    // Fetch Videos with Search & Pagination
    const fetchVideos = async (page = 1, search = '') => {
        try {
            const res = await api.get(`/trainer/uploaded-videos?page=${page}&search=${search}`);
            setMyVideos(res.data.videos || []);
            setVideoTotalPages(res.data.totalPages || 1);
            setVideoPage(page);
        } catch (error) {
            console.error("Error fetching videos:", error);
        }
    };

    // Handle Search Submit
    const handleCourseSearch = (e) => {
        e.preventDefault();
        fetchCourses(1, courseSearch);
    };

    const handleVideoSearch = (e) => {
        e.preventDefault();
        fetchVideos(1, videoSearch);
    };

    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    // Filter and Paginate Recommended Videos
    const filteredRecommendedVideos = defaultVideos.filter(video =>
        (video.title || video.name || "").toLowerCase().includes(recommendedSearch.toLowerCase())
    );
    const recommendedTotalPages = Math.ceil(filteredRecommendedVideos.length / ITEMS_PER_PAGE);
    const currentRecommendedVideos = filteredRecommendedVideos.slice(
        (recommendedPage - 1) * ITEMS_PER_PAGE,
        recommendedPage * ITEMS_PER_PAGE
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-neon-purple"></div>
            </div>
        );
    }

    const featuredCourse = allCourses.length > 0 ? allCourses[0] : null;

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white pb-20">
            {/* Hero Section (Featured Course) - Only show on Browse or Recommended */}
            {(activeTab === 'browse' || activeTab === 'recommended') && featuredCourse && (
                <div className="relative h-[500px] w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-black/50 to-transparent z-10"></div>
                    <img
                        src={featuredCourse.thumbnail ? (featuredCourse.thumbnail.startsWith('http') ? featuredCourse.thumbnail : `http://localhost:5000${featuredCourse.thumbnail}`) : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"}
                        alt={featuredCourse.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-20">
                        <div className="max-w-3xl">
                            <span className="inline-block px-3 py-1 bg-neon-purple text-white text-xs font-bold rounded-full mb-4">Featured Course</span>
                            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white shadow-lg">{featuredCourse.name}</h1>
                            <p className="text-gray-200 text-lg mb-8 line-clamp-2 shadow-md">{featuredCourse.description}</p>
                            <div className="flex gap-4">
                                <button className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-full font-bold text-lg transition-all flex items-center gap-2">
                                    <FaFire className="text-neon-purple" /> View Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`container mx-auto px-4 md:px-8 ${activeTab === 'my_courses' || activeTab === 'my_videos' ? 'mt-10' : '-mt-10'} relative z-30`}>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-10">
                    <div className="bg-gray-900/80 backdrop-blur-md p-1 rounded-full inline-flex border border-gray-800 shadow-xl">
                        <button
                            onClick={() => setActiveTab('browse')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'browse' ? 'bg-gray-800 text-white shadow-lg border border-gray-700' : 'text-gray-400 hover:text-white'}`}
                        >
                            Browse Courses
                        </button>
                        <button
                            onClick={() => setActiveTab('my_courses')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'my_courses' ? 'bg-gray-800 text-white shadow-lg border border-gray-700' : 'text-gray-400 hover:text-white'}`}
                        >
                            My Courses
                        </button>
                        <button
                            onClick={() => setActiveTab('recommended')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'recommended' ? 'bg-gray-800 text-white shadow-lg border border-gray-700' : 'text-gray-400 hover:text-white'}`}
                        >
                            Recommended
                        </button>
                        <button
                            onClick={() => setActiveTab('my_videos')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'my_videos' ? 'bg-gray-800 text-white shadow-lg border border-gray-700' : 'text-gray-400 hover:text-white'}`}
                        >
                            My Videos
                        </button>
                    </div>
                </div>

                {/* Recommended Tab */}
                {activeTab === 'recommended' && (
                    <div className="mb-12 animate-fade-in">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <FaPlay className="text-neon-orange" /> Recommended Videos
                            </h2>
                            <div className="relative w-full md:w-64">
                                <input
                                    type="text"
                                    placeholder="Search videos..."
                                    value={recommendedSearch}
                                    onChange={(e) => { setRecommendedSearch(e.target.value); setRecommendedPage(1); }}
                                    className="w-full bg-dark-card border border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-neon-orange transition-colors"
                                />
                                <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
                            </div>
                        </div>

                        {currentRecommendedVideos.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    {currentRecommendedVideos.map(video => (
                                        <div
                                            key={video.id}
                                            onClick={() => navigate(`/trainer/video/${video.id}`)}
                                            className="bg-dark-card rounded-xl overflow-hidden border border-gray-800 hover:border-neon-orange transition-all group shadow-lg cursor-pointer"
                                        >
                                            <div className="h-40 bg-gray-800 relative overflow-hidden">
                                                <img
                                                    src={video.thumbnail ? (video.thumbnail.startsWith('http') ? video.thumbnail : `http://localhost:5000${video.thumbnail}`) : null}
                                                    alt={video.title || video.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                    style={{ display: video.thumbnail ? 'block' : 'none' }}
                                                />
                                                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center" style={{ display: video.thumbnail ? 'none' : 'flex' }}>
                                                    <FaPlay className="text-gray-700 text-3xl" />
                                                </div>
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-10 h-10 bg-neon-orange rounded-full flex items-center justify-center text-white shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                                                        <FaPlay className="ml-1 text-sm" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-white mb-1 line-clamp-1 group-hover:text-neon-orange transition-colors">{video.title || video.name}</h3>
                                                <p className="text-xs text-gray-400 line-clamp-2">{video.description || "No description."}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Pagination Controls */}
                                {recommendedTotalPages > 1 && (
                                    <div className="flex justify-center items-center gap-4">
                                        <button
                                            onClick={() => setRecommendedPage(prev => Math.max(prev - 1, 1))}
                                            disabled={recommendedPage === 1}
                                            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        <span className="text-gray-400">Page {recommendedPage} of {recommendedTotalPages}</span>
                                        <button
                                            onClick={() => setRecommendedPage(prev => Math.min(prev + 1, recommendedTotalPages))}
                                            disabled={recommendedPage === recommendedTotalPages}
                                            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <FaChevronRight />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-gray-400 text-center py-10">No recommended videos found.</p>
                        )}
                    </div>
                )}

                {/* My Courses Tab */}
                {activeTab === 'my_courses' && (
                    <div className="animate-fade-in">
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
                )}

                {/* All Courses Tab (Browse) */}
                {activeTab === 'browse' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <FaStar className="text-yellow-400" /> All Courses Directory
                            </h2>
                            <form onSubmit={handleCourseSearch} className="relative w-full md:w-64">
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    value={courseSearch}
                                    onChange={(e) => setCourseSearch(e.target.value)}
                                    className="w-full bg-dark-card border border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-neon-purple transition-colors"
                                />
                                <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
                            </form>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {allCourses.map(course => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    isEnrolled={false}
                                    isPending={false}
                                    onEnroll={() => { }}
                                    onContinue={() => { }}
                                    hideEnrollButton={true}
                                />
                            ))}
                        </div>
                        {/* Pagination Controls */}
                        {allCourses.length > 0 ? (
                            <div className="flex justify-center items-center gap-4">
                                <button
                                    onClick={() => fetchCourses(coursePage - 1, courseSearch)}
                                    disabled={coursePage === 1}
                                    className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <FaChevronLeft />
                                </button>
                                <span className="text-gray-400">Page {coursePage} of {courseTotalPages}</span>
                                <button
                                    onClick={() => fetchCourses(coursePage + 1, courseSearch)}
                                    disabled={coursePage === courseTotalPages}
                                    className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <FaChevronRight />
                                </button>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-10">No courses found.</p>
                        )}
                    </div>
                )}

                {/* My Videos Tab */}
                {activeTab === 'my_videos' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <FaVideo className="text-pink-500" /> My Uploaded Videos
                            </h2>
                            <form onSubmit={handleVideoSearch} className="relative w-full md:w-64">
                                <input
                                    type="text"
                                    placeholder="Search videos..."
                                    value={videoSearch}
                                    onChange={(e) => setVideoSearch(e.target.value)}
                                    className="w-full bg-dark-card border border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-neon-purple transition-colors"
                                />
                                <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
                            </form>
                        </div>

                        {myVideos.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                                    {myVideos.map(video => (
                                        <div
                                            key={video.id}
                                            onClick={() => navigate(`/trainer/video/${video.id}`)}
                                            className="bg-dark-card rounded-xl overflow-hidden border border-gray-800 hover:border-pink-500 transition-all group shadow-lg cursor-pointer"
                                        >
                                            <div className="h-48 bg-gray-800 relative overflow-hidden group">
                                                <img
                                                    src={video.thumbnail ? (video.thumbnail.startsWith('http') ? video.thumbnail : `http://localhost:5000${video.thumbnail}`) : null}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                    style={{ display: video.thumbnail ? 'block' : 'none' }}
                                                />
                                                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center" style={{ display: video.thumbnail ? 'none' : 'flex' }}>
                                                    <FaPlay className="text-gray-700 text-4xl" />
                                                </div>
                                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-3">
                                                    <span className="text-xs text-gray-300 bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                                                        {video.course_name} • {video.batch_title}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-pink-500 transition-colors">{video.title}</h3>
                                                <p className="text-gray-400 text-sm line-clamp-2 mb-3">{video.description || "No description."}</p>
                                                <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-800 pt-3">
                                                    <span>Uploaded: {new Date(video.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Pagination Controls */}
                                <div className="flex justify-center items-center gap-4">
                                    <button
                                        onClick={() => fetchVideos(videoPage - 1, videoSearch)}
                                        disabled={videoPage === 1}
                                        className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <span className="text-gray-400">Page {videoPage} of {videoTotalPages}</span>
                                    <button
                                        onClick={() => fetchVideos(videoPage + 1, videoSearch)}
                                        disabled={videoPage === videoTotalPages}
                                        className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-400 text-center py-10">No uploaded videos found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainerHome;
