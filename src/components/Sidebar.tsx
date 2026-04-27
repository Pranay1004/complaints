'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Ticket, 
  Settings, 
  LogOut, 
  User,
  ShieldAlert,
  ClipboardList,
  Inbox
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState('student');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserRole(user.role || 'student');
    }
  }, []);

  const isAdmin = userRole !== 'student';

  // Different menu items for Students vs Admins
  const studentMenu = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', href: '/dashboard' },
    { icon: <PlusCircle size={20} />, label: 'New Complaint', href: '/tickets/create' },
    { icon: <Ticket size={20} />, label: 'My Tickets', href: '/tickets' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/settings' },
  ];

  const adminMenu = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', href: '/dashboard' },
    { icon: <Inbox size={20} />, label: 'Incoming Complaints', href: '/tickets' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/settings' },
  ];

  const menuItems = isAdmin ? adminMenu : studentMenu;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className="glass" style={{ 
      width: '280px', 
      height: 'calc(100vh - 2rem)', 
      margin: '1rem',
      display: 'flex', 
      flexDirection: 'column',
      padding: '1.5rem',
      position: 'sticky',
      top: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', padding: '0 0.5rem' }}>
        <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldAlert color="var(--background)" size={18} />
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>IIST CMS</span>
      </div>

      {/* Role Badge */}
      {isAdmin && (
        <div style={{ 
          padding: '0.75rem 1rem', 
          background: 'rgba(56, 189, 248, 0.08)', 
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: 'var(--radius)', 
          marginBottom: '1.5rem',
          fontSize: '0.75rem',
          color: 'var(--primary)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          ⚡ {userRole} Portal
        </div>
      )}

      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius)',
                    color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                    background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                    transition: 'all 0.2s ease',
                    fontWeight: isActive ? 600 : 400
                  }}>
                    {item.icon}
                    {item.label}
                    {isActive && (
                      <motion.div 
                        layoutId="active"
                        style={{ marginLeft: 'auto', width: '4px', height: '4px', background: 'var(--primary)', borderRadius: '50%' }}
                      />
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            padding: '0.75rem 1rem',
            width: '100%',
            background: 'transparent',
            color: '#ef4444',
            textAlign: 'left'
          }}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
