import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import {
  Download,
  Upload,
  RotateCcw,
  ImageIcon,
  Type,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Maximize,
  Minus,
  Plus,
  Wand2
} from 'lucide-react';

const AdvisoryGenerator = () => {
  const exportRef = useRef(null);

  // State for advisory content
  const [logo1, setLogo1] = useState(null);
  const [logo2, setLogo2] = useState(null);
  const [headerText, setHeaderText] = useState('WE ARE CURRENTLY PERFORMING SYSTEM MAINTENANCE.');
  const [subText, setSubText] = useState('FOR SYSTEM STABILITY, SORRY FOR THE INCONVENIENCE');
  const [watermarkText, setWatermarkText] = useState('');

  // Watermark Formatting
  const [watermarkSize, setWatermarkSize] = useState(120);
  const [watermarkOpacity, setWatermarkOpacity] = useState(4);
  const [watermarkAngle, setWatermarkAngle] = useState(-30);

  // Customization state
  const [bgStyle, setBgStyle] = useState('mesh'); // 'solid', 'gradient', 'mesh'
  const [bgColor, setBgColor] = useState('#f8f9fa');
  const [bgColor2, setBgColor2] = useState('#e9ecef');
  const [showPattern, setShowPattern] = useState(true);
  const [textColor, setTextColor] = useState('#1a1a1a');
  const [headerSize, setHeaderSize] = useState(48);
  const [subtextSize, setSubtextSize] = useState(18);
  const [alignment, setAlignment] = useState('center');
  const [aspectRatio, setAspectRatio] = useState('16/9'); // '16/9' or '1/1'
  const [isExporting, setIsExporting] = useState(false);

  // Helper for background style
  const getBackgroundStyle = () => {
    if (bgStyle === 'solid') return bgColor;
    if (bgStyle === 'gradient') return `linear-gradient(135deg, ${bgColor}, ${bgColor2})`;
    if (bgStyle === 'mesh') return `
      radial-gradient(at 0% 0%, ${bgColor} 0px, transparent 50%),
      radial-gradient(at 100% 0%, ${bgColor2} 0px, transparent 50%),
      radial-gradient(at 100% 100%, ${bgColor} 0px, transparent 50%),
      radial-gradient(at 0% 100%, ${bgColor2} 0px, transparent 50%),
      ${bgColor}
    `;
    return bgColor;
  };

  const handleLogoUpload = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0);

          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Automatically remove white/near-white backgrounds (threshold > 245)
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];

              if (r > 245 && g > 245 && b > 245) {
                data[i + 3] = 0; // Make transparent
              }
            }
            ctx.putImageData(imageData, 0, 0);
            setter(canvas.toDataURL('image/png'));
          } catch (err) {
            console.error('Canvas processing failed:', err);
            setter(reader.result); // Fallback to original image
          }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = async (format = 'png') => {
    if (!exportRef.current) return;

    setIsExporting(true);
    try {
      // Create a higher resolution canvas
      const canvas = await html2canvas(exportRef.current, {
        scale: 3, // Higher resolution
        useCORS: true,
        backgroundColor: bgStyle === 'solid' ? bgColor : null, // html2canvas handles gradients better if we don't force bg
        logging: false,
      });

      const image = canvas.toDataURL(`image/${format}`, 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `SGC-Advisory-${Date.now()}.${format}`;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const resetLayout = () => {
    setLogo1(null);
    setLogo2(null);
    setHeaderText('WE ARE CURRENTLY PERFORMING SYSTEM MAINTENANCE.');
    setSubText('FOR SYSTEM STABILITY, SORRY FOR THE INCONVENIENCE');
    setWatermarkText('');
    setWatermarkSize(120);
    setWatermarkOpacity(4);
    setWatermarkAngle(-30);
    setBgStyle('mesh');
    setBgColor('#f8f9fa');
    setBgColor2('#e9ecef');
    setShowPattern(true);
    setTextColor('#1a1a1a');
    setHeaderSize(48);
    setSubtextSize(18);
    setAlignment('center');
    setAspectRatio('16/9');
  };

  const randomizeBackground = () => {
    const styles = ['solid', 'gradient', 'mesh'];
    setBgStyle(styles[Math.floor(Math.random() * styles.length)]);
    setBgColor('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
    setBgColor2('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
    setShowPattern(Math.random() > 0.5);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', height: 'calc(100vh - 250px)' }}>
      {/* Controls Panel */}
      <div className="glass-panel" style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Type size={20} className="text-gradient" /> Layout Editor
        </h3>

        {/* Logo Uploads */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Logo 1</label>
            <label className="glass-panel" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '12px', cursor: 'pointer', height: '80px', borderStyle: 'dashed', borderWidth: '1px',
              background: 'rgba(255,255,255,0.02)'
            }}>
              {logo1 ? <img src={logo1} alt="Logo 1" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <Upload size={20} />}
              <input type="file" hidden onChange={(e) => handleLogoUpload(e, setLogo1)} accept="image/*" />
            </label>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Logo 2</label>
            <label className="glass-panel" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '12px', cursor: 'pointer', height: '80px', borderStyle: 'dashed', borderWidth: '1px',
              background: 'rgba(255,255,255,0.02)'
            }}>
              {logo2 ? <img src={logo2} alt="Logo 2" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <Upload size={20} />}
              <input type="file" hidden onChange={(e) => handleLogoUpload(e, setLogo2)} accept="image/*" />
            </label>
          </div>
        </div>

        {/* Text Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Header Text</label>
            <textarea
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)', border: '1px solid var(--glass-border)', resize: 'none', height: '80px', fontSize: '0.85rem'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Description Text</label>
            <textarea
              value={subText}
              onChange={(e) => setSubText(e.target.value)}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)', border: '1px solid var(--glass-border)', resize: 'none', height: '60px', fontSize: '0.85rem'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Watermark (Optional)</label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="e.g., CONFIDENTIAL"
              style={{
                width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)', border: '1px solid var(--glass-border)', fontSize: '0.85rem'
              }}
            />
          </div>
        </div>

        {/* Controls: Colors & Sizes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Background Style</span>
              <button
                onClick={randomizeBackground}
                style={{ padding: '4px 10px', borderRadius: '6px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Wand2 size={12} /> Randomize
              </button>
            </div>
            <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '4px' }}>
              <button onClick={() => setBgStyle('solid')} style={{ flex: 1, padding: '6px', borderRadius: '6px', background: bgStyle === 'solid' ? 'var(--accent-teal-dark)' : 'transparent', color: '#fff', fontSize: '0.7rem' }}>Solid</button>
              <button onClick={() => setBgStyle('gradient')} style={{ flex: 1, padding: '6px', borderRadius: '6px', background: bgStyle === 'gradient' ? 'var(--accent-teal-dark)' : 'transparent', color: '#fff', fontSize: '0.7rem' }}>Gradient</button>
              <button onClick={() => setBgStyle('mesh')} style={{ flex: 1, padding: '6px', borderRadius: '6px', background: bgStyle === 'mesh' ? 'var(--accent-teal-dark)' : 'transparent', color: '#fff', fontSize: '0.7rem' }}>Mesh</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Primary</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ width: '100%', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }} />
            </div>
            {bgStyle !== 'solid' && (
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Secondary</label>
                <input type="color" value={bgColor2} onChange={(e) => setBgColor2(e.target.value)} style={{ width: '100%', height: '32px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem' }}>Pattern Overlay</span>
            <button
              onClick={() => setShowPattern(!showPattern)}
              style={{ padding: '4px 12px', borderRadius: '20px', background: showPattern ? 'var(--accent-green)' : 'var(--bg-tertiary)', color: '#fff', fontSize: '0.7rem' }}
            >
              {showPattern ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem' }}>Header Size</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => setHeaderSize(s => Math.max(10, s - 2))} style={{ background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '4px', color: '#fff' }}><Minus size={14} /></button>
                <span style={{ minWidth: '30px', textAlign: 'center', fontSize: '0.8rem' }}>{headerSize}px</span>
                <button onClick={() => setHeaderSize(s => s + 2)} style={{ background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '4px', color: '#fff' }}><Plus size={14} /></button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem' }}>Alignment</span>
            <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '4px' }}>
              <button onClick={() => setAlignment('left')} style={{ padding: '6px', borderRadius: '6px', background: alignment === 'left' ? 'var(--accent-teal-dark)' : 'transparent', color: '#fff' }}><AlignLeft size={16} /></button>
              <button onClick={() => setAlignment('center')} style={{ padding: '6px', borderRadius: '6px', background: alignment === 'center' ? 'var(--accent-teal-dark)' : 'transparent', color: '#fff' }}><AlignCenter size={16} /></button>
              <button onClick={() => setAlignment('right')} style={{ padding: '6px', borderRadius: '6px', background: alignment === 'right' ? 'var(--accent-teal-dark)' : 'transparent', color: '#fff' }}><AlignRight size={16} /></button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem' }}>Ratio</span>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem' }}
            >
              <option value="16/9">16:9 Landscape</option>
              <option value="1/1">1:1 Square</option>
              <option value="4/5">4:5 Portrait</option>
            </select>
          </div>

          {/* Watermark Advanced Controls */}
          {watermarkText && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Watermark Format</span>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem' }}>Size</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => setWatermarkSize(s => Math.max(20, s - 10))} style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}><Minus size={12} /></button>
                  <span style={{ minWidth: '30px', textAlign: 'center', fontSize: '0.75rem' }}>{watermarkSize}px</span>
                  <button onClick={() => setWatermarkSize(s => Math.min(400, s + 10))} style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}><Plus size={12} /></button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem' }}>Opacity (%)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="range" min="1" max="100" value={watermarkOpacity} onChange={(e) => setWatermarkOpacity(e.target.value)} style={{ width: '80px' }} />
                  <span style={{ fontSize: '0.75rem', minWidth: '25px', textAlign: 'right' }}>{watermarkOpacity}%</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem' }}>Angle</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="range" min="-90" max="90" value={watermarkAngle} onChange={(e) => setWatermarkAngle(e.target.value)} style={{ width: '80px' }} />
                  <span style={{ fontSize: '0.75rem', minWidth: '25px', textAlign: 'right' }}>{watermarkAngle}°</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              disabled={isExporting}
              onClick={() => downloadImage('png')}
              style={{
                padding: '12px', borderRadius: '12px', background: 'var(--accent-gradient)',
                color: '#0B2E33', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: isExporting ? 0.7 : 1, fontSize: '0.85rem'
              }}
            >
              <Download size={18} /> PNG
            </button>
            <button
              disabled={isExporting}
              onClick={() => downloadImage('jpeg')}
              style={{
                padding: '12px', borderRadius: '12px', background: 'var(--bg-tertiary)',
                color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: isExporting ? 0.7 : 1, border: '1px solid var(--glass-border)', fontSize: '0.85rem'
              }}
            >
              <Download size={18} /> JPEG
            </button>
          </div>

          <button
            onClick={resetLayout}
            style={{
              width: '100%', padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem'
            }}
          >
            <RotateCcw size={16} /> Reset Layout
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '40px', overflow: 'hidden' }}>
        <div
          ref={exportRef}
          className="preview-canvas"
          style={{
            aspectRatio: aspectRatio,
            width: '100%',
            maxWidth: aspectRatio === '16/9' ? '1000px' : '600px',
            background: getBackgroundStyle(),
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: alignment === 'center' ? 'center' : alignment === 'left' ? 'flex-start' : 'flex-end',
            padding: '60px',
            textAlign: alignment,
            color: textColor,
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Pattern Overlay */}
          {showPattern && (
            <div style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.05,
              pointerEvents: 'none',
              backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
          )}

          {/* Watermark Overlay */}
          {watermarkText && (
            <div style={{
              position: 'absolute',
              inset: '-50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '15%',
              pointerEvents: 'none',
              zIndex: 0,
              overflow: 'hidden',
              transform: `rotate(${watermarkAngle}deg)`,
            }}>
              {[0, 1, 2].map((idx) => (
                <span key={idx} style={{
                  fontSize: `clamp(${watermarkSize * 0.5}px, ${watermarkSize / 10}vw, ${watermarkSize * 1.5}px)`,
                  fontWeight: '900',
                  color: textColor,
                  opacity: watermarkOpacity / 100,
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                  letterSpacing: '12px',
                  transform: `translateX(${idx === 1 ? '5%' : '-5%'})`
                }}>
                  {watermarkText} &nbsp;&nbsp;&nbsp; {watermarkText} &nbsp;&nbsp;&nbsp; {watermarkText} &nbsp;&nbsp;&nbsp; {watermarkText}
                </span>
              ))}
            </div>
          )}

          {/* Logos Row */}
          <div style={{ display: 'flex', gap: '40px', marginBottom: '60px', alignItems: 'center', justifyContent: alignment === 'center' ? 'center' : 'flex-start', position: 'relative', zIndex: 1 }}>
            {logo1 && <img src={logo1} alt="" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />}
            {logo2 && <img src={logo2} alt="" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />}
          </div>

          {/* Main Content */}
          <h1 style={{
            fontSize: `${headerSize}px`,
            fontWeight: '900',
            textTransform: 'uppercase',
            lineHeight: '1.1',
            marginBottom: '30px',
            maxWidth: '90%',
            fontFamily: "'Inter', sans-serif",
            position: 'relative',
            zIndex: 1
          }}>
            {headerText}
          </h1>

          <div style={{
            width: '100px',
            height: '4px',
            background: textColor,
            marginBottom: '30px',
            opacity: 0.2,
            marginLeft: alignment === 'center' ? 'auto' : alignment === 'right' ? 'auto' : '0',
            marginRight: alignment === 'center' ? 'auto' : alignment === 'left' ? 'auto' : '0',
            position: 'relative',
            zIndex: 1
          }}></div>

          <p style={{
            fontSize: `${subtextSize}px`,
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            maxWidth: '80%',
            opacity: 0.8,
            position: 'relative',
            zIndex: 1
          }}>
            {subText}
          </p>

          {/* Corner Decors for premium look */}
          <div style={{ position: 'absolute', top: '20px', left: '20px', width: '40px', height: '40px', borderTop: `2px solid ${textColor}`, borderLeft: `2px solid ${textColor}`, opacity: 0.1 }}></div>
          <div style={{ position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px', borderTop: `2px solid ${textColor}`, borderRight: `2px solid ${textColor}`, opacity: 0.1 }}></div>
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '40px', height: '40px', borderBottom: `2px solid ${textColor}`, borderLeft: `2px solid ${textColor}`, opacity: 0.1 }}></div>
          <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '40px', height: '40px', borderBottom: `2px solid ${textColor}`, borderRight: `2px solid ${textColor}`, opacity: 0.1 }}></div>
        </div>
      </div>
    </div>
  );
};

export default AdvisoryGenerator;
