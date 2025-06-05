import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import DashboardLayout from './layouts/DashboardLayout';
import MyCoursesPage from './pages/MyCoursesPage';
import CertificatesPage from './pages/CertificatesPage';
import SettingsPage from './pages/SettingsPage';
import UserManagementPage from './pages/UserManagementPage';
import ManageCoursesPage from './pages/ManageCoursesPage';
import MessagesPage from './pages/MessagesPage';
import LessonPage from './pages/LessonPage';
import NotFoundPage from './pages/NotFoundPage';
// ... (imports)
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import TeacherOverviewPage from './pages/teacher/TeacherOverviewPage';
import StudentOverviewPage from './pages/student/StudentOverviewPage';
import LoginPage from './pages/LoginPage';
import ReportsPage from './pages/ReportsPage';
import { AuthProvider } from './services/AuthContext';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import TeacherCoursesPage from './pages/teacher/TeacherCoursesPage';
import TeacherLessonsPage from './pages/teacher/TeacherLessonsPage';
import ScheduleLiveSessionPage from './pages/ScheduleLiveSessionPage';
import LiveSessionPage from './pages/LiveSessionPage';


function App() {
  const currentUserRole = 'admin'; // Set to 'admin' for testing this page
  const currentUserName = 'Admin User';
  const currentUserEmail = 'admin@example.com';

  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/login" element={<LoginPage />} /> {/* Add Login Page route */}
        <Route path="/register" element={<SignupPage />} /> {/* Add Login Page route */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* Add Login Page route */}
        <Route path="/reset-password" element={<ResetPasswordPage />} /> {/* Add Login Page route */}
        {/* <Route path="/about" element={()=>"about pages"} /> Add Login Page route */}

        <Route
          path="/dashboard/*"
          element={
            <DashboardLayout
              userRole={currentUserRole}
              userName={currentUserName}
              userEmail={currentUserEmail}
            />
          }
        >
              {/* Change the default dashboard route to AdminOverviewPage if user is admin */}
              <Route index element={currentUserRole === 'admin' ? <AdminOverviewPage /> : currentUserRole === 'teacher' ? <TeacherOverviewPage /> : <StudentOverviewPage />} />
              <Route path='courses' element={currentUserRole === 'admin' ? <TeacherCoursesPage /> : currentUserRole === 'teacher' ? <TeacherCoursesPage /> : <StudentCoursePage />} />
              <Route path='courses/:courseId/lessons' element={currentUserRole === 'admin' ? <TeacherCoursesPage /> : currentUserRole === 'teacher' ? <TeacherLessonsPage /> : <StudentCoursePage />} />
              <Route path="mycourses" element={<MyCoursesPage />} />
              <Route path="certificates" element={<CertificatesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="reports" element={<ReportsPage />} /> {/* Add Reports Page route */}
              {/* Route pour le formulaire de planification de session live */}
              <Route path="live-sessions/schedule" element={<ScheduleLiveSessionPage />} />
              {/* Route pour la page de session live en cours (avec un ID dynamique) */}
          </Route>
          <Route path="/live-session/:sessionId" element={<LiveSessionPage />} />
          <Route path="/course/:courseId/lesson/:lessonId" element={<LessonPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;