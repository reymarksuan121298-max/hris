import React, { useState } from 'react';
import { X, UserRound, MapPin, Book, Briefcase, FileText, Shield, UploadCloud, ChevronRight, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const QuickStageModal = ({ isOpen, onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name_english: '',
    email: '',
    mobile: '',
    department: 'ADMIN',
    position: '',
    employment_status: 'Probationary Status',
    dob: '',
    sex: 'Male'
  });

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFinalize = async () => {
    setLoading(true);
    const { error } = await supabase.from('employees').insert([formData]);
    if (error) {
      alert("Error staging employee: " + error.message);
    } else {
      onRefresh();
      onClose();
    }
    setLoading(false);
  };

  const tabs = [
    { id: 1, icon: <UserRound size={18} />, label: 'Personal Info' },
    { id: 2, icon: <MapPin size={18} />, label: 'Contact Details' },
    { id: 3, icon: <Briefcase size={18} />, label: 'Role & Placement' },
    { id: 4, icon: <UploadCloud size={18} />, label: 'File Initializer' }
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
    }}>
      <div className="glass-panel animate-zoom-in" style={{ 
        width: '100%', maxWidth: '900px', height: '600px', 
        display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden'
      }}>
        
        {/* Modal Header */}
        <div style={{ 
          padding: '24px', borderBottom: '1px solid var(--glass-border)', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(255,255,255,0.03)'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Quick Stage & 201 File Init</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Standardized workforce onboarding pipeline.</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Side Tabs */}
          <div style={{ 
            width: '240px', borderRight: '1px solid var(--glass-border)', 
            padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' 
          }}>
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                  borderRadius: '10px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: activeTab === tab.id ? 'var(--accent-blue)' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                  textAlign: 'left', fontWeight: 'bold', fontSize: '0.85rem'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div style={{ flex: 1, padding: '40px', overflowY: 'auto', background: 'rgba(0,0,0,0.1)' }}>
            {activeTab === 1 && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h4 style={{ color: 'var(--accent-blue)', margin: 0 }}>Basic Identity Details</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full Name (Last Name, First Name MI.)</label>
                  <input name="name_english" value={formData.name_english} onChange={handleInputChange} autoFocus className="glass-input" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Date of Birth</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="glass-input" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sex</label>
                    <select name="sex" value={formData.sex} onChange={handleInputChange} className="glass-input">
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h4 style={{ color: 'var(--accent-blue)', margin: 0 }}>Communication Channels</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Corporate Email / Personal Email</label>
                  <input name="email" value={formData.email} onChange={handleInputChange} className="glass-input" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mobile Phone Number</label>
                  <input name="mobile" value={formData.mobile} onChange={handleInputChange} className="glass-input" />
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h4 style={{ color: 'var(--accent-blue)', margin: 0 }}>Placement Details</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Department Placement</label>
                  <select name="department" value={formData.department} onChange={handleInputChange} className="glass-input">
                    <option>ADMIN</option>
                    <option>ACCOUNTING</option>
                    <option>HR</option>
                    <option>IT</option>
                    <option>TELLER OPERATIONS</option>
                    <option>LOGISTICS</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active Job Position</label>
                  <input name="position" value={formData.position} onChange={handleInputChange} className="glass-input" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Employment Status</label>
                  <select name="employment_status" value={formData.employment_status} onChange={handleInputChange} className="glass-input">
                    <option>Probationary Status</option>
                    <option>Regular Status</option>
                    <option>Project-Based</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 4 && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px' }}>
                <UploadCloud size={60} color="var(--accent-blue)" />
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ margin: 0 }}>Ready to Stage</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Please review the data before final archival.</p>
                </div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', 
                  width: '100%', border: '1px solid var(--glass-border)' 
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>Name:</div><div style={{ fontWeight: 'bold' }}>{formData.name_english || 'NOT SET'}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Position:</div><div>{formData.position || 'NOT SET'}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Dept:</div><div>{formData.department}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ 
          padding: '20px 32px', borderTop: '1px solid var(--glass-border)', 
          background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'flex-end', gap: '16px' 
        }}>
          <button onClick={onClose} className="glass-button" style={{ padding: '12px 24px' }}>Cancel</button>
          
          {activeTab < 4 ? (
            <button 
              onClick={() => setActiveTab(activeTab + 1)}
              style={{ 
                background: 'var(--accent-blue)', color: '#fff', border: 'none', 
                padding: '12px 32px', borderRadius: '10px', fontWeight: 'bold', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              Continue <ChevronRight size={18} />
            </button>
          ) : (
            <button 
              onClick={handleFinalize}
              disabled={loading || !formData.name_english}
              style={{ 
                background: 'var(--accent-green)', color: '#fff', border: 'none', 
                padding: '12px 32px', borderRadius: '10px', fontWeight: 'bold', 
                cursor: 'pointer', opacity: (loading || !formData.name_english) ? 0.5 : 1
              }}
            >
              {loading ? 'Archiving...' : 'Finalize & Archive'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickStageModal;
