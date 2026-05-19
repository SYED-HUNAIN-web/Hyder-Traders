'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, UserMinus, UserCheck, User, Mail, Phone, Calendar, 
  DollarSign, ShoppingBag, X, ShieldAlert, Award, Shield, UserX, Loader2, CheckCircle2
} from 'lucide-react';
import { 
  getAllUsers, blockUserProfile, changeUserRole, getOrdersByUserId, deleteUserProfile, UserProfile, Order 
} from '@/services/firestore';

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'admin' | 'user'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Blocked'>('All');

  // Debounce search input value changes to keep UI extremely snappy
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Selected User Modal State
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch initial users list
  const loadUsersData = async () => {
    setIsLoading(true);
    try {
      const usersList = await getAllUsers();
      setUsers(usersList);
    } catch (err) {
      console.error('Failed to retrieve registered users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsersData();
  }, []);

  // Fetch orders for a user when selected
  useEffect(() => {
    if (selectedUser) {
      const fetchUserOrders = async () => {
        setIsOrdersLoading(true);
        try {
          const list = await getOrdersByUserId(selectedUser.uid);
          setUserOrders(list);
        } catch (err) {
          console.error(`Failed to fetch orders for user ${selectedUser.uid}:`, err);
        } finally {
          setIsOrdersLoading(false);
        }
      };
      fetchUserOrders();
    } else {
      setUserOrders([]);
    }
  }, [selectedUser]);

  // Action: Toggle Block Status
  const handleToggleBlock = async (user: UserProfile) => {
    setUpdatingUserId(user.uid);
    const newBlockedState = !user.blocked;
    try {
      await blockUserProfile(user.uid, newBlockedState);
      
      // Optimistic/state update
      setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, blocked: newBlockedState } : u));
      if (selectedUser?.uid === user.uid) {
        setSelectedUser(prev => prev ? { ...prev, blocked: newBlockedState } : null);
      }
      
      triggerToast(`User "${user.fullName}" has been successfully ${newBlockedState ? 'Blocked' : 'Unblocked'}.`);
    } catch (err) {
      console.error('Failed to toggle block status:', err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Action: Toggle Role
  const handleChangeRole = async (user: UserProfile, newRole: 'admin' | 'user') => {
    setUpdatingUserId(user.uid);
    try {
      await changeUserRole(user.uid, newRole);
      
      // State update
      setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, role: newRole } : u));
      if (selectedUser?.uid === user.uid) {
        setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
      }
      
      triggerToast(`User "${user.fullName}" is now registered as an ${newRole === 'admin' ? 'Administrator' : 'Customer'}.`);
    } catch (err) {
      console.error('Failed to change user role:', err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Action: Delete User Profile permanently from Database
  const handleDeleteUser = async (user: UserProfile) => {
    if (window.confirm(`⚠️ PERMANENT DELETION WARNING:\n\nAre you sure you want to permanently delete the customer profile for "${user.fullName}"?\nThis action CANNOT be undone.`)) {
      setUpdatingUserId(user.uid);
      try {
        await deleteUserProfile(user.uid);
        
        // State update
        setUsers(prev => prev.filter(u => u.uid !== user.uid));
        if (selectedUser?.uid === user.uid) {
          setSelectedUser(null);
        }
        
        triggerToast(`User profile for "${user.fullName}" has been permanently deleted.`);
      } catch (err) {
        console.error('Failed to delete user profile:', err);
        alert('Failed to delete user profile from database.');
      } finally {
        setUpdatingUserId(null);
      }
    }
  };

  const triggerToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Filter logic memoized to prevent redundant calculation loops
  const filteredUsers = React.useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return users.filter(user => {
      const matchesSearch = !q || 
        (user.fullName || '').toLowerCase().includes(q) ||
        (user.email || '').toLowerCase().includes(q) ||
        (user.phoneNumber || '').toLowerCase().includes(q);
      
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      
      const matchesStatus = 
        statusFilter === 'All' || 
        (statusFilter === 'Blocked' && user.blocked === true) || 
        (statusFilter === 'Active' && !user.blocked);
        
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, debouncedSearch, roleFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-55/40 p-4 rounded-2xl border border-gray-100">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <User className="text-[#ff6600]" size={22} /> Users Directory
          </h2>
          <p className="text-xs text-gray-400 font-bold mt-1">Manage user access permissions, track accounts, and monitor customer metrics.</p>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-6 py-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-slide-in shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search & Filter tools */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <input
            type="text"
            placeholder="Search users by name, email, phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border-2 border-transparent bg-gray-50 rounded-2xl text-sm focus:border-[#ff6600]/10 focus:bg-white outline-none font-bold text-gray-900 transition-all"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Filter Role */}
        <div className="relative">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as any)}
            className="w-full pl-10 pr-4 py-3 border-2 border-transparent bg-gray-55 rounded-2xl text-sm focus:border-[#ff6600]/10 focus:bg-white outline-none font-bold text-gray-900 transition-all cursor-pointer appearance-none"
          >
            <option value="All">All Roles</option>
            <option value="user">Customers Only</option>
            <option value="admin">Administrators Only</option>
          </select>
          <Award size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Filter Status */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="w-full pl-10 pr-4 py-3 border-2 border-transparent bg-gray-55 rounded-2xl text-sm focus:border-[#ff6600]/10 focus:bg-white outline-none font-bold text-gray-900 transition-all cursor-pointer appearance-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Accounts</option>
            <option value="Blocked">Blocked Accounts</option>
          </select>
          <ShieldAlert size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Grid listing */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-[2.5rem] border border-gray-55 shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-[#ff6600] animate-spin" />
            <span className="text-xs text-gray-400 font-black uppercase tracking-widest">Loading Users Profile Directory...</span>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100/50">
            <UserX size={32} className="text-gray-400" />
          </div>
          <h3 className="text-base font-black text-gray-900">No users profiles found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto font-medium">No results match your search parameters. Try altering your filter inputs or matching queries.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Profile</th>
                  <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Access Role</th>
                  <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Purchases</th>
                  <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Spent</th>
                  <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined Date</th>
                  <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map(user => (
                  <tr key={user.uid} className="hover:bg-orange-50/5 transition-colors group">
                    {/* User profile info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-55 rounded-xl border border-gray-100 flex items-center justify-center shrink-0 text-gray-400 group-hover:bg-[#ff6600]/10 group-hover:text-[#ff6600] transition-colors font-bold">
                          {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User size={18} />}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-900 group-hover:text-[#ff6600] transition-colors">{user.fullName || 'Registered Customer'}</div>
                          <div className="text-xs text-gray-400 font-medium mt-0.5">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="py-4 px-6">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded-lg">
                          <Shield size={12} fill="currentColor" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                          Customer
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6 text-center">
                      {user.blocked ? (
                        <span className="inline-flex px-2.5 py-1 bg-red-50 border border-red-100 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-md">
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-md">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Total orders count */}
                    <td className="py-4 px-6 text-center font-extrabold text-sm text-gray-900">
                      {user.totalOrders || 0}
                    </td>

                    {/* Total spending */}
                    <td className="py-4 px-6 font-extrabold text-sm text-gray-900">
                      Rs. {(user.totalSpent || 0).toLocaleString()}
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-6 text-xs text-gray-400 font-bold">
                      {user.createdAt?.seconds ? (
                        new Date(user.createdAt.seconds * 1000).toLocaleDateString('en-PK', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })
                      ) : 'Historical User'}
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-gray-100 cursor-pointer shadow-sm"
                        >
                          Details
                        </button>
                        
                        {/* Toggle Block Action */}
                        <button
                          disabled={updatingUserId === user.uid}
                          onClick={() => handleToggleBlock(user)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors border cursor-pointer ${
                            user.blocked 
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100' 
                              : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100'
                          }`}
                          title={user.blocked ? 'Unblock User' : 'Block User'}
                        >
                          {updatingUserId === user.uid ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          ) : user.blocked ? (
                            <UserCheck size={15} />
                          ) : (
                            <UserMinus size={15} />
                          )}
                        </button>

                        {/* Delete User Direct Action */}
                        <button
                          disabled={updatingUserId === user.uid}
                          onClick={() => handleDeleteUser(user)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors border border-red-200 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white cursor-pointer"
                          title="Delete User Profile"
                        >
                          {updatingUserId === user.uid ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          ) : (
                            <UserX size={15} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected User Modal Details Backdrop */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-end animate-fade-in-backdrop">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl z-10 relative flex flex-col p-8 overflow-y-auto animate-slide-in-drawer border-l border-gray-100 rounded-l-[3rem]">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#ff6600]/10 rounded-2xl flex items-center justify-center text-[#ff6600] font-black text-2xl">
                  {selectedUser.fullName ? selectedUser.fullName.charAt(0).toUpperCase() : <User size={24} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{selectedUser.fullName || 'Registered User'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      selectedUser.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-gray-50 text-gray-400'
                    }`}>
                      {selectedUser.role}
                    </span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      selectedUser.blocked ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {selectedUser.blocked ? 'Blocked' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)} 
                className="w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-xl flex items-center justify-center transition-colors border border-gray-100/50 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Metrics Statistics Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-55/50 border border-gray-100/50 p-4 rounded-2xl flex flex-col">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Purchases</span>
                <span className="text-xl font-black text-gray-900 mt-1.5 flex items-center gap-1">
                  <ShoppingBag size={16} className="text-gray-400" /> {selectedUser.totalOrders || 0}
                </span>
              </div>
              <div className="bg-gray-55/50 border border-gray-100/50 p-4 rounded-2xl flex flex-col">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Spending</span>
                <span className="text-xl font-black text-[#ff6600] mt-1.5 flex items-center gap-0.5">
                  Rs. {(selectedUser.totalSpent || 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-gray-55/50 border border-gray-100/50 p-4 rounded-2xl flex flex-col">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Joined Date</span>
                <span className="text-xs font-bold text-gray-900 mt-2 flex items-center gap-1 shrink-0">
                  <Calendar size={14} className="text-gray-400" />
                  {selectedUser.createdAt?.seconds ? (
                    new Date(selectedUser.createdAt.seconds * 1000).toLocaleDateString('en-PK', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })
                  ) : 'Historical'}
                </span>
              </div>
            </div>

            {/* Account Details Box */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 mb-8">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Profile Details</h4>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-400 shrink-0" />
                  <div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Email Address</div>
                    <div className="font-extrabold text-gray-900 text-xs">{selectedUser.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-gray-400 shrink-0" />
                  <div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Phone Contact</div>
                    <div className="font-extrabold text-gray-900 text-xs">{selectedUser.phoneNumber || 'None provided'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address listings */}
            <div className="mb-8">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Saved Shipping Addresses</h4>
              {!selectedUser.addresses || selectedUser.addresses.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl border border-gray-100/50 p-6 text-center text-xs text-gray-400 font-bold">
                  This user has no saved addresses in their profile dashboard.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedUser.addresses.map((addr) => (
                    <div key={addr.id} className={`p-4 rounded-2xl border ${addr.isDefault ? 'border-[#ff6600]/20 bg-orange-50/10' : 'border-gray-100 bg-white'} relative`}>
                      {addr.isDefault && (
                        <span className="absolute top-3 right-3 bg-[#ff6600]/10 text-[#ff6600] text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                          Default
                        </span>
                      )}
                      <div className="text-xs font-bold text-gray-900 pr-12 leading-relaxed">{addr.street}</div>
                      <div className="text-[10px] font-bold text-gray-400 mt-2">{addr.city}, {addr.state} - {addr.zipCode}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Action Permissions controls */}
            <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 mb-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div>
                <h4 className="text-sm font-black text-gray-900 tracking-tight">Security & Permissions</h4>
                <p className="text-[11px] text-gray-400 font-bold mt-0.5">Toggle administrative access or block the account from placing checkouts.</p>
              </div>
              <div className="flex gap-2">
                {/* Delete Customer Profile */}
                <button
                  disabled={updatingUserId === selectedUser.uid}
                  onClick={() => handleDeleteUser(selectedUser)}
                  className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer bg-red-800 hover:bg-red-950 text-white transition-colors"
                >
                  {updatingUserId === selectedUser.uid ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <><UserX size={14} /> Delete Profile</>
                  )}
                </button>

                {/* Block / Unblock Toggle */}
                <button
                  disabled={updatingUserId === selectedUser.uid}
                  onClick={() => handleToggleBlock(selectedUser)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors ${
                    selectedUser.blocked 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {updatingUserId === selectedUser.uid ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : selectedUser.blocked ? (
                    <><UserCheck size={14} /> Unblock Account</>
                  ) : (
                    <><UserMinus size={14} /> Block Account</>
                  )}
                </button>

                {/* Role Switcher */}
                <select
                  disabled={updatingUserId === selectedUser.uid}
                  value={selectedUser.role}
                  onChange={e => handleChangeRole(selectedUser, e.target.value as any)}
                  className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-white border border-gray-200 text-gray-900 outline-none cursor-pointer hover:border-gray-300 transition-colors"
                >
                  <option value="user">Role: Customer</option>
                  <option value="admin">Role: Administrator</option>
                </select>
              </div>
            </div>

            {/* Recent Orders table */}
            <div className="mt-auto">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-55 pb-3 mb-4">Recent Transaction History</h4>
              {isOrdersLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="w-8 h-8 text-[#ff6600] animate-spin" />
                </div>
              ) : userOrders.length === 0 ? (
                <div className="bg-gray-55/50 border border-gray-100 rounded-2xl p-6 text-center text-xs text-gray-400 font-bold">
                  No orders have been submitted by this user profile yet.
                </div>
              ) : (
                <div className="border border-gray-50 rounded-2xl overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="py-3 px-4 text-[9px] font-black text-gray-400 uppercase tracking-wider">Tracking #</th>
                          <th className="py-3 px-4 text-[9px] font-black text-gray-400 uppercase tracking-wider">Total Amount</th>
                          <th className="py-3 px-4 text-[9px] font-black text-gray-400 uppercase tracking-wider text-center">Status</th>
                          <th className="py-3 px-4 text-[9px] font-black text-gray-400 uppercase tracking-wider text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-xs font-bold">
                        {userOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-gray-50/30">
                            <td className="py-3 px-4 text-gray-900 uppercase font-black tracking-tight">{ord.trackingNumber}</td>
                            <td className="py-3 px-4 text-gray-900">Rs. {ord.total.toLocaleString()}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded ${
                                ord.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                                ord.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                                ord.status === 'Shipped' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {ord.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-gray-400 text-[10px]">
                              {ord.createdAt?.seconds ? (
                                new Date(ord.createdAt.seconds * 1000).toLocaleDateString('en-PK')
                              ) : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
