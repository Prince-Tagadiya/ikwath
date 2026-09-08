import React, { useState, useMemo } from 'react';
import { FormulationProfile } from '../types';
import { FORMULATIONS } from '../data/formulations';
import { StatusChip } from './StatusChip';

interface FormulationsScreenProps {
  onSelectFormulation?: (f: FormulationProfile) => void;
}

const CATEGORIES = [
  'All',
  'Immunity',
  'Adaptogen',
  'Anti-inflammatory',
  'Digestive',
  'Joint & Pain',
  'Fever & Detox',
  'Renal',
];

type SortMode = 'classical' | 'name' | 'time' | 'water' | 'custom';

export const FormulationsScreen: React.FC<FormulationsScreenProps> = ({ onSelectFormulation }) => {
  const [selected, setSelected] = useState<FormulationProfile>(FORMULATIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortMode, setSortMode] = useState<SortMode>('classical');
  const [customOrder, setCustomOrder] = useState<string[]>(FORMULATIONS.map((f) => f.id));

  // Handle reordering up/down
  const moveFormulation = (id: string, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    setSortMode('custom');
    setCustomOrder((prev) => {
      const idx = prev.indexOf(id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  const displayedFormulations = useMemo(() => {
    // 1. Filter by search & category
    const filtered = FORMULATIONS.filter((f) => {
      const matchesSearch =
        !searchQuery ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.pod_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.afi_code && f.afi_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        f.herbs.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        activeCategory === 'All' ||
        f.category.toLowerCase().includes(activeCategory.toLowerCase());

      return matchesSearch && matchesCat;
    });

    // 2. Sort or reorder
    const list = [...filtered];
    switch (sortMode) {
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'time':
        return list.sort((a, b) => {
          const tA = (a.soak_time_min || 10) + (a.extraction_time_min || 18);
          const tB = (b.soak_time_min || 10) + (b.extraction_time_min || 18);
          return tA - tB;
        });
      case 'water':
        return list.sort((a, b) => a.water_ml - b.water_ml);
      case 'custom':
        return list.sort((a, b) => {
          const idxA = customOrder.indexOf(a.id);
          const idxB = customOrder.indexOf(b.id);
          return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
        });
      case 'classical':
      default:
        return list;
    }
  }, [searchQuery, activeCategory, sortMode, customOrder]);

  const handleStartBrew = () => {
    if (onSelectFormulation && selected) {
      onSelectFormulation(selected);
    }
  };

  const totalCycleMin =
    (selected.soak_time_min || 10) + (selected.extraction_time_min || 18) + 2;

  return (
    <div className="screen-content formulations-pro-screen">
      {/* Top Header with Research Validation Banner & Search */}
      <div className="formulations-pro-header">
        <div className="fpro-title-wrap">
          <div className="fpro-title-group">
            <span className="fpro-title-number">STEP 1</span>
            <h1 className="fpro-title">Select Kwatha Formulation</h1>
            <span className="fpro-count-badge">{displayedFormulations.length} Classical Recipes</span>
          </div>
          <div className="formulations-research-banner">
            <span className="research-banner-badge">✓ AFI / API Research-Backed</span>
            <span>All 12 formulations strictly standardized per Ayurvedic Pharmacopoeia of India</span>
          </div>
        </div>

        {/* Search, Filter Chips & Reorder Toolbar */}
        <div className="fpro-filter-row">
          <div className="fpro-search-box">
            <svg className="fpro-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="input-kwatha-search-pro"
              type="text"
              className="fpro-search-input"
              placeholder="Search by classical name (Ayush, Triphala, Dashamoola) or herbs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="fpro-search-clear" onClick={() => setSearchQuery('')}>×</button>
            )}
          </div>

          {/* Reorder / Sort Control */}
          <div className="fpro-sort-control">
            <span className="fpro-sort-label">Order:</span>
            <select
              id="select-kwatha-sort"
              className="fpro-sort-select"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              aria-label="Reorder formulations"
            >
              <option value="classical">Classical AFI Order</option>
              <option value="name">Name (A → Z)</option>
              <option value="time">Fastest Brew Time</option>
              <option value="water">Water Volume (Low to High)</option>
              <option value="custom">Custom Reordered</option>
            </select>
          </div>

          {/* Category Chips */}
          <div className="fpro-cat-chips">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`fpro-cat-chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Workspace */}
      <div className="formulations-pro-layout">
        {/* Left Column: Easy-to-browse Herb Cards Grid */}
        <div className="fpro-grid-container">
          <div className="fpro-cards-grid">
            {displayedFormulations.map((f, index) => {
              const isSelected = selected.id === f.id;
              const fTotalTime = (f.soak_time_min || 10) + (f.extraction_time_min || 18) + 2;
              return (
                <div
                  key={f.id}
                  id={`card-fpro-${f.id}`}
                  className={`fpro-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelected(f)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${f.name}`}
                >
                  <div className="fpro-card-image-wrap">
                    {f.image ? (
                      <img src={f.image} alt={f.name} className="fpro-card-img" />
                    ) : (
                      <div className="fpro-card-img-placeholder">🌿</div>
                    )}
                    {isSelected && (
                      <div className="fpro-card-check" title="Currently Selected">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                    <span className="fpro-card-pod-id">{f.pod_id}</span>

                    {/* Quick Reorder Up/Down arrows */}
                    <div className="fpro-card-reorder-buttons" onClick={(e) => e.stopPropagation()}>
                      {index > 0 && (
                        <button
                          className="fpro-reorder-btn"
                          title="Move Up"
                          onClick={(e) => moveFormulation(f.id, 'up', e)}
                        >
                          ▲
                        </button>
                      )}
                      {index < displayedFormulations.length - 1 && (
                        <button
                          className="fpro-reorder-btn"
                          title="Move Down"
                          onClick={(e) => moveFormulation(f.id, 'down', e)}
                        >
                          ▼
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="fpro-card-body">
                    <div className="fpro-card-title">{f.name}</div>
                    <div className="fpro-card-meta">
                      <span className="fpro-card-tag">{f.category.split('&')[0].trim()}</span>
                      <span className="fpro-card-code">{f.afi_code || 'AFI Part-I'}</span>
                    </div>
                    <div className="fpro-card-quick-specs">
                      <span>💧 {f.water_ml}mL → {f.target_reduction_ml}mL</span>
                      <span>·</span>
                      <span>⏱️ ~{fTotalTime}m</span>
                      <span>·</span>
                      <span>🌡️ {f.extraction_temp_c}°C</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Monograph Specs Inspector & 2-Tap Action Console */}
        <div className="fpro-inspector-panel">
          {/* Header Banner of Selected Item */}
          <div className="fpro-insp-header">
            {selected.image && (
              <img src={selected.image} alt={selected.name} className="fpro-insp-thumb" />
            )}
            <div className="fpro-insp-title-col">
              <div className="fpro-insp-name">{selected.name}</div>
              <div className="fpro-insp-chips">
                <StatusChip label="AFI/API VERIFIED" variant="active" size="sm" />
                <span className="fpro-insp-pod-badge">{selected.pod_id} · REV {selected.profile_revision}</span>
              </div>
            </div>
          </div>

          <div className="fpro-insp-desc">{selected.description}</div>

          {/* Key Herbs (Yavakuṭa Cūrṇa) Box */}
          <div className="fpro-insp-herbs-box">
            <div className="fpro-insp-section-title">
              <span>Key Herbs (Yavakuṭa Cūrṇa Composition)</span>
              <span className="fpro-mesh-tag">{selected.coarse_powder_grade || '10/40 Mesh'}</span>
            </div>
            <div className="fpro-herbs-chips-list">
              {selected.herbs.map((herb, idx) => (
                <div key={idx} className="fpro-herb-pill">
                  <span className="fpro-herb-check">✓</span>
                  <span>{herb}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monograph Parameters Grid */}
          <div className="fpro-insp-specs-section">
            <div className="fpro-insp-section-title">AFI/API Pharmacopoeial Extraction Parameters</div>
            <div className="fpro-specs-grid">
              <div className="fpro-spec-cell">
                <span className="fpro-sc-label">Water Input (API Jala)</span>
                <span className="fpro-sc-val">{selected.water_ml} mL</span>
              </div>
              <div className="fpro-spec-cell">
                <span className="fpro-sc-label">Target Reduction (1/4)</span>
                <span className="fpro-sc-val">~{selected.target_reduction_ml} mL ({selected.reduction_endpoint_g}g)</span>
              </div>
              <div className="fpro-spec-cell">
                <span className="fpro-sc-label">Controlled Mild Temp</span>
                <span className="fpro-sc-val">{selected.extraction_temp_c} °C (PT100)</span>
              </div>
              <div className="fpro-spec-cell">
                <span className="fpro-sc-label">Soak Duration</span>
                <span className="fpro-sc-val">{selected.soak_time_min} minutes</span>
              </div>
              <div className="fpro-spec-cell">
                <span className="fpro-sc-label">Extraction Cycle</span>
                <span className="fpro-sc-val">{selected.extraction_time_min} minutes</span>
              </div>
              <div className="fpro-spec-cell">
                <span className="fpro-sc-label">Stirrer Agitation</span>
                <span className="fpro-sc-val">{selected.stirrer_rpm} RPM (Stepper)</span>
              </div>
            </div>
          </div>

          {/* Monograph & Safety Assurance Note */}
          <div className="fpro-safety-note">
            🛡️ <strong>AFI Conforming:</strong> Automated gravimetric mass loss (HX711) preserves thermolabile phytoconstituents.
          </div>

          {/* BIG 2-TAP START BREW BUTTON PINNED AT BOTTOM */}
          <div className="fpro-cta-wrap">
            <button
              id="btn-start-brew-2tap"
              className="fpro-start-btn"
              onClick={handleStartBrew}
              aria-label={`Start Brew for ${selected.name}`}
            >
              <div className="fpro-start-btn-title">START BREW ➔</div>
              <div className="fpro-start-btn-sub">
                2-Tap Quick Start · {selected.name} (~{totalCycleMin} min cycle)
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Motto matching touch display */}
      <div className="touch-footer-motto">
        <svg className="motto-leaf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
        <span>Traditional Knowledge</span>
        <span className="motto-separator">|</span>
        <span>Precision Technology</span>
        <span className="motto-separator">|</span>
        <span>Healthier Tomorrow</span>
      </div>
    </div>
  );
};
