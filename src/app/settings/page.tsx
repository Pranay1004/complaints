'use client';

import { useState, useEffect } from 'react';
import { User, Bell, Shield, Moon, Globe, Save } from 'lucide-react';
import DashboardLayout from '@/app/dashboard/layout';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  if (!user) return <DashboardLayout><div>Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Settings</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Manage your profile and portal preferences.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Profile Section */}
          <div className="glass" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <User size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.125rem' }}>Profile Information</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label>Full Name</label>
                <input type="text" defaultValue={user.full_name} style={{ width: '100%' }} />
              </div>
              <div>
                <label>Identity Code</label>
                <input type="text" value={user.id} disabled style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <div>
                <label>Department / Role</label>
                <input type="text" value={user.role.toUpperCase()} disabled style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
              <div>
                <label>Email (Virtual)</label>
                <input type="text" value={`${user.id.toLowerCase()}@iist.ac.in`} disabled style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="glass" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Bell size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.125rem' }}>Notifications</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked />
                <span>Real-time dashboard alerts for ticket updates</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked />
                <span>Weekly summary reports of resolved issues</span>
              </label>
            </div>
          </div>

          {/* Security Section */}
          <SecuritySection user={user} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button className="primary" onClick={() => {
              setSaving(true);
              setTimeout(() => setSaving(false), 1000);
            }}>
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SecuritySection({ user }: { user: any }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ password: newPassword })
        .eq('identity_code', user.id);

      if (error) throw error;
      alert('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="glass" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Shield size={20} color="var(--primary)" />
        <h3 style={{ fontSize: '1.125rem' }}>Security</h3>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'flex-end' }}>
        <div>
          <label>New Password</label>
          <input 
            type="password" 
            placeholder="Min 8 characters" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: '100%' }} 
          />
        </div>
        <div>
          <label>Confirm Password</label>
          <input 
            type="password" 
            placeholder="Repeat password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%' }} 
          />
        </div>
      </div>
      <button 
        className="secondary" 
        style={{ marginTop: '1.5rem' }} 
        onClick={handleUpdatePassword}
        disabled={updating}
      >
        {updating ? 'Updating...' : 'Update Password'}
      </button>
    </div>
  );
}
