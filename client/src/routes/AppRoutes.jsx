import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import CompaniesPage from '../features/companies/pages/CompaniesPage';
import FileDetailsPage from '../features/files/pages/FileDetailsPage';
import UploadedFilesPage from '../features/files/pages/UploadedFilesPage';
import ImportPage from '../features/import/pages/ImportPage';
import ExportPage from '../features/export/pages/ExportPage';
import TagsPage from '../features/tags/pages/TagsPage';
import UsersPage from '../features/dashboard/pages/UsersPage';
import ProfilePage from '../features/profile/pages/ProfilePage';
import AboutPage from '../features/dashboard/pages/AboutPage';
import TargetListsPage from '../features/targetLists/pages/TargetListsPage';
import TargetListDetailsPage from '../features/targetLists/pages/TargetListDetailsPage';
import LandingPage from '../pages/LandingPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/register"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <RegisterPage />
          </ProtectedRoute>
        }
      />

      {/* Main Layout Route - Public so unauthenticated users see the sidebar */}
      <Route path="/" element={<DashboardLayout />}>
        {/* Show Landing Page on the index route */}
        <Route index element={<LandingPage />} />
        
        {/* Protected Inner Routes */}
        <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="companies" element={<ProtectedRoute><CompaniesPage /></ProtectedRoute>} />
        <Route path="uploaded-files" element={<ProtectedRoute allowedRoles={['admin', 'sales', 'marketing', 'cold_mail']}><UploadedFilesPage /></ProtectedRoute>} />
        <Route path="files/:fileId" element={<ProtectedRoute><FileDetailsPage /></ProtectedRoute>} />
        <Route
          path="import"
          element={
            <ProtectedRoute allowedRoles={['admin', 'sales']}>
              <ImportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="export"
          element={
            <ProtectedRoute allowedRoles={['admin', 'marketing']}>
              <ExportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tags"
          element={
            <ProtectedRoute allowedRoles={['admin', 'sales']}>
              <TagsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="target-lists"
          element={
            <ProtectedRoute allowedRoles={['admin', 'sales', 'cold_mail']}>
              <TargetListsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="target-lists/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'sales', 'cold_mail']}>
              <TargetListDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="about" element={<AboutPage />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;