import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { FaClock, FaArrowLeft, FaUsers } from 'react-icons/fa';

const TrainerCourseDetails = () => {
    const { courseId } = useParams();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                // Fetch batches filtered by course_id
                const response = await api.get(`/trainer/batches?course_id=${courseId}`);
                setBatches(response.data.batches || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching batches:", error);
                setLoading(false);
            }
        };
        fetchBatches();
    }, [courseId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-neon-purple"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white p-8 pt-24">
            <div className="container mx-auto">
                <button
                    onClick={() => navigate('/trainer/home')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <FaArrowLeft /> Back to Home
                </button>

                <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue">
                    Course Batches
                </h1>

                {batches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {batches.map(batch => (
                            <div
                                key={batch.batch_id}
                                onClick={() => navigate(`/trainer/batch/${batch.batch_id}`)}
                                className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-neon-purple transition-all shadow-lg group cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-neon-purple transition-colors">{batch.batch_title}</h3>
                                        <p className="text-sm text-gray-400">{batch.course_name}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">Active</span>
                                </div>
                                <div className="space-y-3 text-gray-400 text-sm mb-6">
                                    <div className="flex items-center gap-2">
                                        <FaClock className="text-gray-500" />
                                        <span>
                                            {new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.end_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-neon-purple font-medium">
                                    <FaUsers /> View Content & Students
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-dark-card rounded-xl border border-gray-800">
                        <p className="text-gray-400 mb-4">No batches found for this course.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainerCourseDetails;
