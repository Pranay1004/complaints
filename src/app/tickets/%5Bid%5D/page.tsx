'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Clock, CheckCircle, MessageSquare, 
  User, Calendar, Tag, AlertTriangle, Send, Loader2, ChevronRight
} from 'lucide-react';
import DashboardLayout from '@/app/dashboard/layout';
import { supabase } from '@/lib/supabase';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchTicketData();
  }, [params.id]);

  async function fetchTicketData() {
    try {
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', params.id)
        .single();

      if (ticketError) throw ticketError;
      setTicket(ticketData);

      const { data: updatesData } = await supabase
        .from('ticket_updates')
        .select('*')
        .eq('ticket_id', params.id)
        .order('created_at', { ascending: true });

      setUpdates(updatesData || []);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(newStatus: string) {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticket.id);

      if (error) throw error;

      // Add a system update record
      await supabase.from('ticket_updates').insert({
        ticket_id: ticket.id,
        author_id: user.id,
        content: `Status changed to ${newStatus}`,
        type: 'status_change'
      });

      fetchTicketData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('ticket_updates').insert({
        ticket_id: ticket.id,
        author_id: user.id,
        content: newComment,
        type: user.role === 'student' ? 'comment' : 'official_reply'
      });

      if (error) throw error;
      setNewComment('');
      fetchTicketData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <DashboardLayout><div className="flex-center" style={{ height: '50vh' }}><Loader2 className="animate-spin" /></div></DashboardLayout>;
  if (!ticket) return <DashboardLayout><div>Ticket not found</div></DashboardLayout>;

  const isAdmin = user?.role !== 'student';

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Navigation Header */}
        <button 
          onClick={() => router.back()} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--muted-foreground)', marginBottom: '1.5rem', padding: 0 }}
        >
          <ArrowLeft size={16} />
          Back to list
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Ticket Card */}
            <div className="glass" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>TIC-{ticket.id}</span>
                    {ticket.priority === 'Urgent' && (
                      <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '10px', fontWeight: 700 }}>URGENT</span>
                    )}
                  </div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{ticket.title}</h1>
                </div>
                <div style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '20px', 
                  background: 'var(--secondary)', 
                  fontSize: '0.875rem', 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ticket.status === 'Resolved' ? '#10b981' : '#3b82f6' }} />
                  {ticket.status}
                </div>
              </div>

              <div style={{ color: 'var(--foreground)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '2rem' }}>
                {ticket.description}
              </div>

              {ticket.image_url && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Attached Evidence:</p>
                  <img 
                    src={ticket.image_url} 
                    alt="Ticket attachment" 
                    style={{ maxWidth: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} 
                  />
                </div>
              )}
            </div>

            {/* Discussion Timeline */}
            <div className="glass" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={18} />
                Discussion Timeline
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                {updates.length === 0 ? (
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No updates yet.</p>
                ) : (
                  updates.map((update) => (
                    <div key={update.id} style={{ 
                      display: 'flex', 
                      gap: '1rem',
                      padding: update.type === 'official_reply' ? '1rem' : '0',
                      background: update.type === 'official_reply' ? 'rgba(56, 189, 248, 0.05)' : 'transparent',
                      borderRadius: 'var(--radius)',
                      border: update.type === 'official_reply' ? '1px solid rgba(56, 189, 248, 0.1)' : 'none'
                    }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                            {update.author_id} {update.type === 'official_reply' && <span style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}>• Official</span>}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                            {new Date(update.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--foreground)' }}>{update.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <textarea 
                  placeholder={isAdmin ? "Type an official response..." : "Add a comment..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ width: '100%', minHeight: '100px', padding: '1rem', paddingRight: '4rem' }}
                />
                <button 
                  onClick={handleAddComment}
                  disabled={submitting || !newComment.trim()}
                  style={{ position: 'absolute', bottom: '1rem', right: '1rem', width: '40px', height: '40px', borderRadius: '50%', padding: 0 }}
                  className="primary flex-center"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Info & Admin Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>
            
            {/* Admin Action Card */}
            {isAdmin && (
              <div className="glass" style={{ padding: '1.5rem', border: '1px solid var(--primary)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>Management Controls</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button 
                    onClick={() => handleUpdateStatus('In Progress')} 
                    className="secondary" 
                    style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem' }}
                  >
                    <Clock size={16} /> Mark as In Progress
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('Resolved')} 
                    className="primary" 
                    style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem', background: '#10b981' }}
                  >
                    <CheckCircle size={16} /> Mark as Resolved
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('Closed')} 
                    className="secondary" 
                    style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem', color: '#ef4444' }}
                  >
                    <AlertTriangle size={16} /> Close Ticket
                  </button>
                </div>
              </div>
            )}

            <div className="glass" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Ticket Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <User size={16} style={{ color: 'var(--muted-foreground)' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Reported By</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{ticket.reporter_id}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Calendar size={16} style={{ color: 'var(--muted-foreground)' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Date Filed</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{new Date(ticket.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Tag size={16} style={{ color: 'var(--muted-foreground)' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Category</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>{ticket.category}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
