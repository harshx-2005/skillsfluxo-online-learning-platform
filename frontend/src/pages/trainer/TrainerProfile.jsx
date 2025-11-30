import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { getAssetUrl } from '../../utils/api';
import { toast } from 'react-toastify';
import { FaUserCircle, FaCamera, FaEnvelope, FaPhoneAlt, FaUser, FaEdit, FaSave, FaTimes, FaLock, FaSignOutAlt } from 'react-icons/fa';

const TrainerProfile = () => {
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
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

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
        <div className="min-h-screen bg-[#0f0f0f] text-white p-8 pt-24">
            <div className="container mx-auto max-w-3xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue">
                        Trainer Profile
                    </h1>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isEditing ? 'bg-gray-700 hover:bg-gray-600' : 'bg-purple-600 hover:bg-purple-700'}`}
                    >
                        {isEditing ? <><FaTimes /> Cancel</> : <><FaEdit /> Edit Profile</>}
                    </button>
                </div>

                <div className="bg-dark-card rounded-xl border border-gray-800 p-8 shadow-2xl">
                    {/* Centered Profile Pic */}
                    <div className="flex flex-col items-center mb-10">
                        <div className={`relative w-40 h-40 rounded-full overflow-hidden border-4 border-neon-purple group mb-4 ${isEditing ? 'cursor-pointer' : ''}`}>
                            {user?.profile_pic ? (
                                <img
                                    src={getAssetUrl(user.profile_pic)}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400">
                                    <FaUserCircle className="text-7xl" />
                                </div>
                            )}

                            {isEditing && (
                                <div
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <FaCamera className="text-white text-3xl" />
                                </div>
                            )}
                        </div>

                        {isEditing && (
                            <button
                                onClick={() => fileInputRef.current.click()}
                                disabled={uploading}
                                className="text-neon-purple hover:text-purple-400 font-medium transition-colors disabled:opacity-50 text-sm"
                            >
                                {uploading ? "Uploading..." : "Change Photo"}
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
                    <div className="space-y-6">
                        <form onSubmit={handleUpdateProfile}>
                            <div className="space-y-4">
                                {/* Name */}
                                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <FaUser />
                                        </div>
                                        <label className="text-gray-400 text-sm">Full Name</label>
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-black/30 border border-gray-600 rounded px-3 py-2 text-white focus:border-neon-blue focus:outline-none"
                                        />
                                    ) : (
                                        <p className="text-lg font-semibold pl-12">{user?.name}</p>
                                    )}
                                </div>

                                {/* Email (Read Only) */}
                                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                            <FaEnvelope />
                                        </div>
                                        <label className="text-gray-400 text-sm">Email Address</label>
                                    </div>
                                    <p className="text-lg font-semibold pl-12 text-gray-300">{user?.email}</p>
                                </div>

                                {/* Phone */}
                                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                            <FaPhoneAlt />
                                        </div>
                                        <label className="text-gray-400 text-sm">Phone Number</label>
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-black/30 border border-gray-600 rounded px-3 py-2 text-white focus:border-neon-blue focus:outline-none"
                                            placeholder="Enter phone number"
                                        />
                                    ) : (
                                        <p className="text-lg font-semibold pl-12">{user?.phone || "Not provided"}</p>
                                    )}
                                </div>
                            </div>

                            {isEditing && (
                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-500/20"
                                    >
                                        <FaSave /> Save Changes
                                    </button>
                                </div>
                            )}
                        </form>

                        {/* Security Section */}
                        <div className="mt-8 pt-6 border-t border-gray-800">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <FaLock className="text-neon-purple" /> Security
                            </h3>

                            <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-white">Change Password</p>
                                        <p className="text-sm text-gray-400">Change your account password</p>
                                    </div>
                                    <button
                                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded border border-gray-600 transition-colors text-sm"
                                    >
                                        {showPasswordChange ? "Cancel" : "Change Password"}
                                    </button>
                                </div>

                                {showPasswordChange && (
                                    <form onSubmit={handleChangePassword} className="mt-6 space-y-4 border-t border-gray-700 pt-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Current Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordData.old_password}
                                                onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                                className="w-full bg-black/30 border border-gray-600 rounded px-3 py-2 text-white focus:border-neon-blue focus:outline-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">New Password</label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={passwordData.new_password}
                                                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                                    className="w-full bg-black/30 border border-gray-600 rounded px-3 py-2 text-white focus:border-neon-blue focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    required
                                                    value={passwordData.confirm_password}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                                    className="w-full bg-black/30 border border-gray-600 rounded px-3 py-2 text-white focus:border-neon-blue focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={uploading}
                                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-green-500/20"
                                            >
                                                Change Password
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Logout Section */}
                        <div className="mt-8 pt-6 border-t border-gray-800 flex justify-center">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-red-500 hover:text-red-400 font-bold transition-colors px-6 py-3 rounded-lg hover:bg-red-500/10"
                            >
                                <FaSignOutAlt /> Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerProfile;
