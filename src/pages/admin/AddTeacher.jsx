import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContextCore';
import { addTeacher } from '../../services/api';

const AddTeacher = () => {
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
    subject_code: '',
    designation: '',
    avatarUrl: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addMutation = useMutation({
    mutationFn: (data) => addTeacher(token, data.userData, data.profileData),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['teachers'] });
        alert('Teacher registered successfully!');
        navigate('/admin/teachers');
      } else {
        console.error('Add Teacher API Error:', response);
        setError(response.error?.message || response.message || 'Failed to register teacher');
      }
    },
    onError: (err) => {
      console.error('Add Teacher Page Error:', err);
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
      subject_code: formData.subject_code,
      designation: formData.designation,
      avatarUrl: formData.avatarUrl
    };

    addMutation.mutate({ userData, profileData });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button 
          type="button"
          onClick={() => navigate('/admin/teachers')}
          className="p-2 hover:bg-surface-dark/10 rounded-full transition-colors text-text-secondary"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-main dark:text-white">New Faculty Registration</h1>
          <p className="text-sm text-text-secondary">Create a new teacher account and professional profile</p>
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
            <span className="material-symbols-outlined text-primary">badge</span>
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
                placeholder="e.g. prof_wilson"
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
                placeholder="teacher@nast.edu"
              />
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark p-6 shadow-sm">
          <h2 className="text-lg font-bold text-text-main dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person_apron</span>
            Professional Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Full Name (with Title)</label>
              <input 
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="e.g. Dr. Sarah Xavier"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Designation</label>
              <input 
                required
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="e.g. Senior Lecturer"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Subject Code / Department</label>
              <input 
                required
                name="subject_code"
                value={formData.subject_code}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="e.g. PHY-101"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Photo URL (Avatar)</label>
              <input 
                type="url"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="https://example.com/teacher_photo.jpg"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button 
            type="button"
            onClick={() => navigate('/admin/teachers')}
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
            ) : 'Register Faculty'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTeacher;
