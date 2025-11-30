import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaArrowLeft } from 'react-icons/fa';

const EnrollmentRequests = () => {
    const [requests, setRequests] = useState([]);
    const [batches, setBatches] = useState([]); // Need batches to assign
    const [loading, setLoading] = useState(true);
    const [selectedBatch, setSelectedBatch] = useState({}); // Map request_id -> batch_id

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [reqRes, batchRes] = await Promise.all([
                api.get('/enroll/requests'),
                api.get('/adminCourse/batch') // Correct endpoint for batches
            ]);
            setRequests(reqRes.data.data || []);
            setBatches(batchRes.data || []); // Adjust based on actual response structure
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            // toast.error("Failed to load requests");
            setLoading(false);
        }
    };

    const handleApprove = async (requestId, courseId) => {
        const batchId = selectedBatch[requestId];
        if (!batchId) {
            toast.warning("Please select a batch to assign.");
            return;
        }

        try {
            await api.post('/enroll/approve', {
                request_id: requestId,
                batch_id: batchId
            });
            toast.success("Enrollment approved!");
            fetchData(); // Refresh
        } catch (error) {
            console.error("Approval error:", error);
            toast.error("Failed to approve request");
        }
    };

    const handleReject = async (requestId) => {
        if (!window.confirm("Are you sure you want to reject this request?")) return;

        try {
            await api.post('/enroll/reject', { request_id: requestId });
            toast.success("Enrollment rejected");
            fetchData();
        } catch (error) {
            console.error("Rejection error:", error);
            toast.error("Failed to reject request");
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
            <h1 className="text-3xl font-bold text-white mb-8">Enrollment Requests</h1>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-orange"></div>
                </div>
            ) : (
                <div className="bg-dark-card rounded-xl border border-gray-800 overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-400">
                            <thead className="bg-gray-900 text-gray-200 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-4">Request ID</th>
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-6 py-4">Course</th>
                                    <th className="px-6 py-4">Assign Batch</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {requests.map(req => (
                                    <tr key={req.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">{req.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{req.student_name}</div>
                                            <div className="text-xs text-gray-500">{req.student_email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-neon-orange">{req.course_name}</td>
                                        <td className="px-6 py-4">
                                            <select
                                                className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-neon-orange"
                                                value={selectedBatch[req.id] || ''}
                                                onChange={(e) => setSelectedBatch({ ...selectedBatch, [req.id]: e.target.value })}
                                            >
                                                <option value="">Select Batch</option>
                                                {batches
                                                    .filter(b => b.course_id == req.course_id) // Loose equality for safety
                                                    .map(b => (
                                                        <option key={b.id} value={b.id}>{b.title} ({b.course_name})</option>
                                                    ))
                                                }
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 flex gap-2">
                                            <button
                                                onClick={() => handleApprove(req.id, req.course_id)}
                                                className="p-2 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                                                title="Approve"
                                            >
                                                <FaCheck />
                                            </button>
                                            <button
                                                onClick={() => handleReject(req.id)}
                                                className="p-2 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                                title="Reject"
                                            >
                                                <FaTimes />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {requests.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            No pending requests.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnrollmentRequests;
