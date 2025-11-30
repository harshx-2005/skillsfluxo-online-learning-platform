import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaVideo, FaImage, FaArrowLeft, FaEdit, FaChevronLeft, FaChevronRight, FaPlay } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ManageVideos = () => {
    const [videos, setVideos] = useState([]);
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        course_id: '',
        batch_id: '',
        video: null,
        thumbnail: null
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchData(page);
    }, [page]);

    const fetchData = async (currentPage = 1) => {
        try {
            setLoading(true);
            let videosRes;
            if (search) {
                videosRes = await api.get(`/videos/search?key=${search}`);
                // Search API might not be paginated yet, handling it gracefully
                setVideos(videosRes.data.videos || []);
                setTotalPages(1);
            } else {
                videosRes = await api.get(`/videos/admin/all?page=${currentPage}&limit=12`);
                setVideos(videosRes.data.videos || []);
                setTotalPages(videosRes.data.totalPages || 1);
            }

            const coursesRes = await api.get('/adminCourse/course');
            setCourses(coursesRes.data.courses || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
            setLoading(false);
        }
    };

    const handleCourseChange = async (courseId) => {
        setFormData({ ...formData, course_id: courseId, batch_id: '' });
        if (!courseId) {
            setBatches([]);
            return;
        }
        try {
            const response = await api.get(`/adminCourse/course/${courseId}/batches`);
            setBatches(response.data.data || []);
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    };

    const [editingId, setEditingId] = useState(null);

    const openEdit = (video, e) => {
        e.stopPropagation(); // Prevent navigation to player
        setFormData({
            name: video.name,
            description: video.description,
            course_id: video.course_id || '',
            batch_id: video.batch_id || '',
            is_default: video.is_default,
            video: null, // Don't preload file
            thumbnail: null
        });
        setEditingId(video.id);
        setShowModal(true);
        if (video.course_id) handleCourseChange(video.course_id);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Video file required only for new uploads
        if (!editingId && !formData.video) {
            toast.error("Video file is required");
            return;
        }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('course_id', formData.course_id);
        data.append('batch_id', formData.batch_id);
        data.append('is_default', formData.is_default ? '1' : '0');
        if (formData.video) data.append('video', formData.video);
        if (formData.thumbnail) data.append('thumbnail', formData.thumbnail);

        try {
            setUploading(true);
            if (editingId) {
                await api.put(`/videos/edit/${editingId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Video updated successfully");
            } else {
                const endpoint = formData.is_default ? '/videos/upload/default' : '/videos/upload';
                await api.post(endpoint, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Video uploaded successfully");
            }
            setShowModal(false);
            setFormData({ name: '', description: '', course_id: '', batch_id: '', video: null, thumbnail: null });
            setEditingId(null);
            fetchData(page);
        } catch (error) {
            console.error("Error saving video:", error);
            toast.error("Failed to save video");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent navigation to player
        if (!window.confirm("Are you sure you want to delete this video?")) return;
        try {
            await api.delete(`/videos/delete/${id}`);
            toast.success("Video deleted");
            fetchData(page);
        } catch (error) {
            console.error("Error deleting video:", error);
            toast.error("Failed to delete video");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
                <FaArrowLeft /> Back to Dashboard
            </button>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-white">Manage Videos</h1>
                <div className="flex gap-4 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search videos..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-dark-card border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-neon-orange outline-none w-full md:w-64"
                    />
                    <button
                        onClick={() => {
                            setFormData({ name: '', description: '', course_id: '', batch_id: '', video: null, thumbnail: null });
                            setEditingId(null);
                            setShowModal(true);
                        }}
                        className="bg-neon-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-orange-900/20 whitespace-nowrap"
                    >
                        <FaPlus /> Upload Video
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-orange"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {videos.map(video => (
                            <div
                                key={video.id}
                                onClick={() => navigate(`/admin/video/${video.id}`)}
                                className="bg-dark-card p-4 rounded-xl border border-gray-800 hover:border-neon-orange transition-all group shadow-lg flex flex-col cursor-pointer"
                            >
                                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4 group">
                                    {video.thumbnail ? (
                                        <img src={video.thumbnail} alt={video.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-600">
                                            <FaVideo className="text-4xl" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <FaPlay className="text-white text-3xl drop-shadow-lg" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-neon-orange transition-colors">{video.name}</h3>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {video.is_default === 1 && (
                                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">Default</span>
                                    )}
                                    {video.course_name && (
                                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded border border-purple-500/30 truncate max-w-[100px]" title={video.course_name}>
                                            {video.course_name}
                                        </span>
                                    )}
                                    {video.batch_title && (
                                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30 truncate max-w-[100px]" title={video.batch_title}>
                                            {video.batch_title}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-400 text-sm mb-2 truncate">{video.description}</p>
                                <div className="mt-auto flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-800">
                                    <span>{video.uploaded_by_name || 'Admin'}</span>
                                    <div className="flex gap-2">
                                        <button onClick={(e) => openEdit(video, e)} className="text-gray-400 hover:text-white p-2 transition-colors">
                                            <FaEdit />
                                        </button>
                                        <button onClick={(e) => handleDelete(video.id, e)} className="text-red-500 hover:text-red-400 p-2 transition-colors">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <button
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                                className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                            >
                                <FaChevronLeft />
                            </button>
                            <span className="text-gray-400 font-medium">Page {page} of {totalPages}</span>
                            <button
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={page === totalPages}
                                className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-dark-card p-8 rounded-xl w-full max-w-md border border-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-white mb-6">{editingId ? 'Edit Video' : 'Upload Video'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-neon-orange outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-neon-orange outline-none resize-none h-20"
                                />
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="checkbox"
                                    id="is_default"
                                    checked={formData.is_default || false}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            is_default: e.target.checked,
                                            course_id: '',
                                            batch_id: ''
                                        });
                                        if (e.target.checked) setBatches([]);
                                    }}
                                    className="w-4 h-4 text-neon-orange bg-gray-800 border-gray-700 rounded focus:ring-neon-orange"
                                />
                                <label htmlFor="is_default" className="text-sm font-medium text-gray-300">Default Video (Available to all)</label>
                            </div>

                            {!formData.is_default && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Course</label>
                                        <select
                                            value={formData.course_id}
                                            onChange={(e) => handleCourseChange(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-neon-orange outline-none"
                                            required={!formData.is_default}
                                        >
                                            <option value="">Select Course</option>
                                            {courses.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Batch</label>
                                        <select
                                            value={formData.batch_id}
                                            onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-neon-orange outline-none"
                                            required={!formData.is_default}
                                            disabled={!formData.course_id}
                                        >
                                            <option value="">Select Batch</option>
                                            {batches.map(b => (
                                                <option key={b.id} value={b.id}>{b.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Video File {editingId && '(Optional)'}</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        name="video"
                                        accept="video/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="video-upload"
                                        required={!editingId}
                                    />
                                    <label htmlFor="video-upload" className="flex items-center justify-center w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700 text-gray-300">
                                        <FaVideo className="mr-2" /> {formData.video ? formData.video.name : 'Choose Video'}
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Thumbnail (Optional)</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        name="thumbnail"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="thumb-upload"
                                    />
                                    <label htmlFor="thumb-upload" className="flex items-center justify-center w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700 text-gray-300">
                                        <FaImage className="mr-2" /> {formData.thumbnail ? formData.thumbnail.name : 'Choose Thumbnail'}
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                                    disabled={uploading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-neon-orange hover:bg-orange-600 text-white py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={uploading}
                                >
                                    {uploading ? 'Saving...' : (editingId ? 'Update' : 'Upload')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageVideos;
