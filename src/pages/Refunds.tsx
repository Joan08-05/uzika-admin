import { useData } from '../context/DataContext';
import PageHeader from '../components/PageHeader';

export default function Refunds() {
  const { orders } = useData();
  const refundedOrders = orders.filter(o => o.refundIssued);

  return (
    <div>
      <PageHeader title="Refunds" />

      <div className="card">
        <table className="vendors-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Vendor</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {refundedOrders.map(o => (
              <tr key={o.id}>
                <td><span className="order-id-link">#{o.id}</span></td>
                <td><strong>{o.vendor}</strong></td>
                <td>{o.customer}</td>
                <td>TZS {o.amount.toLocaleString()}</td>
                <td>{o.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {refundedOrders.length === 0 && <p style={{ color: '#9ca3af' }}>No refunds issued yet.</p>}
      </div>
    </div>
  );
}