import { useState } from 'react';
import { useAuth } from '../../context/AuthContextCore';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!username || !password) {
      setError('Please enter both username and password');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(username, password);
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-6">
      <div className="w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl border border-border-light dark:border-border-dark p-8 md:p-10">
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
            <span className="material-symbols-outlined text-5xl">school</span>
          </div>
          <h1 className="text-2xl font-bold text-text-main dark:text-white tracking-tight">Dazzling ERP</h1>
          <p className="text-text-secondary mt-1">Sign in to your admin account</p>
        </div>
        
        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm border border-red-100 dark:border-red-900/30">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-text-main dark:text-white mb-2">Username</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xl">person</span>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username" 
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-text-main dark:text-white mb-2">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xl">lock</span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password" 
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="size-4 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary/20" />
              <span className="text-sm text-text-secondary group-hover:text-text-main transition-colors">Remember me</span>
            </label>
            <button type="button" className="text-sm font-medium text-primary hover:underline">Forgot password?</button>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Logging in...
              </>
            ) : 'Log In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border-light dark:border-border-dark text-center">
          <p className="text-sm text-text-secondary">
            Need help? <button className="text-primary font-medium hover:underline">Contact Support</button>
          </p>
        </div>
      </div>
      
      {/* Footer info */}
      <p className="mt-8 text-sm text-text-secondary">
        &copy; 2026 Dazzling ERP Systems. All rights reserved.
      </p>
    </div>
  );
};

export default LoginPage;
