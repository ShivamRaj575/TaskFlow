import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../api';
import { BarChart3, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardAPI.getStats();
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching stats", error);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="page-container" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading dashboard...</div>;

  return (
    <div className="page-container fade-in">
      <h1 style={{ marginBottom: '2rem' }}>Dashboard Snapshot</h1>
      
      <div className="grid-cols-4" style={{ marginBottom: '3rem' }}>
        <div className="glass-panel card">
          <div className="flex-between">
            <h3 style={{ color: 'var(--text-secondary)' }}>Total Tasks</h3>
            <BarChart3 color="var(--accent-color)" />
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.total_tasks}</p>
        </div>
        
        <div className="glass-panel card">
          <div className="flex-between">
            <h3 style={{ color: 'var(--text-secondary)' }}>Done</h3>
            <CheckCircle2 color="var(--success)" />
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.tasks_by_status['Done'] || 0}</p>
        </div>
        
        <div className="glass-panel card">
          <div className="flex-between">
            <h3 style={{ color: 'var(--text-secondary)' }}>In Progress</h3>
            <Clock color="var(--warning)" />
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.tasks_by_status['In Progress'] || 0}</p>
        </div>
        
        <div className="glass-panel card">
          <div className="flex-between">
            <h3 style={{ color: 'var(--text-secondary)' }}>Overdue</h3>
            <AlertCircle color="var(--danger)" />
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.overdue_tasks}</p>
        </div>
      </div>

      <div className="grid-cols-2">
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Tasks by Status</h3>
          {Object.entries(stats.tasks_by_status).map(([status, count]) => (
            <div key={status} className="flex-between" style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
              <span>{status}</span>
              <span style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.1)', padding: '0.25rem 1rem', borderRadius: '1rem' }}>{count}</span>
            </div>
          ))}
          {Object.keys(stats.tasks_by_status).length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No tasks found.</p>}
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Tasks Per User</h3>
          {Object.entries(stats.tasks_per_user).map(([user, count]) => (
            <div key={user} className="flex-between" style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
              <span>{user}</span>
              <span style={{ fontWeight: 'bold', background: 'rgba(255,255,255,0.1)', padding: '0.25rem 1rem', borderRadius: '1rem' }}>{count}</span>
            </div>
          ))}
          {Object.keys(stats.tasks_per_user).length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No assigned tasks.</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
