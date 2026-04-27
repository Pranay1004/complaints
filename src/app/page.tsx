'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquare, Shield, Clock, BarChart3, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LandingPage() {
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRecent() {
      const { data } = await supabase
        .from('tickets')
        .select('category, status, title')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) setRecentUpdates(data);
    }
    fetchRecent();
  }, []);

  return (
    <main style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      {/* News Ticker Banner */}
      <div style={{ 
        background: 'rgba(56, 189, 248, 0.1)', 
        borderBottom: '1px solid var(--border)', 
        height: '40px', 
        display: 'flex', 
        alignItems: 'center',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        position: 'relative'
      }}>
        <div style={{ 
          background: 'var(--primary)', 
          color: 'var(--background)', 
          padding: '0 1rem', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          fontSize: '0.75rem', 
          fontWeight: 800,
          zIndex: 10,
          position: 'absolute',
          left: 0,
          boxShadow: '10px 0 20px rgba(0,0,0,0.5)'
        }}>
          LIVE UPDATES
        </div>
        
        <motion.div 
          animate={{ x: ['100%', '-100%'] }}
          transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
          style={{ display: 'flex', gap: '4rem', paddingLeft: '120px' }}
        >
          {recentUpdates.length > 0 ? recentUpdates.map((update, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', fontWeight: 500 }}>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>[{update.category.toUpperCase()}]</span>
              <span>{update.title}</span>
              <span style={{ 
                padding: '0.1rem 0.5rem', 
                borderRadius: '10px', 
                background: update.status === 'Resolved' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                color: update.status === 'Resolved' ? '#4ade80' : '#fbbf24',
                fontSize: '0.75rem'
              }}>
                {update.status}
              </span>
            </div>
          )) : (
            <div style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
              IIST Complaint Management System is now online. Awaiting campus reports...
            </div>
          )}
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield color="var(--background)" size={24} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>IIST CMS</span>
        </div>
        <Link href="/login">
          <button className="secondary">Sign In</button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="container" style={{ paddingTop: '6rem', paddingBottom: '8rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span style={{ 
            background: 'rgba(56, 189, 248, 0.1)', 
            color: 'var(--primary)', 
            padding: '0.5rem 1rem', 
            borderRadius: '20px', 
            fontSize: '0.875rem', 
            fontWeight: 600,
            marginBottom: '1.5rem',
            display: 'inline-block'
          }}>
            Digitizing Governance at IIST Trivandrum
          </span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Swift resolution for every <br />
            <span style={{ color: 'var(--primary)' }}>campus concern.</span>
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            A unified platform for students, staff, and authorities to manage complaints with transparency and real-time tracking.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/login">
              <button className="primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
                Launch Portal <ArrowRight size={20} />
              </button>
            </Link>
            <button className="secondary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
              View Public Stats
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 0', background: 'rgba(255,255,255,0.02)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <FeatureCard 
              icon={<MessageSquare size={24} />} 
              title="Easy Filing" 
              description="Register complaints across hostel, academic, or maintenance departments in seconds."
            />
            <FeatureCard 
              icon={<Clock size={24} />} 
              title="Real-time Tracking" 
              description="Get instant updates on your ticket status and regular intimations via the portal."
            />
            <FeatureCard 
              icon={<BarChart3 size={24} />} 
              title="Long-term Insights" 
              description="Data-driven tracking to identify and resolve recurring campus issues permanently."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass" style={{ padding: '2rem' }}>
      <div style={{ color: 'var(--primary)', marginBottom: '1.25rem' }}>{icon}</div>
      <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>{title}</h3>
      <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}
