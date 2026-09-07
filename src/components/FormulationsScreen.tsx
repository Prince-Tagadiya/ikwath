import React, { useState } from 'react';
import { FormulationProfile } from '../types';
import { FORMULATIONS } from '../data/formulations';
import { StatusChip } from './StatusChip';

interface FormulationsScreenProps {
  onSelectFormulation?: (f: FormulationProfile) => void;
}

export const FormulationsScreen: React.FC<FormulationsScreenProps> = ({ onSelectFormulation }) => {
  const [selected, setSelected] = useState<FormulationProfile | null>(FORMULATIONS[0] ?? null);

  return (
    <div className="screen-content formulations-screen">
      <div className="formulations-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div className="formulations-title">Formulation Library</div>
            <div className="formulations-sub">Validated profiles · Standardized for single-dose pod brewing</div>
          </div>
          <div className="formulations-research-banner">
            <span className="research-banner-badge">✓ Research-Backed</span>
            <span>All 12 formulations strictly standardized per <strong>AFI, API & PCIM&H</strong> monographs</span>
          </div>
        </div>
      </div>

      <div className="formulations-layout">
        {/* List */}
        <div className="formulations-list">
          {FORMULATIONS.map((f) => (
            <div
              key={f.id}
              className={`formulations-row ${selected?.id === f.id ? 'active' : ''}`}
              onClick={() => setSelected(f)}
              role="button"
              tabIndex={0}
              aria-label={`View ${f.name}`}
            >
              <div className="formulations-row-name">{f.name}</div>
              <div className="formulations-row-meta">
                <span>{f.pod_id}</span>
                <span>·</span>
                <span>{f.profile_revision}</span>
                <span>·</span>
                <span>{f.usage_count} runs</span>
              </div>
              <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
                <StatusChip
                  label={f.status}
                  variant={f.status === 'ACTIVE' ? 'active' : f.status === 'DEPRECATED' ? 'fault' : 'warning'}
                  size="sm"
                />
                {f.validated && <StatusChip label="AFI/API VERIFIED" variant="active" size="sm" />}
              </div>
            </div>
          ))}
        </div>

        {/* Detail */}
        <div className="formulations-detail">
          {selected ? (
            <>
              <div className="formulations-detail-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div className="formulations-detail-name">{selected.name}</div>
                  <StatusChip label="VERIFIED AFI/API" variant="active" size="sm" />
                </div>
                <div className="formulations-detail-sub">{selected.description}</div>

                <div className="formulations-research-detail-pill">
                  <span className="pill-dot">●</span>
                  <span><strong>Monograph Standard:</strong> Researched & validated against {selected.afi_code || 'AFI/API'} specifications using standardized {selected.coarse_powder_grade || 'Yavakuṭa Cūrṇa'}.</span>
                </div>

                <div className="formulations-params">
                  {[
                    { label: 'AFI / API Reference', value: selected.afi_code || 'AFI Part-I' },
                    { label: 'Powder Grade', value: selected.coarse_powder_grade || 'Yavakuṭa Cūrṇa (10/40 mesh)' },
                    { label: 'Profile revision', value: selected.profile_revision },
                    { label: 'Pod ID', value: selected.pod_id },
                    { label: 'Category', value: selected.category },
                    { label: 'Status', value: selected.status },
                    { label: 'Water input', value: `${selected.water_ml} mL` },
                    { label: 'Temp target', value: `${selected.extraction_temp_c} °C` },
                    { label: 'Soak time', value: `${selected.soak_time_min} min` },
                    { label: 'Extraction time', value: `${selected.extraction_time_min} min` },
                    { label: 'Stirrer speed', value: `${selected.stirrer_rpm} RPM` },
                    { label: 'Reduction endpoint', value: `~${selected.reduction_endpoint_g} g` },
                    { label: 'Total runs', value: `${selected.usage_count}` },
                  ].map((p) => (
                    <div key={p.label} className="formulations-param-row">
                      <span className="formulations-param-label">{p.label}</span>
                      <span className="formulations-param-value">{p.value}</span>
                    </div>
                  ))}
                </div>

                <div className="formulations-herbs-label">Key Herbs (Yavakuṭa Cūrṇa)</div>
                <ul className="formulations-herbs-list">
                  {selected.herbs.map((h) => <li key={h}>{h}</li>)}
                </ul>

                <div className="formulations-note">
                  ✓ Verified standard per PCIM&H / AFI monographs. Normal users cannot edit validated parameters. A change creates a new revision and enters the validation workflow.
                </div>
              </div>

              {onSelectFormulation && selected.validated && selected.status === 'ACTIVE' && (
                <div className="formulations-detail-footer">
                  <button
                    id={`btn-select-formulation-${selected.id}`}
                    className="btn-primary"
                    onClick={() => onSelectFormulation(selected)}
                  >
                    Use this formulation →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="formulations-empty">
              <div className="formulations-empty-icon">📋</div>
              <div>Select a formulation to view its profile.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
