import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FaUserSlash, FaUserCheck, FaTrash, FaArrowLeft } from 'react-icons/fa';

const ManageUsers = () => {
    const [activeTab, setActiveTab] = useState('students');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [activeTab, search]);

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
            toast.error("Failed to load users");
            setLoading(false);
        }
    };

    const toggleStatus = async (userId, currentStatus) => {
        try {
            await api.patch(`/admin/users/${userId}/status`, { is_active: !currentStatus });
            toast.success("User status updated");
            fetchUsers();
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };

    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [userDetails, setUserDetails] = useState(null);

    const openDetails = async (user) => {
        setSelectedUser(user);
        try {
            const endpoint = activeTab === 'students' ? `/admin/students/${user.id}` : `/admin/trainers/${user.id}`;
            const response = await api.get(endpoint);
            setUserDetails(response.data);
            setShowDetailsModal(true);
        } catch (error) {
            console.error("Error fetching user details:", error);
            toast.error("Failed to load user details");
        }
    };

    // Assignment State
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('');
    const [assignLoading, setAssignLoading] = useState(false);

    // Fetch courses when modal opens
    useEffect(() => {
        if (showDetailsModal) {
            fetchCourses();
        }
    }, [showDetailsModal]);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/adminCourse/course');
            setBatches(response.data.data || []);
        } catch (error) {
            console.error("Error fetching batches:", error);
        }
    };

    const handleAssign = async () => {
        if (!selectedCourse || !selectedBatch) {
            toast.error("Please select both course and batch");
            return;
        }

        try {
            setAssignLoading(true);
            const endpoint = activeTab === 'students' ? '/enroll/student-assign' : '/enroll/trainer-assign';
            const payload = activeTab === 'students'
                ? { student_id: selectedUser.id, course_id: selectedCourse, batch_id: selectedBatch }
                : { trainer_id: selectedUser.id, course_id: selectedCourse, batch_id: selectedBatch };

            await api.post(endpoint, payload);
            toast.success("Assigned successfully");

            // Optimistic Update
            const courseObj = courses.find(c => c.id == selectedCourse);
            const batchObj = batches.find(b => b.id == selectedBatch);

            setUserDetails(prev => ({
                ...prev,
                courses: [...(prev.courses || []), { course_id: selectedCourse, course_name: courseObj?.name }],
                batches: [...(prev.batches || []), { batch_id: selectedBatch, batch_name: batchObj?.title }]
            }));

            setAssignLoading(false);
            setSelectedCourse('');
            setSelectedBatch('');
        } catch (error) {
            console.error("Assignment error:", error);
            toast.error(error.response?.data?.message || "Assignment failed");
            setAssignLoading(false);
        }
    };

    const handleRemoveCourse = async (courseId) => {
        if (!window.confirm("Are you sure you want to remove this course?")) return;
        try {
            await api.post('/admin/student/remove-course', {
                student_id: selectedUser.id,
                course_id: courseId
            });
            toast.success("Course removed");

            // Optimistic Update
            setUserDetails(prev => ({
                ...prev,
                courses: prev.courses.filter(c => c.course_id !== courseId),
                batches: prev.batches.filter(b => b.course_id !== courseId) // Also remove associated batches
            }));
        } catch (error) {
            console.error("Error removing course:", error);
            toast.error("Failed to remove course");
        }
    };

    const handleRemoveBatch = async (batchId) => {
        if (!window.confirm("Are you sure you want to remove this batch?")) return;
        try {
            await api.post('/admin/student/remove-batch', {
                student_id: selectedUser.id,
                batch_id: batchId
            });
            toast.success("Batch removed");

            // Optimistic Update
            setUserDetails(prev => ({
                ...prev,
                batches: prev.batches.filter(b => b.batch_id !== batchId)
            }));
        } catch (error) {
            console.error("Error removing batch:", error);
            toast.error("Failed to remove batch");
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
            <h1 className="text-3xl font-bold text-white mb-8">User Management</h1>

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex bg-dark-card p-1 rounded-lg border border-gray-800 w-fit">
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'students'
                            ? 'bg-gray-800 text-white shadow-sm'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Students
                    </button>
                    <button
                        onClick={() => setActiveTab('trainers')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'trainers'
                            ? 'bg-gray-800 text-white shadow-sm'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Trainers
                    </button>
                </div>
                <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-dark-card border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-neon-orange outline-none w-full md:w-64"
                />
            </div>

            {
                loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-orange"></div>
                    </div>
                ) : (
                    <div className="bg-dark-card rounded-xl border border-gray-800 overflow-hidden shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-gray-400">
                                <thead className="bg-gray-900 text-gray-200 uppercase text-xs font-bold">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4">{user.id}</td>
                                            <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${user.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 flex gap-2">
                                                <button
                                                    onClick={() => openDetails(user)}
                                                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                                                >
                                                    Details
                                                </button>
                                                <button
                                                    onClick={() => toggleStatus(user.id, user.is_active)}
                                                    className={`p-2 rounded hover:bg-gray-700 transition-colors ${user.is_active ? 'text-red-400' : 'text-green-400'
                                                        }`}
                                                    title={user.is_active ? "Deactivate" : "Activate"}
                                                >
                                                    {user.is_active ? <FaUserSlash /> : <FaUserCheck />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            {/* User Details Modal */}
            {
                showDetailsModal && userDetails && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                        <div className="bg-dark-card p-8 rounded-xl w-full max-w-2xl border border-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold text-white">{userDetails.name}</h2>
                                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-white">
                                    <FaTrash className="rotate-45" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                                    <h3 className="text-lg font-semibold text-white mb-2">User Details</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-400">Role</p>
                                            <p className="text-white capitalize">{userDetails.role}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Joined</p>
                                            <p className="text-white">{new Date(userDetails.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Phone</p>
                                            <p className="text-white">{userDetails.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Status</p>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${userDetails.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {userDetails.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
                                    <p className="text-blue-200 text-sm flex items-center gap-2">
                                        <FaArrowLeft />
                                        To manage courses and batches, please use the
                                        <a href="/admin/assignments" className="font-bold underline hover:text-white">Manage Assignments</a> page.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ManageUsers;
