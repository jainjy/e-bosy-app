import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages publiques
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/student/CoursesPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import NotFoundPage from "./pages/NotFoundPage";

// Pages cours et leçons
import CourseDetailsPage from "./pages/student/CourseDetailsPage";
import CourseEnrollPage from "./pages/student/CourseEnrollPage";
import LessonPage from "./pages/student/LessonPage";
import LessonFormPage from "./pages/teacher/LessonFormPage";

// Pages d'évaluations et résultats
import ExercisePage from "./pages/student/ExercisePage";
import AssessmentListPage from "./pages/student/AssessmentListPage";
import StudentAssessmentsPage from "./pages/student/StudentAssessmentsPage";

// Pages dashboard et rôles
import MenuLayout from "./layouts/DashboardLayout";
import MyCoursesPage from "./pages/student/MyCoursesPage";
import TeacherCoursesPage from "./pages/teacher/TeacherCoursesPage";
import TeacherLessonsPage from "./pages/teacher/TeacherLessonsPage";
import AssessmentsPage from "./pages/teacher/AssessmentsPage";
import QuestionsPage from "./pages/teacher/QuestionsPage";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import TeacherOverviewPage from "./pages/teacher/TeacherOverviewPage";
import StudentOverviewPage from "./pages/student/StudentOverviewPage";

// Pages diverses
import CertificatesPage from "./pages/CertificatesPage";
import CertificateViewPage from "./pages/CertificateViewPage";
import SettingsPage from "./pages/SettingsPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import MessagesPage from "./pages/MessagesPage";
import NotificationsPage from "./pages/NotificationsPage";

import CoursesToCertifyPage from "./pages/student/CoursesToCertifyPage";
import CertificationExamPage from "./pages/student/CertificationExamPage";
import CertificationInstructionsPage from "./pages/student/CertificationInstructionsPage";

// Contexts
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { MessageProvider } from "./contexts/MessageContext";
import { LoadingSpinner } from "./components/LoadingSpinner";
import LiveSessionsPage from "./pages/LiveSessionsPage";

import TeacherPage from "./pages/TeacherPage";
import StudentPage from "./pages/StudentPage";
import CertificationResultsPage from "./pages/student/CertificationResultsPage";
import CertificateVerificationPage from "./pages/CertificateVerificationPage";
import AdminCoursesPage from "./pages/admin/AdminCoursesPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import ProfilePage from "./pages/ProfilePage";
import FacturesPage from "./pages/FacturesPage";
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage";
import Conference from "./pages/ConferencePage";
import RecordingViewPage from "./pages/RecordingViewPage";
import AdminLiveSessionsPage from "./pages/admin/AdminLiveSessionsPage";
import PaymentPage from "./pages/PaymentPage";
import TeacherStudentsPage from "./pages/teacher/TeacherStudentsPage";

// Route protégée
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
        <LoadingSpinner />
      </div>
    );
  }

  if (!localStorage.getItem("user_token")) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

// Dashboard selon le rôle
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

// Page de cours selon le rôle
function RoleBasedCoursesPage() {
  const { user } = useAuth();
  switch (user?.role) {
    case "administrateur":
      return <AdminCoursesPage />;
    case "enseignant":
      return <TeacherCoursesPage />;
    default:
      return <MyCoursesPage />;
  }
}
// Page de cours selon le rôle
function RoleBasedHomePage() {
  const { user } = useAuth();
    if(user){
      return <RoleBasedDashboard/>
    }
    else{
      return <HomePage/>
    }
  }


// Composant principal
function App() {
  return (
    <>
      <Router>
        <Routes>

          {/* Routes publiques */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify" element={<CertificateVerificationPage />} />
          <Route path="/conf" element={<Conference />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MenuLayout />
              </ProtectedRoute>
            }
          >
            {/* Routes du dashboard */}

            <Route path="dashboard" element={<RoleBasedDashboard />} />
            <Route index element={<RoleBasedHomePage/>} />
            <Route path="mycourses" element={<RoleBasedCoursesPage />} />
            <Route path="users/:id/profile" element={<ProfilePage />} />
            <Route path="subscription" element={<SubscriptionPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route
              path="courses/:courseId/lessons"
              element={<TeacherLessonsPage />}
            />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route
              path="courses/:courseId/assessments"
              element={<AssessmentsPage />}
            />
            <Route
              path="courses/:courseId/enroll"
              element={<CourseEnrollPage/>}
            />
            <Route
              path="courses/:courseId/assessments/:assessmentId/questions"
              element={<QuestionsPage />}
            />
            <Route path="admin/live-sessions" element={<AdminLiveSessionsPage />} />
            
            {/* Routes des cours */}
            <Route path="course/:courseId" element={<CourseDetailsPage />} />
            <Route path="course/:courseId/lesson/:lessonId" element={<LessonPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="course/:courseId/results" element={<CertificationResultsPage />} />
            <Route path="course/:courseId/certification" element={<CertificationInstructionsPage />} />
            <Route path="course/:courseId/certification/exam" element={<CertificationExamPage />} />
            <Route path="course/:courseId/exercise/:assessmentId" element={<ExercisePage />} />
            <Route path="course/:courseId/assessments" element={<AssessmentListPage />} />
            
            {/* Autres routes */}
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="certificates" element={<CertificatesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="messages/:userId" element={<MessagesPage />} />
            <Route path="message/:userId" element={<MessagesPage />} />
            
            <Route path="users" element={<UserManagementPage />} />
            <Route path="live-sessions" element={<LiveSessionsPage />} />
            <Route path="live-session/:sessionId" element={<TeacherPage />} />
            <Route
              path="live-session/:sessionId"
              element={
                <ProtectedRoute>
                  <TeacherPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/live-session/:sessionId"
              element={
                <ProtectedRoute>
                  <StudentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/live-session/:sessionId"
              element={<StudentPage />}
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
            <Route
              path="assessments"
              element={
                <ProtectedRoute>
                  <StudentAssessmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="certificates/available"
              element={
                <ProtectedRoute>
                  <CoursesToCertifyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="invoices"
              element={
                <ProtectedRoute>
                  <FacturesPage />
                </ProtectedRoute>
              }
            />
            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="payment" element={<PaymentPage />} />
            <Route path="students" element={<TeacherStudentsPage />} />
            
           
          </Route>
          <Route path="recordings/:id" element={<RecordingViewPage />} />
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

// Wrapper avec contextes
export default function AppWrapper() {
  return (
    <AuthProvider>
      <MessageProvider>
        <App />
      </MessageProvider>
    </AuthProvider>
  );
}
