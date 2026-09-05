import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

export default function PermissionRoute({ permission, children }: { permission: string; children: ReactNode }) {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}