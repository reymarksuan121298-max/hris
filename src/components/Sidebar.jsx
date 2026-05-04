import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, UserPlus, ClipboardList, ShieldAlert, GraduationCap, Settings, LogOut, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../supabaseClient';
import logo from '../assets/logo.png';

const Sidebar = ({ onOpenConfig, sbStatus }) => {
  const menuItems = [
    { icon: <UserPlus size={20} />, label: "Employee Onboarding", path: "/onboarding" },
    { icon: <ShieldAlert size={20} />, label: "Employee Relations", path: "/er-cases" },
    { icon: <ClipboardList size={20} />, label: "Sales Force", path: "/sf-ops" },
    { icon: <GraduationCap size={20} />, label: "L&D & Special Projects", path: "/ld-tracker" },
    { icon: <Users size={20} />, label: "Employee Directory", path: "/directory" },
    { icon: <Users size={20} />, label: "Staff & Tellers", path: "/staff-roster" },
    { icon: <ImageIcon size={20} />, label: "Advisory Gen", path: "/advisory-generator" },
  ];

  return (
    <nav className="glass-panel" style={{
      width: 'calc(100% - 40px)', height: '70px', position: 'fixed', left: '20px', top: '20px',
      display: 'flex', flexDirection: 'row', padding: '0 24px', zIndex: 1000, alignItems: 'center', gap: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingRight: '24px', borderRight: '1px solid var(--glass-border)' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.03)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)'
        }}>
          <img src={logo} alt="SGC Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <h2 style={{ fontSize: '1rem', color: '#fff', letterSpacing: '1px', margin: 0 }}>SGC</h2>
          <div style={{ fontSize: '0.66rem', color: 'var(--accent-blue)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>HRMS</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '12px', overflowX: 'auto', padding: '0 12px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '12px', transition: 'all 0.2s',
              background: isActive ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
              color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
              border: isActive ? '1px solid rgba(88, 166, 255, 0.2)' : '1px solid transparent',
              fontWeight: isActive ? '600' : '400',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              fontSize: '0.85rem'
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', borderLeft: '1px solid var(--glass-border)', paddingLeft: '24px' }}>
        <div style={{
          fontSize: '0.8rem',
          color: sbStatus === 'Supabase Active' ? 'var(--accent-green)' : 'var(--accent-red)',
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--glass-border)'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor', boxShadow: '0 0 6px currentColor' }}></span>
          {sbStatus}
        </div>

        <button
          onClick={onOpenConfig}
          title="System Config"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px',
            borderRadius: '12px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer'
          }}
        >
          <Settings size={20} />
        </button>

        <button
          onClick={() => supabase.auth.signOut()}
          title="Sign Out"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px',
            borderRadius: '12px', background: 'transparent', color: 'var(--accent-red)', border: 'none', cursor: 'pointer'
          }}
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
