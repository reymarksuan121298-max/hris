import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import {
  X, File, Video, Image as ImageIcon, FileText,
  Upload, Trash2, Download, ExternalLink,
  Search, Filter, Plus, Clock, User,
  Save, AlertCircle, Loader2, CheckCircle2,
  BookOpen
} from 'lucide-react';

const LDResourceManager = ({ training, type, onClose, isEmbedded = false }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [dragActive, setDragActive] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeUploads, setActiveUploads] = useState([]); // [{ file, customName }]
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchResources();
    checkRole();
  }, [training.id]);

  const checkRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const email = user.email.toLowerCase();
      const isAdmin = email.includes('admin') || email.includes('hr') || email.includes('manager');
      setIsAdmin(isAdmin);
    }
  };

  const fetchResources = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('training_resources')
      .select('*')
      .eq('training_id', training.id)
      .eq('training_type', type)
      .order('created_at', { ascending: false });

    if (!error) setResources(data);
    setLoading(false);
  };

  const getFileType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['mp4', 'mov', 'avi'].includes(ext)) return 'video';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'image';
    if (['pdf', 'doc', 'docx'].includes(ext)) return 'document';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'spreadsheet';
    if (['ppt', 'pptx'].includes(ext)) return 'presentation';
    return 'file';
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'video': return <Video size={20} color="#ff7b72" />;
      case 'image': return <ImageIcon size={20} color="#3fb950" />;
      case 'spreadsheet': return <FileText size={20} color="#2ea44f" />;
      case 'presentation': return <File size={20} color="#d29922" />;
      case 'document': return <FileText size={20} color="#58a6ff" />;
      default: return <File size={20} color="var(--text-secondary)" />;
    }
  };

  const logActivity = async (action, resourceId, resourceName, details = {}) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('activity_logs').insert([{
      action,
      resource_id: resourceId,
      resource_name: resourceName,
      user_email: user.email,
      details
    }]);
  };

  const handleFileSelect = (files) => {
    const newUploads = Array.from(files).map(file => ({
      file,
      customName: file.name
    }));
    setActiveUploads(prev => [...prev, ...newUploads]);
  };

  const handleUploadAll = async () => {
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();

    for (const item of activeUploads) {
      const { file, customName } = item;
      const fileExt = file.name.split('.').pop();
      const finalName = customName.endsWith(`.${fileExt}`) ? customName : `${customName}.${fileExt}`;
      const storageName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `training-materials/${training.id}/${getFileType(file.name)}/${storageName}`;

      const { error: uploadError } = await supabase.storage
        .from('training-materials')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('training-materials')
        .getPublicUrl(filePath);

      const { data, error: dbError } = await supabase.from('training_resources').insert([{
        training_id: training.id,
        training_type: type,
        file_name: finalName,
        file_type: getFileType(file.name),
        file_url: publicUrl,
        uploaded_by: user?.email || 'Anonymous'
      }]).select().single();

      if (data) await logActivity('UPLOAD', data.id, finalName);
    }

    setActiveUploads([]);
    setUploading(false);
    fetchResources();
  };

  const handleDelete = async (resource) => {
    if (!isAdmin) return alert("Unauthorized: Admin access required.");
    if (!window.confirm(`Delete ${resource.file_name}?`)) return;

    const path = resource.file_url.split('/public/training-materials/')[1];
    if (path) {
      await supabase.storage.from('training-materials').remove([path]);
    }

    await supabase.from('training_resources').delete().eq('id', resource.id);
    await logActivity('DELETE', resource.id, resource.file_name);
    fetchResources();
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => {
    setDragActive(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.file_name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || r.file_type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={isEmbedded ? "" : "fixed inset-0 z-[10000] flex items-center justify-center p-4"} style={isEmbedded ? { height: '100%', display: 'flex' } : { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-fade-in" style={{ width: '100%', maxWidth: '1000px', height: isEmbedded ? '100%' : '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

        {/* Header - Only show in Modal Mode or if needed */}
        {!isEmbedded ? (
          <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <div>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem' }}>
                <Save color="var(--accent-purple)" size={24} />
                Resource Vault: <span style={{ color: 'var(--accent-blue)' }}>{training.employee_name || training.report_type}</span>
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                {training.department || 'General'} &bull; {training.report_type || 'Library'}
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} />
            </button>
          </div>
        ) : (
          <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(184, 227, 233, 0.02)' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem' }}>
              <BookOpen color="var(--accent-blue)" size={24} /> Central Intelligence Library
            </h3>
            <span style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
              GLOBAL REPOSITORY
            </span>
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Main Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', gap: '24px', overflowY: 'auto' }}>

            {/* Search & Filter Bar */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '12px' }}>
                <Search size={18} color="var(--text-secondary)" />
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                />
              </div>
              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '12px' }}>
                <Filter size={18} color="var(--text-secondary)" />
                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  <option value="all">All Types</option>
                  <option value="video">Videos</option>
                  <option value="image">Images</option>
                  <option value="document">Documents</option>
                  <option value="spreadsheet">Spreadsheets</option>
                  <option value="presentation">Presentations</option>
                </select>
              </div>
            </div>

            {/* Resources Grid */}
            <div style={{ flex: 1 }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-secondary)' }}>
                  <Loader2 className="animate-spin" size={32} />
                  <p style={{ marginTop: '12px' }}>Syncing with Cloud Vault...</p>
                </div>
              ) : filteredResources.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '2px dashed var(--glass-border)', color: 'var(--text-secondary)' }}>
                  {search ? <Search size={40} opacity={0.2} /> : <File size={40} opacity={0.2} />}
                  <p style={{ marginTop: '12px' }}>No training resources discovered.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                  {filteredResources.map(res => (
                    <div
                      key={res.id}
                      className="glass-panel"
                      style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer', transition: 'transform 0.2s' }}
                      onClick={() => { setPreviewFile(res); logActivity('VIEW', res.id, res.file_name); }}
                      onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ height: '140px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        {res.file_type === 'image' ? (
                          <img src={res.file_url} alt={res.file_name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {getFileIcon(res.file_type)}
                            </div>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{res.file_type}</span>
                          </div>
                        )}
                        <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                          {isAdmin && (
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(res); }} style={{ background: 'rgba(255,123,114,0.1)', border: '1px solid rgba(255,123,114,0.2)', color: 'var(--accent-red)', padding: '6px', borderRadius: '6px' }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{res.file_name}</div>
                        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            <User size={10} /> {res.uploaded_by?.split('@')[0]}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            <Clock size={10} /> {new Date(res.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upload Sidebar */}
          <div style={{ width: '300px', borderLeft: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={18} color="var(--accent-blue)" /> Upload Center
            </h4>

            <div
              onDragOver={isAdmin ? onDragOver : null}
              onDragLeave={isAdmin ? onDragLeave : null}
              onDrop={isAdmin ? onDrop : null}
              onClick={() => isAdmin && fileInputRef.current.click()}
              style={{
                border: '2px dashed ' + (dragActive ? 'var(--accent-blue)' : 'var(--glass-border)'),
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '24px',
                textAlign: 'center',
                cursor: isAdmin ? 'pointer' : 'not-allowed',
                background: dragActive ? 'rgba(184, 227, 233, 0.05)' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.3s ease',
                opacity: isAdmin ? 1 : 0.5
              }}
            >
              <input
                type="file"
                multiple
                hidden
                ref={fileInputRef}
                onChange={e => handleFileSelect(e.target.files)}
              />
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {uploading ? <Loader2 className="animate-spin" size={24} color="var(--accent-blue)" /> : <Plus size={24} color="var(--text-secondary)" />}
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{isAdmin ? (uploading ? 'Processing...' : 'Add Training Assets') : 'Upload Locked'}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{isAdmin ? 'Videos, PPT, Excel, Images' : 'Admin access required'}</div>
              </div>
            </div>

            {activeUploads.length > 0 && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>PENDING UPLOAD ({activeUploads.length})</div>
                {activeUploads.map((item, idx) => (
                  <div key={idx} className="glass-panel" style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{item.file.name}</div>
                      <button onClick={() => setActiveUploads(prev => prev.filter((_, i) => i !== idx))} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}><X size={14} /></button>
                    </div>
                    <input
                      value={item.customName}
                      onChange={e => {
                        const next = [...activeUploads];
                        next[idx].customName = e.target.value;
                        setActiveUploads(next);
                      }}
                      placeholder="Rename file..."
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: '0.8rem', padding: '6px 10px', borderRadius: '6px', outline: 'none' }}
                    />
                  </div>
                ))}
                <button
                  onClick={handleUploadAll}
                  disabled={uploading}
                  style={{ background: 'var(--accent-gradient)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  Save All Assets
                </button>
              </div>
            )}

            <div className="glass-panel" style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <AlertCircle size={14} /> <span>Usage Policy</span>
              </div>
              Materials uploaded here are visible to the assigned personnel and admins. Ensure sensitive data is handled appropriately.
            </div>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10001, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.5)' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{previewFile.file_name}</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href={previewFile.file_url} download target="_blank" style={{ background: 'var(--accent-blue)', color: '#000', padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={16} /> Download
              </a>
              <button onClick={() => setPreviewFile(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', overflow: 'hidden' }}>
            {previewFile.file_type === 'video' ? (
              <video controls autoPlay style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                <source src={previewFile.file_url} />
              </video>
            ) : previewFile.file_type === 'image' ? (
              <img src={previewFile.file_url} alt={previewFile.file_name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} />
            ) : previewFile.file_type === 'document' && previewFile.file_name.toLowerCase().endsWith('.pdf') ? (
              <iframe
                src={previewFile.file_url}
                style={{ width: '80%', height: '100%', border: 'none', borderRadius: '12px', background: '#fff' }}
                title="PDF Preview"
              />
            ) : (
              <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '24px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                  {getFileIcon(previewFile.file_type)}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.5rem' }}>Rich Preview Unavailable</h3>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '12px', fontSize: '0.95rem', maxWidth: '300px', margin: '12px auto' }}>
                    This file type ({previewFile.file_type}) requires external software to view.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                  <a href={previewFile.file_url} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: '1px solid var(--glass-border)' }}>
                    <ExternalLink size={20} /> Preview in Browser
                  </a>
                  <a href={previewFile.file_url} download style={{ flex: 1, textAlign: 'center', background: 'var(--accent-gradient)', color: '#fff', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <Download size={20} /> Download and View
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LDResourceManager;
