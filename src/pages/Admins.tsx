import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Toggle from '../components/Toggle';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import '../auth.css';

interface AdminRow {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'pending' | 'active' | 'disabled';
  avatarUrl?: string | null;
  permissions?: Record<string, boolean> | null;
}

const PERMISSION_OPTIONS = [
  { key: 'orders', label: 'Orders' },
  { key: 'vendors', label: 'Vendors' },
  { key: 'customers', label: 'Customers' },
  { key: 'reports', label: 'Reports' },
];

const STATUS_CLASS: Record<string, string> = {
  active: 'status-pill-active',
  pending: 'status-pill-pending',
  disabled: 'status-pill-disabled',
};

export default function Admins() {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermissions, setInvitePermissions] = useState<Record<string, boolean>>({});
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const [editingAdmin, setEditingAdmin] = useState<AdminRow | null>(null);
  const [editPermissions, setEditPermissions] = useState<Record<string, boolean>>({});
  const [savingPermissions, setSavingPermissions] = useState(false);

  const [togglingId, setTogglingId] = useState<number | null>(null);

  async function loadAdmins() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/auth/admins');
      setAdmins(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load admins.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  function openInviteModal() {
    setInviteName('');
    setInviteEmail('');
    setInvitePermissions({});
    setInviteError('');
    setInviteSuccess('');
    setShowInviteModal(true);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteError('');
    setInviteSuccess('');
    try {
      const res = await api.post('/auth/invite', {
        name: inviteName,
        email: inviteEmail,
        permissions: invitePermissions,
      });
      setInviteSuccess(res.data.message);
      setInviteName('');
      setInviteEmail('');
      setInvitePermissions({});
      loadAdmins();
    } catch (err: any) {
      setInviteError(err.response?.data?.message ?? 'Failed to send invite.');
    } finally {
      setInviting(false);
    }
  }

  function openEditModal(admin: AdminRow) {
    setEditingAdmin(admin);
    setEditPermissions(admin.permissions ?? {});
  }

  async function handleSavePermissions() {
    if (!editingAdmin) return;
    setSavingPermissions(true);
    try {
      await api.patch(`/auth/admins/${editingAdmin.id}/permissions`, {
        permissions: { dashboard: true, ...editPermissions },
      });
      setEditingAdmin(null);
      loadAdmins();
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Failed to update permissions.');
    } finally {
      setSavingPermissions(false);
    }
  }

  async function handleToggleDisabled(admin: AdminRow) {
    const disable = admin.status !== 'disabled';
    const confirmMsg = disable
      ? `Disable ${admin.name}'s account? They won't be able to log in until re-enabled.`
      : `Re-enable ${admin.name}'s account?`;
    if (!window.confirm(confirmMsg)) return;

    setTogglingId(admin.id);
    try {
      await api.patch(`/auth/admins/${admin.id}/status`, { disabled: disable });
      loadAdmins();
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Failed to update account status.');
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Admins" />

      <div className="card">
        <div className="admins-header-row">
          <h2>Team Members</h2>
          <button className="btn-save" onClick={openInviteModal}>Invite Admin</button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="auth-error">{error}</p>}

        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.name}</td>
                  <td>{admin.email}</td>
                  <td>{admin.role}</td>
                  <td>
                    <span className={`status-pill ${STATUS_CLASS[admin.status]}`}>
                      {admin.status}
                    </span>
                  </td>
                  <td>
                    {admin.role !== 'SuperAdmin' && (
                      <div className="hatua-cell" style={{ alignItems: 'center' }}>
                        <button className="btn btn-outline" onClick={() => openEditModal(admin)}>
                          Edit permissions
                        </button>
                        <Toggle
                          checked={admin.status !== 'disabled'}
                          onChange={() => handleToggleDisabled(admin)}
                          disabled={togglingId === admin.id || admin.id === currentUser?.id}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showInviteModal && (
        <div className="modal-overlay">
          <div className="card modal-card">
            <h2>Invite Admin</h2>
            {inviteSuccess && <p style={{ color: '#22a06b' }}>{inviteSuccess}</p>}
            {inviteError && <p className="auth-error">{inviteError}</p>}

            <form onSubmit={handleInvite}>
              <label className="auth-label">Name</label>
              <input className="auth-input" value={inviteName} onChange={(e) => setInviteName(e.target.value)} required />

              <label className="auth-label">Email</label>
              <input className="auth-input" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />

              <label className="auth-label">Permissions</label>
              <div className="permission-checkbox-list">
                <label>
                  <input type="checkbox" checked disabled />
                  Dashboard <span className="action-sub">(always included)</span>
                </label>
                {PERMISSION_OPTIONS.map((opt) => (
                  <label key={opt.key}>
                    <input
                      type="checkbox"
                      checked={!!invitePermissions[opt.key]}
                      onChange={(e) => setInvitePermissions((prev) => ({ ...prev, [opt.key]: e.target.checked }))}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              <div className="settings-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowInviteModal(false)}>Close</button>
                <button type="submit" className="btn-save" disabled={inviting}>
                  {inviting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingAdmin && (
        <div className="modal-overlay">
          <div className="card modal-card">
            <h2>Edit Permissions</h2>
            <p className="action-sub">{editingAdmin.name} ({editingAdmin.email})</p>

            <div className="permission-checkbox-list">
              <label>
                <input type="checkbox" checked disabled />
                Dashboard <span className="action-sub">(always included)</span>
              </label>
              {PERMISSION_OPTIONS.map((opt) => (
                <label key={opt.key}>
                  <input
                    type="checkbox"
                    checked={!!editPermissions[opt.key]}
                    onChange={(e) => setEditPermissions((prev) => ({ ...prev, [opt.key]: e.target.checked }))}
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            <div className="settings-actions">
              <button type="button" className="btn btn-outline" onClick={() => setEditingAdmin(null)}>Cancel</button>
              <button className="btn-save" onClick={handleSavePermissions} disabled={savingPermissions}>
                {savingPermissions ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}