import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLogin from './pages/admin/AdminLogin';
import StudentHome from './pages/student/StudentHome';
import StudentDashboard from './pages/student/StudentDashboard';
import CourseContent from './pages/student/CourseContent';
import VideoPlayer from './pages/student/VideoPlayer';
import StudentProfile from './pages/student/StudentProfile';
import TrainerHome from './pages/trainer/TrainerHome';
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import TrainerProfile from './pages/trainer/TrainerProfile';
import TrainerBatches from './pages/trainer/TrainerBatches';
import TrainerCourseDetails from './pages/trainer/TrainerCourseDetails';
import TrainerBatchDetails from './pages/trainer/TrainerBatchDetails';
import TrainerVideoPlayer from './pages/trainer/TrainerVideoPlayer';
import UploadVideo from './pages/trainer/UploadVideo';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import EnrollmentRequests from './pages/admin/EnrollmentRequests';
import ManageCourses from './pages/admin/ManageCourses';
import ManageBatches from './pages/admin/ManageBatches';
import CourseBatches from './pages/admin/CourseBatches';
import ManageAssignments from './pages/admin/ManageAssignments';
import ManageVideos from './pages/admin/ManageVideos';
import AdminProfile from './pages/admin/AdminProfile';
import AdminVideoPlayer from './pages/admin/AdminVideoPlayer';
// ... existing imports ...


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-dark-bg text-dark-text font-sans">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/home" element={<StudentHome />} />
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/video/:videoId" element={<VideoPlayer />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route path="/student/course/:courseId/content" element={<CourseContent />} />
            </Route>

            {/* Trainer Routes */}
            <Route element={<ProtectedRoute allowedRoles={['trainer']} />}>
              <Route path="/trainer/home" element={<TrainerHome />} />
              <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
              <Route path="/trainer/course/:courseId" element={<TrainerCourseDetails />} />
              <Route path="/trainer/batch/:batchId" element={<TrainerBatchDetails />} />
              <Route path="/trainer/batches" element={<TrainerBatches />} />
              <Route path="/trainer/upload-video" element={<UploadVideo />} />
              <Route path="/trainer/profile" element={<TrainerProfile />} />
              <Route path="/trainer/video/:videoId" element={<TrainerVideoPlayer />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/enrollments" element={<EnrollmentRequests />} />
              <Route path="/admin/courses" element={<ManageCourses />} />
              <Route path="/admin/courses/:courseId/batches" element={<CourseBatches />} />
              <Route path="/admin/batches" element={<ManageBatches />} />
              <Route path="/admin/assignments" element={<ManageAssignments />} />
              <Route path="/admin/videos" element={<ManageVideos />} />
              <Route path="/admin/video/:videoId" element={<AdminVideoPlayer />} />
            </Route>
          </Routes>
          <ToastContainer theme="dark" position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
