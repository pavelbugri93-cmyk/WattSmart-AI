import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateRate } from '../services/api';
import { Zap, BarChart2, LogOut, Search, Check, Save, TrendingUp } from 'lucide-react';
import './ProfilePage.css';

const RATE_PRESETS = [
  { label: 'Residential', value: 0.59 },
  { label: 'Night Rate',  value: 0.38 },
  { label: 'Business',    value: 0.72 },
  { label: 'Peak',        value: 1.10 },
];

// Average kWh/m² from the UCI Energy Efficiency dataset
const EXAMPLE_KWH = 46;

export default function ProfilePage() {
  const [user, setUser]       = useState(null);
  const [rate, setRate]       = useState(0.6);
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

  useEffect(() => {
    getProfile()
      .then(res => {
        setUser(res.data);
        setRate(res.data.electricityRate ?? 0.6);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await updateRate(rate);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert('Failed to save rate. Please try again.');
    }
  };

  const handleRateChange = (newRate) => {
    setRate(newRate);
    setSaved(false);
  };

  const estimatedAnnualCost = (EXAMPLE_KWH * 365 * rate).toFixed(0);
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GB')
    : '—';

  if (loading) {
    return <div className="profile-page"><p className="profile-loading">Loading...</p></div>;
  }

  return (
    <div className="profile-page">

      {/* Top navigation bar */}
      <header className="profile-header">
        <span className="profile-header__logo">
          <Zap size={20} color="#60a5fa" style={{ marginRight: 6 }} />
          WattSmart AI
        </span>
        <nav className="profile-header__nav">
          <button className="nav-btn" onClick={() => navigate('/predict')}>
            <Search size={14} style={{ marginRight: 4 }} /> Predict
          </button>
          <button className="nav-btn" onClick={() => navigate('/history')}>
            <BarChart2 size={14} style={{ marginRight: 4 }} /> History
          </button>
          <button className="nav-btn nav-btn--danger" onClick={() => { localStorage.clear(); navigate('/'); }}>
            <LogOut size={14} style={{ marginRight: 4 }} /> Logout
          </button>
        </nav>
      </header>

      <main className="profile-container">

        {/* User info card */}
        <div className="profile-card">
          <div className="profile-avatar">
            {user?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <p className="profile-email">{user?.email}</p>
          <p className="profile-since">
            <Zap size={12} style={{ marginRight: 4 }} />
            Member since {joinDate}
          </p>
        </div>

        {/* Electricity rate card */}
        <div className="rate-card">
          <h2 className="rate-card__title">
            <Zap size={18} color="#60a5fa" style={{ marginRight: 8 }} />
            Personal Electricity Rate
          </h2>
          <p className="rate-card__subtitle">
            This rate is used to calculate the annual cost in every prediction.
          </p>

          <div className="rate-display">
            <span className="rate-display__label">Current rate:</span>
            <span className="rate-display__value">₪{rate.toFixed(2)}</span>
            <span className="rate-display__unit">/ kWh</span>
          </div>

          <input
            type="range"
            className="rate-slider"
            min={0.3} max={1.2} step={0.01}
            value={rate}
            onChange={e => handleRateChange(parseFloat(e.target.value))}
          />

          <div className="rate-range-labels">
            <span>₪0.30 — Cheap</span>
            <span>₪0.60 — Average</span>
            <span>₪1.20 — Expensive</span>
          </div>

          {/* Live cost estimate based on current rate */}
          <div className="rate-example">
            <p className="rate-example__title">
              <TrendingUp size={12} style={{ marginRight: 4 }} />
              Impact on an average building (46 kWh/m²)
            </p>
            <p className="rate-example__cost">
              Estimated annual cost: <b className="rate-example__highlight">₪{estimatedAnnualCost}</b>
            </p>
          </div>

          <button
            className={`save-btn ${saved ? 'save-btn--saved' : ''}`}
            onClick={handleSave}
          >
            {saved
              ? <><Check size={16} style={{ marginRight: 6 }} /> Saved!</>
              : <><Save size={16} style={{ marginRight: 6 }} /> Save Rate</>
            }
          </button>

          {/* Quick-select common Israeli electricity rates */}
          <div className="rate-presets">
            <p className="rate-presets__title">Common rates in Israel:</p>
            <div className="rate-presets__grid">
              {RATE_PRESETS.map(preset => (
                <button
                  key={preset.value}
                  className={`preset-btn ${Math.abs(rate - preset.value) < 0.01 ? 'preset-btn--active' : ''}`}
                  onClick={() => handleRateChange(preset.value)}
                >
                  <span className="preset-btn__label">{preset.label}</span>
                  <span className="preset-btn__value">₪{preset.value}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}