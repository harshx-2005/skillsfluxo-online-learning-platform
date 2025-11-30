import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { getAssetUrl } from '../../utils/api';
import { toast } from 'react-toastify';
import { FaUserCircle, FaCamera, FaEnvelope, FaPhoneAlt, FaUser, FaFileAlt, FaDownload, FaEdit, FaSave, FaTimes, FaLock, FaSignOutAlt } from 'react-icons/fa';

const StudentProfile = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });
    const [resume, setResume] = useState(null); // URL or path
    const fileInputRef = useRef(null);
    const resumeInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
            });
            fetchResume();
        }
    }, [user]);

    const fetchResume = async () => {
        try {
            const res = await api.get('/profile/resume');
            if (res.data.resume) {
                setResume(res.data.resume);
            }
        } catch (error) {
            // Silently fail if no resume or 404
            console.log("No resume found or error fetching resume");
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('profile_pic', file);

        setUploading(true);
        try {
            await api.patch('/profile/update', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const picRes = await api.get('/profile/profile-pic');
            const newPic = picRes.data.profile_pic;

            const updatedUser = { ...user, profile_pic: newPic };
            updateUser(updatedUser);

            toast.success("Profile picture updated successfully!");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload profile picture.");
        } finally {
            setUploading(false);
        }
    };

    const handleResumeChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('resume', file);

        setUploading(true);
        try {
            await api.patch('/profile/update', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await fetchResume();
            toast.success("Resume uploaded successfully!");
        } catch (error) {
            console.error("Resume upload error:", error);
            toast.error("Failed to upload resume.");
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('phone', formData.phone);

            await api.patch('/profile/update', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const updatedUser = { ...user, ...formData };
            updateUser(updatedUser);
            setIsEditing(false);
            toast.success("Profile details updated!");
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to update profile.");
        } finally {
            setUploading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            return toast.error("New passwords do not match");
        }

        setUploading(true);
        try {
            await api.post('/auth/change-password', {
                old_password: passwordData.old_password,
                new_password: passwordData.new_password
            });
            toast.success("Password changed successfully");
            setShowPasswordChange(false);
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            console.error("Password change error:", error);
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white py-8">
            <div className="container mx-auto max-w-4xl px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/student/home')}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors border border-white/10"
                            title="Back to Home"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                My Profile
                            </h1>
                            <p className="text-gray-400 text-sm">Manage your personal information.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${isEditing ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-neon-blue text-black hover:bg-white'}`}
                    >
                        {isEditing ? <><FaTimes /> Cancel</> : <><FaEdit /> Edit</>}
                    </button>
                </div>

                <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                    {/* Background Accents - Removed for clean look */}

                    <div className="relative z-10">
                        {/* Centered Profile Pic */}
                        <div className="flex flex-col items-center mb-12">
                            <div className={`relative w-40 h-40 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl group mb-6 ${isEditing ? 'cursor-pointer hover:border-neon-orange transition-colors' : ''}`}>
                                {user?.profile_pic ? (
                                    <img
                                        src={getAssetUrl(user.profile_pic)}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-gray-500">
                                        <FaUserCircle className="text-8xl" />
                                    </div>
                                )}

                                {isEditing && (
                                    <div
                                        className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        <FaCamera className="text-white text-4xl drop-shadow-lg" />
                                    </div>
                                )}
                            </div>

                            {isEditing && (
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={uploading}
                                    className="text-neon-orange hover:text-white font-bold transition-colors disabled:opacity-50 text-sm flex items-center gap-2 bg-neon-orange/10 px-4 py-2 rounded-full border border-neon-orange/20 hover:bg-neon-orange hover:border-neon-orange"
                                >
                                    <FaCamera /> {uploading ? "Uploading..." : "Change Photo"}
                                </button>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>

                        {/* Details Section - Stacked */}
                        <div className="space-y-8">
                            <form onSubmit={handleUpdateProfile}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name */}
                                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                <FaUser />
                                            </div>
                                            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Full Name</label>
                                        </div>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-blue focus:bg-black/60 focus:outline-none transition-all"
                                            />
                                        ) : (
                                            <p className="text-xl font-bold text-white pl-1">{user?.name}</p>
                                        )}
                                    </div>

                                    {/* Email (Read Only) */}
                                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                                                <FaEnvelope />
                                            </div>
                                            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Email Address</label>
                                        </div>
                                        <p className="text-xl font-bold text-gray-300 pl-1">{user?.email}</p>
                                    </div>

                                    {/* Phone */}
                                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors md:col-span-2">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                                                <FaPhoneAlt />
                                            </div>
                                            <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">Phone Number</label>
                                        </div>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-blue focus:bg-black/60 focus:outline-none transition-all"
                                                placeholder="Enter phone number"
                                            />
                                        ) : (
                                            <p className="text-xl font-bold text-white pl-1">{user?.phone || "Not provided"}</p>
                                        )}
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="mt-8 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={uploading}
                                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1"
                                        >
                                            <FaSave /> Save Changes
                                        </button>
                                    </div>
                                )}
                            </form>

                            {/* Resume Section */}
                            <div className="mt-10 pt-8 border-t border-white/10">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                                    <span className="w-1 h-6 bg-neon-orange rounded-full"></span>
                                    Resume / CV
                                </h3>

                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.07] transition-colors">
                                    <div className="flex items-center gap-5 flex-1">
                                        <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center text-gray-500 border border-white/5">
                                            <FaFileAlt className="text-3xl" />
                                        </div>
                                        <div>
                                            {resume ? (
                                                <p className="text-green-400 font-bold text-lg mb-1">Resume Uploaded</p>
                                            ) : (
                                                <p className="text-gray-300 font-bold text-lg mb-1">No resume uploaded</p>
                                            )}
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">PDF, DOCX supported</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        {resume && (
                                            <a
                                                href={getAssetUrl(resume)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 md:flex-none px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 border border-white/10"
                                                title="Preview/Download Resume"
                                            >
                                                <FaDownload /> Download
                                            </a>
                                        )}
                                        <button
                                            onClick={() => resumeInputRef.current.click()}
                                            disabled={uploading}
                                            className="flex-1 md:flex-none px-6 py-3 bg-neon-orange hover:bg-orange-500 text-white rounded-xl font-bold transition-all text-sm shadow-lg shadow-neon-orange/20 hover:shadow-neon-orange/40"
                                        >
                                            {resume ? "Update Resume" : "Upload Resume"}
                                        </button>
                                        <input
                                            type="file"
                                            ref={resumeInputRef}
                                            onChange={handleResumeChange}
                                            className="hidden"
                                            accept=".pdf,.doc,.docx"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Security Section */}
                            <div className="mt-10 pt-8 border-t border-white/10">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                                    <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                                    Security
                                </h3>

                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <p className="font-bold text-white text-lg mb-1">Change Password</p>
                                            <p className="text-sm text-gray-400">Ensure your account is secure by updating your password regularly.</p>
                                        </div>
                                        <button
                                            onClick={() => setShowPasswordChange(!showPasswordChange)}
                                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-all text-sm font-bold"
                                        >
                                            {showPasswordChange ? "Cancel" : "Change Password"}
                                        </button>
                                    </div>

                                    {showPasswordChange && (
                                        <form onSubmit={handleChangePassword} className="mt-8 space-y-6 border-t border-white/10 pt-6 animate-fade-in">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Password</label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={passwordData.old_password}
                                                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-blue focus:bg-black/60 focus:outline-none transition-all"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                                                    <input
                                                        type="password"
                                                        required
                                                        value={passwordData.new_password}
                                                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-blue focus:bg-black/60 focus:outline-none transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        required
                                                        value={passwordData.confirm_password}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-blue focus:bg-black/60 focus:outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={uploading}
                                                    className="bg-neon-blue text-black hover:bg-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-neon-blue/30 transform hover:-translate-y-1"
                                                >
                                                    Update Password
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>

                            {/* Logout Section */}
                            <div className="mt-12 pt-8 border-t border-white/10 flex justify-center">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-red-500 hover:text-white font-bold transition-all px-8 py-3 rounded-full hover:bg-red-600 border border-transparent hover:border-red-500 hover:shadow-lg hover:shadow-red-600/20"
                                >
                                    <FaSignOutAlt /> Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
