import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/student/CoursesPage";
import DashboardLayout from "./layouts/DashboardLayout";
import MyCoursesPage from "./pages/student/MyCoursesPage";
import CertificatesPage from "./pages/CertificatesPage";
import SettingsPage from "./pages/SettingsPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import MessagesPage from "./pages/MessagesPage";
import LessonPage from "./pages/student/LessonPage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import TeacherOverviewPage from "./pages/teacher/TeacherOverviewPage";
import StudentOverviewPage from "./pages/student/StudentOverviewPage";
import LoginPage from "./pages/LoginPage";
import { AuthProvider, useAuth } from "./services/AuthContext";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import TeacherCoursesPage from "./pages/teacher/TeacherCoursesPage";
import TeacherLessonsPage from "./pages/teacher/TeacherLessonsPage";
import ScheduleLiveSessionPage from "./pages/ScheduleLiveSessionPage";
import LiveSessionPage from "./pages/LiveSessionPage";
import Analytics from "./pages/teacher/Analytics";
import CertificateViewPage from "./pages/CertificateViewPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import NotificationsPage from "./pages/NotificationsPage";
import CourseDetailsPage from "./pages/student/CourseDetailsPage";
import LessonFormPage from "./pages/teacher/LessonFormPage";
import CourseEnrollPage from "./pages/student/CourseEnrollPage";

const ProtectedRoute = ({ children }) => {
  const { logged, loading, refreshUser } = useAuth();

  useEffect(() => {
    if (!logged) {
      refreshUser();
    }
  }, [logged, refreshUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Chargement...
      </div>
    );
  }

  if (!localStorage.getItem("user_token")) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/course/:courseId" element={<CourseDetailsPage />} />
          <Route
            path="/courses/:courseId/enroll"
            element={<CourseEnrollPage />}
          />
          <Route
            path="/live-session/:sessionId"
            element={<LiveSessionPage />}
          />
          <Route
            path="/course/:courseId/lesson/:lessonId"
            element={<LessonPage />}
          />
          <Route path="*" element={<NotFoundPage />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RoleBasedDashboard />} />
            <Route path="courses" element={<RoleBasedCoursesPage />} />
            <Route
              path="courses/:courseId/lessons"
              element={<TeacherLessonsPage />}
            />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="certificates" element={<CertificatesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="analytics" element={<Analytics />} />
            <Route
              path="live-sessions/schedule"
              element={<ScheduleLiveSessionPage />}
            />
            <Route
              path="courses/:courseId/lessons/:lessonId/edit"
              element={<LessonFormPage />}
            />
            <Route
              path="courses/:courseId/lessons/add"
              element={<LessonFormPage />}
            />
            <Route path="certificates/:id" element={<CertificateViewPage />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
    </>
  );
}

// Composants pour la gestion des rôles
function RoleBasedDashboard() {
  const { user } = useAuth();

  switch (user?.role) {
    case "administrateur":
      return <AdminOverviewPage />;
    case "enseignant":
      return <TeacherOverviewPage />;
    default:
      return <StudentOverviewPage />;
  }
}

function RoleBasedCoursesPage() {
  const { user } = useAuth();

  if (user?.role === "etudiant") {
    return <MyCoursesPage />;
  }
  return <TeacherCoursesPage />;
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
