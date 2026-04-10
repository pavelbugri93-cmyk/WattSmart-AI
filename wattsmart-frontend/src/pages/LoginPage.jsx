import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, updateRate } from '../services/api';
import logo from '../assets/logo.jpeg';
import { Mail, Lock, Eye, EyeOff, Zap, LogIn, UserPlus, AlertTriangle, ChevronLeft } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [fade, setFade]             = useState(false);
  const [isLogin, setIsLogin]       = useState(true);
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [rate, setRate]             = useState('0.60');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const navigate                    = useNavigate();

  // Splash screen fades out after 0.8s and unmounts at 1.2s
  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 800);
    const t2 = setTimeout(() => setShowSplash(false), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (showSplash) {
    return (
      <div className={`splash ${fade ? 'splash--hidden' : ''}`}>
        <img src={logo} alt="WattSmart" className="splash__logo" />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn  = isLogin ? login : register;
      const res = await fn(email, password);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('email', res.data.email);

      // Update electricity rate only if the user changed it from the default
      if (!isLogin && rate !== '0.60') {
        await updateRate(parseFloat(rate));
      }
      navigate('/predict');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (loginMode) => {
    setIsLogin(loginMode);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <img src={logo} alt="WattSmart" className="login-logo" />
        <h1 className="login-title">WattSmart AI</h1>
        <p className="login-subtitle">Smart Energy Consumption Predictor</p>

        {/* Tab switcher — Login / Register */}
        <div className="login-tabs">
          <button className={`login-tab ${isLogin ? 'login-tab--active' : ''}`} onClick={() => switchTab(true)}>
            Login
          </button>
          <button className={`login-tab ${!isLogin ? 'login-tab--active' : ''}`} onClick={() => switchTab(false)}>
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">

          {/* Email input */}
          <div className="input-wrap">
            <Mail size={16} color="#475569" style={{ margin: '0 10px' }} />
            <input
              className="input-field"
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password input with show/hide toggle */}
          <div className="input-wrap">
            <Lock size={16} color="#475569" style={{ margin: '0 10px' }} />
            <input
              className="input-field"
              type={showPass ? 'text' : 'password'}
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
              {showPass ? <EyeOff size={16} color="#475569" /> : <Eye size={16} color="#475569" />}
            </button>
          </div>

          {/* Electricity rate slider — shown only on register */}
          {!isLogin && (
            <div className="rate-box">
              <label className="rate-label">
                <Zap size={13} color="#60a5fa" style={{ marginLeft: 4 }} />
                Electricity Rate: <b className="rate-value">₪{parseFloat(rate).toFixed(2)}/kWh</b>
              </label>
              <input
                type="range"
                className="rate-slider"
                min={0.30} max={1.20} step={0.01}
                value={rate}
                onChange={e => setRate(e.target.value)}
              />
              <div className="rate-hints">
                <span>₪0.30</span>
                <span className="rate-hints__default">Default: ₪0.60</span>
                <span>₪1.20</span>
              </div>
            </div>
          )}

          {/* Validation / server error message */}
          {error && (
            <div className="error-box">
              <AlertTriangle size={14} style={{ marginLeft: 6 }} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`submit-btn ${loading ? 'submit-btn--loading' : ''}`}
          >
            {loading ? 'Processing...' : isLogin
              ? <><LogIn size={16} style={{ marginRight: 8 }} /> Login</>
              : <><UserPlus size={16} style={{ marginRight: 8 }} /> Register</>
            }
          </button>
        </form>

        <div className="divider">
          <span className="divider__text">or</span>
        </div>

        {/* Skip auth — guest mode */}
        <button className="guest-btn" onClick={() => navigate('/predict')}>
          <ChevronLeft size={16} style={{ marginLeft: 4 }} />
          Continue as Guest
        </button>

      </div>
    </div>
  );
}