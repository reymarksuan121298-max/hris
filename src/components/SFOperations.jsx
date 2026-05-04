import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { MapPin, Target, ShieldAlert, Plus, X, Building, AlertTriangle, Activity, Banknote, Edit3, Save, Trash2, Clock, CheckCircle, Upload, FileText, Download, Briefcase } from 'lucide-react';

const getStatusStyle = (status) => {
  const s = (status || '').toLowerCase();
  if (['resolved', 'completed'].includes(s)) return { bg: 'rgba(63,185,80,0.1)', color: 'var(--accent-green)' };
  if (['in review', 'transferred', 'pending', 'awaiting validation'].includes(s)) return { bg: 'rgba(58,166,255,0.1)', color: 'var(--accent-blue)' };
  if (['escalated', 'disputed', 'flagged', 'open', 'sop violation', 'security breach'].includes(s)) return { bg: 'rgba(255,123,114,0.1)', color: 'var(--accent-red)' };
  return { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' };
};

const SFOperations = () => {
  const [activeTab, setActiveTab] = useState('incidents'); // 'incidents' or 'payouts'
  const [irCases, setIrCases] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]); // Multiple receipts
  const [previewFile, setPreviewFile] = useState(null); // { url, name }
  const [cashLogs, setCashLogs] = useState([]);
  const [newCashLog, setNewCashLog] = useState({
    personnel_in_charge: '',
    cash_assistance_type: 'Medical Assistance',
    payment_method: 'Cash',
    amount: '',
    notes: '',
    status: 'Pending',
    date: new Date().toISOString().split('T')[0]
  });

  // Expanded Data State
  const [newItem, setNewItem] = useState({
    agent_name: '',
    area: '',
    status: 'OPEN',
    file_name: '',
    file_url: '',
    sop_breakdown: 'Under Investigation',
    baranggay_share: 'Pending Routing',
    legal_34_40: 'No records'
  });



  const fetchIRCases = async () => {
    setLoading(true);
    // Fetch Incidents
    const { data: irData } = await supabase.from('ir_cases').select('*').order('date_posted', { ascending: false }).limit(100);
    if (irData) setIrCases(irData);

    // Fetch Cash Logs
    const { data: cashData } = await supabase.from('cash_assistance_logs').select('*').order('date', { ascending: false }).limit(100);
    if (cashData) setCashLogs(cashData);

    setLoading(false);
  };

  // Lock body scroll when modals are open
  useEffect(() => {
    if (showModal || selectedIncident || previewFile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showModal, selectedIncident, previewFile]);

  useEffect(() => { fetchIRCases(); }, []);

  const handleFileUpload = async (file) => {
    if (!file) return null;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 12)}.${fileExt}`;
    const filePath = `incidents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('incident_reports_sales')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError.message);
      setUploading(false);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('incident_reports_sales')
      .getPublicUrl(filePath);

    setUploading(false);
    return { fileName: file.name, fileUrl: publicUrl };
  };

  const handleMultiFileUpload = async (files) => {
    if (!files || files.length === 0) return [];
    setUploading(true);
    const uploadedReceipts = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 12)}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('receipts')
          .getPublicUrl(filePath);
        uploadedReceipts.push({ name: file.name, url: publicUrl });
      } else {
        console.error('Upload error for', file.name, ':', uploadError.message);
      }
    }
    setUploading(false);
    return uploadedReceipts;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    if (activeTab === 'incidents') {
      let uploadedFileData = { fileName: '', fileUrl: '' };
      if (uploadFile) {
        const result = await handleFileUpload(uploadFile);
        if (result) uploadedFileData = result;
      }

      const { error } = await supabase.from('ir_cases').insert([{
        agent_name: newItem.agent_name,
        area: newItem.area,
        status: newItem.status,
        sop_breakdown: newItem.sop_breakdown,
        baranggay_share: newItem.baranggay_share,
        cash_amount: newItem.cash_amount,
        file_name: uploadedFileData.fileName,
        file_url: uploadedFileData.fileUrl,
        date_posted: new Date().toISOString()
      }]);

      if (error) {
        console.error(error);
        alert('Error inserting incident record.');
      } else {
        setShowModal(false);
        resetNewItem();
        setUploadFile(null);
        fetchIRCases();
        alert('Incident Report saved successfully!');
      }
    } else {
      // CASH ASSISTANCE LOGIC
      if (!newCashLog.personnel_in_charge || !newCashLog.payment_method || !newCashLog.cash_assistance_type) {
        alert('Please fill out all required fields.');
        setUploading(false);
        return;
      }
      if (newCashLog.amount <= 0) {
        alert('Amount must be greater than 0.');
        setUploading(false);
        return;
      }

      let receiptUrls = [];
      if (uploadFiles.length > 0) {
        receiptUrls = await handleMultiFileUpload(uploadFiles);
      }

      const { error } = await supabase.from('cash_assistance_logs').insert([{
        ...newCashLog,
        amount: parseFloat(newCashLog.amount) || 0,
        receipts: receiptUrls,
        created_at: new Date().toISOString()
      }]);

      if (error) {
        console.error(error);
        alert(`Error saving cash assistance: ${error.message}`);
      } else {
        setShowModal(false);
        alert('Cash Assistance Log saved successfully!');
        setUploadFiles([]);
        resetNewItem();
        fetchIRCases();
      }
    }
    setUploading(false);
  };

  const resetNewItem = () => {
    setNewItem({
      agent_name: '', area: '', status: 'OPEN', file_name: '', file_url: '',
      sop_breakdown: 'Under Investigation',
      baranggay_share: 'Pending Routing', cash_amount: 0
    });
    setNewCashLog({
      personnel_in_charge: '',
      cash_assistance_type: 'One Time',
      payment_method: 'Cash',
      amount: 0,
      receipts: [],
      notes: '',
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    });
    setUploadFiles([]);
    setUploadFile(null);
  };

  const handleUpdateIncident = async (e) => {
    e.preventDefault();
    const { id, created_at, ...updateData } = selectedIncident;
    const { error } = await supabase.from('ir_cases').update(updateData).eq('id', selectedIncident.id);
    if (!error) {
      setIsEditing(false);
      fetchIRCases();
    }
  };

  const handleUpdateCashLog = async (e) => {
    e.preventDefault();
    setUploading(true);

    let finalReceipts = [...(selectedIncident.receipts || [])];
    if (uploadFiles.length > 0) {
      const newReceipts = await handleMultiFileUpload(uploadFiles);
      finalReceipts = [...finalReceipts, ...newReceipts];
    }

    const { id, created_at, ...updateData } = selectedIncident;
    const { error } = await supabase.from('cash_assistance_logs')
      .update({
        ...updateData,
        receipts: finalReceipts
      })
      .eq('id', selectedIncident.id);

    if (error) {
      console.error(error);
      alert(`Error updating log: ${error.message}`);
    } else {
      setIsEditing(false);
      setUploadFiles([]);
      fetchIRCases();
      setSelectedIncident(null);
      alert('Update successful!');
    }
    setUploading(false);
  };

  const handleDeleteIncident = async (e, id) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const table = activeTab === 'incidents' ? 'ir_cases' : 'cash_assistance_logs';

    if (window.confirm(`Permanently delete this ${activeTab === 'incidents' ? 'incident' : 'payout'} record?`)) {
      setLoading(true);
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) {
        console.error('Delete error:', error);
        alert(`Failed to delete: ${error.message}`);
      } else {
        if (selectedIncident?.id === id) setSelectedIncident(null);
        fetchIRCases();
      }
      setLoading(false);
    }
  };

  // Metrics
  const totalCashOut = cashLogs.reduce((sum, log) => sum + (log.amount || 0), 0);
  const totalIncidents = irCases.length;
  const processedData = activeTab === 'incidents' ? irCases : cashLogs;

  return (
    <>
      {/* 1. DETAIL / EDIT MODAL (Outside transform) */}
      {selectedIncident && (
        <div
          onClick={() => { setSelectedIncident(null); setIsEditing(false); }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px'
          }}>
          <div
            onClick={e => e.stopPropagation()}
            className="glass-panel animate-fade-in"
            style={{
              width: '100%', maxWidth: '850px', maxHeight: '100%',
              overflowY: 'auto', display: 'flex', flexDirection: 'column'
            }}>
            <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeTab === 'incidents' ? <ShieldAlert size={20} color="var(--accent-red)" /> : <Activity size={20} color="var(--accent-blue)" />}
                {activeTab === 'incidents' ? 'Incident Detail' : 'Payout Log Details'}
              </h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setIsEditing(!isEditing)} style={{ background: 'rgba(58, 166, 255, 0.1)', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>{isEditing ? 'Cancel Edit' : 'Modify Record'}</button>
                <button onClick={() => setSelectedIncident(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              {isEditing ? (
                <form onSubmit={activeTab === 'incidents' ? handleUpdateIncident : handleUpdateCashLog} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {activeTab === 'incidents' ? (
                    <>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Employee Name</label>
                          <input value={selectedIncident.agent_name} onChange={e => setSelectedIncident({ ...selectedIncident, agent_name: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff' }} />
                        </div>
                        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Region/Area Code</label>
                          <input value={selectedIncident.area} onChange={e => setSelectedIncident({ ...selectedIncident, area: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Incident Classification</label>
                        <select value={selectedIncident.sop_breakdown} onChange={e => setSelectedIncident({ ...selectedIncident, sop_breakdown: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff' }}>
                          <option>Under Investigation</option>
                          <option>SOP Violation</option>
                          <option>Security Breach</option>
                          <option>Internal Misconduct</option>
                          <option>Policy Deviation</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current Resolution Status</label>
                        <select value={selectedIncident.status} onChange={e => setSelectedIncident({ ...selectedIncident, status: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff' }}>
                          <option>Flagged</option>
                          <option>In Review</option>
                          <option>Escalated</option>
                          <option>Resolved</option>
                          <option>Dismissed</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>In Charge</label>
                          <input value={selectedIncident.personnel_in_charge} onChange={e => setSelectedIncident({ ...selectedIncident, personnel_in_charge: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Amount Disbursed</label>
                          <input type="number" value={selectedIncident.amount} onChange={e => setSelectedIncident({ ...selectedIncident, amount: parseFloat(e.target.value) })} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff' }} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Payout Type</label>
                          <select value={selectedIncident.cash_assistance_type} onChange={e => setSelectedIncident({ ...selectedIncident, cash_assistance_type: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff' }}>
                            <option>Baranggay Share</option>
                            <option>Cash Assistance</option>
                            <option>Security Fund</option>
                            <option>Emergency Payout</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Disbursement Method</label>
                          <select value={selectedIncident.payment_method} onChange={e => setSelectedIncident({ ...selectedIncident, payment_method: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff' }}>
                            <option>G-Cash</option>
                            <option>Bank Transfer</option>
                            <option>Over Counter</option>
                            <option>Pera Padala</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Existing Receipts ({selectedIncident.receipts?.length || 0})</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                          {selectedIncident.receipts?.map((doc, i) => (
                            <div key={i} style={{ position: 'relative' }}>
                              <img src={doc.url || doc} alt="R" style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
                              <button onClick={() => {
                                const newR = selectedIncident.receipts.filter((_, idx) => idx !== i);
                                setSelectedIncident({ ...selectedIncident, receipts: newR });
                              }} style={{ position: 'absolute', top: -4, right: -4, background: 'var(--accent-red)', border: 'none', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', cursor: 'pointer' }}>×</button>
                            </div>
                          ))}
                        </div>
                        <input type="file" multiple accept="image/*,application/pdf" onChange={e => setUploadFiles(Array.from(e.target.files))} style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current Disbursement Lifecycle</label>
                        <select value={selectedIncident.status} onChange={e => setSelectedIncident({ ...selectedIncident, status: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff' }}>
                          <option>Awaiting Validation</option>
                          <option>Transferred</option>
                          <option>Completed</option>
                          <option>Disputed</option>
                        </select>
                      </div>
                    </>
                  )}
                  <button type="submit" disabled={uploading} style={{ background: 'var(--accent-green)', color: '#fff', padding: '14px', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Save size={18} /> {uploading ? 'Finalizing...' : 'Update Records In Vault'}
                  </button>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Report Author</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{activeTab === 'incidents' ? selectedIncident.agent_name : selectedIncident.personnel_in_charge}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>Deployment Context</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{activeTab === 'incidents' ? selectedIncident.area : `${selectedIncident.cash_assistance_type} (${selectedIncident.payment_method})`}</div>
                    </div>
                  </div>

                  {activeTab === 'incidents' ? (
                    <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Incident Category</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-red)' }}>{selectedIncident.sop_breakdown}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Logged On</div>
                          <div style={{ fontWeight: '500' }}>{new Date(selectedIncident.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>

                      {selectedIncident.memo_url && (
                        <div style={{ marginTop: '24px' }}>
                          {(() => {
                            const url = selectedIncident.memo_url;
                            const isPdf = String(url).split('?')[0].toLowerCase().endsWith('.pdf');
                            const isImage = String(url).split('?')[0].toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i);

                            if (isPdf) {
                              return (
                                <div onClick={() => setPreviewFile({ url, name: 'Incident Memo' })} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(58, 166, 255, 0.05)', border: '1px solid rgba(58, 166, 255, 0.2)', borderRadius: '12px', color: 'var(--accent-blue)', transition: 'all 0.2s' }}>
                                  <FileText size={24} />
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Incident Memo Document</span>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Click to view proof in vault</span>
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <div onClick={() => setPreviewFile({ url, name: 'Incident Memo' })} style={{ cursor: 'pointer', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', position: 'relative' }}>
                                <img src={url} alt="Memo" style={{ width: '100%', display: 'block' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', display: 'flex', alignItems: 'flex-end', padding: '16px', opacity: 0, transition: 'opacity 0.3s' }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0}>
                                  <span style={{ color: '#fff', fontSize: '0.85rem' }}>View Full Document</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Validated Amount</div>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-green)', letterSpacing: '-1px' }}>
                          ₱ {selectedIncident.amount?.toLocaleString()}
                        </div>
                      </div>

                      {selectedIncident.receipts && selectedIncident.receipts.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px' }}>Disbursement Proofs ({selectedIncident.receipts.length})</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                            {selectedIncident.receipts.map((doc, i) => (
                              <div key={i} onClick={() => setPreviewFile({ url: (doc.url || doc), name: (doc.name || 'Disbursement Proof') })} style={{ cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)', height: '120px' }}>
                                <img src={doc.url || doc} alt="R" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedIncident.notes && (
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', border: '1px solid var(--glass-border)' }}>
                          "{selectedIncident.notes}"
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Lifecycle:</span>
                      <span style={{ padding: '4px 12px', borderRadius: '12px', background: getStatusStyle(selectedIncident.status).bg, color: getStatusStyle(selectedIncident.status).color, fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {selectedIncident.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. CREATE NEW MODAL (Outside transform) */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px'
          }}>
          <div
            onClick={e => e.stopPropagation()}
            className="glass-panel animate-fade-in"
            style={{
              width: '100%', maxWidth: '700px', padding: '24px',
              maxHeight: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column'
            }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, color: activeTab === 'incidents' ? 'var(--accent-red)' : 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {activeTab === 'incidents' ? <ShieldAlert size={20} /> : <Banknote size={20} />}
                  {activeTab === 'incidents' ? 'New Incident Report' : 'New Payout Log'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeTab === 'incidents' ? (
                <>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Personnel</label>
                      <input required value={newItem.agent_name} onChange={e => setNewItem({ ...newItem, agent_name: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff' }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Region Area</label>
                      <input required value={newItem.area} onChange={e => setNewItem({ ...newItem, area: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Incident Category</label>
                    <select required value={newItem.sop_breakdown} onChange={e => setNewItem({ ...newItem, sop_breakdown: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff' }}>
                      <option>Under Investigation</option>
                      <option>SOP Violation</option>
                      <option>Security Breach</option>
                      <option>Internal Misconduct</option>
                      <option>Policy Deviation</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Report Attachment (Proof)</label>
                    <div style={{ border: '2px dashed var(--glass-border)', borderRadius: '12px', padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', position: 'relative' }}>
                      <input type="file" onChange={e => setUploadFile(e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                      <Upload size={24} color="var(--text-secondary)" />
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{uploadFile ? <strong>{uploadFile.name}</strong> : 'Upload Incident Memo'}</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Row 1: Personnel | Type | Method */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Personnel In Charge</label>
                      <input required value={newCashLog.personnel_in_charge} onChange={e => setNewCashLog({ ...newCashLog, personnel_in_charge: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff' }} placeholder="Enter name..." />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Payout Type</label>
                      <select value={newCashLog.cash_assistance_type} onChange={e => setNewCashLog({ ...newCashLog, cash_assistance_type: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff' }}>
                        <option>Baranggay Share</option>
                        <option>Cash Assistance</option>
                        <option>Security Fund</option>
                        <option>Emergency Payout</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Method</label>
                      <select value={newCashLog.payment_method} onChange={e => setNewCashLog({ ...newCashLog, payment_method: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff' }}>
                        <option>G-Cash</option>
                        <option>Bank Transfer</option>
                        <option>Over Counter</option>
                        <option>Pera Padala</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Amount | Status */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Amount (₱)</label>
                      <input required type="number" value={newCashLog.amount} onChange={e => setNewCashLog({ ...newCashLog, amount: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff' }} placeholder="0.00" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Initial Lifecycle</label>
                      <select value={newCashLog.status} onChange={e => setNewCashLog({ ...newCashLog, status: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff' }}>
                        <option>Awaiting Validation</option>
                        <option>Transferred</option>
                        <option>Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Upload Receipts (full width) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Upload Receipts (Multiple Files)</label>
                    <div style={{ border: '2px dashed var(--glass-border)', borderRadius: '12px', padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', position: 'relative' }}>
                      <input type="file" multiple accept="image/*,application/pdf" onChange={e => setUploadFiles(Array.from(e.target.files))} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                      <Upload size={20} color="var(--text-secondary)" />
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {uploadFiles.length > 0 ? <strong>{uploadFiles.length} files selected</strong> : 'Drag & drop receipts here'}
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Notes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Internal Notes (Optional)</label>
                    <textarea rows={2} value={newCashLog.notes} onChange={e => setNewCashLog({ ...newCashLog, notes: e.target.value })} style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: '0.9rem' }} placeholder="Transaction references..." />
                  </div>
                </>
              )}

              <button disabled={uploading} type="submit" style={{ background: activeTab === 'incidents' ? 'var(--accent-red)' : 'var(--accent-blue)', color: '#fff', padding: '14px', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px', opacity: uploading ? 0.7 : 1 }}>
                {uploading ? 'Processing Backend...' : activeTab === 'incidents' ? 'Commit Record' : 'Save Cash Assistance'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Tabs Header */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0' }}>
          <button
            onClick={() => { setActiveTab('incidents'); resetNewItem(); }}
            style={{
              padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: activeTab === 'incidents' ? '2px solid var(--accent-red)' : '2px solid transparent',
              color: activeTab === 'incidents' ? 'var(--accent-red)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <ShieldAlert size={18} /> Incident Management
          </button>
          <button
            onClick={() => { setActiveTab('payouts'); resetNewItem(); }}
            style={{
              padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: activeTab === 'payouts' ? '2px solid var(--accent-blue)' : '2px solid transparent',
              color: activeTab === 'payouts' ? 'var(--accent-blue)' : 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Banknote size={18} /> Payout Logs (Shares/Assistance)
          </button>
        </div>

        {/* Header with Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
              {activeTab === 'incidents' ? <ShieldAlert size={28} color="var(--accent-red)" /> : <Activity size={28} color="var(--accent-blue)" />}
              {activeTab === 'incidents' ? 'Incident Operations' : 'Payout Matrix'}
            </h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {activeTab === 'incidents' ? 'Security & Compliance Logging' : 'Strategic Financial Disbursements'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '12px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                {activeTab === 'incidents' ? 'Total Reports' : 'Total Payout Volume'}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: activeTab === 'incidents' ? 'var(--accent-red)' : 'var(--accent-blue)' }}>
                {activeTab === 'incidents' ? totalIncidents : `₱ ${totalCashOut.toLocaleString()}`}
              </div>
            </div>

            <button onClick={() => setShowModal(true)} style={{ background: activeTab === 'incidents' ? 'var(--accent-red)' : 'var(--accent-blue)', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              <Plus size={20} /> New {activeTab === 'incidents' ? 'Report' : 'Payout'}
            </button>
          </div>
        </div>

        {/* Main Grid Table */}
        <div className="glass-panel" style={{ padding: '0', overflowX: 'auto', background: 'var(--bg-secondary)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <th style={{ padding: '20px', width: '60px' }}>Action</th>
                <th style={{ padding: '20px' }}>Date</th>
                {activeTab === 'incidents' ? (
                  <>
                    <th style={{ padding: '20px' }}>Personnel & Area</th>
                    <th style={{ padding: '20px' }}>Category / SOP</th>
                    <th style={{ padding: '20px' }}>Attachment</th>
                  </>
                ) : (
                  <>
                    <th style={{ padding: '20px' }}>Personnel</th>
                    <th style={{ padding: '20px' }}>Type & Method</th>
                    <th style={{ padding: '20px' }}>Amount (₱)</th>
                    <th style={{ padding: '20px' }}>Receipts</th>
                  </>
                )}
                <th style={{ padding: '20px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center' }}>Syncing telemetry...</td></tr>
              ) : processedData.map(item => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedIncident(item)} // Generic selection
                  style={{ borderBottom: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '20px' }}>
                    <button
                      onClick={(e) => handleDeleteIncident(e, item.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '12px', opacity: 0.6, position: 'relative', zIndex: 10 }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                      onMouseOut={(e) => e.currentTarget.style.opacity = 0.6}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                  <td style={{ padding: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {new Date(activeTab === 'incidents' ? item.date_posted : item.date).toLocaleDateString()}
                  </td>

                  {activeTab === 'incidents' ? (
                    <>
                      <td style={{ padding: '20px' }}>
                        <div style={{ fontWeight: 'bold' }}>{item.agent_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.area}</div>
                      </td>
                      <td style={{ padding: '20px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldAlert size={14} color="var(--accent-red)" />
                          {item.sop_breakdown}
                        </div>
                      </td>
                      <td style={{ padding: '20px' }}>
                        {item.file_url ? <span style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={16} /> Ready</span> : <span style={{ opacity: 0.3 }}>-</span>}
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '20px' }}>
                        <div style={{ fontWeight: 'bold' }}>{item.personnel_in_charge}</div>
                      </td>
                      <td style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Banknote size={14} color="var(--accent-blue)" />
                          {item.cash_assistance_type}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>via {item.payment_method}</div>
                      </td>
                      <td style={{ padding: '20px', fontWeight: 'bold', color: 'var(--accent-blue)' }}>
                        ₱ {(item.amount || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '20px' }}>
                        {item.receipts && item.receipts.length > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-blue)', fontSize: '0.85rem' }}>
                            <FileText size={16} /> <strong>{item.receipts.length}</strong> {item.receipts.length === 1 ? 'Receipt' : 'Receipts'}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.85rem', opacity: 0.3 }}>None</span>
                        )}
                      </td>
                    </>
                  )}

                  <td style={{ padding: '20px' }}>
                    <span style={{
                      color: item.status?.toLowerCase() === 'open' || item.status === 'Pending' ? 'var(--accent-red)' : 'var(--accent-green)',
                      background: item.status?.toLowerCase() === 'open' || item.status === 'Pending' ? 'rgba(255,123,114,0.1)' : 'rgba(63,185,80,0.1)',
                      padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold'
                    }}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {processedData.length === 0 && !loading && (
                <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>No records found for this category.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* 4. FILE PREVIEW MODAL (A4 Readable Layout) */}
      {previewFile && (
        <div
          onClick={() => setPreviewFile(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div onClick={e => e.stopPropagation()} className="animate-fade-in" style={{
            width: '850px',
            height: '95vh',
            maxWidth: '100%',
            background: '#fff',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
            position: 'relative'
          }}>
            {/* Header Tray */}
            <div style={{ padding: '16px 24px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(88, 166, 255, 0.1)', padding: '8px', borderRadius: '8px' }}>
                  <FileText size={20} color="var(--accent-blue)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{previewFile.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Document Preview Mode</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <a href={previewFile.url} download style={{ background: 'var(--accent-blue)', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold' }}>Download</a>
                <button onClick={() => setPreviewFile(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><X size={20} /></button>
              </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, position: 'relative', background: '#f0f2f5' }}>
              {(() => {
                const ext = previewFile.name.split('.').pop().toLowerCase();
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                const isDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext);
                const isPdf = ext === 'pdf';

                if (isImage) {
                  return (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                      <img src={previewFile.url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }} />
                    </div>
                  );
                }

                if (isPdf) {
                  return <iframe src={previewFile.url} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Preview" />;
                }

                if (isDoc) {
                  return <iframe src={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(previewFile.url)}`} style={{ width: '100%', height: '100%', border: 'none' }} title="Office Preview" />;
                }

                return (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#656d76' }}>
                    <div style={{ background: '#fff', padding: '48px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                      <div style={{ background: '#f0f2f5', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <FileText size={40} />
                      </div>
                      <h3 style={{ margin: '0 0 8px 0' }}>Preview Unavailable</h3>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>This file type must be downloaded to be viewed.</p>
                      <a href={previewFile.url} download style={{ display: 'inline-block', marginTop: '24px', color: 'var(--accent-blue)', fontWeight: 'bold', textDecoration: 'none' }}>Download File Now</a>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SFOperations;
