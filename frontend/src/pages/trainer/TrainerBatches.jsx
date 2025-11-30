import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FaUsers, FaCalendarAlt } from 'react-icons/fa';

const TrainerBatches = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const response = await api.get('/trainer/batches');
                setBatches(response.data.batches || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching batches:", error);
                toast.error("Failed to load batches");
                setLoading(false);
            }
        };
        fetchBatches();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">My Batches</h1>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-purple"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {batches.map(batch => (
                        <div key={batch.batch_id} className="bg-dark-card p-6 rounded-xl border border-gray-800 hover:border-neon-purple transition-all shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{batch.batch_title}</h3>
                                    <p className="text-neon-purple text-sm font-medium">{batch.course_name}</p>
                                </div>
                                <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
                                    ID: {batch.batch_id}
                                </span>
                            </div>

                            <div className="space-y-3 text-gray-400 text-sm mb-6">
                                <div className="flex items-center gap-2">
                                    <FaCalendarAlt className="text-gray-500" />
                                    <span>
                                        {new Date(batch.start_date).toLocaleDateString()} - {new Date(batch.end_date).toLocaleDateString()}
                                    </span>
                                </div>
                                {/* Add student count if available, or fetch separately */}
                            </div>

                            <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                                <FaUsers /> View Students
                            </button>
                        </div>
                    ))}
                    {batches.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No batches assigned yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TrainerBatches;
