import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { UsersListPage } from '../pages/users/UsersListPage';
import { UserFormPage } from '../pages/users/UserFormPage';
import { RolesListPage } from '../pages/roles/RolesListPage';
import { RoleFormPage } from '../pages/roles/RoleFormPage';
import { RoleDetailPage } from '../pages/roles/RoleDetailPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute requireAdmin={true}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersListPage />} />
            <Route path="users/new" element={<UserFormPage />} />
            <Route path="users/:id" element={<UserFormPage />} />
            <Route path="roles" element={<RolesListPage />} />
            <Route path="roles/new" element={<RoleFormPage />} />
            <Route path="roles/:id" element={<RoleDetailPage />} />
            <Route path="roles/:id/edit" element={<RoleFormPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
