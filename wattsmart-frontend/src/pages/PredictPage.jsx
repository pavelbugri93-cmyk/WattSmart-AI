import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictGuest, predictUser } from '../services/api';
import logo from '../assets/logo.jpeg';
import {
  Zap, Search, BarChart2, User, Bot, LogOut,
  Thermometer, Wind, DollarSign, Calendar, Leaf,
  FlaskConical, Lock, TrendingUp
} from 'lucide-react';
import './PredictPage.css';

// Default values match the first row of the UCI Energy Efficiency dataset
const INITIAL_FORM = {
  relativeCompactness: 0.98,
  surfaceArea:         514.5,
  wallArea:            294.0,
  roofArea:            110.25,
  overallHeight:       7.0,
  orientation:         2,
  glazingArea:         0.0,
  glazingDistribution: 0,
};

// Average total load from the UCI dataset — used for comparison bar
const DATASET_AVERAGE_KWH = 46;

// Max What-If simulations allowed per prediction
const WHAT_IF_LIMIT = 3;

const getEnergyGrade = (total) => {
  if (total < 20) return { grade: 'A', color: '#10b981', label: 'Very Efficient' };
  if (total < 32) return { grade: 'B', color: '#34d399', label: 'Efficient' };
  if (total < 44) return { grade: 'C', color: '#fbbf24', label: 'Average' };
  if (total < 56) return { grade: 'D', color: '#f97316', label: 'Inefficient' };
  return            { grade: 'F', color: '#ef4444', label: 'Very Inefficient' };
};

const getRecommendation = (heating, cooling) => {
  const total = heating + cooling;
  const ratio = cooling / heating;
  if (total < 20)  return 'Excellent efficiency — top 20% of buildings. Keep up regular maintenance.';
  if (ratio > 2)   return 'Very high cooling load — consider improved roof insulation and solar-protective glazing.';
  if (ratio < 0.5) return 'High heating load — double-pane windows and wall insulation can reduce this by up to 20%.';
  if (total > 55)  return 'Above-average consumption — a full energy retrofit could save ₪2,000+ per year.';
  if (total > 38)  return 'Slightly above average — minor insulation improvements could push you to a B rating.';
  return 'Below-average consumption — small improvements could reach an A rating.';
};

// Reusable form field wrapper
const Field = ({ label, hint, children }) => (
  <div className="field">
    <label className="field__label">{label}</label>
    {hint && <p className="field__hint">{hint}</p>}
    {children}
  </div>
);

export default function PredictPage() {
  const [form, setForm]                   = useState(INITIAL_FORM);
  const [result, setResult]               = useState(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [showWhatIf, setShowWhatIf]       = useState(false);
  const [whatIfVals, setWhatIfVals]       = useState({ glazingArea: 0.0, overallHeight: 7.0, relativeCompactness: 0.98 });
  const [whatIfResult, setWhatIfResult]   = useState(null);
  const [whatIfLoading, setWhatIfLoading] = useState(false);
  const [whatIfCount, setWhatIfCount]     = useState(0);

  const navigate = useNavigate();
  const token    = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setWhatIfResult(null);
    setShowWhatIf(false);
    setWhatIfCount(0);
    try {
      const fn  = token ? predictUser : predictGuest;
      const res = await fn(form);
      setResult(res.data);
      setWhatIfVals({
        glazingArea:         form.glazingArea,
        overallHeight:       form.overallHeight,
        relativeCompactness: form.relativeCompactness,
      });
    } catch {
      setError('Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatIf = async () => {
    if (whatIfCount >= WHAT_IF_LIMIT) return;
    setWhatIfLoading(true);
    try {
      const res = await predictGuest({ ...form, ...whatIfVals });
      setWhatIfResult(res.data);
      setWhatIfCount(c => c + 1);
    } catch {
      setWhatIfResult(null);
    } finally {
      setWhatIfLoading(false);
    }
  };

  const logout = () => { localStorage.clear(); navigate('/'); };

  const totalLoad = result ? result.heatingLoad + result.coolingLoad : 0;

  return (
    <div className="predict-page">

      {/* Top navigation bar */}
      <header className="predict-header">
        <img src={logo} alt="WattSmart" className="predict-header__logo" />
        <nav className="predict-header__nav">
          {token ? (
            <>
              <button className="nav-btn" onClick={() => navigate('/models')}>
                <Bot size={14} style={{ marginRight: 4 }} /> Models
              </button>
              <button className="nav-btn" onClick={() => navigate('/profile')}>
                <User size={14} style={{ marginRight: 4 }} /> Profile
              </button>
              <button className="nav-btn" onClick={() => navigate('/history')}>
                <BarChart2 size={14} style={{ marginRight: 4 }} /> History
              </button>
              <button className="nav-btn nav-btn--danger" onClick={logout}>
                <LogOut size={14} style={{ marginRight: 4 }} /> Logout
              </button>
            </>
          ) : (
            <button className="nav-btn nav-btn--primary" onClick={() => navigate('/')}>
              <Lock size={14} style={{ marginRight: 4 }} /> Login
            </button>
          )}
        </nav>
      </header>

      <div className="predict-content">

        {/* ── Input form card ── */}
        <div className="predict-card">
          <h2 className="predict-card__title">Building Parameters</h2>

          <form onSubmit={handleSubmit}>

            <Field
              label={`Relative Compactness: ${form.relativeCompactness}`}
              hint="Higher compactness = less surface area = less energy loss"
            >
              <input type="range" className="slider" min={0.62} max={0.98} step={0.01}
                value={form.relativeCompactness}
                onChange={e => setForm({ ...form, relativeCompactness: parseFloat(e.target.value) })} />
            </Field>

            <Field
              label={`Surface Area: ${form.surfaceArea} m²`}
              hint="Total area of the building envelope"
            >
              <input type="range" className="slider" min={514.5} max={808.5} step={0.5}
                value={form.surfaceArea}
                onChange={e => setForm({ ...form, surfaceArea: parseFloat(e.target.value) })} />
            </Field>

            <Field
              label="Building Height"
              hint="Taller buildings have more volume to heat and cool"
            >
              <select className="select-input" value={form.overallHeight}
                onChange={e => setForm({ ...form, overallHeight: parseFloat(e.target.value) })}>
                <option value={3.5}>3.5m — Low-rise</option>
                <option value={7.0}>7.0m — High-rise</option>
              </select>
            </Field>

            <Field
              label={`Glazing Area: ${Math.round(form.glazingArea * 100)}%`}
              hint="Window coverage — more windows = more heat gain in summer"
            >
              <input type="range" className="slider" min={0} max={0.4} step={0.1}
                value={form.glazingArea}
                onChange={e => setForm({ ...form, glazingArea: parseFloat(e.target.value) })} />
            </Field>

            {/* Advanced fields — authenticated users only */}
            {token && (
              <>
                <Field label={`Wall Area: ${form.wallArea} m²`} hint="Total external wall surface area">
                  <input type="range" className="slider" min={245} max={416.5} step={0.5}
                    value={form.wallArea}
                    onChange={e => setForm({ ...form, wallArea: parseFloat(e.target.value) })} />
                </Field>

                <Field label="Roof Area (m²)" hint="Building roof surface area">
                  <select className="select-input" value={form.roofArea}
                    onChange={e => setForm({ ...form, roofArea: parseFloat(e.target.value) })}>
                    <option value={110.25}>110.25</option>
                    <option value={122.5}>122.5</option>
                    <option value={147.0}>147.0</option>
                    <option value={220.5}>220.5</option>
                  </select>
                </Field>

                <Field label="Orientation" hint="North/South orientation affects solar exposure">
                  <select className="select-input" value={form.orientation}
                    onChange={e => setForm({ ...form, orientation: parseInt(e.target.value) })}>
                    <option value={2}>North</option>
                    <option value={3}>East</option>
                    <option value={4}>South</option>
                    <option value={5}>West</option>
                  </select>
                </Field>

                <Field label="Glazing Distribution" hint="0 = no windows, 5 = windows on all sides">
                  <select className="select-input" value={form.glazingDistribution}
                    onChange={e => setForm({ ...form, glazingDistribution: parseInt(e.target.value) })}>
                    {[0, 1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </Field>
              </>
            )}

            {/* Upsell banner for guests */}
            {!token && (
              <div className="upsell-box">
                <Lock size={16} color="#93c5fd" style={{ marginRight: 6 }} />
                <p className="upsell-box__title">Extended results for registered users</p>
                <p className="upsell-box__subtitle">Annual cost • CO₂ • A-F rating • Scenario Simulator • History</p>
                <button type="button" className="upsell-box__btn" onClick={() => navigate('/')}>
                  Sign up for free
                </button>
              </div>
            )}

            {error && <p className="predict-error">{error}</p>}

            <button type="submit" disabled={loading} className="predict-submit-btn">
              <Search size={16} style={{ marginRight: 6 }} />
              {loading ? 'Calculating...' : 'Calculate Prediction'}
            </button>
          </form>
        </div>

        {/* ── Results card ── */}
        {result && (
          <div className="predict-card">
            <h2 className="predict-card__title">Results</h2>

            {/* Energy efficiency grade — authenticated only */}
            {token && (() => {
              const { grade, color, label } = getEnergyGrade(totalLoad);
              return (
                <div className="grade-box" style={{ borderColor: color }}>
                  <span className="grade-box__letter" style={{ color }}>{grade}</span>
                  <div>
                    <p className="grade-box__label" style={{ color }}>{label}</p>
                    <p className="grade-box__total">Total: {totalLoad.toFixed(2)} kWh/m²</p>
                  </div>
                </div>
              );
            })()}

            <div className="result-item">
              <span className="result-item__label"><Thermometer size={14} style={{ marginRight: 4 }} /> Heating Load</span>
              <span className="result-item__value">{result.heatingLoad} kWh</span>
            </div>
            <div className="result-item">
              <span className="result-item__label"><Wind size={14} style={{ marginRight: 4 }} /> Cooling Load</span>
              <span className="result-item__value">{result.coolingLoad} kWh</span>
            </div>

            {token && (
              <>
                <div className="result-item">
                  <span className="result-item__label"><DollarSign size={14} style={{ marginRight: 4 }} /> Annual Cost</span>
                  <span className="result-item__value">₪{result.annualCost}</span>
                </div>
                <div className="result-item">
                  <span className="result-item__label"><Calendar size={14} style={{ marginRight: 4 }} /> Monthly Cost</span>
                  <span className="result-item__value">₪{(result.annualCost / 12).toFixed(2)}</span>
                </div>
                <div className="result-item">
                  <span className="result-item__label"><Leaf size={14} style={{ marginRight: 4 }} /> CO₂ Emissions</span>
                  <span className="result-item__value">{result.co2} kg</span>
                </div>

                {/* Comparison bar vs dataset average */}
                <div className="compare-box">
                  <p className="compare-box__title">
                    <TrendingUp size={13} style={{ marginRight: 4 }} />
                    Comparison vs. UCI Dataset Average
                  </p>
                  <div className="compare-row">
                    <span className="compare-row__label">Yours</span>
                    <div className="compare-bar">
                      <div className="compare-bar__fill compare-bar__fill--yours"
                        style={{ width: `${Math.min(totalLoad / 70 * 100, 100)}%` }} />
                    </div>
                    <span className="compare-row__value">{totalLoad.toFixed(1)}</span>
                  </div>
                  <div className="compare-row">
                    <span className="compare-row__label">Average</span>
                    <div className="compare-bar">
                      <div className="compare-bar__fill compare-bar__fill--avg"
                        style={{ width: `${DATASET_AVERAGE_KWH / 70 * 100}%` }} />
                    </div>
                    <span className="compare-row__value">46.0</span>
                  </div>
                </div>

                {/* AI recommendation */}
                <div className="recommendation-box">
                  {getRecommendation(result.heatingLoad, result.coolingLoad)}
                </div>

                {/* What-If simulator */}
                <div className="whatif-section">
                  <button className="whatif-toggle" onClick={() => setShowWhatIf(!showWhatIf)}>
                    <FlaskConical size={14} style={{ marginRight: 6 }} />
                    {showWhatIf ? 'Close' : 'Open'} Scenario Simulator
                  </button>
                  <p className="whatif-note">Simulation only — not saved to history</p>

                  {showWhatIf && (
                    <div className="whatif-box">

                      <label className="field__label">Glazing: <b className="highlight">{whatIfVals.glazingArea}</b></label>
                      <input type="range" className="slider" min={0} max={0.4} step={0.05}
                        value={whatIfVals.glazingArea}
                        onChange={e => setWhatIfVals({ ...whatIfVals, glazingArea: parseFloat(e.target.value) })} />

                      <label className="field__label">Height: <b className="highlight">{whatIfVals.overallHeight}</b></label>
                      <select className="select-input" value={whatIfVals.overallHeight}
                        onChange={e => setWhatIfVals({ ...whatIfVals, overallHeight: parseFloat(e.target.value) })}>
                        <option value={3.5}>3.5 — Low-rise</option>
                        <option value={7.0}>7.0 — High-rise</option>
                      </select>

                      <label className="field__label">Compactness: <b className="highlight">{whatIfVals.relativeCompactness}</b></label>
                      <input type="range" className="slider" min={0.62} max={0.98} step={0.01}
                        value={whatIfVals.relativeCompactness}
                        onChange={e => setWhatIfVals({ ...whatIfVals, relativeCompactness: parseFloat(e.target.value) })} />

                      <button
                        className={`predict-submit-btn ${whatIfCount >= WHAT_IF_LIMIT ? 'predict-submit-btn--disabled' : ''}`}
                        onClick={handleWhatIf}
                        disabled={whatIfLoading || whatIfCount >= WHAT_IF_LIMIT}
                      >
                        {whatIfLoading ? 'Calculating...' : whatIfCount >= WHAT_IF_LIMIT
                          ? <><Lock size={14} style={{ marginRight: 6 }} /> No attempts left</>
                          : <><FlaskConical size={14} style={{ marginRight: 6 }} /> Run Scenario ({WHAT_IF_LIMIT - whatIfCount} left)</>
                        }
                      </button>

                      {whatIfResult && (() => {
                        const before  = totalLoad;
                        const after   = whatIfResult.heatingLoad + whatIfResult.coolingLoad;
                        const diff    = ((after - before) / before * 100).toFixed(1);
                        const saving  = before > after;
                        return (
                          <div className="whatif-result">
                            <div className="whatif-result__col">
                              <p className="whatif-result__label">Before</p>
                              <p className="whatif-result__value">{before.toFixed(2)}</p>
                              <p className="whatif-result__unit">kWh/m²</p>
                            </div>
                            <div className="whatif-result__arrow">→</div>
                            <div className="whatif-result__col">
                              <p className="whatif-result__label">After</p>
                              <p className="whatif-result__value">{after.toFixed(2)}</p>
                              <p className="whatif-result__unit">kWh/m²</p>
                            </div>
                            <div className="whatif-result__col">
                              <p className={`whatif-result__diff ${saving ? 'whatif-result__diff--saving' : 'whatif-result__diff--worse'}`}>
                                {diff}%
                              </p>
                              {saving && (
                                <p className="whatif-result__saving">
                                  Save ₪{((before - after) * 365 * 0.60).toFixed(0)}/yr
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <button className="history-btn" onClick={() => navigate('/history')}>
                  <BarChart2 size={14} style={{ marginRight: 6 }} /> View History
                </button>
              </>
            )}

            {!token && (
              <p className="guest-note">
                <button className="link-btn" onClick={() => navigate('/')}>Login</button> to see cost, CO₂ and efficiency rating
              </p>
            )}

            <div className="coming-soon">
              <p className="coming-soon__title">Planned Improvements</p>
              <p className="coming-soon__item">Refresh token support</p>
              <p className="coming-soon__item">Multi-language support</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}