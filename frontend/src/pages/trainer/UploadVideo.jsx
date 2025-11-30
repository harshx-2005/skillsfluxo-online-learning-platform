import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaArrowLeft } from 'react-icons/fa';

const UploadVideo = () => {
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch courses first
        const fetchCourses = async () => {
            try {
                const response = await api.get('/trainer/courses');
                setCourses(response.data.courses || []);
            } catch (error) {
                console.error("Error fetching courses:", error);
                toast.error("Failed to fetch assigned courses");
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        // Fetch batches when course is selected
        const fetchBatches = async () => {
            if (!selectedCourse) {
                setBatches([]);
                return;
            }
            try {
                const response = await api.get(`/trainer/batches?course_id=${selectedCourse}`);
                setBatches(response.data.batches || []);
            } catch (error) {
                console.error("Error fetching batches:", error);
            }
        };
        fetchBatches();
    }, [selectedCourse]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCourse || !selectedBatch) {
            toast.error("Please select a course and a batch");
            return;
        }

        if (!videoFile) {
            toast.error("Please select a video file");
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('course_id', selectedCourse);
        formData.append('batch_id', selectedBatch);

        formData.append('video', videoFile);
        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }

        try {
            setUploading(true);
            await api.post('/videos/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success("Video uploaded successfully!");
            navigate('/trainer/dashboard');
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(error.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <button
                onClick={() => navigate('/trainer/dashboard')}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
            >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white mb-8">Upload Video</h1>

            <div className="bg-dark-card p-8 rounded-xl border border-gray-800 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Course Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Select Course</label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => {
                                setSelectedCourse(e.target.value);
                                setSelectedBatch(''); // Reset batch when course changes
                            }}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-neon-purple focus:border-transparent outline-none"
                            required
                        >
                            <option value="">-- Select Course --</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Batch Selection - Only show if course is selected */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Select Batch</label>
                        <select
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-neon-purple focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                            disabled={!selectedCourse}
                        >
                            <option value="">-- Select Batch --</option>
                            {batches.map(batch => (
                                <option key={batch.batch_id} value={batch.batch_id}>
                                    {batch.batch_title}
                                </option>
                            ))}
                        </select>
                        {!selectedCourse && (
                            <p className="text-xs text-gray-500 mt-1">Please select a course first.</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Video Title</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-neon-purple focus:border-transparent outline-none"
                            placeholder="Introduction to..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-neon-purple focus:border-transparent outline-none h-32 resize-none"
                            placeholder="Brief description of the video content..."
                        />
                    </div>

                    {/* File Upload Only */}
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Video File</label>
                                <div className="relative border-2 border-dashed border-gray-700 rounded-lg p-6 hover:border-neon-purple transition-colors text-center cursor-pointer">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => setVideoFile(e.target.files[0])}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        required
                                    />
                                    <FaCloudUploadAlt className="mx-auto text-3xl text-gray-500 mb-2" />
                                    <span className="text-sm text-gray-400 block">
                                        {videoFile ? videoFile.name : "Click to upload video"}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Thumbnail (Optional)</label>
                                <div className="relative border-2 border-dashed border-gray-700 rounded-lg p-6 hover:border-neon-purple transition-colors text-center cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setThumbnailFile(e.target.files[0])}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <FaCloudUploadAlt className="mx-auto text-3xl text-gray-500 mb-2" />
                                    <span className="text-sm text-gray-400 block">
                                        {thumbnailFile ? thumbnailFile.name : "Click to upload image"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full bg-gradient-to-r from-neon-purple to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-bold py-3 rounded-lg shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <FaCloudUploadAlt /> Upload Video
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadVideo;
