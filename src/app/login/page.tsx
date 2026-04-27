'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, ShieldCheck, AlertCircle, Key } from 'lucide-react';
import { validateID } from '@/lib/id-validator';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!id || !password) {
      setError('Please enter both your code and password');
      return;
    }

    // Validate ID format (SC25M001, HA00001, etc.)
    const userInfo = validateID(id);
    if (!userInfo) {
      setError('Invalid IIST Identity Code format.');
      return;
    }

    setLoading(true);

    try {
      // Check if a profile already exists for this identity code
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('identity_code', userInfo.id)
        .single();

      if (profile) {
        // Profile exists — verify password
        const storedPassword = profile.password || userInfo.id; // fallback: ID = default password
        if (storedPassword !== password) {
          throw new Error('Incorrect password. Please try again.');
        }
      } else {
        // First login — create profile with the entered password
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            identity_code: userInfo.id,
            role: userInfo.role,
            password: password,
            full_name: userInfo.id,
            department: userInfo.role === 'student' ? 'Student' : userInfo.role
          });
        if (createError) throw createError;
      }

      // Store session in localStorage
      localStorage.setItem('user', JSON.stringify({ 
        ...userInfo, 
        uuid: userInfo.id,
        full_name: profile?.full_name || userInfo.id
      }));

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', padding: '1rem' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass card-shadow" 
        style={{ width: '100%', maxWidth: '420px', padding: '3rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="flex-center" style={{ 
            width: '64px', 
            height: '64px', 
            background: 'rgba(56, 189, 248, 0.1)', 
            borderRadius: '16px',
            margin: '0 auto 1.5rem',
            color: 'var(--primary)'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>IIST Portal</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Secure Complaint Management</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <label>Identity Code</label>
            <input 
              type="text" 
              placeholder="e.g. SC25B042" 
              value={id}
              onChange={(e) => setId(e.target.value.toUpperCase())}
              style={{ width: '100%' }}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%' }}
              required
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                color: '#ef4444',
                fontSize: '0.8125rem',
                padding: '0.75rem',
                background: 'rgba(239, 68, 68, 0.05)',
                borderRadius: 'var(--radius)',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            className="primary" 
            style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Verifying...' : (
              <>
                <LogIn size={18} />
                Enter Portal
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
          <p><strong>First time?</strong> Use your ID as password.<br/>You can change it in settings later.</p>
        </div>
      </motion.div>
    </div>
  );
}
