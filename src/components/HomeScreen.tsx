import React, { useState, useEffect, useRef } from 'react';
import { MachineStatus, BrewRecord, FormulationProfile } from '../types';
import { StatusChip } from './StatusChip';
import { AlertBanner } from './AlertBanner';
import { FORMULATIONS } from '../data/formulations';

interface HomeScreenProps {
  machineStatus: MachineStatus;
  lastBrew: BrewRecord | null;
  chamberClean: boolean;
  waterReady: boolean;
  onInsertPod: () => void;
  onViewHistory: () => void;
  onSelectKwatha?: (f: FormulationProfile) => void;
}

const STATUS_CONFIG: Record<MachineStatus, { label: string; color: string; chipVariant: 'active' | 'off' | 'fault' | 'warning' | 'info' }> = {
  READY: { label: 'Machine is idle & ready to brew', color: 'var(--success)', chipVariant: 'active' },
  BUSY: { label: 'Brew in progress', color: 'var(--accent)', chipVariant: 'info' },
  CLEANING: { label: 'Cleaning cycle in progress', color: 'var(--amber)', chipVariant: 'warning' },
  ATTENTION: { label: 'Action required before starting', color: 'var(--amber)', chipVariant: 'warning' },
  OFFLINE: { label: 'Local machine available — offline mode active', color: 'var(--text-muted)', chipVariant: 'off' },
  FAULT: { label: 'Fault — service required', color: 'var(--danger)', chipVariant: 'fault' },
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  machineStatus,
  lastBrew,
  chamberClean,
  waterReady,
  onInsertPod,
  onViewHistory,
  onSelectKwatha,
}) => {
  const cfg = STATUS_CONFIG[machineStatus];
  const isReady = machineStatus === 'READY';
  const [hoveredArrow, setHoveredArrow] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');
  const hoverNavTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time ticking clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
      setCurrentDateStr(
        now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hover on arrow automatically navigates to Formulations page
  const handleArrowMouseEnter = () => {
    setHoveredArrow(true);
    // Smooth transition: 320ms hover triggers auto navigation
    hoverNavTimerRef.current = setTimeout(() => {
      onInsertPod();
    }, 320);
  };

  const handleArrowMouseLeave = () => {
    setHoveredArrow(false);
    if (hoverNavTimerRef.current) {
      clearTimeout(hoverNavTimerRef.current);
      hoverNavTimerRef.current = null;
    }
  };

  // Top 4 quick formulations
  const popularKwathas = FORMULATIONS.slice(0, 4);

  return (
    <div className="screen-content home-pro-screen">
      {/* Top Welcome & Real-Time Live Clock Hero */}
      <div className="home-pro-hero">
        <div className="home-hero-time-block">
          <div className="home-live-time">
            {currentTimeStr || '10:24:00 AM'}
          </div>
          <div className="home-live-date">
            {currentDateStr || 'Tuesday, 8 Sep 2026'} · Smart Touch Kiosk Display
          </div>
        </div>

        <div className="home-hero-status-pill">
          <div className="home-pulse-dot" />
          <span className="home-status-txt">{cfg.label}</span>
          <StatusChip label={machineStatus} variant={cfg.chipVariant} size="sm" />
        </div>
      </div>

      {/* Attention alert if any */}
      {machineStatus === 'ATTENTION' && (
        <AlertBanner
          severity="WARNING"
          message="Action required before starting a new brew."
          action="Check chamber or water level."
        />
      )}
      {machineStatus === 'FAULT' && (
        <AlertBanner
          severity="SERVICE"
          message="A fault has been detected. Brewing is locked."
          action="Open Technician Mode to run diagnostics."
        />
      )}

      {/* Main 2-Tap Interactive Action Banner with Hover-Arrow Transition */}
      <div
        id="home-2tap-card"
        className={`home-2tap-card ${hoveredArrow ? 'hovered' : ''}`}
        onClick={onInsertPod}
        role="button"
        tabIndex={0}
        aria-label="Tap or hover arrow to browse formulations and start brew"
      >
        <div className="home-2tap-left">
          <div className="home-2tap-badge">⚡ 2-TAP SMART WORKFLOW</div>
          <div className="home-2tap-heading">
            {hoveredArrow ? 'Opening All 12 Formulations ➔' : 'Select Kwatha & Start Brew'}
          </div>
          <div className="home-2tap-sub">
            <strong>Tap 1:</strong> Select Kwatha Pod &nbsp;·&nbsp; <strong>Tap 2:</strong> Add Water & Start Precision Decoction
          </div>
        </div>

        <div
          className="home-2tap-action-btn"
          onMouseEnter={handleArrowMouseEnter}
          onMouseLeave={handleArrowMouseLeave}
          title="Hover or click arrow to view all formulations"
        >
          <span className="home-btn-label">
            {hoveredArrow ? 'Loading Library...' : 'Browse Formulations'}
          </span>
          <div className={`home-arrow-circle ${hoveredArrow ? 'pulse' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      </div>

      {/* Quick Access Popular Kwathas (1-Touch Entry) */}
      <div className="home-quick-shelf">
        <div className="home-shelf-header">
          <div className="home-shelf-title">Popular Classical Formulations (AFI / API)</div>
          <button className="home-shelf-link" onClick={onInsertPod}>
            View All 12 Formulations →
          </button>
        </div>

        <div className="home-shelf-grid">
          {popularKwathas.map((f) => (
            <div
              key={f.id}
              className="home-shelf-card"
              onClick={() => {
                if (onSelectKwatha) {
                  onSelectKwatha(f);
                } else {
                  onInsertPod();
                }
              }}
              role="button"
              tabIndex={0}
            >
              {f.image ? (
                <img src={f.image} alt={f.name} className="home-shelf-img" />
              ) : (
                <div className="home-shelf-placeholder">🌿</div>
              )}
              <div className="home-shelf-card-info">
                <div className="home-shelf-card-name">{f.name}</div>
                <div className="home-shelf-card-meta">
                  {f.category.split('&')[0].trim()} · {f.water_ml}mL → {f.target_reduction_ml}mL
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Readiness Checklist & Last Brew */}
      <div className="home-bottom-row">
        <div className="home-readiness-panel">
          <div className="home-panel-label">Hardware Sensor Readiness (IoT)</div>
          <div className="home-checks-row">
            <div className={`home-check-chip ${chamberClean ? 'ok' : 'fail'}`}>
              <span className="check-chip-icon">{chamberClean ? '✓' : '✗'}</span>
              <span>Chamber: {chamberClean ? 'SS316 CLEAN' : 'NEEDS RINSE'}</span>
            </div>
            <div className={`home-check-chip ${waterReady ? 'ok' : 'fail'}`}>
              <span className="check-chip-icon">{waterReady ? '✓' : '✗'}</span>
              <span>Water Level: {waterReady ? 'API JALA READY' : 'REFILL'}</span>
            </div>
            <div className="home-check-chip ok">
              <span className="check-chip-icon">✓</span>
              <span>Load Cell + PT100: CALIBRATED</span>
            </div>
          </div>
        </div>

        {lastBrew && (
          <div className="home-last-brew-compact" onClick={onViewHistory} role="button" tabIndex={0}>
            <div className="home-last-compact-head">
              <span className="hl-label">Last Brew Record</span>
              <span className="hl-pass">{lastBrew.result}</span>
            </div>
            <div className="hl-name">{lastBrew.formulation} ({lastBrew.final_mass_g}g)</div>
            <div className="hl-time">
              {lastBrew.timestamp.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · {lastBrew.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
