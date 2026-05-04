import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import SystemConfigModal from './components/SystemConfigModal';

// Import Pages
import OnboardingVault from './components/OnboardingVault';
import ERCaseManagement from './components/ERCaseManagement';
import SFOperations from './components/SFOperations';
import LDTracker from './components/LDTracker';
import EmployeeDirectory from './components/EmployeeDirectory';
import StaffRoster from './components/StaffRoster';
import AdvisoryGenerator from './components/AdvisoryGenerator';

import logo from './assets/logo.png';

function App() {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [sbStatus, setSbStatus] = useState('Connecting...');
  const [isConfigOpen, setConfigOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem('hris-theme');
    if (savedTheme === 'light') { document.body.classList.add('light-theme'); }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setSession(session);
      setInitializing(false);
      setSbStatus(error || !import.meta.env.VITE_SUPABASE_URL ? 'DB Offline (Check .env)' : 'Supabase Active');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setInitializing(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/onboarding': return { title: 'Onboarding Vault', sub: 'Automated 201 File & Compliance Repository' };
      case '/er-cases': return { title: 'ER Case Management', sub: 'Disciplinary & Grievance Logs' };
      case '/sf-ops': return { title: 'Salesforce (IR) Tracking', sub: 'SOP Breaches & Branch Operations' };
      case '/ld-tracker': return { title: 'L&D & Special Projects', sub: 'Performance Assessments & Project Tasking Matrix' };
      case '/directory': return { title: 'Employee Directory', sub: 'Corporate Workforce Table' };
      case '/staff-roster': return { title: 'Staff & Tellers', sub: 'Departmental & Company Divisions' };
      case '/advisory-generator': return { title: 'Advisory Generator', sub: 'Create & Export System Maintenance Notices' };
      default: return { title: 'SGC Hris System', sub: '' };
    }
  };

  const { title, sub } = getPageTitle();

  if (initializing) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
        Initializing...
      </div>
    );
  }

  if (!session) return <Login />;

  return (
    <div className="app-container">
      <SystemConfigModal isOpen={isConfigOpen} onClose={() => setConfigOpen(false)} />
      <Sidebar onOpenConfig={() => setConfigOpen(true)} sbStatus={sbStatus} />
      <main className="main-content">
        <header className="animate-fade-in" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingBottom: '20px', borderBottom: '1px solid var(--glass-border)'
        }}>
          <div>
            <h1 className="text-gradient" style={{ fontSize: '2.4rem' }}>{title}</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{sub}</p>
          </div>
        </header>

        <div style={{ flex: 1, paddingBottom: '32px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/onboarding" replace />} />
            <Route path="/onboarding" element={<OnboardingVault />} />
            <Route path="/er-cases" element={<ERCaseManagement />} />
            <Route path="/sf-ops" element={<SFOperations />} />
            <Route path="/ld-tracker" element={<LDTracker />} />
            <Route path="/directory" element={<EmployeeDirectory />} />
            <Route path="/staff-roster" element={<StaffRoster />} />
            <Route path="/advisory-generator" element={<AdvisoryGenerator />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <footer style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 0',
          borderTop: '1px solid var(--glass-border)', background: 'rgba(11, 46, 51, 0.8)',
          backdropFilter: 'blur(12px)', textAlign: 'center', color: 'var(--text-secondary)',
          fontSize: '0.75rem', lineHeight: '1.6', zIndex: 900, boxShadow: '0 -10px 25px rgba(0,0,0,0.3)'
        }}>
          <p>© 2026 SGC HRMS - All Rights Reserved</p>
          <p style={{ margin: 0 }}>
            Designed and Developed By: <strong>Reymark Suan</strong> |
            <span style={{ opacity: 0.8, marginLeft: '8px' }}>Powered By : SMNR IT Group @ SGC Corporation</span>
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
