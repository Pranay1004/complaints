'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import DashboardLayout from '@/app/dashboard/layout';
import { supabase } from '@/lib/supabase';

export default function TicketsPage() {
  const [search, setSearch] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchTickets() {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) return;
        const user = JSON.parse(userData);
        const adminRole = user.role !== 'student';
        setIsAdmin(adminRole);

        let query = supabase
          .from('tickets')
          .select('*')
          .order('created_at', { ascending: false });

        if (user.role === 'student') {
          // Students only see their own tickets
          query = query.eq('reporter_id', user.uuid);
        } else {
          // Admins see ALL tickets in their department category
          // Map role names to category values used in the ticket form
          const roleToCategory: Record<string, string> = {
            hostel: 'hostel',
            academic: 'academic',
            maintenance: 'maintenance',
            faculty: 'academic',
            staff: 'other',
          };
          const category = roleToCategory[user.role] || user.role;
          query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (error) throw error;
        setTickets(data || []);
      } catch (err) {
        console.error('Error fetching tickets:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, []);

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {isAdmin ? 'Incoming Complaints' : 'My Tickets'}
          </h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            {isAdmin 
              ? 'Review, address, and resolve complaints filed by students.'
              : 'Track the status of your reported issues and view resolutions.'}
          </p>
        </div>
        {!isAdmin && (
          <Link href="/tickets/create">
            <button className="primary">File New Complaint</button>
          </Link>
        )}
      </div>

      <div className="glass" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} size={18} />
          <input 
            type="text" 
            placeholder="Search tickets by ID, title, or status..." 
            style={{ width: '100%', paddingLeft: '3rem' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="secondary" style={{ display: 'flex', gap: '0.5rem' }}>
          <Filter size={18} /> Filter
        </button>
      </div>

      <div className="glass" style={{ overflow: 'hidden', minHeight: '200px', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
            <Loader2 className="animate-spin" size={24} /> Loading tickets...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>Ticket ID</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>Subject</th>
                {isAdmin && <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>Reported By</th>}
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>Priority</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>Status</th>
                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>Date</th>
                <th style={{ padding: '1.25rem 1.5rem', width: '80px' }}></th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                    {isAdmin ? 'No complaints pending in your department.' : 'No tickets found. File a complaint to get started.'}
                  </td>
                </tr>
              ) : (
                tickets.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toString().includes(search.toLowerCase())).map((ticket, i) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={ticket.id} 
                    onClick={() => router.push(`/tickets/${ticket.id}`)}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s ease', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.875rem' }}>TIC-{ticket.id}</td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>
                      <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ticket.title}
                      </div>
                    </td>
                    {isAdmin && (
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                        {ticket.reporter_id}
                      </td>
                    )}
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ 
                        fontSize: '0.75rem', padding: '0.25rem 0.625rem', borderRadius: '12px', 
                        background: ticket.priority === 'Critical' ? 'rgba(239,68,68,0.1)' : ticket.priority === 'High' ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.05)', 
                        color: ticket.priority === 'Critical' ? '#ef4444' : ticket.priority === 'High' ? '#fbbf24' : 'var(--muted-foreground)',
                        border: '1px solid var(--border)' 
                      }}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <Link href={`/tickets/${ticket.id}`}>
                        <button style={{ background: 'transparent', color: 'var(--muted-foreground)' }}>
                          <ExternalLink size={18} />
                        </button>
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, any> = {
    'Open': { bg: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', icon: <Clock size={14} /> },
    'In Progress': { bg: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', icon: <Clock size={14} /> },
    'Resolved': { bg: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', icon: <CheckCircle2 size={14} /> },
    'Closed': { bg: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', icon: <AlertCircle size={14} /> },
  };

  const style = styles[status] || styles['Open'];

  return (
    <span style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '0.375rem', 
      padding: '0.25rem 0.75rem', 
      borderRadius: '20px', 
      background: style.bg, 
      color: style.color, 
      fontSize: '0.75rem', 
      fontWeight: 600 
    }}>
      {style.icon}
      {status}
    </span>
  );
}
