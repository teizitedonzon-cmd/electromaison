import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * SignaturePad minimal (sans dépendance externe).
 * - Supporte souris + tactile (pointer events)
 * - Exporte une image (dataURL) pour envoi au backend
 */
export default function SignaturePad({
  width = 600,
  height = 200,
  disabled = false,
  onChange,
  initialDataUrl,
}) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef(null);
  const [dataUrl, setDataUrl] = useState(initialDataUrl || '');

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  const style = useMemo(
    () => ({
      width: `${width}px`,
      height: `${height}px`,
      border: '1.5px solid #E2E8F0',
      borderRadius: '10px',
      background: '#fff',
      touchAction: 'none',
      display: 'block',
    }),
    [width, height]
  );

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const targetW = Math.max(1, Math.round(rect.width));
    const targetH = Math.max(1, Math.round(rect.height));

    canvas.width = Math.round(targetW * dpr);
    canvas.height = Math.round(targetH * dpr);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Fond blanc
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, targetW, targetH);

    // Restaurer image si fournie
    if (dataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, targetW, targetH);
      };
      img.src = dataUrl;
    }
  };

  const exportDataUrl = () => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    // image PNG
    const url = canvas.toDataURL('image/png');
    setDataUrl(url);
    onChange?.(url);
    return url;
  };

  useEffect(() => {
    // resize au montage + lors du resize fenêtre
    const handleResize = () => resizeCanvas();
    resizeCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getPoint = (e) => {

    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const drawLine = (from, to) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    // Efface lastPoint
    lastPoint.current = to;
  };

  const onPointerDown = (e) => {
    if (disabled) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture?.(e.pointerId);
    drawing.current = true;
    lastPoint.current = getPoint(e);

    // Eviter scroll sur mobile
    e.preventDefault?.();
  };

  const onPointerMove = (e) => {
    if (disabled) return;
    if (!drawing.current) return;

    const p = getPoint(e);
    const last = lastPoint.current;
    if (!p || !last) return;

    // dessiner segment
    drawLine(last, p);
    e.preventDefault?.();
  };

  const endDrawing = () => {
    if (disabled) return;
    if (!drawing.current) return;
    drawing.current = false;
    lastPoint.current = null;
    exportDataUrl();
  };

  const onClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');

    // reset fond
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    setDataUrl('');
    onChange?.('');
  };

  return (
    <div ref={wrapperRef} style={{ width: `${width}px`, maxWidth: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ ...style, width: '100%' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrawing}
        onPointerCancel={endDrawing}
        onPointerLeave={endDrawing}
      />
      <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
        <button type="button" onClick={onClear} disabled={disabled} style={{
          border: '1.5px solid #E2E8F0',
          background: '#fff',
          borderRadius: 10,
          padding: '8px 14px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontWeight: 700,
          color: '#444',
        }}>
          Effacer
        </button>
        <div style={{ fontSize: 12, color: '#64748B' }}>
          Signature en ligne (tactile/souris).
        </div>
      </div>
    </div>
  );
}

