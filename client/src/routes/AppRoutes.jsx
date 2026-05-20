import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import CompaniesPage from '../features/companies/pages/CompaniesPage';
import FileDetailsPage from '../features/files/pages/FileDetailsPage';
import ImportPage from '../features/import/pages/ImportPage';
import ExportPage from '../features/export/pages/ExportPage';
import TagsPage from '../features/tags/pages/TagsPage';
import ProfilePage from '../features/profile/pages/ProfilePage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes inside Dashboard Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="files/:fileId" element={<FileDetailsPage />} />
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
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;