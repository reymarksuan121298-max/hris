import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { supabase } from '../supabaseClient';
import {
  Users, Building2, Briefcase, Mail, Phone, ChevronDown, ChevronRight,
  Search, Filter, Plus, LayoutGrid, List, MoreVertical, ShieldCheck, X,
  UserRound, UploadCloud, Eye, Edit2, Trash2, Save, Activity, CheckCircle, FileText,
  Upload, ShieldAlert, MapPin, AlertTriangle, History
} from 'lucide-react';
import QuickStageModal from './QuickStageModal';

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

const isTeller = (emp) => {
  const pos = (emp.position || '').toLowerCase();
  const dept = (emp.department || '').toLowerCase();
  return pos.includes('teller') || dept.includes('teller') || dept.includes('gaming');
};

// --- Sub-Components ---

const RosterControls = ({ viewMode, setViewMode, searchQuery, setSearchQuery, onQuickStage }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Roster & Segregation</h3>
      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Categorized workforce tracking for HQ operations and distribution pipelines.</p>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div className="glass-panel" style={{ display: 'flex', padding: '4px', gap: '4px', borderRadius: '10px' }}>
        <button
          onClick={() => setViewMode('list')}
          style={{
            padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: viewMode === 'list' ? 'var(--accent-blue)' : 'transparent',
            color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
        >
          <List size={18} />
        </button>
        <button
          onClick={() => setViewMode('grid')}
          style={{
            padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: viewMode === 'grid' ? 'var(--accent-blue)' : 'transparent',
            color: viewMode === 'grid' ? '#fff' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
        >
          <LayoutGrid size={18} />
        </button>
      </div>

      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px', minWidth: '280px' }}>
        <Search size={18} color="var(--text-secondary)" />
        <input
          type="text"
          placeholder="Search roster..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: 'transparent', border: 'none', color: '#fff',
            padding: '12px 0', outline: 'none', width: '100%', fontSize: '0.9rem'
          }}
        />
      </div>

      <button className="glass-button" style={{ padding: '12px' }}>
        <Filter size={18} />
      </button>

      <button
        onClick={onQuickStage}
        style={{
          background: 'var(--accent-gradient)', color: '#fff', border: 'none',
          padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 4px 15px rgba(88, 166, 255, 0.3)'
        }}
      >
        <Plus size={20} /> Quick Stage
      </button>
    </div>
  </div>
);

const EmployeeRow = memo(({ employee, openProfile }) => (
  <div
    className="employee-row-hover"
    onClick={() => openProfile && openProfile(employee)}
    style={{
      display: 'grid', gridTemplateColumns: 'minmax(250px, 1.5fr) 2fr 150px',
      alignItems: 'center', padding: '14px 24px',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{
        width: '42px', height: '42px', borderRadius: '50%',
        overflow: 'hidden', border: '1px solid var(--glass-border)',
        background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {employee.photo_url ? (
          <img src={employee.photo_url} alt={employee.name_english} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
        ) : (
          <UserRound size={20} color="var(--text-secondary)" />
        )}
      </div>
      <div>
        <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.95rem' }}>{employee.name_english || 'Unassigned Name'}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>ID: {String(employee.id || '').slice(0, 8).toUpperCase()}</div>
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
      <div style={{ minWidth: '150px' }}>
        <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '500' }}>{employee.position || 'Staff'}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Position</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        <Mail size={14} color="var(--accent-blue)" />
        <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{employee.email || 'N/A'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        <Phone size={14} color="var(--accent-green)" />
        <span>{employee.mobile || 'N/A'}</span>
      </div>
    </div>

    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{
        padding: '6px 14px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        background: (employee.employment_status || '').toLowerCase().includes('regular') ? 'rgba(63, 185, 80, 0.1)' : 'rgba(88, 166, 255, 0.1)',
        color: (employee.employment_status || '').toLowerCase().includes('regular') ? 'var(--accent-green)' : 'var(--accent-blue)',
        border: `1px solid ${(employee.employment_status || '').toLowerCase().includes('regular') ? 'rgba(63, 185, 80, 0.2)' : 'rgba(88, 166, 255, 0.2)'}`
      }}>
        {((employee.employment_status || 'Probationary').split(' / ')[0])}
      </div>
    </div>
  </div>
));
EmployeeRow.displayName = 'EmployeeRow';

const TellerArea = memo(({ tableName, areaLabel, viewMode, searchQuery, nameFields, openProfile }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(30);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchArea = async () => {
      setLoading(true);
      const from = currentPage * pageSize;
      const to = from + pageSize - 1;

      const { data: res, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .range(from, to);
      
      if (!error && res) {
        setTotalCount(count || 0);
        const mapped = res.map(t => ({
          ...t,
          name_english: nameFields.reduce((acc, field) => acc || t[field], null) || 'Unassigned Name',
          position: t.outlet || `Teller (${areaLabel})`,
          department: areaLabel,
          mobile: t.contact_number || t.mobile,
          is_from_tellers_table: true
        }));
        setData(mapped);
      }
      setLoading(false);
    };
    fetchArea();
  }, [tableName, areaLabel, nameFields, currentPage, pageSize]);

  // Reset to page 0 if table changes
  useEffect(() => { setCurrentPage(0); }, [tableName]);

  const filtered = useMemo(() => {
    const query = searchQuery?.toLowerCase() || '';
    if (!query) return data;
    return data.filter(emp =>
      emp.name_english?.toLowerCase().includes(query) ||
      emp.position?.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
      <div className="spinner-glow" style={{ width: '30px', height: '30px', border: '3px solid rgba(88, 166, 255, 0.1)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    </div>
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <div>Showing {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount} entries in {areaLabel}</div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

           <button 
             disabled={currentPage === 0} 
             onClick={() => setCurrentPage(p => p - 1)}
             className="glass-button" 
             style={{ padding: '6px 14px', borderRadius: '8px', opacity: currentPage === 0 ? 0.3 : 1 }}
           >
             Previous
           </button>
           <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0 15px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
             Page {currentPage + 1} of {totalPages}
           </div>
           <button 
             disabled={currentPage >= totalPages - 1} 
             onClick={() => setCurrentPage(p => p + 1)}
             className="glass-button" 
             style={{ padding: '6px 14px', borderRadius: '8px', opacity: currentPage >= totalPages - 1 ? 0.3 : 1 }}
           >
             Next
           </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Users size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <div>No personnel records found in the {areaLabel} matrix for this page.</div>
        </div>
      ) : (
        viewMode === 'list' ? (
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'minmax(250px, 1.5fr) 2fr 150px',
              padding: '12px 24px', background: 'rgba(255,255,255,0.05)',
              fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)',
              textTransform: 'uppercase', letterSpacing: '1px'
            }}>
              <span>Teller Name</span>
              <span>Location / Assignment & Contact</span>
              <span style={{ textAlign: 'right' }}>Status Matrix</span>
            </div>
            {filtered.map(emp => (
              <EmployeeRow key={emp.id} employee={emp} openProfile={openProfile} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filtered.map(emp => (
              <div key={emp.id} className="glass-panel employee-row-hover" onClick={() => openProfile(emp)} style={{ padding: '20px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <UserRound size={24} color="var(--text-secondary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0' }}>{emp.name_english}</h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-blue)' }}>{emp.position}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
});
TellerArea.displayName = 'TellerArea';

const DepartmentAccordion = ({ name, staffCount, children, isOpen, onToggle }) => (
  <div className="glass-panel" style={{ marginBottom: '16px', padding: 0, overflow: 'hidden' }}>
    <div
      onClick={onToggle}
      style={{
        padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)',
        borderBottom: isOpen ? '1px solid var(--glass-border)' : 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: 'rgba(88, 166, 255, 0.1)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <Building2 size={20} color="var(--accent-blue)" />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{name}</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{staffCount} Staff Members Allocated</span>
        </div>
      </div>
      <div style={{
        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.3s ease',
        color: 'var(--text-secondary)'
      }}>
        <ChevronDown size={20} />
      </div>
    </div>

    <div style={{
      maxHeight: isOpen ? '5000px' : '0',
      overflow: 'hidden',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      background: 'rgba(0,0,0,0.1)'
    }}>
      {isOpen && children}
    </div>
  </div>
);

// --- Main Component ---

const StaffRoster = () => {
  const [employees, setEmployees] = useState([]);
  const [tellers, setTellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('OFFICE_STAFF');
  const [activeTellerArea, setActiveTellerArea] = useState('GFO LDN');
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDepts, setExpandedDepts] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false); // Quick Stage Modal

  // --- Directory Modal States ---
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [showChecklistDropdown, setShowChecklistDropdown] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [incidentReports, setIncidentReports] = useState([]);
  const [uploadingIncident, setUploadingIncident] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);

    const { data, error } = await supabase.from('employees').select('*').order('name_english', { ascending: true });

    if (!error && data) {
      setEmployees(data);
      const initialExpanded = {};
      const depts = [...new Set(data.map(e => e.department || 'UNCATEGORIZED'))];
      depts.forEach((d, i) => { if (i === 0) initialExpanded[d] = true; });
      setExpandedDepts(initialExpanded);
    }

    setLoading(false);
  };

  // --- Modal Logic ---
  const fetchIncidentReports = async (name) => {
    const { data } = await supabase.from('ir_cases').select('*').eq('agent_name', name).order('date_posted', { ascending: false });
    if (data) setIncidentReports(data);
  };

  const openProfile = (emp) => {
    setSelectedProfile(emp);
    setEditForm(emp);
    setIsEditingProfile(false);
    setIsEditingStatus(false);
    setShowChecklistDropdown(false);
    setIncidentReports([]);
    fetchIncidentReports(emp.name_english);
  };

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

  const handleStatusChange = async (newStatus) => {
    const { error } = await supabase.from('employees').update({ employment_status: newStatus }).eq('id', selectedProfile.id);
    if (!error) {
      setSelectedProfile({ ...selectedProfile, employment_status: newStatus });
      fetchEmployees();
      setIsEditingStatus(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const { id, created_at, ...updateData } = editForm;
    const { error } = await supabase.from('employees').update(updateData).eq('id', id);
    if (!error) {
      setSelectedProfile(editForm);
      setIsEditingProfile(false);
      fetchEmployees();
    }
  };

  const handleDeleteEmployee = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (!error) {
        setSelectedProfile(null);
        fetchEmployees();
      }
    }
  };

  const handleDocUpload = async (docKey, file) => {
    if (!file) return;
    setUploadingDoc(docKey);
    const fileExt = file.name.split('.').pop();
    const fileName = `${selectedProfile.id}_${docKey}_${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from('201_files').upload(fileName, file);

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('201_files').getPublicUrl(uploadData.path);
      const updatedDocs = { ...selectedProfile.modular_docs, [docKey]: { url: publicUrl, name: file.name, status: 'Pending Verification', uploaded_at: new Date().toISOString() } };
      await supabase.from('employees').update({ modular_docs: updatedDocs }).eq('id', selectedProfile.id);
      setSelectedProfile({ ...selectedProfile, modular_docs: updatedDocs });
      fetchEmployees();
    }
    setUploadingDoc(null);
  };

  const handleDocVerify = async (docKey, status, remarks = '') => {
    const updatedDocs = { ...selectedProfile.modular_docs, [docKey]: { ...selectedProfile.modular_docs?.[docKey], status, verified_at: new Date().toISOString(), remarks } };
    await supabase.from('employees').update({ modular_docs: updatedDocs }).eq('id', selectedProfile.id);
    setSelectedProfile({ ...selectedProfile, modular_docs: updatedDocs });
    fetchEmployees();
  };

  const handleIncidentUpload = async (file) => {
    if (!file) return;
    setUploadingIncident(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${selectedProfile.id}_IR_${Date.now()}.${fileExt}`;
    const filePath = `incidents/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from('incident_reports_sales').upload(filePath, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('incident_reports_sales').getPublicUrl(filePath);
        
        const { error: insertError } = await supabase.from('ir_cases').insert([{
          agent_name: selectedProfile.name_english,
          area: selectedProfile.department || 'Unassigned',
          status: 'OPEN',
          sop_breakdown: 'Under Investigation',
          file_name: file.name,
          file_url: publicUrl,
          date_posted: new Date().toISOString()
        }]);

        if (!insertError) {
          fetchIncidentReports(selectedProfile.name_english);
          alert('Incident Report uploaded successfully!');
        } else {
          alert('Error saving incident report record: ' + insertError.message);
        }
      } else {
        alert('Error uploading file: ' + uploadError.message);
      }
    } catch (err) {
      alert('An unexpected error occurred during upload.');
      console.error(err);
    } finally {
      setUploadingIncident(false);
    }
  };

  const toggleDept = (dept) => {
    setExpandedDepts(prev => ({ ...prev, [dept]: !prev[dept] }));
  };

  const filtered = useMemo(() => {
    const source = activeTab === 'TELLERS' ? tellers : employees.filter(e => !isTeller(e));
    const query = searchQuery?.toLowerCase() || '';

    if (!query) return source;

    return source.filter(emp =>
      emp.name_english?.toLowerCase().includes(query) ||
      emp.position?.toLowerCase().includes(query) ||
      emp.department?.toLowerCase().includes(query)
    );
  }, [activeTab, tellers, employees, searchQuery]);

  const grouped = useMemo(() => {
    const res = filtered.reduce((acc, emp) => {
      const dept = emp.department || 'UNCATEGORIZED';
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(emp);
      return acc;
    }, {});

    // Ensure requested groups exist in Tellers tab
    if (activeTab === 'TELLERS') {
      if (!res['GFO LDN']) res['GFO LDN'] = [];
      if (!res['5A']) res['5A'] = [];
      if (!res['IMPERIAL']) res['IMPERIAL'] = [];
    }

    return res;
  }, [filtered, activeTab]);

  return (
    <div style={{ padding: '0 0 40px 0' }}>
      <div className="animate-fade-in">

      <RosterControls
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onQuickStage={() => setIsModalOpen(true)}

      />
      </div>

      <QuickStageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchEmployees}
      />

      <div className="animate-fade-in">
      {/* Segmented Category Buttons */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '32px',
        padding: '6px', background: 'rgba(255,255,255,0.03)',
        borderRadius: '14px', width: 'fit-content', border: '1px solid var(--glass-border)'
      }}>
        <button
          onClick={() => setActiveTab('OFFICE_STAFF')}
          style={{
            padding: '12px 32px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
            background: activeTab === 'OFFICE_STAFF' ? 'var(--accent-blue)' : 'transparent',
            color: activeTab === 'OFFICE_STAFF' ? '#fff' : 'var(--text-secondary)',
            boxShadow: activeTab === 'OFFICE_STAFF' ? '0 4px 15px rgba(88, 166, 255, 0.2)' : 'none',
            fontSize: '0.85rem', letterSpacing: '1px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          OFFICE STAFF
        </button>
        <button
          onClick={() => setActiveTab('TELLERS')}
          style={{
            padding: '12px 32px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
            background: activeTab === 'TELLERS' ? 'var(--accent-blue)' : 'transparent',
            color: activeTab === 'TELLERS' ? '#fff' : 'var(--text-secondary)',
            boxShadow: activeTab === 'TELLERS' ? '0 4px 15px rgba(88, 166, 255, 0.2)' : 'none',
            fontSize: '0.85rem', letterSpacing: '1px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          TELLERS
        </button>
      </div>

      {activeTab === 'TELLERS' && (
        <div style={{
          display: 'flex', gap: '20px', marginBottom: '32px',
          borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px'
        }}>
          {['GFO LDN', '5A', 'IMPERIAL'].map(area => (
            <button
              key={area}
              onClick={() => setActiveTellerArea(area)}
              style={{
                background: 'transparent', border: 'none', color: activeTellerArea === area ? 'var(--accent-blue)' : 'var(--text-secondary)',
                padding: '8px 4px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer',
                position: 'relative', transition: 'all 0.2s'
              }}
            >
              {area}
              {activeTellerArea === area && (
                <div style={{ position: 'absolute', bottom: '-17px', left: 0, right: 0, height: '2px', background: 'var(--accent-blue)', boxShadow: '0 0 10px var(--accent-blue)' }} />
              )}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '100px 0' }}>
          <div className="spinner-glow" style={{ width: '40px', height: '40px', border: '3px solid rgba(88, 166, 255, 0.1)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', letterSpacing: '1px' }}>SYNCHRONIZING PERSONNEL MATRIX...</span>
        </div>
      ) : activeTab === 'TELLERS' ? (
        <div className="animate-fade-in">
          {activeTellerArea === 'GFO LDN' && (
             <TellerArea 
               tableName="tellersldn" 
               areaLabel="GFO LDN" 
               viewMode={viewMode} 
               searchQuery={searchQuery}
               nameFields={['fullname', 'fullName', 'full_name', 'name']}
               openProfile={openProfile}
             />
          )}
          {activeTellerArea === '5A' && (
             <TellerArea 
               tableName="tellers" 
               areaLabel="5A" 
               viewMode={viewMode} 
               searchQuery={searchQuery}
               nameFields={['fullname', 'fullname', 'full_name', 'name']}
               openProfile={openProfile}
             />
          )}
          {activeTellerArea === 'IMPERIAL' && (
             <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Users size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <div>Imperial Area Command center is currently empty.</div>
             </div>
          )}
        </div>
      ) : (
        Object.keys(grouped).sort().map(dept => (
          <DepartmentAccordion
            key={dept}
            name={dept}
            staffCount={grouped[dept].length}
            isOpen={expandedDepts[dept]}
            onToggle={() => toggleDept(dept)}
          >
            {viewMode === 'list' ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'minmax(250px, 1.5fr) 2fr 150px',
                  padding: '12px 24px', background: 'rgba(255,255,255,0.05)',
                  fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)',
                  textTransform: 'uppercase', letterSpacing: '1px'
                }}>
                  <span>Teller</span>
                  <span>Kiosk Name and Contact Number</span>
                  <span style={{ textAlign: 'right' }}>Status</span>
                </div>
                {grouped[dept].map(emp => (
                  <EmployeeRow key={emp.id} employee={emp} openProfile={openProfile} />
                ))}
              </div>
            ) : (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px', padding: '24px'
              }}>
                {grouped[dept].map(emp => (
                  <div
                    key={emp.id}
                    className="glass-panel employee-row-hover"
                    onClick={() => openProfile(emp)}
                    style={{
                      padding: '20px',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                        {emp.photo_url ? <img src={emp.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserRound size={24} style={{ margin: '13px', color: 'var(--text-secondary)' }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0' }}>{emp.name_english}</h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-blue)' }}>{emp.position}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <Mail size={14} /> {emp.email || 'N/A'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <Phone size={14} /> {emp.mobile || 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DepartmentAccordion>
        ))
      )}
      </div>

      {/* Profile Viewer / Edit CRUD Modal */}
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
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowChecklistDropdown(!showChecklistDropdown)} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    <ShieldAlert size={14} color={MODULAR_DOCS_LIST.filter(d => (selectedProfile.modular_docs?.[d.key]?.status === 'Approved')).length === MODULAR_DOCS_LIST.length ? 'var(--accent-green)' : 'var(--accent-red)'} />
                    Vault Compliance Matrix
                    <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                      {MODULAR_DOCS_LIST.filter(d => selectedProfile.modular_docs?.[d.key]?.url).length}/{MODULAR_DOCS_LIST.length}
                    </span>
                  </button>

                  {showChecklistDropdown && (
                    <div onClick={e => e.stopPropagation()} className="glass-panel animate-fade-in" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '12px', width: '320px', zIndex: 99999, padding: '20px', border: '1px solid var(--glass-border)', boxShadow: '0 15px 30px rgba(0,0,0,0.4)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px' }}>Verification Status</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {MODULAR_DOCS_LIST.map((doc, idx) => {
                          const status = selectedProfile.modular_docs?.[doc.key]?.status || 'Missing';
                          const styles = getDocStatusStyle(status);
                          return (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                              <span style={{ color: 'rgba(255,255,255,0.7)' }}>{doc.label.split('(')[0]}</span>
                              <span style={{ color: styles.color, fontWeight: 'bold', fontSize: '0.7rem' }}>{status}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
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

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {/* Personal Info Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ color: 'var(--accent-blue)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', margin: 0 }}>Basic Demographics</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Full Legal Name</label>
                        <input required value={editForm.name_english || ''} onChange={(e) => setEditForm({ ...editForm, name_english: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email Allocation</label>
                        <input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mobile Dispatch</label>
                        <input value={editForm.mobile || ''} onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Photograph ID URL</label>
                        <input value={editForm.photo_url || ''} onChange={(e) => setEditForm({ ...editForm, photo_url: e.target.value })} placeholder="https://..." style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Date of Birth</label>
                        <input type="date" value={editForm.dob || ''} onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Place of Birth</label>
                        <input value={editForm.pob || ''} onChange={(e) => setEditForm({ ...editForm, pob: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sex</label>
                        <select value={editForm.sex || ''} onChange={(e) => setEditForm({ ...editForm, sex: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }}>
                          <option value="">Select</option><option>Male</option><option>Female</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Civil Status</label>
                        <input value={editForm.civil_status || ''} onChange={(e) => setEditForm({ ...editForm, civil_status: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Blood Type</label>
                        <input value={editForm.blood_type || ''} onChange={(e) => setEditForm({ ...editForm, blood_type: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Citizenship</label>
                        <input value={editForm.citizenship || ''} onChange={(e) => setEditForm({ ...editForm, citizenship: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Height (m)</label>
                        <input value={editForm.height || ''} onChange={(e) => setEditForm({ ...editForm, height: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Weight (kg)</label>
                        <input value={editForm.weight || ''} onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ color: 'var(--accent-green)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', margin: 0 }}>Residential Data</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Permanent Residence</label>
                        <input value={editForm.residence_address || ''} onChange={(e) => setEditForm({ ...editForm, residence_address: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Postal Code</label>
                        <input value={editForm.residence_postal || ''} onChange={(e) => setEditForm({ ...editForm, residence_postal: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Present Displacement Address</label>
                        <input value={editForm.present_address || ''} onChange={(e) => setEditForm({ ...editForm, present_address: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Postal Code</label>
                        <input value={editForm.present_postal || ''} onChange={(e) => setEditForm({ ...editForm, present_postal: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                    </div>
                  </div>

                  {/* Family Data */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ color: 'var(--accent-red)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', margin: 0 }}>Family Matrix</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Spousal Entry</label>
                        <input value={editForm.spouse_name || ''} onChange={(e) => setEditForm({ ...editForm, spouse_name: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Parents (Father/Mother Legal Names)</label>
                        <input value={editForm.parents_names || ''} onChange={(e) => setEditForm({ ...editForm, parents_names: e.target.value })} placeholder="Father's Name & Mother's Name" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Children Allocation (Names & DOBs)</label>
                      <textarea value={editForm.children_info || ''} onChange={(e) => setEditForm({ ...editForm, children_info: e.target.value })} rows="3" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none', resize: 'vertical' }} />
                    </div>
                  </div>

                  {/* Org Placement Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ color: 'var(--accent-purple)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', margin: 0 }}>Organizational Placement</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Department Allocation</label>
                        <input value={editForm.department || ''} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Position Wrapper</label>
                        <input value={editForm.position || ''} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                    </div>
                  </div>

                  {/* Government IDs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ color: 'var(--accent-blue)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', margin: 0 }}>Government Identifier Matrix</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SSS Number</label>
                        <input value={editForm.sss || ''} onChange={(e) => setEditForm({ ...editForm, sss: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>PHILHEALTH</label>
                        <input value={editForm.philhealth || ''} onChange={(e) => setEditForm({ ...editForm, philhealth: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>PAG-IBIG</label>
                        <input value={editForm.pagibig || ''} onChange={(e) => setEditForm({ ...editForm, pagibig: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TIN Number</label>
                        <input value={editForm.tin || ''} onChange={(e) => setEditForm({ ...editForm, tin: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>GSIS Allocation</label>
                        <input value={editForm.gsis || ''} onChange={(e) => setEditForm({ ...editForm, gsis: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                    </div>
                  </div>

                  {/* Education & Bio Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', margin: 0 }}>Education & Skill Repository</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Historical Education Background</label>
                        <input value={editForm.educational || ''} onChange={(e) => setEditForm({ ...editForm, educational: e.target.value })} placeholder="Primary / Secondary" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Highest Level Entry</label>
                        <input value={editForm.highest_level || ''} onChange={(e) => setEditForm({ ...editForm, highest_level: e.target.value })} placeholder="e.g. Bachelor of Science" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>School Name / Institution</label>
                        <input value={editForm.school_name || ''} onChange={(e) => setEditForm({ ...editForm, school_name: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Major / Project Subject</label>
                        <input value={editForm.major_subject || ''} onChange={(e) => setEditForm({ ...editForm, major_subject: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Specified Skills</label>
                        <input value={editForm.skills || ''} onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })} placeholder="e.g. Accounting, IT, Operations" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                    </div>
                  </div>

                  {/* Work History & Legal */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ color: 'var(--accent-purple)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', margin: 0 }}>Work History & Disclosures</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Professional Experience History</label>
                      <textarea value={editForm.work_history || ''} onChange={(e) => setEditForm({ ...editForm, work_history: e.target.value })} rows="4" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none', resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>CSC License / Eligibility</label>
                        <input value={editForm.csc_license || ''} onChange={(e) => setEditForm({ ...editForm, csc_license: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>CSC Validity / Date</label>
                        <input type="date" value={editForm.csc_date || ''} onChange={(e) => setEditForm({ ...editForm, csc_date: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Legal Disclosures (Q34-40 Response)</label>
                      <textarea value={editForm.legal_34_40 || ''} onChange={(e) => setEditForm({ ...editForm, legal_34_40: e.target.value })} placeholder="Disclosures regarding legal history..." rows="2" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: '#fff', outline: 'none', resize: 'vertical' }} />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} style={{ background: 'var(--accent-green)', color: '#fff', padding: '14px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(63, 185, 80, 0.3)' }}>
                    <Save size={18} /> {loading ? 'Committing...' : 'Commit Database Changes'}
                  </button>
                </form>
              ) : (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  <div>
                    <h2 style={{ fontSize: '2.2rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{selectedProfile.name_english}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      <Briefcase size={20} /> {selectedProfile.position || 'No Position mapped'} &bull; {selectedProfile.department || 'Corporate Tier'}
                    </div>
                  </div>

                  {/* View Mode Grid Sections */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

                    {/* Demographics & Personal */}
                    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.02)' }}>
                      <h5 style={{ margin: 0, color: 'var(--accent-blue)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 'bold' }}>Basic Information</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem' }}>
                        <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>DATE OF BIRTH</div>{selectedProfile.dob || 'N/A'}</div>
                        <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>PLACE OF BIRTH</div>{selectedProfile.pob || 'N/A'}</div>
                        <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>SEX</div>{selectedProfile.sex || 'N/A'}</div>
                        <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>CIVIL STATUS</div>{selectedProfile.civil_status || 'N/A'}</div>
                        <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>CITIZENSHIP</div>{selectedProfile.citizenship || 'Filipino'}</div>
                        <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>BLOOD TYPE</div><span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>{selectedProfile.blood_type || 'N/A'}</span></div>
                        <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>HEIGHT</div>{selectedProfile.height || 'N/A'}m</div>
                        <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>WEIGHT</div>{selectedProfile.weight || 'N/A'}kg</div>
                      </div>
                    </div>

                    {/* Contact & Address */}
                    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.02)' }}>
                      <h5 style={{ margin: 0, color: 'var(--accent-green)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 'bold' }}>Contact & Residence</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={14} color="var(--accent-purple)" /> {selectedProfile.email || 'N/A'}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={14} color="var(--accent-green)" /> {selectedProfile.mobile || 'N/A'}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>PERMANENT ADDRESS</div>
                          <div style={{ display: 'flex', gap: '6px' }}><MapPin size={12} style={{ marginTop: '2px' }} /> {selectedProfile.residence_address || 'N/A'} ({selectedProfile.residence_postal || '---'})</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>PRESENT DISPLACEMENT</div>
                          <div style={{ display: 'flex', gap: '6px' }}><MapPin size={12} style={{ marginTop: '2px' }} /> {selectedProfile.present_address || 'SAME AS PERMANENT'} ({selectedProfile.present_postal || '---'})</div>
                        </div>
                      </div>
                    </div>

                    {/* Government Identifier Trace */}
                    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.02)' }}>
                      <h5 style={{ margin: 0, color: 'var(--accent-red)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 'bold' }}>Statutory Benefits</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '12px', fontSize: '0.85rem' }}>
                        <div style={{ color: 'var(--text-secondary)' }}>SSS NUMBER</div><code style={{ color: 'var(--accent-blue)' }}>{selectedProfile.sss || 'MISSING'}</code>
                        <div style={{ color: 'var(--text-secondary)' }}>PHILHEALTH</div><code style={{ color: 'var(--accent-blue)' }}>{selectedProfile.philhealth || 'MISSING'}</code>
                        <div style={{ color: 'var(--text-secondary)' }}>PAG-IBIG</div><code style={{ color: 'var(--accent-blue)' }}>{selectedProfile.pagibig || 'MISSING'}</code>
                        <div style={{ color: 'var(--text-secondary)' }}>TIN NUMBER</div><code style={{ color: 'var(--accent-blue)' }}>{selectedProfile.tin || 'MISSING'}</code>
                        <div style={{ color: 'var(--text-secondary)' }}>GSIS PLATE</div><code style={{ color: 'var(--accent-blue)' }}>{selectedProfile.gsis || 'MISSING'}</code>
                      </div>
                    </div>

                    {/* Family & Social Matrix */}
                    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.02)' }}>
                      <h5 style={{ margin: 0, color: 'var(--accent-purple)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 'bold' }}>Family</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                        <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>SPOUSE / PARTNER</div>{selectedProfile.spouse_name || 'NONE RECORDED'}</div>
                        <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>PARENTS ORIGIN</div>{selectedProfile.parents_names || 'N/A'}</div>
                        <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>CHILDREN ALLOCATION</div><div style={{ whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.7)' }}>{selectedProfile.children_info || 'NO DATA'}</div></div>
                      </div>
                    </div>

                    {/* Education & Skill Matrix */}
                    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.02)' }}>
                      <h5 style={{ margin: 0, color: 'var(--text-primary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 'bold' }}>Education</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                        <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>INSTITUTION</div>{selectedProfile.school_name || 'N/A'}</div>
                        <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>ATTAINMENT</div>{selectedProfile.educational || 'N/A'} - {selectedProfile.highest_level || ''}</div>
                        <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>MAJOR / SPECIALIZATION</div>{selectedProfile.major_subject || 'N/A'}</div>
                        <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>RELEVANT SKILLS</div><div style={{ color: 'var(--accent-green)' }}>{selectedProfile.skills || 'GENERAL STAFF'}</div></div>
                      </div>
                    </div>

                    {/* Experience & Disclosure */}
                    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.02)' }}>
                      <h5 style={{ margin: 0, color: 'var(--accent-purple)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 'bold' }}>History & Legal</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                        <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>WORK HISTORY</div><div style={{ maxHeight: '80px', overflowY: 'auto', fontSize: '0.8rem', opacity: 0.8 }}>{selectedProfile.work_history || 'NO DATA'}</div></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>CSC ELIGIBILITY</div>{selectedProfile.csc_license || '---'}</div>
                          <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>VALIDITY</div>{selectedProfile.csc_date || '---'}</div>
                        </div>
                        <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>LEGAL DISCLOSURES</div><div style={{ color: 'var(--accent-red)', fontSize: '0.75rem' }}>{selectedProfile.legal_34_40 || 'NO DISCLOSURES'}</div></div>
                      </div>
                    </div>
                  </div>

                  {/* 201 Modular Repository Section */}
                  <div className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h4 style={{ margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShieldCheck size={20} color="var(--accent-blue)" /> 201 Modular Repository
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Verification Pipeline</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                      {MODULAR_DOCS_LIST.map((doc, idx) => {
                        const docData = selectedProfile.modular_docs?.[doc.key];
                        const hasFile = !!docData?.url;
                        const styles = getDocStatusStyle(docData?.status || 'Missing');

                        return (
                          <div key={idx} style={{
                            padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px',
                            border: `1px solid ${hasFile ? 'rgba(255,255,255,0.05)' : 'rgba(255,123,114,0.1)'}`,
                            display: 'flex', flexDirection: 'column', gap: '12px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: hasFile ? '#fff' : 'rgba(255,255,255,0.4)', lineHeight: 1.2 }}>{doc.label}</div>
                                <div style={{ fontSize: '0.65rem', color: styles.color, fontWeight: 'bold', textTransform: 'uppercase', marginTop: '4px' }}>{docData?.status || 'Missing'}</div>
                              </div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {hasFile && (
                                  <button onClick={() => setSelectedFileUrl(docData.url)} style={{ background: 'rgba(88, 166, 255, 0.1)', border: 'none', color: 'var(--accent-blue)', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={14} /></button>
                                )}
                                <label style={{ background: 'var(--accent-blue)', color: '#fff', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Upload size={14} />
                                  <input type="file" hidden onChange={(e) => handleDocUpload(doc.key, e.target.files[0])} />
                                </label>
                              </div>
                            </div>

                            {hasFile && (
                              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                                <button onClick={() => handleDocVerify(doc.key, 'Approved')} style={{ flex: 1, background: 'rgba(63, 185, 80, 0.1)', border: 'none', color: 'var(--accent-green)', padding: '6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}>Approve</button>
                                <button onClick={() => { const r = prompt("Reason for rejection?"); if (r) handleDocVerify(doc.key, 'Rejected', r); }} style={{ flex: 1, background: 'rgba(255, 123, 114, 0.1)', border: 'none', color: 'var(--accent-red)', padding: '6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}>Reject</button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Incident Reports Section */}
                  <div className="glass-panel" style={{ padding: '24px', background: 'rgba(255,123,114,0.02)', border: '1px solid rgba(255,123,114,0.1)', marginTop: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h4 style={{ margin: 0, color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShieldAlert size={20} /> Incident Reports & Compliance
                      </h4>
                      <label style={{ background: 'var(--accent-red)', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Upload size={16} /> {uploadingIncident ? 'Uploading...' : 'Upload New Report'}
                        <input type="file" hidden disabled={uploadingIncident} onChange={(e) => handleIncidentUpload(e.target.files[0])} />
                      </label>
                    </div>

                    {incidentReports.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                        <History size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                        <div>No incident reports found for this personnel.</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {incidentReports.map((report, idx) => (
                          <div key={idx} className="glass-panel" style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,123,114,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileText size={20} color="var(--accent-red)" />
                              </div>
                              <div>
                                <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{report.sop_breakdown || 'Security Incident'}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(report.date_posted || report.created_at).toLocaleDateString()} &bull; {report.area}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ 
                                padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold',
                                background: report.status === 'Resolved' ? 'rgba(63, 185, 80, 0.1)' : 'rgba(255, 123, 114, 0.1)',
                                color: report.status === 'Resolved' ? 'var(--accent-green)' : 'var(--accent-red)',
                                border: `1px solid ${report.status === 'Resolved' ? 'rgba(63, 185, 80, 0.2)' : 'rgba(255, 123, 114, 0.2)'}`
                              }}>
                                {report.status}
                              </span>
                              <button onClick={() => setSelectedFileUrl(report.file_url)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Eye size={14} /> View
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Internal File Preview Modal (2nd Layer) */}
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
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden', padding: 0
            }}>
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-tertiary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={20} color="var(--accent-blue)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>201 Document Preview</h3>
              </div>
              <button
                onClick={() => setSelectedFileUrl(null)}
                style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <iframe src={selectedFileUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Document Viewer" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffRoster;
