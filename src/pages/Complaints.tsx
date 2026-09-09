import { useState } from 'react';
import { useData } from '../context/DataContext';
import PageHeader from '../components/PageHeader';

type Tab = 'open' | 'resolved' | 'ignored';

export default function Complaints() {
  const { complaints, resolveComplaint, ignoreComplaint, reconsiderComplaint } = useData();
  const [tab, setTab] = useState<Tab>('open');

  const open = complaints.filter(c => c.status === 'open');
  const resolved = complaints.filter(c => c.status === 'resolved');
  const ignored = complaints.filter(c => c.status === 'ignored');

  return (
    <div>
      <PageHeader title="Complaints" />

      <div className="filter-tabs">
        <button className={tab === 'open' ? 'filter-tab filter-tab-active' : 'filter-tab'} onClick={() => setTab('open')}>
          Open ({open.length})
        </button>
        <button className={tab === 'resolved' ? 'filter-tab filter-tab-active' : 'filter-tab'} onClick={() => setTab('resolved')}>
          Resolved ({resolved.length})
        </button>
        <button className={tab === 'ignored' ? 'filter-tab filter-tab-active' : 'filter-tab'} onClick={() => setTab('ignored')}>
          Ignored ({ignored.length})
        </button>
      </div>

      {tab === 'open' && (
        <div className="card">
          <table className="vendors-table">
            <thead>
              <tr>
                <th>From</th><th>Type</th><th>About</th><th>Issue</th><th>Hatua</th>
              </tr>
            </thead>
            <tbody>
              {open.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.from}</strong></td>
                  <td style={{ textTransform: 'capitalize' }}>{c.fromType}</td>
                  <td>{c.about ?? '—'}</td>
                  <td>{c.issue}</td>
                  <td>
                    <div className="hatua-cell">
                      <button className="btn btn-primary" onClick={() => resolveComplaint(c.id)}>Resolve</button>
                      <button className="btn btn-danger-outline" onClick={() => ignoreComplaint(c.id)}>Ignore</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {open.length === 0 && <p style={{ color: '#9ca3af' }}>No open complaints.</p>}
        </div>
      )}

      {tab === 'resolved' && (
        <div className="card">
          <table className="vendors-table">
            <thead>
              <tr>
                <th>From</th><th>Type</th><th>About</th><th>Issue</th><th>Resolved By</th><th>Resolved At</th>
              </tr>
            </thead>
            <tbody>
              {resolved.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.from}</strong></td>
                  <td style={{ textTransform: 'capitalize' }}>{c.fromType}</td>
                  <td>{c.about ?? '—'}</td>
                  <td>{c.issue}</td>
                  <td>{c.resolvedByAdminName}</td>
                  <td>{c.resolvedAt ? new Date(c.resolvedAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {resolved.length === 0 && <p style={{ color: '#9ca3af' }}>No resolved complaints.</p>}
        </div>
      )}

      {tab === 'ignored' && (
        <div className="card">
          <table className="vendors-table">
            <thead>
              <tr>
                <th>From</th><th>Type</th><th>About</th><th>Issue</th><th>Ignored By</th><th>Ignored At</th><th>Hatua</th>
              </tr>
            </thead>
            <tbody>
              {ignored.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.from}</strong></td>
                  <td style={{ textTransform: 'capitalize' }}>{c.fromType}</td>
                  <td>{c.about ?? '—'}</td>
                  <td>{c.issue}</td>
                  <td>{c.ignoredByAdminName}</td>
                  <td>{c.ignoredAt ? new Date(c.ignoredAt).toLocaleString() : '—'}</td>
                  <td>
                    <button className="btn btn-outline" onClick={() => reconsiderComplaint(c.id)}>Reconsider</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ignored.length === 0 && <p style={{ color: '#9ca3af' }}>No ignored complaints.</p>}
        </div>
      )}
    </div>
  );
}