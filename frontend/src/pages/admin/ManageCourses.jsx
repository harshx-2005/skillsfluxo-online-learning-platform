import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaBook, FaLayerGroup, FaArrowLeft, FaCloudUploadAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ManageCourses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', level: 'Beginner' });
    const [editingId, setEditingId] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 12;

    useEffect(() => {
        fetchCourses(1);
    }, []);

    const fetchCourses = async (page = 1) => {
        try {
            setLoading(true);
            const response = await api.get(`/adminCourse/course?page=${page}&limit=${LIMIT}`);
            setCourses(response.data.courses || []);
            setTotalPages(Math.ceil((response.data.total || 0) / LIMIT));
            setCurrentPage(page);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching courses:", error);
            toast.error("Failed to load courses");
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('level', formData.level);
            if (formData.thumbnailFile) {
                data.append('thumbnail', formData.thumbnailFile);
            }

            if (editingId) {
                await api.patch(`/adminCourse/course/${editingId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Course updated successfully");
            } else {
                await api.post('/adminCourse/course', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Course created successfully");
            }
            setShowModal(false);
            setFormData({ name: '', description: '', level: 'Beginner', thumbnailFile: null });
            setEditingId(null);
            fetchCourses(currentPage);
        } catch (error) {
            console.error("Error saving course:", error);
            toast.error("Failed to save course");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will delete all associated batches and data.")) return;
        try {
            await api.delete(`/adminCourse/course/${id}`);
            toast.success("Course deleted");
            fetchCourses(currentPage);
        } catch (error) {
            console.error("Error deleting course:", error);
            toast.error("Failed to delete course");
        }
    };

    const openEdit = (course) => {
        setFormData({ name: course.name, description: course.description, level: course.level || 'Beginner' });
        setEditingId(course.id);
        setShowModal(true);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
                <FaArrowLeft /> Back to Dashboard
            </button>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Manage Courses</h1>
                <button
                    onClick={() => {
                        setFormData({ name: '', description: '', level: 'Beginner' });
                        setEditingId(null);
                        setShowModal(true);
                    }}
                    className="bg-neon-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-orange-900/20"
                >
                    <FaPlus /> Add Course
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-orange"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {courses.map(course => (
                            <div key={course.id} className={`bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-neon-orange transition-all group shadow-lg ${!course.is_active ? 'opacity-60 grayscale-[50%]' : ''}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors overflow-hidden w-16 h-16 flex items-center justify-center">
                                        {course.thumbnail ? (
                                            <img
                                                src={course.thumbnail}
                                                alt={course.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.style.display = 'none';
                                                    const icon = e.target.parentElement.querySelector('.fallback-icon');
                                                    if (icon) icon.style.display = 'block';
                                                }}
                                            />
                                        ) : (
                                            <FaBook className="text-2xl text-neon-orange" />
                                        )}
                                        <FaBook className="text-2xl text-neon-orange fallback-icon hidden" style={{ display: course.thumbnail ? 'none' : 'block' }} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/admin/courses/${course.id}/batches`)}
                                            className="text-gray-400 hover:text-neon-orange transition-colors"
                                            title="Manage Batches"
                                        >
                                            <FaLayerGroup />
                                        </button>
                                        <button onClick={() => openEdit(course)} className="text-gray-400 hover:text-white transition-colors" title="Edit">
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => course.is_active && handleDelete(course.id)}
                                            className={`text-gray-400 transition-colors ${course.is_active ? 'hover:text-red-500' : 'cursor-not-allowed opacity-50'}`}
                                            title={course.is_active ? "Delete" : "Already Deleted"}
                                            disabled={!course.is_active}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                    {course.name}
                                    {!course.is_active && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">Deleted</span>}
                                </h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="px-2 py-1 bg-gray-800 rounded text-gray-300">{course.level}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${course.is_approved ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await api.patch(`/adminCourse/course/${course.id}/approve`, { is_approved: course.is_approved ? 0 : 1 });
                                                    toast.success(`Course ${course.is_approved ? 'Unapproved' : 'Approved'}`);
                                                    fetchCourses(currentPage);
                                                } catch (err) {
                                                    toast.error("Failed to update status");
                                                }
                                            }}
                                            className={`text-xs font-bold ${course.is_approved ? 'text-green-500' : 'text-red-500'} hover:underline`}
                                        >
                                            {course.is_approved ? 'Approved' : 'Unapproved'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-6 mt-12">
                            <button
                                onClick={() => fetchCourses(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="w-10 h-10 flex items-center justify-center bg-gray-800 text-white rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-neon-orange/20"
                            >
                                <FaChevronLeft />
                            </button>
                            <span className="text-gray-400 font-medium">
                                Page <span className="text-white font-bold">{currentPage}</span> of <span className="text-white font-bold">{totalPages}</span>
                            </span>
                            <button
                                onClick={() => fetchCourses(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="w-10 h-10 flex items-center justify-center bg-gray-800 text-white rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-neon-orange/20"
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
                    <div className="bg-dark-card p-8 rounded-xl w-full max-w-md border border-gray-800 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">{editingId ? 'Edit Course' : 'Add New Course'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Course Name</label>
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
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-neon-orange outline-none h-24 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Thumbnail (Optional)</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="thumbnail-upload"
                                        accept="image/*"
                                        onChange={(e) => setFormData({ ...formData, thumbnailFile: e.target.files[0] })}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="thumbnail-upload"
                                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-neon-orange hover:bg-gray-800/50 transition-all group"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FaCloudUploadAlt className="text-3xl text-gray-500 group-hover:text-neon-orange mb-2 transition-colors" />
                                            <p className="mb-1 text-sm text-gray-400 group-hover:text-white transition-colors">
                                                <span className="font-bold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
                                        </div>
                                    </label>
                                </div>
                                {formData.thumbnailFile && (
                                    <p className="mt-2 text-sm text-neon-orange flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-neon-orange"></span>
                                        {formData.thumbnailFile.name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Level</label>
                                <select
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-neon-orange outline-none"
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-neon-orange hover:bg-orange-600 text-white py-2 rounded-lg transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCourses;
