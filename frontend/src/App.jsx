import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, FileText } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import PdfReader from './pages/PdfReader';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#0F1115] text-[#F2F2F2]">
        {/* Sidebar */}
        <aside className="w-64 bg-[#1A1D23] border-r border-[#2D323A] px-4 py-10 flex flex-col gap-10">
          <div className="px-6">
            <h1 className="text-xl font-medium tracking-tight text-white uppercase">Focus-Flow</h1>
            <p className="text-[10px] tracking-[0.2em] text-[#94A3B8] uppercase mt-1">Cognitive AI</p>
          </div>
          
          <nav className="flex flex-col gap-1 mt-4">
            <Link to="/" className="flex items-center gap-4 px-6 py-3 rounded-md hover:bg-[#6366F1]/10 text-[#94A3B8] hover:text-white transition-all group">
              <LayoutDashboard size={18} className="group-hover:text-[#6366F1] transition-colors" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link to="/pdf" className="flex items-center gap-4 px-6 py-3 rounded-md hover:bg-[#6366F1]/10 text-[#94A3B8] hover:text-white transition-all group">
              <FileText size={18} className="group-hover:text-[#6366F1] transition-colors" />
              <span className="text-sm font-medium">PDF Reader</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pdf" element={<PdfReader />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
