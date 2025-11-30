import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';

const CourseBatches = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        start_date: '',
        end_date: ''
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchData();
    }, [courseId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch batches for this course
            const batchesRes = await api.get(`/adminCourse/course/${courseId}/batches`);
            // Fetch course details (we might need a specific endpoint or reuse getCourseById)
            const courseRes = await api.get(`/adminCourse/course/${courseId}`);

            setBatches(Array.isArray(batchesRes.data) ? batchesRes.data : (batchesRes.data.data || []));
            setCourse(courseRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load course batches");
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.patch(`/adminCourse/batch/${editingId}`, formData);
                toast.success("Batch updated successfully");
            } else {
                await api.post(`/adminCourse/course/${courseId}/batches`, formData);
                toast.success("Batch created successfully");
            }
            setShowModal(false);
            setFormData({ title: '', start_date: '', end_date: '' });
            setEditingId(null);
            fetchData();
        } catch (error) {
            console.error("Error saving batch:", error);
            toast.error("Failed to save batch");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/adminCourse/batch/${id}`);
            toast.success("Batch deleted");
            fetchData();
        } catch (error) {
            console.error("Error deleting batch:", error);
            toast.error("Failed to delete batch");
        }
    };

    const openEdit = (batch) => {
        setFormData({
            title: batch.title,
            start_date: batch.start_date ? batch.start_date.split('T')[0] : '',
            end_date: batch.end_date ? batch.end_date.split('T')[0] : ''
        });
        setEditingId(batch.id);
        setShowModal(true);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate('/admin/courses')}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
                <FaArrowLeft /> Back to Courses
            </button>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Batches for <span className="text-neon-orange">{course?.name}</span>
                    </h1>
                    <p className="text-gray-400 mt-1">Manage all batches for this course</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({ title: '', start_date: '', end_date: '' });
                        setEditingId(null);
                        setShowModal(true);
                    }}
                    className="bg-neon-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-orange-900/20"
                >
                    <FaPlus /> Add Batch
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-orange"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {batches.length === 0 ? (
                        <div className="col-span-full text-center py-10 text-gray-500">
                            No batches found for this course. Create one to get started.
                        </div>
                    ) : (
                        batches.map(batch => (
                            <div key={batch.id} className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-neon-orange transition-all group shadow-lg">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
                                        <FaCalendarAlt className="text-2xl text-neon-orange" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(batch)} className="text-gray-400 hover:text-white transition-colors"><FaEdit /></button>
                                        <button onClick={() => handleDelete(batch.id)} className="text-gray-400 hover:text-red-500 transition-colors"><FaTrash /></button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{batch.title}</h3>
                                <div className="text-sm text-gray-400 space-y-1">
                                    <p>Start: {batch.start_date ? new Date(batch.start_date).toLocaleDateString() : 'N/A'}</p>
                                    <p>End: {batch.end_date ? new Date(batch.end_date).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div className={`mt-4 inline-block px-2 py-1 rounded text-xs font-bold ${batch.is_active ? 'bg-green-900/30 text-green-500' : 'bg-red-900/30 text-red-500'}`}>
                                    {batch.is_active ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-dark-card p-8 rounded-xl w-full max-w-md border border-gray-800 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">{editingId ? 'Edit Batch' : 'Add New Batch'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Batch Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-neon-orange outline-none"
                                    required
                                    placeholder="e.g. Morning Batch 01"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-neon-orange outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-neon-orange outline-none"
                                    />
                                </div>
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

export default CourseBatches;
