import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import '../auth.css';

const API_BASE_URL = 'http://localhost:3000';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] ?? '');
  const [lastName, setLastName] = useState(user?.name?.split(' ').slice(1).join(' ') ?? '');
  const role = user?.role ?? '';
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const avatarDisplay = avatarPreview
    ?? (user?.avatarUrl ? `${API_BASE_URL}${user.avatarUrl}` : null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setSaveMessage('Please upload an SVG, PNG, JPG, or GIF file.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setSaveMessage('File is too large. Maximum size is 5MB.');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleCancel() {
    navigate(-1);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('');

    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await api.patch('/auth/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(res.data);
      navigate(-1);
    } catch (err: any) {
      setSaveMessage(err.response?.data?.message ?? 'Something went wrong while saving.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Setting" />

      <form className="card settings-card" onSubmit={handleSave}>
        {saveMessage && (
          <div className="settings-banner">
            <span>{saveMessage}</span>
            <button type="button" className="settings-banner-close" onClick={() => setSaveMessage('')}>×</button>
          </div>
        )}

        <div className="settings-grid">
          <div>
            <label className="auth-label">First name</label>
            <input className="auth-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label className="auth-label">Last name</label>
            <input className="auth-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>

        <label className="auth-label">Email address</label>
        <input className="auth-input" value={user?.email ?? ''} readOnly />

        <label className="auth-label">Role</label>
        <input className="auth-input" value={role} readOnly />

        <div className="settings-avatar-row">
          <div className="settings-avatar-preview">
            {avatarDisplay ? (
              <img src={avatarDisplay} alt="Avatar preview" className="settings-avatar-img" />
            ) : (
              firstName.charAt(0).toUpperCase() || '?'
            )}
          </div>
          <div className="settings-dropzone" onClick={() => fileInputRef.current?.click()}>
            <input
              type="file"
              accept="image/png,image/jpeg,image/gif,image/svg+xml"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <div className="settings-dropzone-label">Click to upload or drag and drop</div>
            <div className="settings-dropzone-hint">SVG, PNG, JPG or GIF (max. 800x400px)</div>
          </div>
        </div>

        <div className="settings-actions">
          <button type="button" className="btn btn-outline" onClick={handleCancel}>Cancel</button>
          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}