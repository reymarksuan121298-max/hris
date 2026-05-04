import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Users, Filter, Eye, X, Mail, Phone, MapPin, Briefcase, UserRound, Activity, Edit2, Search, Trash2, Save, UserPlus, ShieldAlert, CheckCircle, Upload, FileText, FileCode, GraduationCap, Award, ScrollText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const MODULAR_DOCS_LIST = [
  { key: 'pds', label: 'Personal Data Sheet (PDS)' },
  { key: 'sss', label: 'SSS Number / Document' },
  { key: 'bir', label: 'BIR (TIN / 2316 / Registration)' },
  { key: 'tin', label: 'TIN ID / Record' },
  { key: 'philhealth', label: 'PhilHealth ID / Record' },
  { key: 'tor', label: 'TOR (Transcript of Records)' },
  { key: 'diploma', label: 'Diploma' },
  { key: 'work_history', label: 'Work History / Employment Certificates' }
];

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState(null); // Track which doc is uploading
  const navigate = useNavigate();
  const location = useLocation();

  // Modal States
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  
  // Status Editing Toggle
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  // Full Profile CRUD States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showChecklistDropdown, setShowChecklistDropdown] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const fetchEmployees = async () => {
    const [empRes, deptRes, desigRes] = await Promise.all([
      supabase.from('employees').select('*, departments(name), designations(name)').limit(500),
      supabase.from('departments').select('*'),
      supabase.from('designations').select('*')
    ]);

    if (!deptRes.error && deptRes.data) setDepartments(deptRes.data);
    if (!desigRes.error && desigRes.data) setDesignations(desigRes.data);

    if (!empRes.error && empRes.data) {
      setEmployees(empRes.data.map(emp => ({
        ...emp,
        department: emp.departments?.name || emp.department,
        position: emp.designations?.name || emp.position
      })));
    }
    setLoading(false);
  };

  // Open the Profile Modal & Seed Form Data
  const openProfile = (emp) => {
    setSelectedProfile(emp);
    setEditForm(emp);
    setIsEditingProfile(false);
  };

  // Lock body scroll when modals are open
  useEffect(() => {
    if (selectedFileUrl || selectedProfile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedFileUrl, selectedProfile]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle deep-linking from Onboarding Vault
  useEffect(() => {
    if (!loading && employees.length > 0 && location.state?.openEmployeeId) {
      const target = employees.find(e => e.id === location.state.openEmployeeId);
      if (target) {
        openProfile(target);
      }
    }
  }, [loading, employees, location.state]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Applicant / Pre-Hire Stage': return { bg: 'rgba(255, 165, 0, 0.15)', color: '#FFB84D' };
      case 'Regular / Permanent Status': return { bg: 'rgba(63, 185, 80, 0.15)', color: 'var(--accent-green)' };
      case 'Project-Based / Contractual': return { bg: 'rgba(163, 113, 247, 0.15)', color: 'var(--accent-purple)' };
      case 'Suspended / On-Leave Status': return { bg: 'rgba(255, 123, 114, 0.15)', color: 'var(--accent-red)' };
      case 'Separated / Offboarded': return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' };
      default: return { bg: 'rgba(88, 166, 255, 0.15)', color: 'var(--accent-blue)' };
    }
  };

  const getDocStatusStyle = (status) => {
    switch (status) {
      case 'Approved': return { color: 'var(--accent-green)', bg: 'rgba(63, 185, 80, 0.1)' };
      case 'Rejected': return { color: 'var(--accent-red)', bg: 'rgba(255, 123, 114, 0.1)' };
      case 'Pending Verification': return { color: 'var(--accent-blue)', bg: 'rgba(88, 166, 255, 0.1)' };
      case 'Uploaded': return { color: '#fff', bg: 'rgba(255, 255, 255, 0.1)' };
      default: return { color: 'var(--text-secondary)', bg: 'transparent' };
    }
  };

  // 1. UPDATE: Inline Status Handle
  const handleStatusChange = async (newStatus) => {
    const updatedProfile = { ...selectedProfile, employment_status: newStatus };
    setSelectedProfile(updatedProfile);
    setIsEditingStatus(false);
    
    const { error } = await supabase.from('employees').update({ employment_status: newStatus }).eq('id', selectedProfile.id);
    
    if (error) {
      console.error("SUPABASE ERROR [Status Change]:", error);
      alert(`Update failed: ${error.message}`);
    } else {
      fetchEmployees();
    }
  };

  // 2. UPDATE: Save Full Edited Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

      const updateData = {
        name_english: editForm.name_english,
        email: editForm.email,
        mobile: editForm.mobile,
        employment_status: editForm.employment_status,
        dob: editForm.dob,
        sex: editForm.sex,
        blood_type: editForm.blood_type,
        residence_address: editForm.residence_address,
        school_name: editForm.school_name,
        educational: editForm.educational,
        highest_level: editForm.highest_level,
        major_subject: editForm.major_subject,
        skills: editForm.skills,
        work_history: editForm.work_history,
        csc_license: editForm.csc_license,
        csc_date: editForm.csc_date,
        legal_34_40: editForm.legal_34_40
      };

      if (editForm.department_id) {
        updateData.department_id = parseInt(editForm.department_id, 10);
        updateData.department = null;
      }
      if (editForm.designation_id) {
        updateData.designation_id = parseInt(editForm.designation_id, 10);
        updateData.position = null;
      }

    const { error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', selectedProfile.id);

    if (!error) {
       setSelectedProfile(editForm);
       setIsEditingProfile(false);
       fetchEmployees();
    } else {
       console.error("Failed Update:", error);
       alert("Failed to update profile constraints.");
    }
    setLoading(false);
  };

  // 3. DELETE: Remove Employee Completely
  const handleDeleteEmployee = async (id, nameStr) => {
    if (window.confirm(`CRITICAL WARNING: Are you strictly sure you want to permanently delete the 201 File and Database Record for ${nameStr}? This action cannot be undone.`)) {
       setLoading(true);
       const { error } = await supabase.from('employees').delete().eq('id', id);
       if (!error) {
         setSelectedProfile(null);
         fetchEmployees();
       } else {
         alert("Could not delete record. Database dependency conflict might exist.");
       }
       setLoading(false);
    }
  };

  const fileRequirements = [
    'Full name', 'Date of birth', 'Address', 'Contact information',
    'SSS number', 'BIR number', 'Tax Identification number (TIN)', 
    'PhilHealth number', 'Pag-IBIG Home Development Mutual Fund (HDMF) number',
    'Education transcripts or diplomas', 'Performance assessments', 'Clearances', 
    'Corrective actions', 'Work history', 'Post-employment information', 'Hiring requirements'
  ];

  // Modular Document Logic
  const handleDocUpload = async (docKey, file) => {
    if (!file) return;
    setUploadingDoc(docKey);
    
    // 1. Upload to Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${selectedProfile.id}_${docKey}_${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('201_files')
      .upload(fileName, file);

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploadingDoc(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('201_files').getPublicUrl(uploadData.path);

    // 2. Update Database Object
    const currentDocs = selectedProfile.modular_docs || {};
    const updatedDocs = {
      ...currentDocs,
      [docKey]: {
        url: publicUrl,
        name: file.name,
        status: 'Pending Verification',
        uploaded_at: new Date().toISOString(),
        remarks: ''
      }
    };

    const { error: dbError } = await supabase.from('employees')
      .update({ modular_docs: updatedDocs })
      .eq('id', selectedProfile.id);

    if (dbError) {
      console.error("SUPABASE ERROR [Doc Upload DB Update]:", dbError);
      alert(`Failed to update compliance record: ${dbError.message}`);
    } else {
      setSelectedProfile({ ...selectedProfile, modular_docs: updatedDocs });
      fetchEmployees();
    }
    setUploadingDoc(null);
  };

  const handleDocVerify = async (docKey, status, remarks = '') => {
    const currentDocs = selectedProfile.modular_docs || {};
    const updatedDocs = {
      ...currentDocs,
      [docKey]: {
        ...currentDocs[docKey],
        status: status,
        verified_at: new Date().toISOString(),
        remarks: remarks
      }
    };

    const { error } = await supabase.from('employees')
      .update({ modular_docs: updatedDocs })
      .eq('id', selectedProfile.id);

    if (!error) {
      setSelectedProfile({ ...selectedProfile, modular_docs: updatedDocs });
      fetchEmployees();
    }
  };


  // Derived Filtered List
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      (emp.name_english?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
      (emp.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (emp.department?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
    const currentStatus = emp.employment_status || 'Probationary Status';
    const matchesStatus = statusFilter === 'All' || currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      {/* 201 File Viewer Modal */}
      {/* 201 File Viewer Modal */}
      {selectedFileUrl && (
        <div 
          onClick={() => setSelectedFileUrl(null)} 
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)', zIndex: 10000, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' 
          }}>
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="glass-panel animate-fade-in"
            style={{ 
              width: '100%', maxWidth: '1100px', height: '90vh', display: 'flex', flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
            }}>
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-tertiary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={20} color="var(--accent-blue)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>SGC 201 Document Vault</h3>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <a href={selectedFileUrl} target="_blank" rel="noreferrer" style={{ background: 'var(--accent-blue)', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold' }}>Original Resource</a>
                <button 
                  onClick={() => setSelectedFileUrl(null)} 
                  style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
            </div>
            <div style={{ flex: 1, backgroundColor: '#f0f2f5', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {(() => {
                 const url = String(selectedFileUrl);
                 const cleanUrl = url.split('?')[0];
                 const ext = cleanUrl.split('.').pop().toLowerCase();
                 const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                 const isDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext);
                 const isPdf = ext === 'pdf';

                 if (isImage) {
                   return <img src={selectedFileUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />;
                 }
                 if (isPdf) {
                    return <iframe src={selectedFileUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Viewer" />;
                 }
                 if (isDoc) {
                    const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(selectedFileUrl)}`;
                    return <iframe src={viewerUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Doc Viewer"/>;
                 }
                 // Default to standard iframe if unknown but present
                 return <iframe src={selectedFileUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Generic Viewer"/>;
               })()}
            </div>
          </div>
        </div>
      )}

      {/* Employee Profile Preview / Edit CRUD Modal */}
      {selectedProfile && (
        <div 
          onClick={() => { setSelectedProfile(null); setIsEditingStatus(false); setIsEditingProfile(false); }}
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', 
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', 
            padding: '24px'
          }}>
          <div 
            onClick={(e) => e.stopPropagation()}
            className="glass-panel animate-fade-in" 
            style={{ 
              width: '100%', maxWidth: '1100px', maxHeight: '100%', 
              overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: 0, 
              position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' 
            }}>
            <div style={{ height: '140px', background: 'var(--accent-gradient)', position: 'relative', flexShrink: 0, borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
              <div style={{ position: 'absolute', top: '16px', right: '64px' }}>
                <button onClick={() => setShowChecklistDropdown(!showChecklistDropdown)} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  <ShieldAlert size={14} color={MODULAR_DOCS_LIST.filter(d => (selectedProfile.modular_docs?.[d.key]?.status === 'Approved')).length === MODULAR_DOCS_LIST.length ? 'var(--accent-green)' : 'var(--accent-red)'}/>
                  Vault Compliance Matrix
                  <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                    {MODULAR_DOCS_LIST.filter(d => selectedProfile.modular_docs?.[d.key]?.url).length}/{MODULAR_DOCS_LIST.length}
                  </span>
                </button>

                {showChecklistDropdown && (
                  <div onClick={e => e.stopPropagation()} className="glass-panel animate-fade-in" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '450px', maxHeight: '550px', overflowY: 'auto', zIndex: 99999, padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                       <h3 style={{ margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                          <CheckCircle size={18} color="var(--accent-green)" /> 201 Modular Repository
                       </h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                       {MODULAR_DOCS_LIST.map((doc, idx) => {
                          const docData = selectedProfile.modular_docs?.[doc.key];
                          const hasFile = !!docData?.url;
                          const styles = getDocStatusStyle(docData?.status || 'Missing');
                          
                          return (
                             <div key={idx} style={{ 
                               padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', 
                               border: `1px solid ${hasFile ? 'var(--glass-border)' : 'rgba(255,123,114,0.1)'}`, 
                               display: 'flex', flexDirection: 'column', gap: '12px'
                             }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                   <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: hasFile ? '#fff' : 'var(--text-secondary)' }}>{doc.label}</span>
                                      <span style={{ fontSize: '0.7rem', color: styles.color, fontWeight: 'bold', textTransform: 'uppercase' }}>{docData?.status || 'Missing'}</span>
                                   </div>
                                   <div style={{ display: 'flex', gap: '8px' }}>
                                      {hasFile && (
                                        <button onClick={() => setSelectedFileUrl(docData.url)} style={{ background: 'rgba(88, 166, 255, 0.1)', border: 'none', color: 'var(--accent-blue)', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}><Eye size={14} /></button>
                                      )}
                                      <label style={{ background: 'var(--accent-blue)', color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                         <Upload size={12} /> {uploadingDoc === doc.key ? '...' : 'Upload'}
                                         <input type="file" hidden onChange={(e) => handleDocUpload(doc.key, e.target.files[0])} />
                                      </label>
                                   </div>
                                </div>

                                {hasFile && (
                                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                                     <button onClick={() => handleDocVerify(doc.key, 'Approved')} style={{ flex: 1, background: 'rgba(63, 185, 80, 0.1)', border: '1px solid rgba(63, 185, 80, 0.2)', color: 'var(--accent-green)', padding: '6px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>Approve</button>
                                     <button onClick={() => { const r = prompt("Reason for rejection?"); if(r) handleDocVerify(doc.key, 'Rejected', r); }} style={{ flex: 1, background: 'rgba(255, 123, 114, 0.1)', border: '1px solid rgba(255, 123, 114, 0.2)', color: 'var(--accent-red)', padding: '6px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>Reject</button>
                                  </div>
                                )}
                                
                                {docData?.remarks && (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-red)', background: 'rgba(255,123,114,0.05)', padding: '8px', borderRadius: '6px', fontStyle: 'italic' }}>
                                    "{docData.remarks}"
                                  </div>
                                )}
                                {docData?.uploaded_at && (
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                                    Uploaded: {new Date(docData.uploaded_at).toLocaleDateString()}
                                  </div>
                                )}
                             </div>
                          );
                       })}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => { setSelectedProfile(null); setIsEditingStatus(false); setIsEditingProfile(false); setShowChecklistDropdown(false); }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>

              <div style={{ position: 'absolute', top: '24px', left: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 {!isEditingStatus ? (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>
                     <Activity size={16} color={getStatusStyle(selectedProfile.employment_status || 'Probationary Status').color} /> 
                     {selectedProfile.employment_status || 'Probationary Status'}
                     {!isEditingProfile && (
                       <button onClick={() => setIsEditingStatus(true)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', marginLeft: '4px', paddingTop: '4px' }}>
                         <Edit2 size={14} />
                       </button>
                     )}
                   </div>
                 ) : (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
                     <select 
                       value={selectedProfile.employment_status || 'Probationary Status'} 
                       onChange={(e) => handleStatusChange(e.target.value)}
                       style={{ background: 'transparent', border: 'none', color: '#fff', padding: '6px', fontSize: '0.85rem', fontWeight: 'bold', outline: 'none' }}
                     >
                       <option style={{ color: '#000' }} value="Applicant / Pre-Hire Stage">Applicant / Pre-Hire</option>
                       <option style={{ color: '#000' }} value="Probationary Status">Probationary Status</option>
                       <option style={{ color: '#000' }} value="Regular / Permanent Status">Regular / Permanent</option>
                       <option style={{ color: '#000' }} value="Project-Based / Contractual">Project-Based / Contractual</option>
                       <option style={{ color: '#000' }} value="Suspended / On-Leave Status">Suspended / On-Leave</option>
                       <option style={{ color: '#000' }} value="Separated / Offboarded">Separated / Offboarded</option>
                     </select>
                     <button onClick={() => setIsEditingStatus(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer' }}>
                       <X size={14} />
                     </button>
                   </div>
                 )}
              </div>
            </div>
            
            <div style={{ padding: '0 32px 32px', position: 'relative' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                 <div style={{ width: '130px', height: '130px', marginTop: '-65px', borderRadius: '50%', border: '6px solid var(--bg-secondary)', background: 'var(--bg-primary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                   {selectedProfile.photo_url ? (
                     <img src={selectedProfile.photo_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   ) : (
                     <UserRound size={64} color="var(--text-secondary)" />
                   )}
                 </div>
                 
                 {/* Action Buttons: Edit / Delete */}
                 <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {!isEditingProfile ? (
                      <>
                        <button onClick={() => setIsEditingProfile(true)} style={{ background: 'var(--accent-blue)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                          <Edit2 size={16} /> Edit Record
                        </button>
                        <button onClick={() => handleDeleteEmployee(selectedProfile.id, selectedProfile.name_english)} style={{ background: 'rgba(255, 123, 114, 0.1)', color: 'var(--accent-red)', border: '1px solid rgba(255, 123, 114, 0.3)', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                          <Trash2 size={16} /> Delete
                        </button>
                      </>
                    ) : (
                      <button onClick={() => { setIsEditingProfile(false); setEditForm(selectedProfile); }} style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                        Cancel Formatting
                      </button>
                    )}
                 </div>
              </div>

              {/* Edit Mode Content vs View Mode Content */}
              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Full Legal Name</label>
                      <input required value={editForm.name_english || ''} onChange={(e) => setEditForm({...editForm, name_english: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Department</label>
                        <select value={editForm.department_id || ''} onChange={(e) => setEditForm({...editForm, department_id: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }}>
                          <option value="">{editForm.department || 'Select Department'}</option>
                          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Designation / Position</label>
                        <select value={editForm.designation_id || ''} onChange={(e) => setEditForm({...editForm, designation_id: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }}>
                          <option value="">{editForm.position || 'Select Designation'}</option>
                          {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email Allocation</label>
                        <input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({...editForm, email: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mobile Dispatch</label>
                        <input value={editForm.mobile || ''} onChange={(e) => setEditForm({...editForm, mobile: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginTop: '8px' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <GraduationCap size={16} /> Educational & Professional Credentials
                      </h4>
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Institutional Name</label>
                          <input value={editForm.school_name || ''} onChange={(e) => setEditForm({...editForm, school_name: e.target.value})} placeholder="School / University" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Degree / Course</label>
                          <input value={editForm.major_subject || ''} onChange={(e) => setEditForm({...editForm, major_subject: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Educational Level</label>
                          <select value={editForm.educational || ''} onChange={(e) => setEditForm({...editForm, educational: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }}>
                            <option></option><option>High School</option><option>Vocational</option><option>College</option><option>Graduate Studies</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>CSC Eligibility</label>
                          <input value={editForm.csc_license || ''} onChange={(e) => setEditForm({...editForm, csc_license: e.target.value})} placeholder="License / Rating" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Eligibility Date</label>
                          <input type="date" value={editForm.csc_date || ''} onChange={(e) => setEditForm({...editForm, csc_date: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginTop: '8px' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-green)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={16} /> Skill Matrix & Work History
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Specialized Skills</label>
                          <textarea value={editForm.skills || ''} onChange={(e) => setEditForm({...editForm, skills: e.target.value})} rows={2} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none', resize: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Work History Summary</label>
                          <textarea value={editForm.work_history || ''} onChange={(e) => setEditForm({...editForm, work_history: e.target.value})} rows={2} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none', resize: 'none' }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Registered Residence</label>
                      <input value={editForm.residence_address || ''} onChange={(e) => setEditForm({...editForm, residence_address: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Date of Birth</label>
                        <input type="date" value={editForm.dob || ''} onChange={(e) => setEditForm({...editForm, dob: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gender Assignment</label>
                        <select value={editForm.sex || ''} onChange={(e) => setEditForm({...editForm, sex: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }}>
                           <option></option><option>Male</option><option>Female</option>
                        </select>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Blood Indexing</label>
                        <input value={editForm.blood_type || ''} onChange={(e) => setEditForm({...editForm, blood_type: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                    </div>

                    <button type="submit" disabled={loading} style={{ background: 'var(--accent-green)', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', marginTop: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                       <Save size={18} /> {loading ? 'Committing...' : 'Commit Database Changes'}
                    </button>
                </form>
              ) : (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{selectedProfile.name_english}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', fontWeight: 'bold' }}>
                      <Briefcase size={16} /> {selectedProfile.position || 'No Position mapped'} &bull; {selectedProfile.department || 'Corporate Tier'}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--bg-tertiary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={16} color="var(--accent-purple)"/></div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email Allocation</div>
                        <div style={{ fontWeight: '500' }}>{selectedProfile.email || 'N/A'}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={16} color="var(--accent-green)"/></div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mobile Dispatch</div>
                        <div style={{ fontWeight: '500' }}>{selectedProfile.mobile || 'N/A'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', gridColumn: 'span 2' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={16} color="var(--accent-red)"/></div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Registered Residence</div>
                        <div style={{ fontWeight: '500' }}>{selectedProfile.residence_address || 'Address missing in vault.'} {selectedProfile.residence_postal}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', padding: '16px 0', borderTop: '1px solid var(--glass-border)' }}>
                     <div style={{ flex: 1 }}>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Blood Indexing</div>
                       <div style={{ fontWeight: 'bold' }}>{selectedProfile.blood_type || '-'}</div>
                     </div>
                     <div style={{ flex: 1 }}>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gender Assignment</div>
                       <div style={{ fontWeight: 'bold' }}>{selectedProfile.sex || '-'}</div>
                     </div>
                     <div style={{ flex: 1 }}>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Date of Birth</div>
                       <div style={{ fontWeight: 'bold' }}>{selectedProfile.dob || '-'}</div>
                     </div>
                  </div>

                  {selectedProfile.file_201_url && (
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginTop: '8px' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Upload size={16} color="var(--accent-blue)" /> Raw 201 File Dump (Uncategorized)
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {selectedProfile.file_201_url.split(',').map((url, idx) => (
                          <button key={idx} onClick={() => setSelectedFileUrl(url)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FileText size={14} /> Attachment {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Directory Layout */}
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        
        {/* Left Header */}
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <Users size={24} color="var(--accent-blue)" /> Active Employee
          </h2>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Showing {filteredEmployees.length} resulting profiles from database.
          </div>
        </div>

        {/* Right Buttons Container: Search, Status Mapping & Direct Create */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, justifyContent: 'flex-end' }}>
          {/* 1. Integrated Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '8px 16px', borderRadius: '10px', width: '100%', maxWidth: '350px' }}>
            <Search size={16} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Search employee..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.85rem' }} 
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}><X size={16}/></button>
            )}
          </div>

          {/* 2. Status Mapping */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '8px 12px', borderRadius: '10px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>STATUS</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.8rem', cursor: 'pointer', paddingRight: '24px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Applicant / Pre-Hire Stage">Applicant / Pre-Hire</option>
              <option value="Probationary Status">Probationary Status</option>
              <option value="Regular / Permanent Status">Regular / Permanent Status</option>
              <option value="Project-Based / Contractual">Project-Based / Contractual</option>
              <option value="Suspended / On-Leave Status">Suspended / On-Leave</option>
              <option value="Separated / Offboarded">Separated / Offboarded</option>
            </select>
          </div>

          {/* 4. Action Button */}
          <button 
            onClick={() => navigate('/onboarding')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: 'var(--accent-green)', 
              border: 'none', 
              color: '#fff', fontWeight: 'bold', 
              padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 15px rgba(63, 185, 80, 0.4)',
              fontSize: '0.85rem', whiteSpace: 'nowrap'
            }}
          >
            <UserPlus size={16} /> Stage New Hire
          </button>
        </div>
      </div>



      {/* Roster Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '16px' }}>Full Legal Name</th>
              <th style={{ padding: '16px' }}>Role & Department</th>
              <th style={{ padding: '16px' }}>Current Mapping</th>
              <th style={{ padding: '16px' }}>Network Contacts</th>
              <th style={{ padding: '16px' }}>Clearance File</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center' }}>Synchronizing CRUD matrices...</td></tr>
            ) : filteredEmployees.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No employee records matched your strict filters.</td></tr>
            ) : (
              filteredEmployees.map(emp => (
                <tr key={emp.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                  
                  {/* Clickable Full Name */}
                  <td style={{ padding: '16px', fontWeight: 'bold' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                       <div 
                         onClick={() => openProfile(emp)}
                         style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'color 0.2s', color: 'var(--text-primary)' }}
                         onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-blue)'}
                         onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                       >
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {emp.photo_url ? <img src={emp.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="P" /> : <UserRound size={16} color="var(--text-secondary)" />}
                          </div>
                          {emp.name_english}
                       </div>
                       
                        {/* Table-view Compliance Progress Bar */}
                       <div style={{ width: '140px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                             {(() => {
                               const uploadedCount = MODULAR_DOCS_LIST.filter(d => emp.modular_docs?.[d.key]?.url).length;
                               const approvedCount = MODULAR_DOCS_LIST.filter(d => emp.modular_docs?.[d.key]?.status === 'Approved').length;
                               const pct = (uploadedCount / MODULAR_DOCS_LIST.length) * 100;
                               return (
                                 <div style={{ 
                                    width: `${pct}%`, 
                                    height: '100%', 
                                    background: approvedCount === MODULAR_DOCS_LIST.length ? 'var(--accent-green)' : pct > 75 ? 'var(--accent-blue)' : 'var(--accent-red)',
                                    transition: 'width 0.4s ease' 
                                 }} />
                               );
                             })()}
                          </div>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.8 }}>
                             {Math.round((MODULAR_DOCS_LIST.filter(d => emp.modular_docs?.[d.key]?.url).length / MODULAR_DOCS_LIST.length) * 100)}%
                          </span>
                       </div>
                    </div>
                  </td>

                  <td style={{ padding: '16px' }}>
                     <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px', fontSize: '0.9rem' }}>{emp.position || 'Tier Unassigned'}</div>
                     <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', background: 'rgba(88, 166, 255, 0.1)', border: '1px solid rgba(88, 166, 255, 0.2)', padding: '2px 8px', borderRadius: '12px', display: 'inline-block', whiteSpace: 'nowrap' }}>{emp.department || 'No Department'}</span>
                  </td>
                  
                  <td style={{ padding: '16px' }}>
                     <span style={{ 
                       padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block',
                       background: getStatusStyle(emp.employment_status || 'Probationary Status').bg,
                       color: getStatusStyle(emp.employment_status || 'Probationary Status').color 
                     }}>
                       {emp.employment_status || 'Probationary Status'}
                     </span>
                  </td>

                  <td style={{ padding: '16px', fontSize: '0.9rem' }}>
                    <div>{emp.email || 'N/A'}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>{emp.mobile || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button 
                      onClick={() => openProfile(emp)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '6px', 
                        background: 'rgba(88, 166, 255, 0.15)', border: '1px solid rgba(88, 166, 255, 0.3)', 
                        color: 'var(--accent-blue)', padding: '6px 12px', borderRadius: '6px', 
                        fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <Eye size={16} /> Documents
                    </button>
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

export default EmployeeDirectory;
