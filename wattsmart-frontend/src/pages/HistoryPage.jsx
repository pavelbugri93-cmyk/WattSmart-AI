import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, deletePrediction, deleteAllPredictions } from '../services/api';
import {
  BarChart2, ArrowLeft, Download, Trash2,
  Thermometer, DollarSign, Building2, Trophy,
  Check, X, Lightbulb
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './HistoryPage.css';

const MAX_COMPARE = 3;

const ORIENTATION_LABELS = ['', '', 'North', 'East', 'South', 'West'];

const getEnergyGrade = (total) => {
  if (total < 20) return { grade: 'A', color: '#10b981' };
  if (total < 32) return { grade: 'B', color: '#34d399' };
  if (total < 44) return { grade: 'C', color: '#fbbf24' };
  if (total < 56) return { grade: 'D', color: '#f97316' };
  return            { grade: 'F', color: '#ef4444' };
};

const exportToCSV = (data) => {
  const headers = ['Date', 'Heating kWh', 'Cooling kWh', 'Total kWh', 'Annual Cost', 'CO2 kg', 'Grade'];
  const rows = data.map(item => {
    const total = item.heatingLoad + item.coolingLoad;
    const { grade } = getEnergyGrade(total);
    return [
      new Date(item.createdAt).toLocaleDateString('en-GB'),
      item.heatingLoad, item.coolingLoad, total.toFixed(1),
      item.annualCost, item.co2, grade
    ].join(',');
  });
  const csv  = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'wattsmart_history.csv';
  a.click();
};

const TABLE_COLUMNS = [
  { key: 'select',      label: '☑' },
  { key: 'createdAt',   label: 'Date' },
  { key: 'heatingLoad', label: 'Heating' },
  { key: 'coolingLoad', label: 'Cooling' },
  { key: 'annualCost',  label: 'Annual Cost' },
  { key: 'co2',         label: 'CO₂' },
  { key: 'total',       label: 'Grade' },
  { key: 'delete',      label: '' },
];

export default function HistoryPage() {
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState([]);
  const [sortKey, setSortKey]       = useState('createdAt');
  const [sortDir, setSortDir]       = useState('desc');
  const [expandedId, setExpandedId] = useState(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const [confirmId, setConfirmId]   = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    getHistory()
      .then(res => setHistory(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id) =>
    setExpandedId(prev => prev === id ? null : id);

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < MAX_COMPARE ? [...prev, id] : prev
    );
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const handleDeleteOne = async (id) => {
    try {
      await deletePrediction(id);
      setHistory(prev => prev.filter(i => i.id !== id));
      setSelected(prev => prev.filter(x => x !== id));
      setConfirmId(null);
    } catch {
      alert('Failed to delete. Please try again.');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllPredictions();
      setHistory([]);
      setSelected([]);
      setConfirmAll(false);
    } catch {
      alert('Failed to delete. Please try again.');
    }
  };

  const sorted = [...history].sort((a, b) => {
    const av = sortKey === 'total' ? a.heatingLoad + a.coolingLoad : a[sortKey];
    const bv = sortKey === 'total' ? b.heatingLoad + b.coolingLoad : b[sortKey];
    return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  // Summary stats
  const total      = history.length;
  const avgCost    = total ? (history.reduce((s, i) => s + i.annualCost, 0) / total).toFixed(0) : 0;
  const avgConsump = total ? (history.reduce((s, i) => s + i.heatingLoad + i.coolingLoad, 0) / total).toFixed(1) : 0;
  const bestGrade  = total ? getEnergyGrade(Math.min(...history.map(i => i.heatingLoad + i.coolingLoad))) : null;

  // Chart data for selected buildings
  const chartData = selected.map((id, idx) => {
    const item = history.find(h => h.id === id);
    return {
      name:    `Building ${idx + 1}`,
      Heating: item.heatingLoad,
      Cooling: item.coolingLoad,
      Total:   +(item.heatingLoad + item.coolingLoad).toFixed(1),
    };
  });

  return (
    <div className="history-page">

      <header className="history-header">
        <h1 className="history-header__title">
          <BarChart2 size={22} style={{ marginRight: 8 }} /> Prediction History
        </h1>
        <button className="back-btn" onClick={() => navigate('/predict')}>
          <ArrowLeft size={14} style={{ marginRight: 4 }} /> Back
        </button>
      </header>

      <main className="history-content">

        {/* KPI summary cards */}
        {!loading && total > 0 && (
          <div className="kpi-row">
            <div className="kpi-card">
              <p className="kpi-card__value">{total}</p>
              <p className="kpi-card__label"><Building2 size={13} style={{ marginRight: 4 }} /> Total Buildings</p>
            </div>
            <div className="kpi-card">
              <p className="kpi-card__value">₪{avgCost}</p>
              <p className="kpi-card__label"><DollarSign size={13} style={{ marginRight: 4 }} /> Avg. Annual Cost</p>
            </div>
            <div className="kpi-card">
              <p className="kpi-card__value">{avgConsump} kWh</p>
              <p className="kpi-card__label"><Thermometer size={13} style={{ marginRight: 4 }} /> Avg. Consumption</p>
            </div>
            <div className="kpi-card" style={{ borderColor: bestGrade?.color }}>
              <p className="kpi-card__value" style={{ color: bestGrade?.color }}>{bestGrade?.grade}</p>
              <p className="kpi-card__label"><Trophy size={13} style={{ marginRight: 4 }} /> Best Grade</p>
            </div>
          </div>
        )}

        {/* Comparison chart — shown when buildings are selected */}
        {selected.length > 0 && (
          <div className="chart-box">
            <div className="chart-box__header">
              <p className="chart-box__title">Building Comparison ({selected.length}/{MAX_COMPARE})</p>
              <button className="clear-btn" onClick={() => setSelected([])}>Clear</button>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" unit=" kWh" domain={[0, 80]} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Legend />
                <Line type="monotone" dataKey="Heating" stroke="#ef4444" strokeWidth={2} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="Cooling" stroke="#3b82f6" strokeWidth={2} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="Total"   stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {selected.length === 0 && !loading && total > 0 && (
          <p className="history-hint">
            <Lightbulb size={13} style={{ marginRight: 4 }} />
            Select up to {MAX_COMPARE} buildings to compare them
          </p>
        )}

        {loading && <p className="history-msg">Loading...</p>}
        {!loading && total === 0 && <p className="history-msg">No predictions yet.</p>}

        {/* Action bar */}
        {!loading && total > 0 && (
          <div className="action-bar">
            <button className="csv-btn" onClick={() => exportToCSV(history)}>
              <Download size={14} style={{ marginRight: 6 }} /> Export CSV
            </button>

            {!confirmAll ? (
              <button className="delete-all-btn" onClick={() => setConfirmAll(true)}>
                <Trash2 size={14} style={{ marginRight: 6 }} /> Delete All
              </button>
            ) : (
              <div className="confirm-box">
                <span className="confirm-box__warning">Are you sure? This cannot be undone.</span>
                <button className="confirm-yes" onClick={handleDeleteAll}>Yes, delete</button>
                <button className="confirm-no"  onClick={() => setConfirmAll(false)}>Cancel</button>
              </div>
            )}
          </div>
        )}

        {/* Predictions table */}
        {!loading && total > 0 && (
          <div className="table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  {TABLE_COLUMNS.map(col => (
                    <th
                      key={col.key}
                      className={`history-th ${col.key !== 'select' && col.key !== 'delete' ? 'history-th--sortable' : ''}`}
                      onClick={() => col.key !== 'select' && col.key !== 'delete' && handleSort(col.key)}
                    >
                      {col.label}
                      {col.key !== 'select' && col.key !== 'delete' && (
                        sortKey === col.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map(item => {
                  const { grade, color } = getEnergyGrade(item.heatingLoad + item.coolingLoad);
                  const isSel = selected.includes(item.id);
                  const isExp = expandedId === item.id;

                  return (
                    <>
                      <tr
                        key={item.id}
                        className={`history-row ${isSel ? 'history-row--selected' : ''}`}
                        onClick={() => toggleExpand(item.id)}
                      >
                        <td className="history-td" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={() => toggleSelect(item.id)}
                            className="row-checkbox"
                          />
                        </td>
                        <td className="history-td">{new Date(item.createdAt).toLocaleDateString('en-GB')}</td>
                        <td className="history-td">{item.heatingLoad} kWh</td>
                        <td className="history-td">{item.coolingLoad} kWh</td>
                        <td className="history-td history-td--cost">₪{item.annualCost}</td>
                        <td className="history-td">{item.co2} kg</td>
                        <td className="history-td" style={{ color, fontWeight: 'bold' }}>{grade}</td>
                        <td className="history-td" onClick={e => e.stopPropagation()}>
                          {confirmId === item.id ? (
                            <span className="confirm-inline">
                              <button className="confirm-yes" onClick={() => handleDeleteOne(item.id)}><Check size={13} /></button>
                              <button className="confirm-no"  onClick={() => setConfirmId(null)}><X size={13} /></button>
                            </span>
                          ) : (
                            <button className="delete-one-btn" onClick={() => setConfirmId(item.id)}>
                              <Trash2 size={15} />
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expanded row — shows building parameters */}
                      {isExp && (
                        <tr className="expand-row">
                          <td colSpan={8} className="expand-cell">
                            <div className="expand-grid">
                              {[
                                { label: 'Relative Compactness', val: item.relativeCompactness },
                                { label: 'Surface Area (m²)',     val: item.surfaceArea },
                                { label: 'Wall Area (m²)',        val: item.wallArea },
                                { label: 'Roof Area (m²)',        val: item.roofArea },
                                { label: 'Height (m)',            val: item.overallHeight },
                                { label: 'Orientation',           val: ORIENTATION_LABELS[item.orientation] },
                                { label: 'Glazing Area',          val: `${Math.round(item.glazingArea * 100)}%` },
                                { label: 'Glazing Distribution',  val: item.glazingDistribution },
                              ].map(f => (
                                <div key={f.label} className="expand-item">
                                  <span className="expand-item__label">{f.label}</span>
                                  <span className="expand-item__value">{f.val}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}