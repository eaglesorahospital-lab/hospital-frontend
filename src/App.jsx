import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './components/admin/AdminLayout';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Departments from './pages/Departments';
import Doctors from './pages/Doctors';
import DoctorDetail from './pages/DoctorDetail';
import Availability from './pages/Availability';
import BookAppointment from './pages/BookAppointment';
import Booking from './pages/Booking';
import AppointmentResult from './pages/AppointmentResult';
import MyAppointments from './pages/MyAppointments';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminSchedules from './pages/admin/AdminSchedules';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainLayout>
          <Routes>
            {/* Public Visitor & Patient Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:slug" element={<DoctorDetail />} />
            <Route path="/availability" element={<Availability />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/appointment-result" element={<AppointmentResult />} />
            <Route path="/my-appointments" element={<MyAppointments />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Clinical Administration Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'STAFF', 'DOCTOR']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="doctors" element={<AdminDoctors />} />
              <Route path="departments" element={<AdminDepartments />} />
              <Route path="schedules" element={<AdminSchedules />} />
              <Route path="patients" element={<AdminAppointments />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="audit" element={<AdminAuditLogs />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Home />} />
          </Routes>
        </MainLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}

