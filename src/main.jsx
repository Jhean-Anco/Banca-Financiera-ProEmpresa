import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CarteraPage from './pages/CarteraPage';
import SolicitudesPage from './pages/SolicitudesPage';
import EvaluacionPage from './pages/EvaluacionPage';
import CobranzaPage from './pages/CobranzaPage';
import ReportesPage from './pages/ReportesPage';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="cartera" element={<CarteraPage />} />
            <Route path="solicitudes" element={<SolicitudesPage />} />
            <Route path="evaluacion" element={<EvaluacionPage />} />
            <Route path="cobranza" element={<CobranzaPage />} />
            <Route path="reportes" element={<ReportesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
