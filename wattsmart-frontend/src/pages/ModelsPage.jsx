import { useNavigate } from 'react-router-dom';
import { Zap, Search, BarChart2, User, LogOut, Lightbulb, Trophy, TrendingDown, Trees, ExternalLink } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import residualsChart from '../assets/LLM_1.png';
import './ModelsPage.css';

// ── Model comparison data — sourced from compareModels.py (updated 2026-04-01) ──

const r2Data = [
  { name: 'Heating Load', 'Linear Regression': 0.9122, 'Random Forest': 0.9977 },
  { name: 'Cooling Load', 'Linear Regression': 0.8932, 'Random Forest': 0.9683 },
];

const rmseData = [
  { name: 'Heating Load', 'Linear Regression': 3.03, 'Random Forest': 0.49 },
  { name: 'Cooling Load', 'Linear Regression': 3.15, 'Random Forest': 1.71 },
];

const tableData = [
  { model: 'Linear Regression', r2h: 0.9122, r2c: 0.8932, rmseh: 3.03, rmsec: 3.15, maeh: 2.18, maec: 2.20, time: '0.014s', winner: false },
  { model: 'Random Forest',     r2h: 0.9977, r2c: 0.9683, rmseh: 0.49, rmsec: 1.71, maeh: 0.35, maec: 1.06, time: '0.000s', winner: true  },
];

const summaryStats = [
  { icon: <Trophy size={24} color="#10b981" />, title: 'Best R²',        value: '0.9977', sub: 'Random Forest on Heating', color: '#10b981' },
  { icon: <TrendingDown size={24} color="#3b82f6" />, title: 'RMSE',     value: '0.49',   sub: 'vs 3.03 in Linear',        color: '#3b82f6' },
  { icon: <Zap size={24} color="#f59e0b" />, title: 'Accuracy Gain',     value: '6x',     sub: 'RF over Linear Regression', color: '#f59e0b' },
  { icon: <Trees size={24} color="#8b5cf6" />, title: 'Trees in Forest', value: '100',    sub: 'n_estimators in RF',        color: '#8b5cf6' },
];

const KAGGLE_URL = 'https://www.kaggle.com/datasets/elikplim/eergy-efficiency-dataset';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8 },
  labelStyle:   { color: '#f1f5f9' },
};

export default function ModelsPage() {
  const navigate = useNavigate();
  const token    = localStorage.getItem('token');

  return (
    <div className="models-page">

      <header className="models-header">
        <span className="models-header__logo">
          <Zap size={18} color="#60a5fa" style={{ marginRight: 6 }} /> WattSmart AI
        </span>
        <nav className="models-header__nav">
          <button className="nav-btn" onClick={() => navigate('/predict')}>
            <Search size={14} style={{ marginRight: 4 }} /> Predict
          </button>
          {token && (
            <>
              <button className="nav-btn" onClick={() => navigate('/history')}>
                <BarChart2 size={14} style={{ marginRight: 4 }} /> History
              </button>
              <button className="nav-btn" onClick={() => navigate('/profile')}>
                <User size={14} style={{ marginRight: 4 }} /> Profile
              </button>
              <button className="nav-btn nav-btn--danger" onClick={() => { localStorage.clear(); navigate('/'); }}>
                <LogOut size={14} style={{ marginRight: 4 }} /> Logout
              </button>
            </>
          )}
        </nav>
      </header>

      <main className="models-container">
        <h2 className="models-title">Model Comparison</h2>
        <p className="models-subtitle">
          Linear Regression vs Random Forest on the UCI Energy Efficiency Dataset
        </p>

        <div className="conclusion-box">
          <p className="conclusion-box__title">
            <Lightbulb size={15} color="#93c5fd" style={{ marginRight: 6 }} />
            Why Random Forest?
          </p>
          <p className="conclusion-box__text">
            We started with Linear Regression as a baseline and achieved R²=0.91 — decent, but the
            residuals plot revealed non-random error patterns, indicating non-linear relationships in
            the data. Switching to Random Forest yielded R²=0.9977 with an RMSE of 0.49 —
            a <b className="highlight">6x improvement in accuracy</b>.
          </p>
        </div>

        <div className="models-card">
          <h3 className="models-card__title">Comparison Table</h3>
          <div className="table-scroll">
            <table className="models-table">
              <thead>
                <tr>
                  {['Model', 'R² Heating', 'R² Cooling', 'RMSE H', 'RMSE C', 'MAE H', 'MAE C', 'Inference Time'].map(h => (
                    <th key={h} className="models-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map(row => (
                  <tr key={row.model} className={`models-tr ${row.winner ? 'models-tr--winner' : ''}`}>
                    <td className={`models-td models-td--name ${row.winner ? 'models-td--highlight' : ''}`}>
                      {row.winner && <Trophy size={13} style={{ marginRight: 4 }} />}
                      {row.model}
                    </td>
                    <td className={`models-td ${row.winner ? 'models-td--good' : ''}`}>{row.r2h}</td>
                    <td className={`models-td ${row.winner ? 'models-td--good' : ''}`}>{row.r2c}</td>
                    <td className={`models-td ${row.winner ? 'models-td--good' : ''}`}>{row.rmseh}</td>
                    <td className={`models-td ${row.winner ? 'models-td--good' : ''}`}>{row.rmsec}</td>
                    <td className="models-td">{row.maeh}</td>
                    <td className="models-td">{row.maec}</td>
                    <td className="models-td">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="charts-row">
          <div className="models-card">
            <h3 className="models-card__title">R² Score — higher is better</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={r2Data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" domain={[0.85, 1.01]} fontSize={12} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend />
                <Bar dataKey="Linear Regression" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Random Forest"     fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="models-card">
            <h3 className="models-card__title">RMSE — lower is better (kWh)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={rmseData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend />
                <Bar dataKey="Linear Regression" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Random Forest"     fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Residuals chart — generated directly from compareModels.py */}
        <div className="models-card">
          <h3 className="models-card__title">Residuals Analysis</h3>
          <p className="residuals-subtitle">
            Points close to the red line (zero error) indicate better predictions.
            Random Forest (orange) clusters tightly around zero — Linear Regression (blue) shows a wider, non-random spread.
          </p>
          <img src={residualsChart} alt="Residuals comparison — Random Forest vs Linear Regression" className="residuals-img" />
        </div>

        <div className="stats-row">
          {summaryStats.map(s => (
            <div key={s.title} className="stat-card">
              <div className="stat-card__icon">{s.icon}</div>
              <p className="stat-card__value" style={{ color: s.color }}>{s.value}</p>
              <p className="stat-card__title">{s.title}</p>
              <p className="stat-card__sub">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="dataset-card">
          <div className="dataset-card__header">
            <h3 className="models-card__title" style={{ margin: 0 }}>About the Dataset</h3>
            <a href={KAGGLE_URL} target="_blank" rel="noopener noreferrer" className="kaggle-link">
              <ExternalLink size={14} style={{ marginRight: 6 }} /> View on Kaggle
            </a>
          </div>

          <p className="dataset-card__text">
            The UCI Energy Efficiency dataset was created by <b>Angeliki Xifara</b> (Civil/Structural Engineer)
            and processed by <b>Athanasios Tsanas</b> at the Oxford Centre for Industrial and Applied Mathematics,
            University of Oxford, UK.
          </p>

          <p className="dataset-card__text">
            The dataset simulates energy analysis across <b>12 different building shapes</b> using the Ecotect
            software, varying glazing area, orientation, and other parameters. It contains <b>768 samples</b> and{' '}
            <b>8 input features</b>, with two prediction targets: Heating Load (Y1) and Cooling Load (Y2).
          </p>

          <div className="dataset-features">
            {[
              { code: 'X1', name: 'Relative Compactness' },
              { code: 'X2', name: 'Surface Area' },
              { code: 'X3', name: 'Wall Area' },
              { code: 'X4', name: 'Roof Area' },
              { code: 'X5', name: 'Overall Height' },
              { code: 'X6', name: 'Orientation' },
              { code: 'X7', name: 'Glazing Area' },
              { code: 'X8', name: 'Glazing Distribution' },
            ].map(f => (
              <div key={f.code} className="dataset-feature">
                <span className="dataset-feature__code">{f.code}</span>
                <span className="dataset-feature__name">{f.name}</span>
              </div>
            ))}
          </div>

          <p className="dataset-card__citation">
            <b>Citation:</b> A. Tsanas, A. Xifara — "Accurate quantitative estimation of energy performance
            of residential buildings using statistical machine learning tools",{' '}
            <i>Energy and Buildings</i>, Vol. 49, pp. 560–567, 2012.
          </p>
        </div>

      </main>
    </div>
  );
}