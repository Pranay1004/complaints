'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Upload, X, Loader2, Zap } from 'lucide-react';
import DashboardLayout from '@/app/dashboard/layout';
import { supabase } from '@/lib/supabase';

export default function CreateTicketPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category) {
      alert('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('User not found');
      const user = JSON.parse(userData);

      let image_url = null;
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('ticket-attachments')
          .upload(fileName, image);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('ticket-attachments').getPublicUrl(fileName);
        image_url = publicUrl;
      }

      const { error } = await supabase.from('tickets').insert({
        title, description, category,
        priority: isUrgent ? 'Urgent' : 'Standard',
        reporter_id: user.uuid,
        image_url,
        status: 'Open'
      });

      if (error) throw error;
      router.push('/tickets');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>File a New Complaint</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Provide details to help us resolve your issue faster.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Row 1: Title + Category side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="input-group">
              <label>Subject / Short Title</label>
              <input
                type="text"
                placeholder="Briefly describe the issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="">Select Category</option>
                <option value="hostel">Hostel Maintenance</option>
                <option value="academic">Academic / Course</option>
                <option value="it">IT Support</option>
                <option value="maintenance">Campus Maintenance</option>
                <option value="finance">Finance / Fees</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Row 2: Full-width description */}
          <div className="input-group">
            <label>Detailed Description</label>
            <textarea
              placeholder="Provide as much detail as possible (room numbers, dates, specific issue...)"
              style={{ minHeight: '160px', width: '100%', resize: 'vertical' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Row 3: Image upload */}
          <div className="input-group">
            <label>Attach Proof <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>(optional)</span></label>
            <div style={{
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius)',
              padding: '1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative',
              background: 'rgba(255,255,255,0.01)'
            }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }}
              />
              {image ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{image.name}</span>
                  <button type="button" onClick={() => setImage(null)} style={{ background: 'transparent', color: '#ef4444' }}><X size={16} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--muted-foreground)' }}>
                  <Upload size={20} />
                  <span>Click or drag to upload (Max 5MB)</span>
                </div>
              )}
            </div>
          </div>

          {/* Row 4: Bottom bar — urgent toggle on left, actions on right */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
            {/* Urgent toggle pill */}
            <button
              type="button"
              onClick={() => setIsUrgent(!isUrgent)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                border: `1px solid ${isUrgent ? '#ef4444' : 'var(--border)'}`,
                background: isUrgent ? 'rgba(239,68,68,0.1)' : 'transparent',
                color: isUrgent ? '#ef4444' : 'var(--muted-foreground)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Zap size={15} fill={isUrgent ? '#ef4444' : 'none'} />
              {isUrgent ? 'Marked Urgent' : 'Mark as Urgent'}
            </button>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" onClick={() => router.back()} className="secondary">Cancel</button>
              <button type="submit" className="primary" disabled={loading} style={{ minWidth: '140px' }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} /> Submit Ticket</>}
              </button>
            </div>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
}
