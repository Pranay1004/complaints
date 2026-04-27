'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { UserInfo } from '@/lib/id-validator';
import { Bell } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem', alignItems: 'center', gap: '1.5rem' }}>
          {/* Notification Bell */}
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <div className="glass" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
              <Bell size={20} />
            </div>
            <div style={{ 
              position: 'absolute', 
              top: '2px', 
              right: '2px', 
              width: '10px', 
              height: '10px', 
              background: '#ef4444', 
              borderRadius: '50%', 
              border: '2px solid var(--background)' 
            }} />
          </div>

          <div className="glass" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.id}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', textTransform: 'capitalize' }}>
                {user.role} {user.type ? `• ${user.type}` : ''}
              </div>
            </div>
            <div style={{ width: '36px', height: '36px', background: 'var(--secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--primary)', border: '1px solid var(--border)' }}>
              {user.id.substring(0, 2)}
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
