import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  BookOpen, FileCheck, Calendar, Search, Plus, X, 
  Award, Clock, ArrowRight, CheckCircle, Trash2, 
  User, Briefcase, Zap, Target, FolderOpen, Files, 
  LayoutDashboard, History, Shield, AlertCircle, 
  TrendingUp, Layers, ChevronRight, Activity
} from 'lucide-react';
import LDResourceManager from './LDResourceManager';

const LDTracker = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'history', 'audit'
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [trainingType, setTrainingType] = useState('assignment');
  const [search, setSearch] = useState('');
  
  const [newAssignment, setNewAssignment] = useState({ 
    employee_name: '', 
    report_type: 'Daily Refresher', 
    due_date: '', 
    department: '',
    priority: 'Normal'
  });



  const fetchLD = async () => {
    setLoading(true);
    const [
      { data: aData }, 
      { data: sData },
      { data: lData }
    ] = await Promise.all([
      supabase.from('ld_assignments').select('*').order('due_date', { ascending: true }),
      supabase.from('ld_submissions').select('*').order('submission_date', { ascending: false }),
      supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(20)
    ]);

    if (aData) setAssignments(aData);
    if (sData) setSubmissions(sData);
    if (lData) setAuditLogs(lData);
    setLoading(false);
  };

  useEffect(() => { fetchLD(); }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('ld_assignments').insert([newAssignment]);
    if (!error) {
       setShowModal(false);
       setNewAssignment({ employee_name: '', report_type: 'Daily Refresher', due_date: '', department: '', priority: 'Normal' });
       fetchLD();
    }
  };

  const handleDeleteAssignment = async (id) => {
     if (window.confirm("Abort this mission directive?")) {
        await supabase.from('ld_assignments').delete().eq('id', id);
        fetchLD();
     }
  };

  const filteredAssignments = assignments.filter(a => 
    a.employee_name?.toLowerCase().includes(search.toLowerCase()) || 
    a.department?.toLowerCase().includes(search.toLowerCase()) || 
    a.report_type?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSubmissions = submissions.filter(s => 
    s.employee_name?.toLowerCase().includes(search.toLowerCase()) || 
    s.report_type?.toLowerCase().includes(search.toLowerCase())
  );

  // Analytics
  const completionRate = (assignments.length + submissions.length) > 0 
    ? Math.round((submissions.length / (assignments.length + submissions.length)) * 100) 
    : 0;
  const overdueCount = assignments.filter(a => new Date(a.due_date) < new Date()).length;
  const criticalProjects = assignments.filter(a => a.report_type.includes('Project') || a.priority === 'High').length;

  return (
    <div className="flex flex-col gap-8" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="animate-fade-in">
      
      {/* 🚀 ELITE HERO SECTION */}
      <div className="glass-panel overflow-hidden" style={{ padding: '0', position: 'relative', background: 'var(--bg-secondary)' }}>
        <div style={{ padding: '40px', position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
            <div>
              <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '16px', margin: 0 }}>
                 <Target size={40} color="var(--accent-blue)" /> L&D Mission Command
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '12px', fontSize: '1rem', maxWidth: '500px', lineHeight: '1.6' }}>
                 Tactical oversight of Corporate Training Compliance and Special Operational Projects. 
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-blue)' }}>{completionRate}%</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>Efficiency</div>
              </div>
              <div style={{ width: '1px', background: 'var(--glass-border)', margin: '10px 0' }}></div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-red)' }}>{overdueCount}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>Critical</div>
              </div>
              <div style={{ width: '1px', background: 'var(--glass-border)', margin: '10px 0' }}></div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-green)' }}>{submissions.length}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>Cleared</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', zIndex: 1 }}>
            <button 
              onClick={() => setShowModal(true)} 
              style={{ 
                background: 'var(--accent-gradient)', color: '#fff', border: 'none', padding: '18px 36px', 
                borderRadius: '16px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', 
                display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s',
                boxShadow: '0 8px 25px rgba(184, 227, 233, 0.25)' 
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Plus size={24} /> Deploy Directive
            </button>
          </div>
        </div>
        
        {/* Background Accent */}
        <div style={{ position: 'absolute', right: '-100px', top: '-100px', width: '300px', height: '300px', background: 'var(--accent-blue)', opacity: 0.05, borderRadius: '50%', filter: 'blur(80px)' }}></div>
      </div>
      </div>

      <div className="animate-fade-in">
      {/* 🛠 COMPALNCE UTILITIES */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="glass-panel" style={{ display: 'flex', gap: '8px', padding: '6px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
           <button 
            onClick={() => setActiveTab('active')}
            style={{ 
              padding: '10px 24px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', transition: 'all 0.2s',
              background: activeTab === 'active' ? 'var(--accent-blue)' : 'transparent',
              color: activeTab === 'active' ? '#000' : 'var(--text-secondary)'
            }}
           >
             <LayoutDashboard size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Active Missions
           </button>
           <button 
            onClick={() => setActiveTab('library')}
            style={{ 
              padding: '10px 24px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', transition: 'all 0.2s',
              background: activeTab === 'library' ? 'var(--accent-teal-light)' : 'transparent',
              color: activeTab === 'library' ? '#000' : 'var(--text-secondary)'
            }}
           >
             <BookOpen size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Central Library
           </button>
           <button 
            onClick={() => setActiveTab('history')}
            style={{ 
              padding: '10px 24px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', transition: 'all 0.2s',
              background: activeTab === 'history' ? 'var(--accent-green)' : 'transparent',
              color: activeTab === 'history' ? '#000' : 'var(--text-secondary)'
            }}
           >
             <History size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Verification Log
           </button>
           <button 
            onClick={() => setActiveTab('audit')}
            style={{ 
              padding: '10px 24px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', transition: 'all 0.2s',
              background: activeTab === 'audit' ? 'var(--accent-purple)' : 'transparent',
              color: activeTab === 'audit' ? '#fff' : 'var(--text-secondary)'
            }}
           >
             <Shield size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Audit Trail
           </button>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', borderRadius: '12px', width: '400px' }}>
           <Search size={20} color="var(--text-secondary)" />
           <input 
            type="text" 
            placeholder="Search directives, agents or projects..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '1rem' }} 
           />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: (activeTab === 'audit' || activeTab === 'library') ? '1fr' : '2.1fr 0.9fr', gap: '32px' }}>
        
        {/* 📋 PRIMARY CONTENT AREA */}
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {activeTab === 'library' && (
            <div style={{ height: '70vh' }}>
              <LDResourceManager 
                training={{ id: 'CENTRAL_LIBRARY', employee_name: 'Central Repository', report_type: 'Departmental Assets' }} 
                type="global" 
                isEmbedded={true}
              />
            </div>
          )}

          {activeTab === 'active' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
              {loading ? [...Array(4)].map((_, i) => <div key={i} className="glass-panel animate-pulse" style={{ height: '200px' }}></div>) :
               filteredAssignments.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', background: 'rgba(255,255,255,0.01)', borderRadius: '24px', border: '1px dashed var(--glass-border)' }}>
                  <Layers size={48} color="var(--text-secondary)" opacity={0.3} style={{ margin: '0 auto 16px' }} />
                  <h3>No Active Missions Found</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>All personnel are currently compliant or no directives have been issued.</p>
                </div>
               ) :
               filteredAssignments.map(a => {
                const isOverdue = new Date(a.due_date) < new Date();
                const isHigh = a.priority === 'High' || a.report_type.includes('Project');
                
                return (
                  <div key={a.id} className="glass-panel group" style={{ padding: '24px', position: 'relative', overflow: 'hidden', borderLeft: isHigh ? '4px solid var(--accent-red)' : '4px solid var(--accent-blue)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                       <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                             <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{a.employee_name}</h4>
                             {isHigh && <Zap size={16} color="var(--accent-red)" className="animate-pulse" />}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>{a.department} &bull; {a.report_type}</div>
                       </div>
                       <button onClick={() => handleDeleteAssignment(a.id)} style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,123,114,0.05)', color: 'var(--accent-red)', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                       </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: isOverdue ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                          <Clock size={16} />
                          <span>Deadline: {new Date(a.due_date).toLocaleDateString()}</span>
                          {isOverdue && <span style={{ background: 'rgba(255,123,114,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' }}>OVERDUE</span>}
                       </div>
                       
                       <div style={{ height: '4px', width: '100%', background: 'var(--bg-tertiary)', borderRadius: '2px', marginTop: '4px' }}>
                          <div style={{ height: '100%', width: isOverdue ? '100%' : '60%', background: isOverdue ? 'var(--accent-red)' : 'var(--accent-blue)', borderRadius: '2px' }}></div>
                       </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                       <button 
                        onClick={() => { setSelectedTraining(a); setTrainingType('assignment'); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(184, 227, 233, 0.1)', color: 'var(--accent-blue)', padding: '10px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}
                       >
                          <Files size={18} /> Resource Vault
                       </button>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <CheckCircle size={14} /> Waiting Verification
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                       <th style={{ padding: '20px', textAlign: 'left' }}>Personnel Agent</th>
                       <th style={{ padding: '20px', textAlign: 'left' }}>Operational Directive</th>
                       <th style={{ padding: '20px', textAlign: 'left' }}>Completion Sync</th>
                       <th style={{ padding: '20px', textAlign: 'center' }}>Asset Vault</th>
                       <th style={{ padding: '20px', textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '20px' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                 {s.employee_name[0]}
                              </div>
                              <span style={{ fontWeight: '600' }}>{s.employee_name}</span>
                           </div>
                        </td>
                        <td style={{ padding: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{s.report_type}</td>
                        <td style={{ padding: '20px', fontSize: '0.85rem' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Clock size={14} color="var(--accent-green)" />
                              {new Date(s.submission_date).toLocaleDateString()}
                           </div>
                        </td>
                        <td style={{ padding: '20px', textAlign: 'center' }}>
                           <button 
                            onClick={() => { setSelectedTraining(s); setTrainingType('submission'); }}
                            style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '10px', color: '#fff', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                           >
                              <FolderOpen size={16} /> Inspect
                           </button>
                        </td>
                        <td style={{ padding: '20px', textAlign: 'right' }}>
                           <span style={{ background: 'rgba(63, 185, 80, 0.1)', color: 'var(--accent-green)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid rgba(63, 185, 80, 0.2)' }}>
                              VERIFIED
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="glass-panel" style={{ padding: '32px' }}>
               <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Activity size={24} color="var(--accent-purple)" /> Real-Time Compliance Audit
               </h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {auditLogs.map(log => (
                    <div key={log.id} style={{ display: 'flex', gap: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
                       <div style={{ 
                          width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                          background: log.action === 'UPLOAD' ? 'rgba(88, 166, 255, 0.1)' : log.action === 'DELETE' ? 'rgba(255, 123, 114, 0.1)' : 'rgba(184, 227, 233, 0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                       }}>
                          {log.action === 'UPLOAD' ? <Plus size={20} color="var(--accent-blue)" /> : log.action === 'DELETE' ? <Trash2 size={20} color="var(--accent-red)" /> : <Clock size={20} color="var(--accent-teal-light)" />}
                       </div>
                       <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                             <span style={{ fontWeight: 'bold', color: 'var(--accent-blue)' }}>{log.action}</span>
                             <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(log.created_at).toLocaleString()}</span>
                          </div>
                          <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                             <span style={{ fontWeight: 'bold' }}>{log.user_email.split('@')[0]}</span> {log.action.toLowerCase()}ed <span style={{ color: 'var(--accent-purple)' }}>{log.resource_name}</span>
                          </p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        {/* 📊 ANALYTICS SIDEBAR */}
        {activeTab !== 'audit' && (
          <div className="flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <div className="glass-panel" style={{ padding: '24px' }}>
                <h4 style={{ margin: '0 0 20px', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <TrendingUp size={16} color="var(--accent-green)" /> Operational Velocity
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                   <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
                         <span>Mastery Level</span>
                         <span style={{ color: 'var(--accent-blue)' }}>68%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                         <div style={{ width: '68%', height: '100%', background: 'var(--accent-blue)', borderRadius: '3px' }}></div>
                      </div>
                   </div>
                   <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
                         <span>Compliance Sync</span>
                         <span style={{ color: 'var(--accent-green)' }}>92%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                         <div style={{ width: '92%', height: '100%', background: 'var(--accent-green)', borderRadius: '3px' }}></div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="glass-panel" style={{ padding: '24px', background: 'var(--accent-gradient)', border: 'none' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <Zap size={20} fill="#fff" /> Quick Tactical Deployment
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.4', marginBottom: '20px' }}>
                   Need to rollout a new SOP or critical safety update immediately? 
                </p>
                <button onClick={() => setShowModal(true)} style={{ width: '100%', background: '#fff', color: '#000', padding: '12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                   SOP Rollout Ready
                </button>
             </div>

             <div className="glass-panel" style={{ padding: '24px' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>RECENT MILESTONES</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                   {submissions.slice(0, 3).map(s => (
                     <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(63, 185, 80, 0.1)' }}>
                           <CheckCircle size={14} color="var(--accent-green)" />
                        </div>
                        <div style={{ fontSize: '0.8rem' }}>
                           <div style={{ fontWeight: 'bold' }}>{s.employee_name}</div>
                           <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Completed {s.report_type}</div>
                        </div>
                     </div>
                   ))}
                </div>
                <button 
                  onClick={() => setActiveTab('history')}
                  style={{ width: '100%', marginTop: '20px', padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', borderRadius: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                   View Full Archive <ChevronRight size={14} />
                </button>
             </div>
          </div>
        )}
      </div>
      </div>

      {/* 🛡 DIRECTIVE DEPLOYMENT MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '500px', padding: '40px', background: 'var(--bg-primary)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem' }}>
                   <Zap size={24} color="var(--accent-blue)" /> Deploy Critical Directive
                </h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24}/></button>
             </div>
             <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '32px' }}>Initialize a new L&D milestone or Tactical Project assignment across the workforce grid.</p>

             <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Personnel / Unit Name</label>
                   <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
                      <input required value={newAssignment.employee_name} onChange={e => setNewAssignment({...newAssignment, employee_name: e.target.value})} placeholder="Input agent or employee name" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', padding: '14px 14px 14px 44px', borderRadius: '12px', outline: 'none', width: '100%' }} />
                   </div>
                </div>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Department</label>
                    <input required value={newAssignment.department} onChange={e => setNewAssignment({...newAssignment, department: e.target.value})} placeholder="e.g. IT, HR, GFC" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', padding: '14px', borderRadius: '12px' }} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Priority</label>
                    <select value={newAssignment.priority} onChange={e => setNewAssignment({...newAssignment, priority: e.target.value})} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', padding: '14px', borderRadius: '12px' }}>
                       <option>Normal</option>
                       <option>Medium</option>
                       <option>High</option>
                       <option>Critical</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Directive Type</label>
                   <select required value={newAssignment.report_type} onChange={e => setNewAssignment({...newAssignment, report_type: e.target.value})} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', padding: '14px', borderRadius: '12px', outline: 'none' }}>
                      <optgroup label="Training Core">
                        <option>Daily Refresher</option>
                        <option>Standard SOP Alignment</option>
                        <option>Monthly Compliance Audit</option>
                      </optgroup>
                      <optgroup label="Special Operations">
                        <option>Special Tactical Project</option>
                        <option>Branch Operational Rollout</option>
                        <option>Critical System Sync</option>
                      </optgroup>
                   </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Mission Threshold (Deadline)</label>
                   <input required type="date" value={newAssignment.due_date} onChange={e => setNewAssignment({...newAssignment, due_date: e.target.value})} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: '#fff', padding: '14px', borderRadius: '12px' }} />
                </div>

                <button type="submit" style={{ background: 'var(--accent-gradient)', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '12px', boxShadow: '0 8px 20px rgba(88, 166, 255, 0.2)' }}>
                   <Target size={20} /> Authorize & Deploy
                </button>
             </form>
          </div>
        </div>
      )}

      {/* 🔐 RESOURCE VAULT MODAL */}
      {selectedTraining && (
        <LDResourceManager 
            training={selectedTraining} 
            type={trainingType} 
            onClose={() => setSelectedTraining(null)} 
        />
      )}

    </div>
  );
};

export default LDTracker;
