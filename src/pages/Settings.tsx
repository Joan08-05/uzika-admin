import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import worldCountries from 'world-countries';
import '../auth.css';

const API_BASE_URL = 'http://localhost:3000';

const COUNTRIES = worldCountries
  .map((c) => ({ code: c.cca2, label: c.name.common }))
  .sort((a, b) => a.label.localeCompare(b.label));

function flagUrl(code: string) {
  return `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;
}

function CountrySelect({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = COUNTRIES.find((c) => c.code === value);

  const filtered = useMemo(() => {
    if (!query) return COUNTRIES;
    return COUNTRIES.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  function handleSelect(code: string) {
    onChange(code);
    setOpen(false);
    setQuery('');
  }

  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
      setQuery('');
    }
  }

  return (
    <div className="country-select" ref={wrapperRef} onBlur={handleBlur}>
      <button
        type="button"
        className="country-select-trigger"
        onClick={() => setOpen((o) => !o)}
      >
        {selected ? (
          <span className="country-select-current">
            <img src={flagUrl(selected.code)} alt="" className="country-flag-img" />
            {selected.label}
          </span>
        ) : (
          <span className="country-select-placeholder">Select a country</span>
        )}
        <span className={`country-select-chevron ${open ? 'country-select-chevron-open' : ''}`}>⌄</span>
      </button>

      {open && (
        <div className="country-select-panel">
          <input
            autoFocus
            className="country-select-search"
            placeholder="Search country..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="country-select-list">
            {filtered.length === 0 && (
              <div className="country-select-empty">No matches.</div>
            )}
            {filtered.map((c) => (
              <button
                type="button"
                key={c.code}
                className="country-select-option"
                onClick={() => handleSelect(c.code)}
              >
                <img src={flagUrl(c.code)} alt="" className="country-flag-img" />
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] ?? '');
  const [lastName, setLastName] = useState(user?.name?.split(' ').slice(1).join(' ') ?? '');
  const [country, setCountry] = useState((user as any)?.country ?? '');
  const role = user?.role ?? '';
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'];
  const MAX_SIZE = 5 * 1024 * 1024;

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
      formData.append('country', country);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await api.patch('/auth/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(res.data);
      navigate(-1);
    } catch (err: any) {
      setSaveMessage(err.response?.data?.message ?? 'Something went wrong while saving.');
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Setting" />

      {saveMessage && (
        <div className="settings-banner">
          <span>{saveMessage}</span>
          <button type="button" className="settings-banner-close" onClick={() => setSaveMessage('')}>×</button>
        </div>
      )}

      <form className="settings-form" onSubmit={handleSave}>
        <div className="settings-row">
          <label className="settings-row-label">Name</label>
          <div className="settings-row-content settings-name-fields">
            <input
              className="auth-input"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              className="auth-input"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="settings-row">
          <label className="settings-row-label">Email address</label>
          <div className="settings-row-content">
            <input className="auth-input" value={user?.email ?? ''} readOnly />
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row-label">
            Your photo
            <div className="settings-row-label-sub">This will be displayed on your profile.</div>
          </div>
          <div className="settings-row-content settings-avatar-row">
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
              <div className="settings-dropzone-icon">⬆</div>
              <div className="settings-dropzone-label">Click to upload <span>or drag and drop</span></div>
              <div className="settings-dropzone-hint">SVG, PNG, JPG or GIF (max. 800×400px)</div>
            </div>
          </div>
        </div>

        <div className="settings-row">
          <label className="settings-row-label">Role</label>
          <div className="settings-row-content">
            <input className="auth-input" value={role} readOnly />
          </div>
        </div>

        <div className="settings-row">
          <label className="settings-row-label">Country</label>
          <div className="settings-row-content">
            <CountrySelect value={country} onChange={setCountry} />
          </div>
        </div>

        <div className="settings-row settings-row-last">
          <div />
          <div className="settings-row-content settings-actions">
            <button type="button" className="btn btn-outline" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}