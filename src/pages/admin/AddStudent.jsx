import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContextCore';
import { addStudent } from '../../services/api';

const AddStudent = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    // User Data
    username: '',
    password: '',
    email: '',
    // Profile Data
    name: '',
    class: '',
    stream: '',
    rollNo: '',
    avatarUrl: '',
    feeStatus: 'Pending'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addMutation = useMutation({
    mutationFn: (data) => addStudent(token, data.userData, data.profileData),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['students'] });
        alert('Student registered successfully!');
        navigate('/admin/students');
      } else {
        console.error('Add Student API Error:', response);
        setError(response.error?.message || response.message || 'Failed to register student');
      }
    },
    onError: (err) => {
      console.error('Add Student Page Error:', err);
      setError('Connection error. Please try again.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const userData = {
      username: formData.username,
      password: formData.password,
      email: formData.email
    };

    const profileData = {
      name: formData.name,
      class: formData.class,
      stream: formData.stream,
      rollNo: Number(formData.rollNo),
      avatarUrl: formData.avatarUrl,
      feeStatus: formData.feeStatus,
      rank: 0,
      overallGPA: 0
    };

    addMutation.mutate({ userData, profileData });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button 
          type="button"
          onClick={() => navigate('/admin/students')}
          className="p-2 hover:bg-surface-dark/10 rounded-full transition-colors text-text-secondary"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-main dark:text-white">New Student Registration</h1>
          <p className="text-sm text-text-secondary">Create a new student account and academic profile</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Information */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark p-6 shadow-sm">
          <h2 className="text-lg font-bold text-text-main dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">account_circle</span>
            Account Credentials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Username</label>
              <input 
                required
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="e.g. jdoe_2026"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Initial Password</label>
              <input 
                required
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <input 
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="student@nast.edu"
              />
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark p-6 shadow-sm">
          <h2 className="text-lg font-bold text-text-main dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">school</span>
            Academic Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Full Name</label>
              <input 
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Class / Grade</label>
              <input 
                required
                name="class"
                value={formData.class}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="e.g. 10A"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Stream / Department</label>
              <input 
                required
                name="stream"
                value={formData.stream}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="e.g. Science"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Roll Number</label>
              <input 
                required
                type="number"
                name="rollNo"
                value={formData.rollNo}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Fee Status</label>
              <select 
                name="feeStatus"
                value={formData.feeStatus}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Photo URL (Avatar)</label>
              <input 
                type="url"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button 
            type="button"
            onClick={() => navigate('/admin/students')}
            className="px-6 py-2.5 rounded-xl border border-border-light dark:border-border-dark font-semibold text-text-secondary hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={addMutation.isPending}
            className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {addMutation.isPending ? (
              <>
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Registering...
              </>
            ) : 'Register Student'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;
