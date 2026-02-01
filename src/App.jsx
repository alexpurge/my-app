import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LayoutDashboard, Users, History, PlusCircle, Calendar, Search, LogOut, 
  ShieldAlert, TrendingUp, Activity, ChevronRight, Filter, CheckCircle2, 
  XCircle, Briefcase, RefreshCw, AlertTriangle, Menu, X, ArrowUpRight, 
  Database, Lock, Key, Clock, AlertOctagon, Loader2, MousePointerClick,
  BadgeDollarSign, ShoppingBag, Percent, Star, ChevronLeft, Power, SkipForward,
  Minimize2, ArrowRight
} from 'lucide-react';

/**
 * PURGE DIGITAL - AGENCY MASTER CONTROLLER
 * v9.7 - MASTER CHANGE HISTORY & ROBUST LOADING
 * - Feature: High-fidelity Change History Table (Meta-style Diffs)
 * - Feature: Non-blocking Background Scans with Skip option
 * - Fix: Prevented table collapse (Blank Screen) with enforced min-heights
 * - Core: Preserved all existing logic, keys, and styling
 */

// --- CONFIGURATION ---
const APP_ID = '1870933960210610'; 
const LOGO_URL = 'https://i.imgur.com/QjjDjuU.png'; 
const GRAPH_API_VERSION = 'v19.0';
const BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

const normalizeTeamMember = (member, index) => {
  const roleLabel = member?.role ? [member.role] : ['Authorized User'];
  return {
    id: member?.id || `member-${index}`,
    name: member?.name || 'Unknown User',
    email: member?.email || 'Email not available',
    role: member?.role || 'Assigned User',
    accessLabels: roleLabel,
    activityKey: member?.name || member?.email || ''
  };
};

// --- 1. EMBEDDED STYLESHEET ---
const STYLES = `
  /* --- RESET & BASE --- */
  :root {
    --bg-dark: #000000;
    --bg-panel: rgba(15, 23, 42, 0.6);
    --border-color: #1e293b;
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --accent-primary: #ff5d00;
    --accent-hover: #ff7b00;
    --logo-bg: #1a1a1a;
    --glass-border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* GLOBAL BOX SIZING FIX */
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body, #root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: var(--bg-dark);
    color: var(--text-primary);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  /* --- ANIMATIONS --- */
  @keyframes spin { 
    from { transform: rotate(0deg); } 
    to { transform: rotate(360deg); } 
  }
  
  @keyframes fadeIn { 
    from { opacity: 0; transform: translateY(10px); } 
    to { opacity: 1; transform: translateY(0); } 
  }

  .animate-spin-always {
    animation: spin 1s linear infinite;
  }

  .content-fade-in {
    animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  /* --- LOADING OVERLAY --- */
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(16px);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
  }

  /* --- MINI LOADER (NAV BAR) --- */
  .mini-loader-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid var(--border-color);
    border-radius: 99px;
    margin-right: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
  }
  .mini-progress-track {
    width: 100px;
    height: 4px;
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
    overflow: hidden;
  }
  .mini-progress-fill {
    height: 100%;
    background: var(--accent-primary);
    transition: width 0.3s ease;
  }

  /* --- UTILITIES --- */
  .app-wrapper { 
    min-height: 100vh; 
    width: 100vw;
    display: flex; 
    flex-direction: column; 
  }
  
  .glass-panel {
    background-color: var(--bg-panel);
    backdrop-filter: blur(12px);
    border: var(--glass-border);
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
    transition: all 0.2s ease;
    height: 100%; /* Fill grid cell */
    display: flex;
    flex-direction: column;
  }

  .container-fluid { 
    width: 100%; 
    padding: 2rem; 
    box-sizing: border-box; 
    flex: 1;
  }
  
  /* --- TYPOGRAPHY --- */
  h1 { margin: 0; font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase; line-height: 1; }
  h2 { margin: 0; font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; }
  h3 { margin: 0; font-weight: 700; color: #fff; }
  p { margin: 0; }
  .text-mono { font-family: ui-monospace, SFMono-Regular, monospace; }
  .text-small { font-size: 0.75rem; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 700; color: var(--text-secondary); }
  .text-accent { color: var(--accent-primary); }

  /* --- FORMS & INPUTS --- */
  .input-group { margin-bottom: 1.5rem; position: relative; }
  .glass-input {
    width: 100%;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-color);
    border-radius: 0.75rem;
    padding: 1rem 1rem 1rem 3rem;
    color: #fff;
    font-size: 1rem;
    box-sizing: border-box;
    transition: border-color 0.2s;
  }
  .glass-input:focus { outline: none; border-color: var(--accent-primary); }
  .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); }

  .btn-primary {
    width: 100%;
    background-color: var(--accent-primary);
    color: white;
    border: none;
    border-radius: 0.75rem;
    padding: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: background-color 0.2s;
  }
  .btn-primary:hover { background-color: var(--accent-hover); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  /* --- LAYOUTS --- */
  .nav-bar {
    height: 5rem;
    background: rgba(0,0,0,0.8);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: blur(10px);
    width: 100%;
    box-sizing: border-box;
  }

  .grid-portfolio {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem; 
    margin-top: 2rem;
    margin-bottom: 2rem; 
    width: 100%;
  }

  .grid-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem; 
    width: 100%;
    margin-bottom: 2rem;
  }

  /* --- COMPONENTS --- */
  .card-content { padding: 1.5rem; cursor: pointer; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
  .card-content:hover { background: rgba(255,255,255,0.03); }
  
  .badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    border: 1px solid transparent;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .badge-active { background: rgba(22, 163, 74, 0.1); color: #4ade80; border-color: rgba(22, 163, 74, 0.2); }
  .badge-paused { background: rgba(234, 179, 8, 0.1); color: #facc15; border-color: rgba(234, 179, 8, 0.2); }
  .badge-closed { background: rgba(255, 93, 0, 0.1); color: #ff8c42; border-color: rgba(255, 93, 0, 0.2); }

  .badge-main { 
    background: rgba(234, 179, 8, 0.15); 
    color: #facc15; 
    border: 1px solid rgba(234, 179, 8, 0.3);
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 0.6rem;
    font-weight: 800;
    text-transform: uppercase;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: 8px;
  }

  .meta-chip {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.5rem;
    border-radius: 9999px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    color: #94a3b8;
    font-size: 0.6rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: rgba(15, 23, 42, 0.6);
  }

  /* BUTTON GROUPS */
  .btn-group {
    display: flex;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.5rem;
    padding: 0.25rem;
    border: 1px solid var(--border-color);
  }
  .btn-group button {
    background: none;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    color: var(--text-secondary);
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-group button.active {
    background: var(--text-primary);
    color: var(--bg-dark);
  }
  .btn-group button:hover:not(.active) {
    color: var(--text-primary);
  }

  .tab-group { display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border-color); margin-bottom: 2rem; overflow-x: auto; width: 100%; }
  .tab-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    padding: 1rem 1.5rem;
    font-weight: 700;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
  }
  .tab-btn.active { color: #fff; border-bottom-color: var(--accent-primary); background: rgba(255, 93, 0, 0.05); }

  .data-table-wrapper { width: 100%; overflow-x: auto; flex: 1; }
  .data-table { width: 100%; border-collapse: collapse; text-align: left; }
  .data-table th { 
    background: #000; 
    padding: 1rem 1.5rem; 
    font-size: 0.7rem; 
    text-transform: uppercase; 
    color: var(--text-secondary); 
    border-bottom: 1px solid var(--border-color);
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .data-table td { 
    padding: 1rem 1.5rem; 
    border-bottom: 1px solid rgba(255,255,255,0.05); 
    font-size: 0.85rem; 
    color: #cbd5e1; 
    vertical-align: top;
  }
  .data-table tr:hover { background: rgba(255,255,255,0.02); }
  
  .change-detail { display: block; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; word-break: break-word; }

  /* DORMANCY SECTION & PROGRESS */
  .progress-container {
    width: 100%;
    height: 6px;
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 1rem;
  }
  .progress-bar {
    height: 100%;
    background: var(--accent-primary);
    transition: width 0.3s ease;
  }
  
  /* HEALTH STATUS BADGE */
  .status-symbol {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 700;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 1rem;
  }
  .status-healthy { background: rgba(74, 222, 128, 0.1); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.2); }
  .status-risk { background: rgba(255, 93, 0, 0.1); color: #ff5d00; border: 1px solid rgba(255, 93, 0, 0.2); }

  /* FILTER CHIP */
  .filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    background: rgba(255, 93, 0, 0.1);
    border: 1px solid rgba(255, 93, 0, 0.3);
    border-radius: 9999px;
    color: #ff5d00;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    margin-left: 1rem;
  }
  .filter-chip:hover {
    background: rgba(255, 93, 0, 0.2);
  }
  
  .btn-outline {
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-outline:hover { border-color: #fff; color: #fff; }
  .btn-outline.active { background: rgba(255, 93, 0, 0.1); border-color: var(--accent-primary); color: var(--accent-primary); }


  /* DATE PICKER & MODAL */
  .date-picker { display: flex; gap: 0.5rem; flex-wrap: wrap; background: rgba(0,0,0,0.3); padding: 0.5rem; border-radius: 0.75rem; border: 1px solid var(--border-color); }
  .date-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    text-transform: uppercase;
  }
  .date-btn.active { background: var(--accent-primary); color: white; }

  .modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(12px);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
  }
  .custom-date-modal {
    background: #0f172a;
    border: 1px solid var(--border-color);
    border-radius: 1rem;
    padding: 2rem;
    width: 100%;
    max-width: 800px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
    text-align: center;
    margin-top: 1rem;
  }
  .calendar-day {
    padding: 0.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
  .calendar-day:hover { background: rgba(255,255,255,0.1); color: #fff; }
  
  /* HIGHLIGHT FEATURE STYLES */
  .calendar-day.selected-start { 
    background: var(--accent-primary); 
    color: #fff;
    border-radius: 0.5rem 0 0 0.5rem;
  }
  .calendar-day.selected-end { 
    background: var(--accent-primary); 
    color: #fff;
    border-radius: 0 0.5rem 0.5rem 0;
  }
  .calendar-day.selected-same {
    background: var(--accent-primary); 
    color: #fff;
    border-radius: 0.5rem;
  }
  .calendar-day.in-range { 
    background: rgba(255, 93, 0, 0.15); 
    color: #fff; 
    border-radius: 0;
  }

  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  .date-select {
    background: rgba(0,0,0,0.5);
    color: #fff;
    border: 1px solid var(--border-color);
    padding: 0.5rem;
    border-radius: 0.5rem;
    font-size: 0.9rem;
  }
`;

// --- 2. LOGIC HELPERS ---

const formatCurrency = (amount, currency) => {
  if (amount === undefined || amount === null) return '0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const normalizeActorKey = (value) => (value ? value.trim().toLowerCase() : '');

// --- DATA PARSING FOR CHANGE LOGS (META STYLE) ---
const parseChangeDetails = (extraData) => {
  if (!extraData) return <span className="text-slate-500 italic">No details available</span>;
  try {
    const data = JSON.parse(extraData);
    
    // Handle Array (common in some endpoints)
    if (Array.isArray(data)) {
      return data.length > 0 ? (
        <div className="flex flex-col gap-1">
          {data.map((item, idx) => (
            <span key={idx} className="text-xs font-mono bg-slate-800 px-1 rounded border border-slate-700 inline-block w-fit">
              {typeof item === 'object' ? JSON.stringify(item) : String(item)}
            </span>
          ))}
        </div>
      ) : <span className="text-slate-500 italic">No specific details</span>;
    }

    // Handle Old/New Value Format (The "Meta" Way)
    if (data.new_value !== undefined || data.old_value !== undefined) {
      return (
        <div className="flex flex-col gap-1.5 text-xs bg-slate-900/50 p-2 rounded border border-slate-800">
          {data.old_value !== undefined && data.old_value !== null && (
            <div className="flex items-start gap-2">
              <span className="text-rose-400 font-bold text-[10px] uppercase w-8 mt-0.5">WAS</span>
              <span className="font-mono text-slate-400 break-all">{String(data.old_value)}</span>
            </div>
          )}
          {data.new_value !== undefined && (
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold text-[10px] uppercase w-8 mt-0.5">NOW</span>
              <span className="font-mono text-white break-all">{String(data.new_value)}</span>
            </div>
          )}
        </div>
      );
    }

    // Handle generic Key-Value pairs
    if (typeof data === 'object' && data !== null) {
      return (
        <div className="flex flex-col gap-1 bg-slate-900/50 p-2 rounded border border-slate-800">
          {Object.entries(data).map(([k, v]) => (
            <div key={k} className="flex gap-2 text-xs">
              <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wide mt-0.5">{k.replace(/_/g, ' ')}:</span>
              <span className="font-mono text-slate-300 break-all">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-xs font-mono text-slate-400">{String(extraData).substring(0, 100)}</span>;
  } catch (e) {
    return <span className="text-xs font-mono text-slate-400">{String(extraData).substring(0, 100)}</span>;
  }
};

// Function to determine API params for range
const getRangeParams = (range, custom) => {
  if (range.days === 'all') return { date_preset: 'maximum' };
  if (range.days === 'custom' && custom.start && custom.end) {
    return {
      time_range: JSON.stringify({
        since: custom.start.toISOString().split('T')[0],
        until: custom.end.toISOString().split('T')[0]
      })
    };
  }
  if (range.days === 1) return { date_preset: 'today' };
  if (range.days === 7) return { date_preset: 'last_7d' };
  if (range.days === 30) return { date_preset: 'last_30d' };
  
  // Fallback
  return { date_preset: 'last_30d' };
};

// --- CUSTOM DATE PICKER COMPONENT ---
const CustomDatePickerModal = ({ isOpen, onClose, onApply }) => {
  if (!isOpen) return null;

  const today = new Date();
  const [startDate, setStartDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [endDate, setEndDate] = useState(today);
  
  // Year range (last 20 years)
  const years = Array.from({ length: 21 }, (_, i) => today.getFullYear() - i);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const handleApply = () => {
    onApply(startDate, endDate);
    onClose();
  };

  const DateInputBlock = ({ label, date, setDate }) => {
    const isDayInRange = (dayDate) => {
      // Create fresh date objects at midnight to avoid time conflicts
      const s = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const e = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      const current = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
      return current > s && current < e;
    };

    const isStart = (dayDate) => {
      return dayDate.getDate() === startDate.getDate() && 
             dayDate.getMonth() === startDate.getMonth() && 
             dayDate.getFullYear() === startDate.getFullYear();
    };

    const isEnd = (dayDate) => {
      return dayDate.getDate() === endDate.getDate() && 
             dayDate.getMonth() === endDate.getMonth() && 
             dayDate.getFullYear() === endDate.getFullYear();
    };

    return (
      <div style={{ marginBottom: '2rem' }}>
        <label className="text-small" style={{ marginBottom: '0.5rem', display: 'block' }}>{label}</label>
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div className="calendar-header">
            <select 
              className="date-select" 
              value={date.getMonth()} 
              onChange={e => setDate(new Date(date.getFullYear(), parseInt(e.target.value), 1))}
            >
              {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select 
              className="date-select" 
              value={date.getFullYear()} 
              onChange={e => setDate(new Date(parseInt(e.target.value), date.getMonth(), 1))}
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="calendar-grid">
            {['S','M','T','W','T','F','S'].map(d => <span key={d} style={{fontSize:'0.7rem', color:'#64748b'}}>{d}</span>)}
            {Array.from({ length: getDaysInMonth(date) }, (_, i) => {
              const day = i + 1;
              const currentRenderDate = new Date(date.getFullYear(), date.getMonth(), day);
              
              const startMatch = isStart(currentRenderDate);
              const endMatch = isEnd(currentRenderDate);
              const inRange = isDayInRange(currentRenderDate);
              const sameDate = startMatch && endMatch;

              let className = 'calendar-day';
              if (sameDate) className += ' selected-same';
              else if (startMatch) className += ' selected-start';
              else if (endMatch) className += ' selected-end';
              else if (inRange) className += ' in-range';

              return (
                <div 
                  key={day} 
                  className={className}
                  onClick={() => setDate(new Date(date.getFullYear(), date.getMonth(), day))}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay">
      <div className="custom-date-modal animate-in zoom-in-95">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3>Select Date Range</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20}/></button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <DateInputBlock label="START DATE" date={startDate} setDate={setStartDate} />
          <DateInputBlock label="END DATE" date={endDate} setDate={setEndDate} />
        </div>

        <button className="btn-primary" onClick={handleApply} style={{ marginTop: '1rem' }}>Apply Date Range</button>
      </div>
    </div>
  );
};

// --- GLOBAL LOADER COMPONENT ---
const GlobalLoader = ({ status, progress, onSkip, canSkip }) => (
  <div className="loading-overlay">
    <div className="animate-spin-always text-accent mb-6">
      <Loader2 size={64} />
    </div>
    <h3 style={{marginBottom:'0.5rem', fontSize:'1.25rem'}}>{status || 'Processing...'}</h3>
    {progress !== undefined && progress > 0 && (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.875rem', width: '300px' }}>
          <span>System Operation</span>
          <span className="text-mono">{progress}%</span>
        </div>
        <div className="progress-container" style={{ width: '300px' }}>
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      </>
    )}
    <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', marginTop: '2rem'}}>
      <p className="text-small" style={{color:'#64748b'}}>Securely communicating with ad infrastructure</p>
      {canSkip && (
        <button 
          onClick={onSkip}
          className="text-small hover:bg-white/10" 
          style={{
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.2)', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '99px',
            color: '#e2e8f0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          <SkipForward size={14} /> Skip to Dashboard
        </button>
      )}
    </div>
  </div>
);

// --- LOGIC: SUBSTANTIVE CHANGES & HELPERS ---
const getActionValue = (insights, actionType, valueKey = 'value') => {
  if (!insights) return 0;
  if (typeof insights[actionType] !== 'undefined') return insights[actionType];
  if (valueKey === 'value' && insights.actions) {
    const action = insights.actions.find(a => a.action_type === actionType);
    if (action) return action.value;
  }
  if (valueKey === 'action_values' && insights.action_values) {
    const action = insights.action_values.find(a => a.action_type === actionType);
    if (action) return action.value;
  }
  if (valueKey === 'cost_per_action_type' && insights.cost_per_action_type) {
    const action = insights.cost_per_action_type.find(a => a.action_type === actionType);
    if (action) return action.value;
  }
  return 0;
};

const isSubstantiveChange = (log) => {
  const type = log.event_type.toLowerCase();
  if (type.includes('billing') || type.includes('payment') || type.includes('invoice')) return false;
  if (type.includes('run_status') || type.includes('archive') || type.includes('delete')) return false;
  if (type.includes('tag') || type.includes('label')) return false;
  return true; 
};

// --- 3. MAIN COMPONENT ---

export default function App() {
  const [session, setSession] = useState({ loggedIn: false, appId: APP_ID, token: '' });
  
  // Loading States
  const [globalLoading, setGlobalLoading] = useState({ active: false, status: '', progress: 0, canSkip: false });
  const [backgroundScan, setBackgroundScan] = useState({ active: false, progress: 0, status: '' });
  const [authError, setAuthError] = useState(null);
  
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedAccountHealth, setSelectedAccountHealth] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dashboard Data State
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({ label: '7 Days', days: 7 });
  const [customDates, setCustomDates] = useState({ start: null, end: null });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [insights, setInsights] = useState(null);
  const [logs, setLogs] = useState([]);
  const [mainActorId, setMainActorId] = useState(null);
  const [userActivityCounts, setUserActivityCounts] = useState({});
  const [historyLoading, setHistoryLoading] = useState(false);
  const [teamByAccount, setTeamByAccount] = useState({});
  const [teamLoading, setTeamLoading] = useState(false);

  // Scanning & Filter State
  const [scanResults, setScanResults] = useState([]); 
  const [dormancyDays, setDormancyDays] = useState(7); 
  const [showAtRiskFilter, setShowAtRiskFilter] = useState(false);
  const [accountStatusFilter, setAccountStatusFilter] = useState('Active'); 

  // --- API CALLER ---
  const callGraphAPI = useCallback(async (endpoint, params = {}) => {
    const queryParams = new URLSearchParams({ access_token: session.token, ...params });
    try {
      const response = await fetch(`${BASE_URL}${endpoint}?${queryParams.toString()}`);
      const data = await response.json();
      if (data.error) throw data.error;
      return data;
    } catch (err) {
      console.error("API Error:", err);
      throw err;
    }
  }, [session.token]);

  const fetchChangeHistory = useCallback(async (accountId, params = {}) => {
    const activityLog = [];
    let afterCursor = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const pageParams = { ...params, limit: 500 };
      if (afterCursor) pageParams.after = afterCursor;

      const page = await callGraphAPI(`/${accountId}/activities`, pageParams);
      const pageData = page?.data || [];
      activityLog.push(...pageData);

      afterCursor = page?.paging?.cursors?.after || null;
      hasNextPage = Boolean(afterCursor) && pageData.length > 0;
    }

    return activityLog;
  }, [callGraphAPI]);

  const fetchAccountTeam = useCallback(async (accountId) => {
    if (!accountId) return [];
    setTeamLoading(true);

    try {
      const response = await callGraphAPI(`/${accountId}/users`, {
        fields: 'id,name,email,role',
        limit: 200
      });
      const members = (response?.data || []).map((member, index) => normalizeTeamMember(member, index));
      setTeamByAccount(prev => ({ ...prev, [accountId]: members }));
      return members;
    } catch (err) {
      console.error('Failed to load team roster', err);
      setTeamByAccount(prev => ({ ...prev, [accountId]: prev[accountId] || [] }));
      return [];
    } finally {
      setTeamLoading(false);
    }
  }, [callGraphAPI]);

  // --- PORTFOLIO RISK SCAN LOGIC (ONE-TIME, BACKGROUND CAPABLE) ---
  const performRiskScan = async (accountList) => {
    // Initial blocking state
    setGlobalLoading({ active: true, status: 'Initializing Risk Scan...', progress: 0, canSkip: true });
    // Also set background state immediately so it's ready if skipped
    setBackgroundScan({ active: true, progress: 0, status: 'Initializing...' });

    const results = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - dormancyDays);
    const RISK_CPR_THRESHOLD = 60.00;
    
    // FIXED RANGE FOR SCAN: LAST 30 DAYS (No Date Picker Dependency)
    const insightsParams = { date_preset: 'last_30d', fields: 'spend,actions,action_values' };

    for (let i = 0; i < accountList.length; i++) {
      const acc = accountList[i];
      const progress = Math.round(((i + 1) / accountList.length) * 100);
      const statusText = `Scanning ${acc.name}...`;

      // Update both loaders
      setGlobalLoading(prev => ({ ...prev, status: statusText, progress }));
      setBackgroundScan({ active: true, progress, status: 'Scanning Portfolio...' });

      try {
        const [activitiesRes, insightsRes] = await Promise.allSettled([
          fetch(`${BASE_URL}/act_${acc.account_id}/activities?fields=event_time,event_type,actor_name&limit=10&access_token=${session.token}`).then(r => r.json()),
          callGraphAPI(`/act_${acc.account_id}/insights`, insightsParams)
        ]);

        let isDormant = false;
        let lastChangeDateStr = 'No recent history';
        
        if (activitiesRes.status === 'fulfilled') {
          const activities = activitiesRes.value.data || [];
          const lastSubstantive = activities.find(log => isSubstantiveChange(log));
          const lastChangeDate = lastSubstantive ? new Date(lastSubstantive.event_time) : null;
          if (lastChangeDate) lastChangeDateStr = lastChangeDate.toLocaleDateString();
          if (!lastChangeDate || lastChangeDate < cutoffDate) isDormant = true;
        }

        let isHighCostRisk = false;
        let calculatedCPA = 0;
        let totalConversions = 0;
        let spend = 0;

        if (insightsRes.status === 'fulfilled' && insightsRes.value.data && insightsRes.value.data.length > 0) {
          const ins = insightsRes.value.data[0];
          spend = parseFloat(ins.spend || 0);
          const leads = getActionValue(ins, 'lead', 'value') || 0;
          const purchases = getActionValue(ins, 'purchase', 'value') || 0;
          totalConversions = parseInt(leads) + parseInt(purchases);

          if (totalConversions > 0) {
            calculatedCPA = spend / totalConversions;
            if (calculatedCPA > RISK_CPR_THRESHOLD) isHighCostRisk = true;
          } else if (spend > RISK_CPR_THRESHOLD && totalConversions === 0) {
            isHighCostRisk = true;
          }
        }

        if (isDormant || isHighCostRisk) {
          results.push({
            account_id: acc.account_id,
            isDormant,
            isHighCostRisk,
            cpa: calculatedCPA,
            lastSubstantiveChange: lastChangeDateStr
          });
        }
      } catch (err) {
        console.warn(`Scan error for ${acc.account_id}`, err);
      }
    }

    setScanResults(results);
    // Clear both loaders on completion
    setGlobalLoading({ active: false, status: '', progress: 0, canSkip: false });
    setBackgroundScan({ active: false, progress: 0, status: '' });
  };

  // --- LOGIN LOGIC ---
  const handleConnect = async (e) => {
    e.preventDefault();
    setGlobalLoading({ active: true, status: 'Authenticating...', progress: 0, canSkip: false });
    setAuthError(null);

    try {
      const response = await fetch(`${BASE_URL}/me/adaccounts?fields=account_id,name,account_status,currency,amount_spent,balance&limit=200&access_token=${session.token}`);
      const data = await response.json();
      if (data.error) throw data.error;
      
      const accountList = data.data || [];
      accountList.sort((a, b) => {
        if (a.account_status === 1 && b.account_status !== 1) return -1;
        if (a.account_status !== 1 && b.account_status === 1) return 1;
        return a.name.localeCompare(b.name);
      });
      
      setAccounts(accountList);
      
      // Perform Scan (Async, don't await blocking UI)
      performRiskScan(accountList);
      
      setSession(prev => ({ ...prev, loggedIn: true }));

    } catch (err) {
      setAuthError(err.message || "Connection failed. Please check your Token.");
      setGlobalLoading({ active: false, status: '', progress: 0, canSkip: false });
    }
  };

  // Skip Handler
  const handleSkipLoading = () => {
    setGlobalLoading(prev => ({ ...prev, active: false }));
    // backgroundScan state remains active and updated by performRiskScan loop
  };

  // --- DATA SYNC LOGIC (SINGLE ACCOUNT) ---
  const refreshAccountData = useCallback(async () => {
    if (!selectedAccount) return;
    
    // IMMERSIVE LOADER TRIGGER (Cannot Skip individual loads)
    setGlobalLoading({ active: true, status: `Loading Data for ${selectedAccount.name}...`, progress: 0, canSkip: false });
    
    // Reset Data
    setSelectedAccountHealth(null); 
    setMainActorId(null);
    setUserActivityCounts({});
    setLogs([]); // Clear logs
    setHistoryLoading(true);

    const insightsParams = getRangeParams(dateRange, customDates);
    insightsParams.fields = 'spend,impressions,cpm,inline_link_clicks,inline_link_click_ctr,cost_per_inline_link_click,actions,action_values,cost_per_action_type,purchase_roas';
    insightsParams.level = 'account';

    const healthCutoff = new Date();
    healthCutoff.setDate(healthCutoff.getDate() - 30);

    // Shared variable for activity counts across async blocks
    let currentCounts = {};

    try {
      // Determine time range for logs
      let activitiesSince = null;
      let activitiesUntil = null;
      if (dateRange.days === 'all') {
         const past = new Date(); past.setFullYear(past.getFullYear() - 20);
         activitiesSince = Math.floor(past.getTime() / 1000);
      } else if (dateRange.days === 'custom' && customDates.start && customDates.end) {
         activitiesSince = Math.floor(customDates.start.getTime() / 1000);
         activitiesUntil = Math.floor(customDates.end.getTime() / 1000);
      } else {
         const start = new Date();
         start.setDate(start.getDate() - (typeof dateRange.days === 'number' ? dateRange.days : 7));
         activitiesSince = Math.floor(start.getTime() / 1000);
      }

      // 1. FILTERED LOGS (FOR TABLE & COUNTS) - REQUEST ALL VARIABLES
      const logsParams = {
        fields: 'event_time,event_type,translated_event_type,actor_name,actor_id,object_name,object_id,object_type,object_link,extra_data,application_name',
        limit: 500 // MAXIMUM PAGE SIZE PER REQUEST
      };
      if (activitiesSince) logsParams.since = activitiesSince;
      if (activitiesUntil) logsParams.until = activitiesUntil;

      const results = await Promise.allSettled([
        callGraphAPI(`/${selectedAccount.id}/insights`, insightsParams), // 0
        fetchChangeHistory(selectedAccount.id, logsParams), // 1: Filtered Logs (for table & counts)
        callGraphAPI(`/${selectedAccount.id}/activities`, { fields: 'event_time,event_type', limit: 50 }) // 2: Health
      ]);

      // 0. INSIGHTS
      if (results[0].status === 'fulfilled') setInsights(results[0].value.data?.[0] || null);
      else setInsights(null);

      // 1. FILTERED LOGS & COUNTS
      let filteredActivities = [];
      if (results[1].status === 'fulfilled') {
        filteredActivities = results[1].value || [];
        setLogs(filteredActivities);
        
        // Populate local variable immediately
        filteredActivities.forEach(log => {
          if (log.actor_name) {
            const actorKey = normalizeActorKey(log.actor_name);
            if (actorKey) {
              currentCounts[actorKey] = (currentCounts[actorKey] || 0) + 1;
            }
          }
        });
        // Update React State
        setUserActivityCounts(currentCounts);
      } else {
        setLogs([]);
      }

      // 2. ACTIVITY LEADER
      let maxCount = 0;
      let topUserKey = null;
      Object.entries(currentCounts).forEach(([key, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topUserKey = key;
        }
      });
      const roster = teamByAccount[selectedAccount.id] || [];
      const topMember = roster.find(member => normalizeActorKey(member.activityKey || member.name) === topUserKey);
      const fallbackMemberId = roster[0]?.id || null;
      setMainActorId(topMember?.id || fallbackMemberId);

      // 3. HEALTH CHECK
      if (results[2].status === 'fulfilled') {
        const healthActivities = results[2].value.data || [];
        const lastHealthChange = healthActivities.find(log => isSubstantiveChange(log));
        if (lastHealthChange && new Date(lastHealthChange.event_time) > healthCutoff) {
          setSelectedAccountHealth({ healthy: true, lastDate: new Date(lastHealthChange.event_time).toLocaleDateString() });
        } else {
          setSelectedAccountHealth({ healthy: false, lastDate: lastHealthChange ? new Date(lastHealthChange.event_time).toLocaleDateString() : 'None' });
        }
      }

    } catch (err) {
      console.error("Critical Sync Error", err);
    } finally {
      // STOP LOADER
      setHistoryLoading(false);
      setGlobalLoading({ active: false, status: '', progress: 0, canSkip: false });
    }
  }, [selectedAccount, dateRange, customDates, callGraphAPI, fetchChangeHistory, teamByAccount]);

  // Only trigger data refresh when Account OR Date changes (not during login)
  useEffect(() => {
    if (selectedAccount) refreshAccountData();
  }, [selectedAccount, dateRange, customDates, refreshAccountData]);

  useEffect(() => {
    if (!selectedAccount) return;
    const accountId = selectedAccount.id;
    if (!teamByAccount[accountId]) {
      fetchAccountTeam(accountId);
    }
  }, [selectedAccount, teamByAccount, fetchAccountTeam]);

  useEffect(() => {
    if (!selectedAccount) return;
    const roster = teamByAccount[selectedAccount.id] || [];
    if (roster.length === 0) return;
    let maxCount = 0;
    let topUserKey = null;
    Object.entries(userActivityCounts).forEach(([key, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topUserKey = key;
      }
    });
    const topMember = roster.find(member => normalizeActorKey(member.activityKey || member.name) === topUserKey);
    const fallbackMemberId = roster[0]?.id || null;
    setMainActorId(topMember?.id || fallbackMemberId);
  }, [selectedAccount, teamByAccount, userActivityCounts]);

  const filteredAccounts = useMemo(() => {
    let result = accounts;
    if (accountStatusFilter === 'Active') {
      result = result.filter(acc => acc.account_status === 1);
    } else if (accountStatusFilter === 'Inactive') {
      result = result.filter(acc => acc.account_status !== 1);
    }
    if (showAtRiskFilter) {
      const riskIds = new Set(scanResults.map(r => r.account_id));
      result = result.filter(acc => riskIds.has(acc.account_id));
    }
    if (searchTerm) {
      result = result.filter(acc => acc.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return result;
  }, [accounts, searchTerm, showAtRiskFilter, scanResults, accountStatusFilter]);

  const teamRoster = useMemo(() => {
    if (!selectedAccount) return [];
    return teamByAccount[selectedAccount.id] || [];
  }, [selectedAccount, teamByAccount]);

  const teamLookup = useMemo(() => {
    return new Map(teamRoster.map(member => [member.id, member]));
  }, [teamRoster]);

  // --- RENDER: LOGIN SCREEN ---
  if (!session.loggedIn) {
    return (
      <div className="app-wrapper" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <style>{STYLES}</style>
        
        {globalLoading.active && (
          <GlobalLoader 
            status={globalLoading.status} 
            progress={globalLoading.progress} 
            onSkip={handleSkipLoading}
            canSkip={globalLoading.canSkip}
          />
        )}

        <div style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--logo-bg)', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 10px 15px -3px rgba(255, 93, 0, 0.4)' }}>
              <img src={LOGO_URL} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '16px' }} />
            </div>
            <h1 style={{ fontSize: '2.5rem' }}>Purge Digital</h1>
            <p className="text-small" style={{ marginTop: '1rem' }}>Agency Master Control Interface</p>
          </div>

          <div className="glass-panel content-fade-in" style={{ padding: '2rem' }}>
             <form onSubmit={handleConnect}>
                {authError && (
                  <div style={{ background: 'rgba(255, 93, 0, 0.1)', border: '1px solid rgba(255, 93, 0, 0.2)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', color: '#ff8c42', fontSize: '0.875rem' }}>
                    <AlertTriangle size={16} /> {authError}
                  </div>
                )}
                
                <div className="input-group">
                  <label className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>System User Token</label>
                  <div style={{ position: 'relative' }}>
                    <Key size={18} className="input-icon" />
                    <input type="password" required className="glass-input" placeholder="Paste Access Token" value={session.token} onChange={e => setSession({...session, token: e.target.value})} />
                  </div>
                </div>

                <button type="submit" className="btn-primary" disabled={globalLoading.active}>
                  Initialize System
                </button>
              </form>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: DASHBOARD ---
  return (
    <div className="app-wrapper">
      <style>{STYLES}</style>
      
      {globalLoading.active && (
        <GlobalLoader 
          status={globalLoading.status} 
          progress={globalLoading.progress} 
          onSkip={handleSkipLoading}
          canSkip={globalLoading.canSkip}
        />
      )}
      
      <CustomDatePickerModal 
        isOpen={showDatePicker} 
        onClose={() => setShowDatePicker(false)}
        onApply={(start, end) => {
          setCustomDates({ start, end });
          setDateRange({ label: `Custom: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`, days: 'custom' });
        }}
      />

      {/* NAV */}
      <nav className="nav-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--logo-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }} onClick={() => setSelectedAccount(null)}>
            <img src={LOGO_URL} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem' }}>Purge Digital</h2>
            <span className="text-small" style={{ fontSize: '0.6rem' }}>Master Controller</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* BACKGROUND SCAN MINI LOADER (Top Right) */}
          {backgroundScan.active && !globalLoading.active && (
            <div className="mini-loader-wrapper animate-fade-in">
              <div style={{display:'flex', flexDirection:'column', gap:'2px'}}>
                <span className="text-small" style={{fontSize:'0.6rem', color:'#fff'}}>Scanning...</span>
                <div className="mini-progress-track">
                  <div className="mini-progress-fill" style={{width: `${backgroundScan.progress}%`}}></div>
                </div>
              </div>
              <RefreshCw className="animate-spin" size={14} color="#ff5d00" />
            </div>
          )}

          {selectedAccount ? (
            <button className="text-small" style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', gap: '0.5rem' }} onClick={() => setSelectedAccount(null)}>
              <LayoutDashboard size={14} /> Back to Portfolio
            </button>
          ) : (
            <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
              {/* NEW: Status Filter Group */}
              <div className="btn-group">
                <button 
                  className={accountStatusFilter === 'All' ? 'active' : ''} 
                  onClick={() => setAccountStatusFilter('All')}
                >
                  All
                </button>
                <button 
                  className={accountStatusFilter === 'Active' ? 'active' : ''} 
                  onClick={() => setAccountStatusFilter('Active')}
                >
                  Active
                </button>
                <button 
                  className={accountStatusFilter === 'Inactive' ? 'active' : ''} 
                  onClick={() => setAccountStatusFilter('Inactive')}
                >
                  Inactive
                </button>
              </div>

              {/* Existing Risk Filter */}
              <button 
                className={`btn-outline ${showAtRiskFilter ? 'active' : ''}`}
                onClick={() => setShowAtRiskFilter(!showAtRiskFilter)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <AlertOctagon size={14} />
                {showAtRiskFilter ? 'Showing Risk Only' : 'Risk Filter'}
              </button>
            </div>
          )}
          <div style={{ width: '1px', height: '24px', background: '#334155' }}></div>
          <LogOut size={20} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setSession({ loggedIn: false, token: '', appId: '' })} />
        </div>
      </nav>

      <main className="container-fluid content-fade-in">
        
        {/* VIEW: PORTFOLIO & FILTER CHIP */}
        {!selectedAccount && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', marginBottom: '0.5rem' }}>Client Portfolio</h1>
                <div style={{display:'flex', alignItems:'center'}}>
                  <p className="text-secondary">
                    Showing <span className="text-accent">{filteredAccounts.length}</span> of {accounts.length} assets
                  </p>
                  {showAtRiskFilter && (
                    <div className="filter-chip" onClick={() => setShowAtRiskFilter(false)}>
                      Risk Filter Active <X size={12}/>
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem', width: '100%', maxWidth: '500px' }}>
                {/* DATE RANGE PICKER (NOW GLOBAL ON HOME) */}
                 <div className="date-picker">
                  {[{ label: 'Today', days: 1 }, { label: '7 Days', days: 7 }, { label: '30 Days', days: 30 }, { label: 'All Time', days: 'all' }].map(d => (
                    <button key={d.label} className={`date-btn ${dateRange.label === d.label ? 'active' : ''}`} onClick={() => setDateRange(d)}>{d.label}</button>
                  ))}
                  <button className={`date-btn ${dateRange.days === 'custom' ? 'active' : ''}`} onClick={() => setShowDatePicker(true)}>
                    Custom
                  </button>
                </div>

                <div style={{ position: 'relative', width: '100%' }}>
                  <Search size={18} className="input-icon" style={{ left: '1rem' }} />
                  <input type="text" className="glass-input" placeholder="Search clients..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ borderRadius: '99px', paddingLeft: '3rem' }} />
                </div>
              </div>

            </div>

            <div className="grid-portfolio">
              {filteredAccounts.map(acc => {
                const riskData = scanResults.find(r => r.account_id === acc.account_id);
                const isRisk = !!riskData;

                return (
                  <div key={acc.account_id} className="glass-panel card-content" onClick={() => setSelectedAccount({ ...acc, id: `act_${acc.account_id}` })}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <div style={{ width: '48px', height: '48px', background: '#1e293b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Briefcase size={24} color="#94a3b8" />
                      </div>
                      <div className={`badge ${acc.account_status === 1 ? 'badge-active' : 'badge-closed'}`}>
                        {acc.account_status === 1 ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {acc.account_status === 1 ? 'ACTIVE' : 'INACTIVE'}
                      </div>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{acc.name}</h3>
                    <p className="text-small text-mono">ID: {acc.account_id}</p>
                    
                    {/* SHOW RISK STATUS IN CARD */}
                    {isRisk ? (
                      <div style={{marginTop:'1rem', padding:'0.5rem', background:'rgba(255, 93, 0, 0.1)', borderRadius:'0.5rem', display:'flex', flexDirection:'column', gap:'0.25rem', fontSize:'0.75rem', color:'#ff5d00', border: '1px solid rgba(255, 93, 0, 0.2)'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:'700'}}>
                          <AlertOctagon size={12} /> AT RISK
                        </div>
                        {riskData.isHighCostRisk && (
                          <span style={{opacity:0.8}}>High CPA: ${riskData.cpa.toFixed(2)}</span>
                        )}
                        {riskData.isDormant && (
                          <span style={{opacity:0.8}}>Dormant: 7+ Days</span>
                        )}
                      </div>
                    ) : (
                      <div style={{marginTop:'1rem', padding:'0.5rem', background:'rgba(74, 222, 128, 0.1)', borderRadius:'0.5rem', display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.75rem', color:'#4ade80', border: '1px solid rgba(74, 222, 128, 0.2)'}}>
                        <CheckCircle2 size={12} /> Healthy
                      </div>
                    )}
                    
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <p className="text-small">Lifetime Spend</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace' }}>{formatCurrency(acc.amount_spent / 100, acc.currency)}</p>
                      </div>
                      <ArrowUpRight size={20} color="#64748b" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW: ACCOUNT DETAILS */}
        {selectedAccount && (
          <div className="animate-zoom-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div className="text-small" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ cursor: 'pointer' }} onClick={() => setSelectedAccount(null)}>Portfolio</span>
                  <ChevronRight size={12} />
                  <span className="text-accent">{selectedAccount.id}</span>
                </div>
                <h1 style={{ fontSize: 'clamp(2rem, 3vw, 3rem)' }}>{selectedAccount.name}</h1>
              </div>
              
              {/* ADVANCED DATE PICKER (PERSISTED FROM HOME) */}
              <div className="date-picker">
                {[{ label: 'Today', days: 1 }, { label: '7 Days', days: 7 }, { label: '30 Days', days: 30 }, { label: 'All Time', days: 'all' }].map(d => (
                  <button key={d.label} className={`date-btn ${dateRange.label === d.label ? 'active' : ''}`} onClick={() => setDateRange(d)}>{d.label}</button>
                ))}
                <button className={`date-btn ${dateRange.days === 'custom' ? 'active' : ''}`} onClick={() => setShowDatePicker(true)}>
                  Custom
                </button>
              </div>
            </div>

            {/* CLIENT HEALTH STATUS BADGE */}
            {selectedAccountHealth && (
              <div style={{ marginBottom: '1rem' }}>
                {selectedAccountHealth.healthy ? (
                  <div className="status-symbol status-healthy">
                    <CheckCircle2 size={16} /> Healthy (Activity Detected)
                  </div>
                ) : (
                  <div className="status-symbol status-risk">
                    <AlertTriangle size={16} /> Needs Optimization (No substantive changes in 30 days)
                  </div>
                )}
              </div>
            )}

            <div className="tab-group">
              {['overview', 'team', 'logs'].map(tab => (
                <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                  {tab === 'overview' && <TrendingUp size={16} />}
                  {tab === 'logs' && <History size={16} />}
                  {tab === 'team' && <Users size={16} />}
                  {tab === 'logs' ? 'CHANGE HISTORY' : tab.toUpperCase()}
                </button>
              ))}
            </div>

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="grid-stats">
                {/* 1. SPEND & IMPRESSIONS */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="text-small">Total Spend</span>
                    <TrendingUp color="#4ade80" />
                  </div>
                  <div style={{ fontSize: 'clamp(1.5rem, 2vw, 2.5rem)', fontWeight: 900, fontFamily: 'monospace' }}>
                    {formatCurrency(insights?.spend, selectedAccount.currency)}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="text-small">Impressions</span>
                    <Activity color="#60a5fa" />
                  </div>
                  <div style={{ fontSize: 'clamp(1.5rem, 2vw, 2.5rem)', fontWeight: 900, fontFamily: 'monospace' }}>
                    {parseInt(insights?.impressions || 0).toLocaleString()}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="text-small">Avg CPM</span>
                    <Database color="#facc15" />
                  </div>
                  <div style={{ fontSize: 'clamp(1.5rem, 2vw, 2.5rem)', fontWeight: 900, fontFamily: 'monospace' }}>
                    {formatCurrency(insights?.cpm, selectedAccount.currency)}
                  </div>
                </div>

                {/* 2. CLICK METRICS (LINK CLICKS) */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="text-small">Link Clicks</span>
                    <MousePointerClick color="#a78bfa" />
                  </div>
                  <div style={{ fontSize: 'clamp(1.5rem, 2vw, 2.5rem)', fontWeight: 900, fontFamily: 'monospace' }}>
                    {parseInt(getActionValue(insights, 'inline_link_clicks') || 0).toLocaleString()}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="text-small">Link CTR</span>
                    <Percent color="#a78bfa" />
                  </div>
                  <div style={{ fontSize: 'clamp(1.5rem, 2vw, 2.5rem)', fontWeight: 900, fontFamily: 'monospace' }}>
                    {parseFloat(insights?.inline_link_click_ctr || 0).toFixed(2)}%
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="text-small">CPC (Link)</span>
                    <BadgeDollarSign color="#a78bfa" />
                  </div>
                  <div style={{ fontSize: 'clamp(1.5rem, 2vw, 2.5rem)', fontWeight: 900, fontFamily: 'monospace' }}>
                    {formatCurrency(insights?.cost_per_inline_link_click, selectedAccount.currency)}
                  </div>
                </div>

                {/* 3. CONVERSION METRICS (LEADS & SALES) */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="text-small">Total Leads</span>
                    <Users color="#f472b6" />
                  </div>
                  <div style={{ fontSize: 'clamp(1.5rem, 2vw, 2.5rem)', fontWeight: 900, fontFamily: 'monospace' }}>
                    {parseInt(getActionValue(insights, 'lead', 'value') || 0).toLocaleString()}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="text-small">Cost Per Lead</span>
                    <BadgeDollarSign color="#f472b6" />
                  </div>
                  <div style={{ fontSize: 'clamp(1.5rem, 2vw, 2.5rem)', fontWeight: 900, fontFamily: 'monospace' }}>
                    {formatCurrency(getActionValue(insights, 'lead', 'cost_per_action_type'), selectedAccount.currency)}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="text-small">Purchases (Sales)</span>
                    <ShoppingBag color="#34d399" />
                  </div>
                  <div style={{ fontSize: 'clamp(1.5rem, 2vw, 2.5rem)', fontWeight: 900, fontFamily: 'monospace' }}>
                    {parseInt(getActionValue(insights, 'purchase', 'value') || getActionValue(insights, 'offsite_conversion.fb_pixel_purchase', 'value') || 0).toLocaleString()}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="text-small">Cost Per Purchase</span>
                    <BadgeDollarSign color="#34d399" />
                  </div>
                  <div style={{ fontSize: 'clamp(1.5rem, 2vw, 2.5rem)', fontWeight: 900, fontFamily: 'monospace' }}>
                    {formatCurrency(getActionValue(insights, 'purchase', 'cost_per_action_type') || getActionValue(insights, 'offsite_conversion.fb_pixel_purchase', 'cost_per_action_type'), selectedAccount.currency)}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="text-small">Total Conversion Value</span>
                    <TrendingUp color="#34d399" />
                  </div>
                  <div style={{ fontSize: 'clamp(1.5rem, 2vw, 2.5rem)', fontWeight: 900, fontFamily: 'monospace' }}>
                    {formatCurrency(getActionValue(insights, 'purchase', 'action_values') || getActionValue(insights, 'offsite_conversion.fb_pixel_purchase', 'action_values'), selectedAccount.currency)}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="text-small">ROAS</span>
                    <Percent color="#34d399" />
                  </div>
                  <div style={{ fontSize: 'clamp(1.5rem, 2vw, 2.5rem)', fontWeight: 900, fontFamily: 'monospace' }}>
                    {getActionValue(insights, 'purchase_roas', 'value') ? parseFloat(getActionValue(insights, 'purchase_roas', 'value')).toFixed(2) : '0.00'}x
                  </div>
                </div>

              </div>
            )}

            {/* TAB: LOGS (ENHANCED CHANGE HISTORY) */}
            {activeTab === 'logs' && (
              <div className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, minHeight: '60vh' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                  <h3>Change History Log</h3>
                  {historyLoading && <RefreshCw className="animate-spin" size={16} />}
                </div>
                <div className="data-table-wrapper" style={{flex: 1}}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{width: '150px'}}>Time</th>
                        <th style={{width: '200px'}}>User</th>
                        <th style={{width: '100px'}}>Action</th>
                        <th style={{width: '250px'}}>Entity (Object)</th>
                        <th>Change Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, i) => {
                        const matchedMember = log.actor_id ? teamLookup.get(log.actor_id) : null;
                        const nameMatchedMember = !matchedMember && log.actor_name
                          ? teamRoster.find(member => normalizeActorKey(member.activityKey || member.name) === normalizeActorKey(log.actor_name))
                          : null;
                        const displayMember = matchedMember || nameMatchedMember;
                        return (
                        <tr key={i}>
                          <td className="text-mono" style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                            <div className="flex flex-col">
                              <span className="text-slate-300 font-bold">{new Date(log.event_time).toLocaleDateString()}</span>
                              <span className="text-xs opacity-70">{new Date(log.event_time).toLocaleTimeString()}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                {log.actor_name ? log.actor_name[0] : '?'}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 600, color: '#fff' }}>{log.actor_name || 'System'}</span>
                                {displayMember?.email && (
                                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                    {displayMember.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${
                              log.event_type.toLowerCase().includes('create') ? 'badge-active' :
                              log.event_type.toLowerCase().includes('delete') ? 'badge-closed' :
                              'badge-paused'
                            }`} style={{ display: 'inline-flex' }}>
                              {log.translated_event_type || log.event_type}
                            </span>
                          </td>
                          <td>
                            <div style={{display:'flex', flexDirection:'column'}}>
                              <span style={{fontWeight:600, color: '#e2e8f0'}}>{log.object_name || '-'}</span>
                              <span className="text-mono" style={{fontSize:'0.65rem', color:'#64748b', marginTop:'2px'}}>ID: {log.object_id}</span>
                            </div>
                          </td>
                          <td className="text-small" style={{textTransform:'none', fontSize: '0.8rem', paddingRight:'2rem'}}>
                            {parseChangeDetails(log.extra_data)}
                          </td>
                        </tr>
                        );
                      })}
                      {logs.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                            <div className="flex flex-col items-center gap-2">
                              <History size={32} strokeWidth={1.5} />
                              <p>No changes found for this period.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: TEAM */}
            {activeTab === 'team' && (
              <div className="grid-stats">
                {teamRoster.map(member => {
                  const isMain = member.id === mainActorId || teamRoster.length === 1;
                  const activityKey = normalizeActorKey(member.activityKey || member.name);
                  const activityCount = userActivityCounts[activityKey] || 0;
                  const accessLabels = member.accessLabels && member.accessLabels.length > 0
                    ? member.accessLabels
                    : ['Logged Actor', 'System External'];

                  return (
                    <div key={member.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', borderColor: isMain ? 'rgba(234, 179, 8, 0.4)' : '' }}>
                      <div style={{ width: '56px', height: '56px', background: isMain ? 'rgba(234, 179, 8, 0.2)' : '#334155', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0, color: isMain ? '#facc15' : 'white' }}>
                        {member.name?.[0] || '?'}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <h4 style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center' }}>
                          {member.name}
                          {isMain && <span className="badge-main"><Star size={10} fill="currentColor" /> MAIN</span>}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.35rem' }}>
                          <p className="text-small text-accent">{member.role}</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {accessLabels.map(label => (
                              <span key={`${member.id}-${label}`} className="meta-chip">{label}</span>
                            ))}
                          </div>
                          <p className="text-small" style={{ fontSize: '0.65rem', textTransform: 'none', opacity: 0.7 }}>
                            {member.email}
                          </p>
                          <p className="text-small" style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                            Activity Count: <span style={{ color: '#fff' }}>{activityCount}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {teamLoading && teamRoster.length === 0 && (
                  <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    <p className="text-small">Loading team roster from Facebook...</p>
                  </div>
                )}
                {!teamLoading && teamRoster.length === 0 && (
                  <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                    <p className="text-small">No team members were returned for this account.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
