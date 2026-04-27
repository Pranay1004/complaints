'use client';

import { 
  Ticket, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Activity,
  Loader2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { label: 'Active Tickets', value: '0', icon: <Clock size={20} />, color: '#38bdf8' },
    { label: 'Resolved', value: '0', icon: <CheckCircle2 size={20} />, color: '#4ade80' },
    { label: 'Pending Action', value: '0', icon: <AlertCircle size={20} />, color: '#fbbf24' },
    { label: 'Total Filed', value: '0', icon: <Ticket size={20} />, color: '#818cf8' },
  ]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) return;
        const user = JSON.parse(userData);
        setIsAdmin(user.role !== 'student');

        let query = supabase.from('tickets').select('*');

        if (user.role === 'student') {
          query = query.eq('reporter_id', user.uuid);
        } else {
          const roleToCategory: Record<string, string> = {
            hostel: 'hostel', academic: 'academic', maintenance: 'maintenance',
            faculty: 'academic', staff: 'other',
          };
          query = query.eq('category', roleToCategory[user.role] || user.role);
        }

        const { data: tickets, error } = await query;

        if (error) throw error;

        // Filter relevant stats for Admin vs Student
        const counts = {
          active: tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length,
          resolved: tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length,
          pending: tickets.filter(t => t.status === 'Open').length,
          total: tickets.length
        };

        setStats([
          { label: isAdmin ? 'Open Complaints' : 'Active Tickets', value: counts.active.toString(), icon: <Clock size={20} />, color: '#38bdf8' },
          { label: 'Resolved', value: counts.resolved.toString(), icon: <CheckCircle2 size={20} />, color: '#4ade80' },
          { label: isAdmin ? 'Needs Attention' : 'Pending Action', value: counts.pending.toString(), icon: <AlertCircle size={20} />, color: '#fbbf24' },
          { label: isAdmin ? 'Total Received' : 'Total Filed', value: counts.total.toString(), icon: <Ticket size={20} />, color: '#818cf8' },
        ]);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();

    // 2. Real-time Listener for new tickets
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tickets' },
        (payload) => {
          console.log('New ticket received:', payload);
          // Only notify if it's relevant to the admin's role
          const userData = localStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            if (user.role !== 'student' && payload.new.category.toLowerCase() === user.role) {
              alert(`🔔 New ${payload.new.category} Ticket: ${payload.new.title}`);
              fetchStats(); // Refresh stats
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          {isAdmin ? 'Department Dashboard' : 'Dashboard Overview'}
        </h1>
        <p style={{ color: 'var(--muted-foreground)' }}>
          {isAdmin 
            ? 'Manage and resolve complaints assigned to your department.'
            : "Welcome back! Here's what's happening with your tickets."}
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass"
            style={{ padding: '1.5rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: `${stat.color}15`, 
                color: stat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <TrendingUp size={12} /> +2.5%
              </div>
            </div>
            {loading ? (
              <Loader2 className="animate-spin" size={24} style={{ marginBottom: '0.25rem' }} />
            ) : (
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{stat.value}</div>
            )}
            <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity & Charts Placeholder */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Activity size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.125rem' }}>Recent Activity</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <ActivityItem 
              title="Portal Active" 
              time="Just now" 
              description="The IIST Complaint Management System is now live."
              status="resolved"
            />
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
              Your real-time activity will appear here.
            </p>
          </div>
        </div>

        <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: '100%', height: '200px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <BarChart3 size={48} color="var(--muted-foreground)" style={{ opacity: 0.5 }} />
          </div>
          <h4 style={{ marginBottom: '0.5rem' }}>Resolution Trends</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Real-time analytics will be enabled as tickets are processed.</p>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ title, time, description, status }: any) {
  return (
    <div style={{ padding: '0.75rem', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{title}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{time}</span>
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>{description}</p>
    </div>
  );
}

function BarChart3({ size, color, style }: any) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      style={style}
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
