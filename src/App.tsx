import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PermissionRoute from './components/PermissionRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ActivateAccount from './pages/ActivateAccount';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Vendors from './pages/Vendors';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Admins from './pages/Admins';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/activate-account" element={<ActivateAccount />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<PermissionRoute permission="orders"><Orders /></PermissionRoute>} />
              <Route path="/vendors" element={<PermissionRoute permission="vendors"><Vendors /></PermissionRoute>} />
              <Route path="/customers" element={<PermissionRoute permission="customers"><Customers /></PermissionRoute>} />
              <Route path="/reports" element={<PermissionRoute permission="reports"><Reports /></PermissionRoute>} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admins" element={<PermissionRoute permission="admins"><Admins /></PermissionRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}