import React, { useState, useEffect } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/data/firebase';
import { IconLock, IconLogin, IconSun as Sun, IconMoon as Moon } from '@/ui/icons';

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(() => document.body.classList.contains('dark-theme'));

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.body.classList.add('dark-theme');
      setIsDark(true);
    } else {
      document.body.classList.remove('dark-theme');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    document.body.classList.toggle('dark-theme', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setIsDark(next);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const whitelistedEmail = 'hamed.rakeeen@gmail.com';
      const userEmail = user.email?.toLowerCase();

      if (userEmail !== whitelistedEmail) {
        await auth.signOut();
        setError(`Unauthorized access: ${user.email} is not in the whitelist.`);
      }
    } catch (err: any) {
      console.error(err);
      setError('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300" style={{ background: 'var(--paper)' }}>
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 z-20 cursor-pointer"
        title={isDark ? 'Switch to light' : 'Switch to dark'}
      >
        {isDark ? (
          <Sun size={18} className="text-ink/40 hover:text-ink transition-colors" />
        ) : (
          <Moon size={18} className="text-ink/40 hover:text-ink transition-colors" />
        )}
      </button>
      
      <div className="w-full max-w-md brutalist-card no-lift p-10 md:p-12 relative z-10 text-center">
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 bg-sepia/20 flex items-center justify-center border border-ink text-ink" style={{ borderRadius: 0 }}>
            <IconLock size={28} />
          </div>
        </div>
        
        <div className="mb-10">
          <h1 className="text-3xl font-black uppercase tracking-tight">Vault gatekeeper</h1>
        </div>

        {error && (
          <div className="bg-rust/10 border-2 border-rust text-rust text-[11px] font-black px-4 py-3 mb-8" style={{ borderRadius: 0 }}>
             {error}
          </div>
        )}

        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="btn-brutalist w-full flex items-center justify-center gap-3 py-4 text-base font-mono-main"
        >
          {loading ? (
             <div className="w-5 h-5 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
          ) : (
            <>
              <IconLogin size={20} />
              <span>CONTINUE WITH GOOGLE</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
