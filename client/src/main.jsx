import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './index.css';
import { AuthProvider, Guard } from './auth';
import { Layout } from './ui';
import { Landing, Login, Register } from './pages/Public';
import Dashboard from './pages/Dashboard';
import ReportForm from './pages/ReportForm';
import Track from './pages/Track';
import Transparency from './pages/Transparency';
import Staff from './pages/Staff';
import Admin from './pages/Admin';
import { AlertTriangle, ArrowRight } from 'lucide-react';

function NotFound() {
  return (
    <div className="card max-w-md mx-auto my-12 p-8 text-center space-y-4 shadow-civic">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
        <AlertTriangle size={28} />
      </div>
      <h1 className="text-2xl font-black text-navy-900">Page Not Found</h1>
      <p className="text-xs text-slate-500">
        The requested civic portal route does not exist or has been relocated.
      </p>
      <div className="pt-2">
        <Link to="/" className="btn shadow-sm">
          Return to Portal Home <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/track/:ticketId?" element={<Track />} />
          <Route path="/transparency" element={<Transparency />} />
          <Route path="/dashboard" element={<Guard roles={['citizen']}><Dashboard /></Guard>} />
          <Route path="/report" element={<Guard roles={['citizen']}><ReportForm /></Guard>} />
          <Route path="/staff" element={<Guard roles={['staff', 'admin']}><Staff /></Guard>} />
          <Route path="/admin" element={<Guard roles={['admin']}><Admin /></Guard>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </AuthProvider>
  </BrowserRouter>
);
