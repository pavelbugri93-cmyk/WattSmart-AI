// ============================================================
// FILE: App.jsx
// Root component — defines all client-side routes.
// Unauthenticated users land on LoginPage (/).
// Unknown routes redirect to / instead of showing a blank page.
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage   from './pages/LoginPage.jsx';
import PredictPage from './pages/PredictPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ModelsPage  from './pages/ModelsPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<LoginPage />} />
        <Route path="/predict" element={<PredictPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/models"  element={<ModelsPage />} />
        <Route path="*"        element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}