import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import '../auth.css';

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/activate', { token, password });
      loginWithToken(res.data.access_token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'This activation link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">ÚZIKA</div>
        <h1 className="auth-title">Activate your account</h1>
        <p className="auth-subtitle">Set a password to finish setting up your admin account.</p>

        <form onSubmit={handleSubmit}>
          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="auth-label">Confirm password</label>
          <input
            className="auth-input"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <p className="auth-error">{error || '\u00A0'}</p>

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? 'Activating...' : 'Activate Account'}
          </button>
        </form>
      </div>
    </div>
  );
}