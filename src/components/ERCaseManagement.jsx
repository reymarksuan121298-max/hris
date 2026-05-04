import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search, Plus, X, ShieldAlert, CheckCircle, Clock, Trash2, Edit3, Save, MoreVertical, AlertTriangle } from 'lucide-react';

const ERCaseManagement = () => {
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newCase, setNewCase] = useState({ case_name: '', area: '', employees: '', status: 'OPEN', officer: '', notes: '' });


  const fetchCases = async () => {
    setLoading(true);
    const { data } = await supabase.from('cases').select('*').order('created_at', { ascending: false });
    if (data) setCases(data);
    setLoading(false);
  };

  // Lock body scroll when modals are open
  useEffect(() => {
    if (showModal || selectedCase) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showModal, selectedCase]);

  useEffect(() => { fetchCases(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await supabase.from('cases').insert([newCase]);
    setShowModal(false);
    setNewCase({ case_name: '', area: '', employees: '', status: 'OPEN', officer: '', notes: '' });
    fetchCases();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { id, created_at, ...updateData } = selectedCase;
    const { error } = await supabase.from('cases').update(updateData).eq('id', selectedCase.id);
    if (!error) {
      setIsEditing(false);
      fetchCases();
    }
  };

  const handleDelete = async (e, id, title) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (window.confirm(`Are you sure you want to permanently delete ER Case: "${title}"?`)) {
      setLoading(true);
      try {
        const { error } = await supabase.from('cases').delete().eq('id', id);
        if (error) {
          alert(`Failed to delete record: ${error.message}`);
        } else {
          if (selectedCase?.id === id) setSelectedCase(null);
          await fetchCases();
        }
      } catch (err) {
        console.error('Unexpected delete error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const filtered = cases.filter(c =>
    c.case_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.employees?.toLowerCase().includes(search.toLowerCase()) ||
    c.id?.toString().includes(search)
  );

  const openCaseCount = cases.filter(c => c.status?.toLowerCase() !== 'closed').length;
  const resolvedCount = cases.filter(c => c.status?.toLowerCase() === 'closed').length;

  return (
    <>
      {/* 1. CASE DETAIL / EDIT MODAL (Outside transform) */}
      {selectedCase && (
        <div 
          onClick={() => { setSelectedCase(null); setIsEditing(false); }} 
          style={{ 
            position: 'fixed', inset: 0, 
            backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', 
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', 
            padding: '24px' 
          }}>
          <div 
            onClick={e => e.stopPropagation()} 
            className="glass-panel animate-fade-in" 
            style={{ 
              width: '100%', maxWidth: '850px', maxHeight: '100%', 
              display: 'flex', flexDirection: 'column', overflowY: 'auto' 
            }}>
            <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} color="var(--accent-red)" /> Case ID #{selectedCase.id}
              </h3>
              <button onClick={() => setSelectedCase(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {isEditing ? (
                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Case Name/Title</label>
                    <input value={selectedCase.case_name} onChange={e => setSelectedCase({ ...selectedCase, case_name: e.target.value })} style={{ padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '8px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Area / Branch</label>
                      <input value={selectedCase.area} onChange={e => setSelectedCase({ ...selectedCase, area: e.target.value })} style={{ padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '8px' }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status</label>
                      <select value={selectedCase.status} onChange={e => setSelectedCase({ ...selectedCase, status: e.target.value })} style={{ padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '8px' }}>
                        <option>OPEN</option>
                        <option>CLOSED</option>
                        <option>UNDER INVESTIGATION</option>
                        <option>ESCALATED</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Involved Personnel</label>
                    <input value={selectedCase.employees} onChange={e => setSelectedCase({ ...selectedCase, employees: e.target.value })} style={{ padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '8px' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Detailed Notes</label>
                    <textarea rows={4} value={selectedCase.notes || ''} onChange={e => setSelectedCase({ ...selectedCase, notes: e.target.value })} style={{ padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '8px', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--accent-green)', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Apply Changes</button>
                  </div>
                </form>
              ) : (
                <>
                  <div style={{ borderLeft: '4px solid var(--accent-red)', paddingLeft: '16px' }}>
                    <h2 style={{ margin: 0 }}>{selectedCase.case_name}</h2>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Area: {selectedCase.area} &bull; Handling: {selectedCase.officer}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Current State</div>
                      <span style={{
                        background: selectedCase.status?.toLowerCase() === 'open' ? 'rgba(255, 123, 114, 0.2)' : 'rgba(88, 166, 255, 0.2)',
                        color: selectedCase.status?.toLowerCase() === 'open' ? 'var(--accent-red)' : 'var(--accent-blue)',
                        padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold'
                      }}>{selectedCase.status}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Involved Personnel</div>
                      <div style={{ fontWeight: 'bold' }}>{selectedCase.employees || 'None listed'}</div>
                    </div>
                  </div>

                  {selectedCase.notes && (
                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: '3px solid var(--accent-red)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Administrative Notes</div>
                      <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{selectedCase.notes}</div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
                    <button onClick={() => setIsEditing(true)} style={{ flex: 1, background: 'var(--accent-blue)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Edit3 size={18} /> Edit Case Records
                    </button>
                    <button onClick={() => { setSelectedCase(null); setIsEditing(false); }} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Close
                    </button>
                    <button onClick={(e) => handleDelete(e, selectedCase.id, selectedCase.case_name)} style={{ padding: '12px', background: 'rgba(255,123,114,0.1)', color: 'var(--accent-red)', border: '1px solid rgba(255,123,114,0.3)', borderRadius: '8px', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. CREATE NEW CASE MODAL (Outside transform) */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)} 
          style={{ 
            position: 'fixed', inset: 0, 
            backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', 
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', 
            padding: '24px' 
          }}>
          <div 
            onClick={e => e.stopPropagation()} 
            className="glass-panel animate-fade-in" 
            style={{ 
              width: '100%', maxWidth: '650px', maxHeight: '100%', 
              display: 'flex', flexDirection: 'column', overflowY: 'auto' 
            }}>
            <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} color="var(--accent-blue)" /> New Administrative Case
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Case Name/Title</label>
                <input required value={newCase.case_name} onChange={e => setNewCase({ ...newCase, case_name: e.target.value })} placeholder="e.g. Policy Violation - Late Filing" style={{ padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '8px' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Area / Branch</label>
                  <input required value={newCase.area} onChange={e => setNewCase({ ...newCase, area: e.target.value })} placeholder="e.g. Manila HQ" style={{ padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '8px' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Handling Officer</label>
                  <input required value={newCase.officer} onChange={e => setNewCase({ ...newCase, officer: e.target.value })} placeholder="HR Officer Name" style={{ padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '8px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Involved Personnel</label>
                <input required value={newCase.employees} onChange={e => setNewCase({ ...newCase, employees: e.target.value })} placeholder="Employee Names" style={{ padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '8px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Initial Notes</label>
                <textarea rows={3} value={newCase.notes} onChange={e => setNewCase({ ...newCase, notes: e.target.value })} placeholder="Brief summary of the incident..." style={{ padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '8px' }} />
              </div>
              <button type="submit" disabled={loading} style={{ background: 'var(--accent-blue)', color: '#fff', padding: '12px', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                {loading ? 'Creating Case...' : 'Open Administrative Case'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Content (Animated) */}
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Analytics Summary Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent-red)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active ER Backlog</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{openCaseCount} Cases</div>
            </div>
            <ShieldAlert size={32} color="var(--accent-red)" opacity={0.5} />
          </div>
          <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent-green)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Resolved This Period</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{resolvedCount} Cases</div>
            </div>
            <CheckCircle size={32} color="var(--accent-green)" opacity={0.5} />
          </div>
          <div onClick={() => setShowModal(true)} className="glass-panel" style={{ padding: '24px', border: '1px dashed var(--glass-border)', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <Plus size={24} color="var(--accent-blue)" />
            <div style={{ fontWeight: 'bold', marginTop: '8px' }}>Initiate New Administrative Case</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={28} color="var(--accent-red)" /> ER Case Management
            </h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Legal & Administrative Compliance Pipeline
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', borderRadius: '12px', width: '300px' }}>
              <Search size={20} color="var(--text-secondary)" />
              <input type="text" placeholder="Search Case ID or Personnel..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.95rem' }} />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="glass-panel" style={{ overflowX: 'auto', background: 'var(--bg-secondary)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '16px', width: '60px' }}>Actions</th>
                <th style={{ padding: '16px' }}>Case Reference</th>
                <th style={{ padding: '16px' }}>Description / Title</th>
                <th style={{ padding: '16px' }}>Personnel Involved</th>
                <th style={{ padding: '16px' }}>Branch Area</th>
                <th style={{ padding: '16px' }}>Administrative State</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center' }}>Syncing Case Backend...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No ER cases matched your criteria.</td></tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} onClick={() => setSelectedCase(c)} style={{ borderTop: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button
                        onClick={(e) => handleDelete(e, c.id, c.case_name)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '12px', opacity: 0.6, position: 'relative', zIndex: 10 }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                        onMouseOut={(e) => e.currentTarget.style.opacity = 0.6}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                    <td style={{ padding: '16px', fontFamily: 'monospace', color: 'var(--accent-blue)', fontWeight: 'bold' }}>#{c.id}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{c.case_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Created {new Date(c.created_at).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: '16px' }}>{c.employees || '-'}</td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{c.area || 'Corporate'}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        background: c.status?.toLowerCase() === 'open' ? 'rgba(255, 123, 114, 0.1)' : 'rgba(88, 166, 255, 0.1)',
                        color: c.status?.toLowerCase() === 'open' ? 'var(--accent-red)' : 'var(--accent-blue)',
                        padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px', border: `1px solid ${c.status?.toLowerCase() === 'open' ? 'rgba(255,123,114,0.3)' : 'rgba(88,166,255,0.3)'}`
                      }}>
                        <Clock size={12} /> {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ERCaseManagement;
