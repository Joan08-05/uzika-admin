import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { complaints as initialComplaints } from '../data/mockData';
import type { Order, Vendor, Customer, Complaint } from '../data/mockData';
import api from '../api/client';

interface DataContextType {
  orders: Order[];
  ordersLoading: boolean;
  ordersError: string;
  vendors: Vendor[];
  vendorsLoading: boolean;
  vendorsError: string;
  customers: Customer[];
  customersLoading: boolean;
  customersError: string;
  complaints: Complaint[];
  updateVendorStatus: (name: string, status: Vendor['status'], reason?: string) => Promise<void>;
  markVendorSettled: (name: string) => Promise<void>;
  toggleVendorOpen: (name: string) => Promise<void>;
  toggleCustomerSuspend: (name: string) => Promise<void>;
  markCustomerRefunded: (name: string) => Promise<void>;
  issueOrderRefund: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [vendorsError, setVendorsError] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState('');
  const [complaints] = useState<Complaint[]>(initialComplaints);

  async function loadOrders() {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err: any) {
      setOrdersError(err.response?.data?.message ?? 'Failed to load orders.');
    } finally {
      setOrdersLoading(false);
    }
  }

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

  async function loadCustomers() {
    setCustomersLoading(true);
    setCustomersError('');
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err: any) {
      setCustomersError(err.response?.data?.message ?? 'Failed to load customers.');
    } finally {
      setCustomersLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
    loadVendors();
    loadCustomers();
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

  async function toggleCustomerSuspend(name: string) {
    const customer = customers.find(c => c.name === name) as any;
    if (!customer) return;
    const newStatus = customer.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.patch(`/customers/${customer.id}/status`, { status: newStatus });
      setCustomers(prev => prev.map(c => ((c as any).id === customer.id ? res.data : c)));
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Failed to update customer status.');
    }
  }

  async function markCustomerRefunded(name: string) {
    const customer = customers.find(c => c.name === name) as any;
    if (!customer) return;
    try {
      const res = await api.patch(`/customers/${customer.id}/refund`, {});
      setCustomers(prev => prev.map(c => ((c as any).id === customer.id ? res.data : c)));
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Failed to mark customer as refunded.');
    }
  }

  async function issueOrderRefund(id: string) {
    try {
      const res = await api.patch(`/orders/${id}/refund`, {});
      setOrders(prev => prev.map(o => (o.id === id ? res.data : o)));
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Failed to issue refund.');
    }
  }

  return (
    <DataContext.Provider
      value={{
        orders, ordersLoading, ordersError,
        vendors, vendorsLoading, vendorsError,
        customers, customersLoading, customersError, complaints,
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