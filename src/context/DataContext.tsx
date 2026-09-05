import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  orders as initialOrders,
  customers as initialCustomers,
  complaints as initialComplaints,
} from '../data/mockData';
import type { Order, Vendor, Customer, Complaint } from '../data/mockData';
import api from '../api/client';

interface DataContextType {
  orders: Order[];
  vendors: Vendor[];
  vendorsLoading: boolean;
  vendorsError: string;
  customers: Customer[];
  complaints: Complaint[];
  updateVendorStatus: (name: string, status: Vendor['status'], reason?: string) => Promise<void>;
  markVendorSettled: (name: string) => Promise<void>;
  toggleVendorOpen: (name: string) => Promise<void>;
  toggleCustomerSuspend: (name: string) => void;
  markCustomerRefunded: (name: string) => void;
  issueOrderRefund: (id: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [vendorsError, setVendorsError] = useState('');
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [complaints] = useState<Complaint[]>(initialComplaints);

  async function loadVendors() {
    setVendorsLoading(true);
    setVendorsError('');
    try {
      const res = await api.get('/vendors');
      setVendors(res.data);
    } catch (err: any) {
      setVendorsError(err.response?.data?.message ?? 'Failed to load vendors.');
    } finally {
      setVendorsLoading(false);
    }
  }

  useEffect(() => {
    loadVendors();
  }, []);

  async function updateVendorStatus(name: string, status: Vendor['status'], reason?: string) {
    const vendor = vendors.find(v => v.name === name) as any;
    if (!vendor) return;
    try {
      const res = await api.patch(`/vendors/${vendor.id}/status`, { status, reason });
      setVendors(prev => prev.map(v => ((v as any).id === vendor.id ? res.data : v)));
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Failed to update vendor status.');
    }
  }

  async function markVendorSettled(name: string) {
    const vendor = vendors.find(v => v.name === name) as any;
    if (!vendor) return;
    try {
      const res = await api.patch(`/vendors/${vendor.id}/settle`, {});
      setVendors(prev => prev.map(v => ((v as any).id === vendor.id ? res.data : v)));
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Failed to mark vendor as settled.');
    }
  }

  async function toggleVendorOpen(name: string) {
    const vendor = vendors.find(v => v.name === name) as any;
    if (!vendor) return;
    try {
      const res = await api.patch(`/vendors/${vendor.id}/toggle-open`, {});
      setVendors(prev => prev.map(v => ((v as any).id === vendor.id ? res.data : v)));
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Failed to update vendor open status.');
    }
  }

  function toggleCustomerSuspend(name: string) {
    setCustomers(prev =>
      prev.map(c => (c.name === name ? { ...c, status: c.status === 'active' ? 'suspended' : 'active' } : c))
    );
  }

  function markCustomerRefunded(name: string) {
    setCustomers(prev => prev.map(c => (c.name === name ? { ...c, refunded: true } : c)));
  }

  function issueOrderRefund(id: string) {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, refundIssued: true } : o)));
  }

  return (
    <DataContext.Provider
      value={{
        orders, vendors, vendorsLoading, vendorsError, customers, complaints,
        updateVendorStatus, markVendorSettled, toggleVendorOpen,
        toggleCustomerSuspend, markCustomerRefunded, issueOrderRefund,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}