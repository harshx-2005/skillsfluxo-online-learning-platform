import { useState } from 'react';
import { FaBook, FaCheckCircle } from 'react-icons/fa';

const CourseCard = ({ course, isEnrolled, isPending, onEnroll, onContinue, hideEnrollButton }) => {
    const [imgError, setImgError] = useState(false);

    return (
        <div className={`glass-panel rounded-2xl overflow-hidden transition-all group hover:scale-[1.02] duration-300 flex flex-col h-full relative border ${isEnrolled ? 'border-neon-blue/30 hover:border-neon-blue' : 'border-gray-800 hover:border-neon-orange/50'} shadow-lg hover:shadow-xl`}>
            <div
                className={`h-48 relative overflow-hidden ${isEnrolled ? 'cursor-pointer' : ''}`}
                onClick={isEnrolled ? onContinue : undefined}
            >
                {course.thumbnail && !imgError ? (
                    <img
                        src={course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`}
                        alt={course.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black group-hover:scale-110 transition-transform duration-700"></div>
                )}

                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300"></div>

                {/* Fallback Icon (visible if no image or image error) */}
                {(!course.thumbnail || course.thumbnail === "" || imgError) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <FaBook className={`text-5xl ${isEnrolled ? 'text-neon-blue/50' : 'text-white/20'} group-hover:text-white transition-colors duration-300`} />
                    </div>
                )}

                {isEnrolled && (
                    <div className="absolute top-3 right-3 bg-neon-blue text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg z-10">
                        <FaCheckCircle /> Enrolled
                    </div>
                )}
                {isPending && (
                    <div className="absolute top-3 right-3 bg-yellow-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg z-10 border border-white/20">
                        <FaCheckCircle /> Requested
                    </div>
                )}
            </div>

            <div className="p-6 flex flex-col flex-grow relative z-10">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-neon-blue transition-colors" title={course.name}>{course.name}</h3>
                <p className="text-gray-300 text-sm mb-6 line-clamp-2 flex-grow">{course.description || "No description available."}</p>

                <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
                    <span className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                        {course.level || "All Levels"}
                    </span>

                    {isEnrolled ? (
                        <button
                            onClick={onContinue}
                            className="text-neon-blue hover:text-white text-sm font-bold transition-colors flex items-center gap-1"
                        >
                            Continue →
                        </button>
                    ) : isPending ? (
                        <button
                            disabled
                            className="bg-white/10 text-gray-400 text-sm font-bold px-4 py-2 rounded-lg cursor-not-allowed border border-white/5"
                        >
                            Requested
                        </button>
                    ) : !hideEnrollButton && (
                        <button
                            onClick={() => onEnroll(course.id)}
                            className="bg-gradient-to-r from-neon-orange to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white text-sm font-bold px-5 py-2 rounded-lg transition-all shadow-lg hover:shadow-neon-orange/30 transform hover:-translate-y-0.5"
                        >
                            Enroll Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
