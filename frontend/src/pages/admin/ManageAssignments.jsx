import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FaSearch, FaUserGraduate, FaChalkboardTeacher, FaExchangeAlt, FaTrash, FaPlus, FaArrowLeft, FaChevronDown } from 'react-icons/fa';

const ManageAssignments = () => {
    const [activeTab, setActiveTab] = useState('students');
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Selection for assignment
    const [selectedUser, setSelectedUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);

    // Form States
    const [assignCourseId, setAssignCourseId] = useState('');
    const [assignBatchId, setAssignBatchId] = useState('');

    // Reassign Modal
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [reassignTarget, setReassignTarget] = useState(null);
    const [newBatchId, setNewBatchId] = useState('');
    const [reassignBatches, setReassignBatches] = useState([]); // Separate state
    const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, activeTab]);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/adminCourse/course?limit=1000&activeOnly=true');
            setCourses(response.data.courses || []);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    const fetchBatches = async (courseId) => {
        if (!courseId) {
            setBatches([]);
            return;
        }
        try {
            const response = await api.get(`/adminCourse/course/${courseId}/batches?activeOnly=true`);
            setBatches(response.data.data || []);
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };

    const fetchReassignBatches = async (courseId) => {
        if (!courseId) return;
        try {
            const response = await api.get(`/adminCourse/course/${courseId}/batches?activeOnly=true`);
            setReassignBatches(response.data.data || []);
        } catch (error) {
            console.error("Error fetching reassign batches:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const endpoint = activeTab === 'students' ? '/admin/students' : '/admin/trainers';
            const response = await api.get(endpoint, { params: { search } });
            const data = activeTab === 'students' ? response.data.students : response.data.trainers;
            setUsers(data || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching users:", error);
            setLoading(false);
        }
    };

    const handleUserSelect = async (user) => {
        try {
            const endpoint = activeTab === 'students' ? `/admin/students/${user.id}` : `/admin/trainers/${user.id}`;
            const response = await api.get(endpoint);
            setSelectedUser(response.data);
            setAssignCourseId('');
            setAssignBatchId('');
        } catch (error) {
            toast.error("Failed to load user details");
        }
    };

    const handleAssignNew = async () => {
        if (!selectedUser || !assignCourseId || !assignBatchId) {
            toast.error("Please select user, course and batch");
            return;
        }

        try {
            const endpoint = activeTab === 'students' ? '/enroll/student-assign' : '/enroll/trainer-assign';
            const payload = activeTab === 'students'
                ? { student_id: selectedUser.id, course_id: assignCourseId, batch_id: assignBatchId }
                : { trainer_id: selectedUser.id, course_id: assignCourseId, batch_id: assignBatchId };

            await api.post(endpoint, payload);
            toast.success("Assigned successfully");
            handleUserSelect(selectedUser); // Refresh details
            setAssignCourseId('');
            setAssignBatchId('');
        } catch (error) {
            toast.error(error.response?.data?.message || "Assignment failed");
        }
    };

    const handleRemove = async (type, id) => {
        if (!window.confirm(`Are you sure you want to remove this ${type}?`)) return;

        try {
            const endpoint = activeTab === 'students'
                ? `/admin/student/remove-${type}`
                : `/admin/trainer/remove-${type}`;

            const payload = activeTab === 'students'
                ? { student_id: selectedUser.id, [`${type}_id`]: id }
                : { trainer_id: selectedUser.id, [`${type}_id`]: id };

            await api.post(endpoint, payload);
            toast.success("Removed successfully");
            handleUserSelect(selectedUser); // Refresh
        } catch (error) {
            toast.error("Removal failed");
        }
    };

    const openReassign = (batch) => {
        setReassignTarget(batch);
        setReassignBatches([]); // Clear previous
        fetchReassignBatches(batch.course_id);
        setNewBatchId('');
        setShowReassignModal(true);
    };

    const handleReassign = async () => {
        if (!newBatchId) return toast.error("Select a new batch");

        try {
            await api.put('/admin/reassign-user', {
                user_id: selectedUser.id,
                old_batch_id: reassignTarget.batch_id,
                new_batch_id: newBatchId,
                new_course_id: reassignTarget.course_id // Explicitly set course context
            });
            toast.success("Reassigned successfully");
            setShowReassignModal(false);
            handleUserSelect(selectedUser); // Refresh
        } catch (error) {
            toast.error(error.response?.data?.message || "Reassignment failed");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => window.location.href = '/admin/dashboard'}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
                <FaArrowLeft /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white mb-8">Manage User Assignments</h1>

            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => { setActiveTab('students'); setSelectedUser(null); }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'students' ? 'bg-neon-orange text-white' : 'bg-dark-card text-gray-400'}`}
                >
                    <FaUserGraduate /> Students
                </button>
                <button
                    onClick={() => { setActiveTab('trainers'); setSelectedUser(null); }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'trainers' ? 'bg-neon-orange text-white' : 'bg-dark-card text-gray-400'}`}
                >
                    <FaChalkboardTeacher /> Trainers
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: User Search & List */}
                <div className="bg-dark-card p-6 rounded-xl border border-gray-800 h-fit">
                    <h2 className="text-xl font-bold text-white mb-4">Select User</h2>
                    <div className="relative mb-4">
                        <FaSearch className="absolute left-3 top-3 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-neon-orange outline-none"
                        />
                    </div>

                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {loading ? (
                            <div className="text-center text-gray-500 py-4">Loading...</div>
                        ) : users.length > 0 ? (
                            users.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => handleUserSelect(user)}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${selectedUser?.id === user.id ? 'bg-gray-800 border border-neon-orange' : 'bg-gray-900 hover:bg-gray-800'}`}
                                >
                                    <div>
                                        <p className="text-white font-medium">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                    {selectedUser?.id === user.id && <div className="w-2 h-2 rounded-full bg-neon-orange"></div>}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-4">No users found</p>
                        )}
                    </div>
                </div>

                {/* Right: Assignment Details */}
                <div className="lg:col-span-2">
                    {selectedUser ? (
                        <div className="space-y-6">
                            {/* Assign New */}
                            <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <FaPlus className="text-neon-orange" /> Assign New
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="relative">
                                        <div
                                            onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
                                            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white cursor-pointer flex justify-between items-center"
                                        >
                                            <span className="truncate">
                                                {courses.find(c => c.id.toString() === assignCourseId.toString())?.name || "Select Course"}
                                            </span>
                                            <FaChevronDown className={`transition-transform ${isCourseDropdownOpen ? 'rotate-180' : ''}`} />
                                        </div>
                                        {isCourseDropdownOpen && (
                                            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg max-h-60 overflow-y-auto shadow-xl">
                                                {courses.length > 0 ? (
                                                    courses.map(c => (
                                                        <div
                                                            key={c.id}
                                                            onClick={() => {
                                                                setAssignCourseId(c.id);
                                                                fetchBatches(c.id);
                                                                setIsCourseDropdownOpen(false);
                                                            }}
                                                            className="px-4 py-2 hover:bg-gray-800 cursor-pointer text-white transition-colors border-b border-gray-800 last:border-none"
                                                        >
                                                            {c.name}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-2 text-gray-500 text-center">No courses found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <select
                                        value={assignBatchId}
                                        onChange={(e) => setAssignBatchId(e.target.value)}
                                        className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-neon-orange"
                                        disabled={!assignCourseId}
                                    >
                                        <option value="">Select Batch</option>
                                        {batches.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                                    </select>
                                </div>
                                <button
                                    onClick={handleAssignNew}
                                    className="bg-neon-orange hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                                >
                                    Assign
                                </button>
                            </div>

                            {/* Current Assignments */}
                            <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
                                <h2 className="text-xl font-bold text-white mb-4">Current Assignments</h2>

                                <div className="mb-6">
                                    <h3 className="text-sm uppercase text-gray-500 font-bold mb-3">Courses</h3>
                                    {selectedUser.courses?.length > 0 ? (
                                        <div className="space-y-2">
                                            {selectedUser.courses.map(c => (
                                                <div key={c.course_id} className="bg-gray-900 p-3 rounded-lg flex justify-between items-center">
                                                    <span className="text-white">{c.course_name}</span>
                                                    <button
                                                        onClick={() => handleRemove('course', c.course_id)}
                                                        className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                                                    >
                                                        <FaTrash /> Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-gray-500 italic">No courses assigned</p>}
                                </div>

                                <div>
                                    <h3 className="text-sm uppercase text-gray-500 font-bold mb-3">Batches</h3>
                                    {selectedUser.batches?.length > 0 ? (
                                        <div className="space-y-2">
                                            {selectedUser.batches.map(b => (
                                                <div key={b.batch_id} className="bg-gray-900 p-3 rounded-lg flex justify-between items-center">
                                                    <div>
                                                        <span className="text-white block">{b.batch_name}</span>
                                                        <span className="text-xs text-gray-500">{b.course_name}</span>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => openReassign(b)}
                                                            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                                                        >
                                                            <FaExchangeAlt /> Reassign
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemove('batch', b.batch_id)}
                                                            className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                                                        >
                                                            <FaTrash /> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-gray-500 italic">No batches assigned</p>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-dark-card p-12 rounded-xl border border-gray-800 text-center text-gray-500">
                            <FaUserGraduate className="text-6xl mx-auto mb-4 opacity-20" />
                            <p className="text-xl">Select a user to manage assignments</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reassign Modal */}
            {showReassignModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-dark-card p-6 rounded-xl w-full max-w-md border border-gray-800">
                        <h2 className="text-xl font-bold text-white mb-4">Reassign Batch</h2>
                        <p className="text-gray-400 mb-4">Move from <span className="text-white font-bold">{reassignTarget?.batch_name}</span> to:</p>

                        <select
                            value={newBatchId}
                            onChange={(e) => setNewBatchId(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-neon-orange mb-6"
                        >
                            <option value="">Select New Batch</option>
                            {reassignBatches
                                .filter(b => b.id !== reassignTarget?.batch_id)
                                .map(b => (
                                    <option key={b.id} value={b.id}>{b.title}</option>
                                ))
                            }
                        </select>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowReassignModal(false)}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReassign}
                                className="flex-1 bg-neon-orange hover:bg-orange-600 text-white py-2 rounded-lg font-bold"
                            >
                                Confirm Reassign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageAssignments;
