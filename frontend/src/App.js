import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import InstallPrompt from './components/InstallPrompt';
import LoginPage from './pages/LoginPage';
import StudentRegister from './pages/StudentRegister';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AvailableRooms from './pages/AvailableRooms';
import MyApplications from './pages/MyApplications';
import StudentMaintenance from './pages/StudentMaintenance';
import StudentPayments from './pages/StudentPayments';
import StudentProfile from './pages/StudentProfile';
import StudentNotifications from './pages/StudentNotifications';
import MyAssignment from './pages/MyAssignment';
import ManageRooms from './pages/ManageRooms';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import Applications from './pages/Applications';
import Maintenance from './pages/Maintenance';
import Payments from './pages/Payments';
import Penalties from './pages/Penalties';
import Reports from './pages/Reports';
import BulkRooms from './pages/BulkRooms';
import AdminChangePassword from './pages/AdminChangePassword';
import AdminProfile from './pages/AdminProfile';
import RoomAssignmentsReport from './pages/RoomAssignmentsReport';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SwapRequest from './pages/SwapRequest';
import Attendance from './pages/Attendance';
import BulkImport from './pages/BulkImport';
import StudentBooking from './pages/StudentBooking';

function AppContent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<StudentRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Admin routes */}
        <Route path="/admin/dashboard" element={
          user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />
        } />
        <Route path="/admin/rooms" element={
          user?.role === 'admin' ? <ManageRooms /> : <Navigate to="/login" />
        } />
        <Route path="/admin/bulk-rooms" element={
          user?.role === 'admin' ? <BulkRooms /> : <Navigate to="/login" />
        } />
        <Route path="/admin/students" element={
          user?.role === 'admin' ? <Students /> : <Navigate to="/login" />
        } />
        <Route path="/admin/students/:id" element={
          user?.role === 'admin' ? <StudentDetails /> : <Navigate to="/login" />
        } />
        <Route path="/admin/applications" element={
          user?.role === 'admin' ? <Applications /> : <Navigate to="/login" />
        } />
        <Route path="/admin/maintenance" element={
          user?.role === 'admin' ? <Maintenance /> : <Navigate to="/login" />
        } />
        <Route path="/admin/payments" element={
          user?.role === 'admin' ? <Payments /> : <Navigate to="/login" />
        } />
        <Route path="/admin/penalties" element={
          user?.role === 'admin' ? <Penalties /> : <Navigate to="/login" />
        } />
        <Route path="/admin/reports" element={
          user?.role === 'admin' ? <Reports /> : <Navigate to="/login" />
        } />
        <Route path="/admin/room-assignments-report" element={
          user?.role === 'admin' ? <RoomAssignmentsReport /> : <Navigate to="/login" />
        } />
        <Route path="/admin/change-password" element={
          user?.role === 'admin' ? <AdminChangePassword /> : <Navigate to="/login" />
        } />
        <Route path="/admin/profile" element={
          user?.role === 'admin' ? <AdminProfile /> : <Navigate to="/login" />
        } />
        <Route path="/admin/attendance" element={
          user?.role === 'admin' ? <Attendance /> : <Navigate to="/login" />
        } />
        <Route path="/admin/bulk-import" element={
          user?.role === 'admin' ? <BulkImport /> : <Navigate to="/login" />
        } />
        
        {/* Student routes */}
        <Route path="/student/dashboard" element={
          user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />
        } />
        <Route path="/student/rooms" element={
          user?.role === 'student' ? <AvailableRooms /> : <Navigate to="/login" />
        } />
        <Route path="/student/applications" element={
          user?.role === 'student' ? <MyApplications /> : <Navigate to="/login" />
        } />
        <Route path="/student/assignment" element={
          user?.role === 'student' ? <MyAssignment /> : <Navigate to="/login" />
        } />
        <Route path="/student/maintenance" element={
          user?.role === 'student' ? <StudentMaintenance /> : <Navigate to="/login" />
        } />
        <Route path="/student/payments" element={
          user?.role === 'student' ? <StudentPayments /> : <Navigate to="/login" />
        } />
        <Route path="/student/profile" element={
          user?.role === 'student' ? <StudentProfile /> : <Navigate to="/login" />
        } />
        <Route path="/student/notifications" element={
          user?.role === 'student' ? <StudentNotifications /> : <Navigate to="/login" />
        } />
        <Route path="/student/swap-request" element={
          user?.role === 'student' ? <SwapRequest /> : <Navigate to="/login" />
        } />
        <Route path="/student/booking" element={
          user?.role === 'student' ? <StudentBooking /> : <Navigate to="/login" />
        } />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
      <InstallPrompt />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;