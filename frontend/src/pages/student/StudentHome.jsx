import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { getAssetUrl } from '../../utils/api';
import { toast } from 'react-toastify';
import CourseCard from '../../components/CourseCard';
import { FaFire, FaClock, FaStar, FaPlay, FaSearch, FaChevronLeft, FaChevronRight, FaBook } from 'react-icons/fa';

const StudentHome = () => {
    const [allCourses, setAllCourses] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [defaultVideos, setDefaultVideos] = useState([]);
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

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch Dashboard Data (My Courses, Stats, etc.)
                const dashboardRes = await api.get('/student/dashboard');
                setMyCourses(dashboardRes.data.myCourses?.courses || []);
                setMyRequests(dashboardRes.data.myRequests || []);

                // Fetch Initial Browse Courses
                fetchCourses();

                // Fetch Initial Recommended Videos
                fetchVideos();

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
            const res = await api.get(`/student/all-courses?page=${page}&search=${search}`);
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
            const res = await api.get(`/student/default-videos?page=${page}&search=${search}`);
            setDefaultVideos(res.data.videos || []);
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

    const handleEnroll = async (courseId) => {
        try {
            await api.post(`/student/enroll/${courseId}`);
            toast.success("Enrollment request sent successfully!");
            // Refresh requests
            const response = await api.get('/student/dashboard');
            setMyRequests(response.data.myRequests || []);
        } catch (error) {
            console.error("Enrollment error:", error);
            toast.error(error.response?.data?.message || "Failed to enroll. Please try again.");
        }
    };

    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-neon-orange"></div>
            </div>
        );
    }

    const featuredCourse = allCourses.length > 0 ? allCourses[0] : null;

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-20">
            {/* Hero Section (Featured Course) - Only show on Browse or Recommended */}
            {(activeTab === 'browse' || activeTab === 'recommended') && featuredCourse && (
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
                                <div className="flex flex-wrap gap-4">
                                    {myCourses.some(c => c.id === featuredCourse.id) ? (
                                        <button
                                            onClick={() => navigate(`/student/course/${featuredCourse.id}/content`)}
                                            className="bg-neon-blue text-black hover:bg-white px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:shadow-[0_0_30px_rgba(0,242,255,0.5)] transform hover:-translate-y-1"
                                        >
                                            <FaPlay /> Continue Learning
                                        </button>
                                    ) : myRequests.some(r => r.course_id === featuredCourse.id && r.status === 'pending') ? (
                                        <button
                                            disabled
                                            className="bg-white/10 text-gray-300 px-8 py-4 rounded-full font-bold text-lg cursor-not-allowed flex items-center gap-2 backdrop-blur-md border border-white/10"
                                        >
                                            <FaClock /> Request Pending
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleEnroll(featuredCourse.id)}
                                            className="bg-neon-orange text-white hover:bg-orange-500 px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,95,31,0.3)] hover:shadow-[0_0_30px_rgba(255,95,31,0.5)] transform hover:-translate-y-1"
                                        >
                                            <FaFire /> Enroll Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 md:px-8 max-w-7xl mt-8 relative z-30">

                {/* Tab Navigation */}
                <div className="flex justify-center mb-12">
                    <div className="bg-[#111] border border-gray-800 p-1.5 rounded-full inline-flex shadow-xl">
                        <button
                            onClick={() => setActiveTab('browse')}
                            className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'browse' ? 'bg-white text-black shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        >
                            Browse
                        </button>
                        <button
                            onClick={() => setActiveTab('my_courses')}
                            className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'my_courses' ? 'bg-white text-black shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        >
                            My Courses
                        </button>
                        <button
                            onClick={() => setActiveTab('recommended')}
                            className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'recommended' ? 'bg-white text-black shadow-lg scale-105' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        >
                            Recommended
                        </button>
                    </div>
                </div>

                {/* My Courses Tab */}
                {activeTab === 'my_courses' && (
                    <div className="mb-16 animate-fade-in">
                        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
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
                            <div className="text-center py-24 glass-panel rounded-3xl border border-white/5">
                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-500 text-4xl">
                                    <FaBook />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">No Courses Yet</h3>
                                <p className="text-gray-400 mb-8 max-w-md mx-auto">You haven't enrolled in any courses yet. Explore our catalog to start learning.</p>
                                <button
                                    onClick={() => setActiveTab('browse')}
                                    className="btn-primary px-8 py-3 rounded-full text-white font-bold hover:scale-105 transition-transform"
                                >
                                    Browse Courses
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Recommended Tab */}
                {activeTab === 'recommended' && (
                    <div className="mb-16 animate-fade-in">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
                            <h2 className="text-3xl font-bold flex items-center gap-3">
                                <span className="w-1 h-8 bg-neon-orange rounded-full"></span>
                                <span className="text-white">Recommended for You</span>
                            </h2>
                            <form onSubmit={handleVideoSearch} className="relative w-full md:w-80 group">
                                <input
                                    type="text"
                                    placeholder="Search videos..."
                                    value={videoSearch}
                                    onChange={(e) => setVideoSearch(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-neon-orange focus:bg-white/10 transition-all placeholder-gray-500"
                                />
                                <FaSearch className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-neon-orange transition-colors" />
                            </form>
                        </div>

                        {defaultVideos.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                                    {defaultVideos.map(video => (
                                        <div
                                            key={video.id}
                                            className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer flex flex-col h-full card-hover"
                                            onClick={() => {
                                                if (video.course_id) {
                                                    navigate(`/student/course/${video.course_id}/content`);
                                                } else {
                                                    navigate(`/student/video/${video.id}`);
                                                }
                                            }}
                                        >
                                            <div className="h-48 bg-gray-900 relative overflow-hidden group">
                                                <img
                                                    src={getAssetUrl(video.thumbnail || video.course_thumbnail)}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                    style={{ display: (video.thumbnail || video.course_thumbnail) ? 'block' : 'none' }}
                                                />
                                                {/* Fallback if no image or error */}
                                                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center" style={{ display: (video.thumbnail || video.course_thumbnail) ? 'none' : 'flex' }}>
                                                    <FaPlay className="text-gray-700 text-4xl" />
                                                </div>

                                                {/* Persistent Play Button Overlay */}
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
                                                <p className="text-gray-400 text-sm line-clamp-2">{video.description || "Watch this exclusive content."}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Pagination Controls */}
                                <div className="flex justify-center items-center gap-4">
                                    <button
                                        onClick={() => fetchVideos(videoPage - 1, videoSearch)}
                                        disabled={videoPage === 1}
                                        className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <span className="text-gray-400 font-medium">Page {videoPage} of {videoTotalPages}</span>
                                    <button
                                        onClick={() => fetchVideos(videoPage + 1, videoSearch)}
                                        disabled={videoPage === videoTotalPages}
                                        className="w-10 h-10 rounded-full bg-[#111] border border-gray-800 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20 bg-[#111] rounded-2xl border border-gray-800">
                                <p className="text-gray-400 text-lg">No recommended videos found.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Browse Tab (All Courses) */}
                {activeTab === 'browse' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
                            <h2 className="text-3xl font-bold flex items-center gap-3">
                                <span className="w-1 h-8 bg-yellow-400 rounded-full"></span>
                                <span className="text-white">Explore All Courses</span>
                            </h2>
                            <form onSubmit={handleCourseSearch} className="relative w-full md:w-80 group">
                                <input
                                    type="text"
                                    placeholder="Search courses..."
                                    value={courseSearch}
                                    onChange={(e) => setCourseSearch(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-neon-orange focus:bg-white/10 transition-all placeholder-gray-500"
                                />
                                <FaSearch className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-neon-orange transition-colors" />
                            </form>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                            {allCourses.map(course => {
                                const isEnrolled = myCourses.some(c => c.id === course.id);
                                const isPending = myRequests.some(r => r.course_id === course.id && r.status === 'pending');

                                return (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        isEnrolled={isEnrolled}
                                        isPending={isPending}
                                        onEnroll={handleEnroll}
                                        onContinue={() => navigate(`/student/course/${course.id}/content`)}
                                    />
                                );
                            })}
                        </div>
                        {/* Pagination Controls */}
                        {allCourses.length > 0 ? (
                            <div className="flex justify-center items-center gap-4">
                                <button
                                    onClick={() => fetchCourses(coursePage - 1, courseSearch)}
                                    disabled={coursePage === 1}
                                    className="w-10 h-10 rounded-full bg-[#111] border border-gray-800 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <FaChevronLeft />
                                </button>
                                <span className="text-gray-400 font-medium">Page {coursePage} of {courseTotalPages}</span>
                                <button
                                    onClick={() => fetchCourses(coursePage + 1, courseSearch)}
                                    disabled={coursePage === courseTotalPages}
                                    className="w-10 h-10 rounded-full bg-[#111] border border-gray-800 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <FaChevronRight />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-[#111] rounded-2xl border border-gray-800">
                                <p className="text-gray-400 text-lg">No courses found matching your search.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentHome;
