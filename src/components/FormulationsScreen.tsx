import React, { useState, useMemo } from 'react';
import { FormulationProfile } from '../types';
import { FORMULATIONS } from '../data/formulations';
import { StatusChip } from './StatusChip';

interface FormulationsScreenProps {
  onSelectFormulation?: (f: FormulationProfile) => void;
}

const CATEGORIES = ['All', 'Immunity & Respiratory', 'Adaptogen & Vitality', 'Anti-inflammatory & Pain', 'Digestive & Metabolic', 'Joint & Musculoskeletal', 'Fever & Detox', 'Renal & Diuretic'];

export const FormulationsScreen: React.FC<FormulationsScreenProps> = ({ onSelectFormulation }) => {
  const [selected, setSelected] = useState<FormulationProfile>(FORMULATIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFullSpecs, setShowFullSpecs] = useState(false);

  const filteredFormulations = useMemo(() => {
    return FORMULATIONS.filter((f) => {
      const matchesSearch =
        !searchQuery ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.pod_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.herbs.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = activeCategory === 'All' || f.category.toLowerCase().includes(activeCategory.toLowerCase().split('&')[0].trim());
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, activeCategory]);

  const handleStartBrew = () => {
    if (onSelectFormulation && selected) {
      onSelectFormulation(selected);
    }
  };

  return (
    <div className="screen-content touch-kwatha-screen">
      {/* Top Header Bar with Search */}
      <div className="touch-kwatha-header">
        <div className="touch-kwatha-title-row">
          <div className="touch-kwatha-title">Select Kwatha</div>
          <div className="formulations-research-banner">
            <span className="research-banner-badge">✓ Research-Backed</span>
            <span>All 12 formulations standardized per <strong>AFI & API</strong> monographs</span>
          </div>
        </div>

        {/* Search Input */}
        <div className="touch-search-box">
          <svg className="touch-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="input-kwatha-search"
            type="text"
            className="touch-search-input"
            placeholder="Search formulations by herb, classical name, or pod ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="touch-search-clear" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        {/* Category Pills */}
        <div className="touch-cat-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`touch-cat-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Herb Cards Horizontal Scroll / Touch Grid */}
      <div className="touch-cards-viewport">
        <div className="touch-cards-grid">
          {filteredFormulations.map((f) => {
            const isSelected = selected?.id === f.id;
            return (
              <div
                key={f.id}
                id={`card-formulation-${f.id}`}
                className={`touch-herb-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelected(f)}
                role="button"
                tabIndex={0}
                aria-label={`Select ${f.name}`}
              >
                <div className="touch-card-img-wrap">
                  {f.image ? (
                    <img src={f.image} alt={f.name} className="touch-card-img" />
                  ) : (
                    <div className="touch-card-img-placeholder">🌿</div>
                  )}
                  {isSelected && (
                    <div className="touch-card-selected-check">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                  <span className="touch-card-pod-badge">{f.pod_id}</span>
                </div>

                <div className="touch-card-info">
                  <div className="touch-card-name">{f.name}</div>
                  <div className="touch-card-category">{f.category}</div>
                  <div className="touch-card-monograph">
                    <span>{f.afi_code || 'API Standard'}</span>
                    <span className="touch-card-dot">·</span>
                    <span>{f.water_ml}mL → {f.target_reduction_ml}mL</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Summary Bar */}
      {selected && (
        <div className="touch-selected-bar">
          <div className="touch-selected-left">
            <div className="touch-selected-badge">CURRENT SELECTION</div>
            <div className="touch-selected-name-row">
              <span className="touch-selected-name">{selected.name}</span>
              <StatusChip label="AFI/API VERIFIED" variant="active" size="sm" />
              <StatusChip label={`REV ${selected.profile_revision}`} variant="info" size="sm" />
            </div>
            <div className="touch-selected-herbs">
              <strong>Key Herbs (Yavakuṭa Cūrṇa):</strong> {selected.herbs.slice(0, 3).join(' · ')}
              {selected.herbs.length > 3 ? ` +${selected.herbs.length - 3} more` : ''}
            </div>
          </div>

          <div className="touch-selected-specs">
            <div className="touch-mini-spec">
              <span className="spec-lbl">Target Temp</span>
              <span className="spec-val">{selected.extraction_temp_c} °C</span>
            </div>
            <div className="touch-mini-spec">
              <span className="spec-lbl">Soak / Brew</span>
              <span className="spec-val">{selected.soak_time_min}m / {selected.extraction_time_min}m</span>
            </div>
            <div className="touch-mini-spec">
              <span className="spec-lbl">Reduction Target</span>
              <span className="spec-val">~{selected.reduction_endpoint_g} g</span>
            </div>
            <button
              className="touch-btn-toggle-specs"
              onClick={() => setShowFullSpecs(!showFullSpecs)}
              title="Toggle full pharmacopoeial parameters"
            >
              {showFullSpecs ? 'Hide Details ▲' : 'View Specs ▼'}
            </button>
          </div>
        </div>
      )}

      {/* Expandable Full Specs Drawer */}
      {showFullSpecs && selected && (
        <div className="touch-full-specs-drawer">
          <div className="specs-drawer-title">
            <span>Official Pharmacopoeial Parameters ({selected.afi_code || 'API/AFI'})</span>
            <span className="specs-powder-note">Coarse Powder: {selected.coarse_powder_grade}</span>
          </div>
          <div className="specs-params-grid">
            <div className="spec-param-box">
              <div className="spec-p-label">Water Input</div>
              <div className="spec-p-value">{selected.water_ml} mL (API Jala)</div>
            </div>
            <div className="spec-param-box">
              <div className="spec-p-label">Boil Temperature</div>
              <div className="spec-p-value">{selected.extraction_temp_c} °C (Controlled mild heat)</div>
            </div>
            <div className="spec-param-box">
              <div className="spec-p-label">Soak Duration</div>
              <div className="spec-p-value">{selected.soak_time_min} minutes</div>
            </div>
            <div className="spec-param-box">
              <div className="spec-p-label">Extraction Cycle</div>
              <div className="spec-p-value">{selected.extraction_time_min} minutes</div>
            </div>
            <div className="spec-param-box">
              <div className="spec-p-label">Stirrer Agitation</div>
              <div className="spec-p-value">{selected.stirrer_rpm} RPM continuous</div>
            </div>
            <div className="spec-param-box">
              <div className="spec-p-label">1/4 Reduction Endpoint</div>
              <div className="spec-p-value">~{selected.reduction_endpoint_g} g (HX711 monitored)</div>
            </div>
          </div>
          <div className="specs-herbs-box">
            <div className="specs-herbs-title">Key Herbs (Yavakuṭa Cūrṇa Monograph Composition):</div>
            <div className="specs-herbs-list">
              {selected.herbs.map((h, i) => (
                <span key={i} className="spec-herb-item">✓ {h}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BIG 2-TAP START BREW BUTTON */}
      <div className="touch-cta-container">
        <button
          id="btn-start-brew-touch"
          className="touch-big-start-btn"
          onClick={handleStartBrew}
          aria-label={`Start Brew for ${selected?.name}`}
        >
          <span className="touch-btn-main-text">Start Brew ➔</span>
          <span className="touch-btn-sub-text">2-Tap Quick Start · {selected?.name} ({selected?.pod_id})</span>
        </button>
      </div>

      {/* Bottom Motto Banner matching mockup */}
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
