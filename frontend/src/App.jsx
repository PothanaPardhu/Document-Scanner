import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, FileText, Menu, X } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import PdfReader from './pages/PdfReader';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex flex-col md:flex-row h-screen bg-[#0F1115] text-[#F2F2F2]">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#1A1D23] border-b border-[#2D323A] px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-medium tracking-tight text-white uppercase">Focus-Flow</h1>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="text-white p-2 hover:bg-[#6366F1]/10 rounded-md transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1A1D23] border-r border-[#2D323A] px-4 py-10 flex flex-col gap-10 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:inset-auto md:z-auto transition-transform duration-300`}>
          <div className="px-6">
            <h1 className="text-xl font-medium tracking-tight text-white uppercase">Focus-Flow</h1>
            <p className="text-[10px] tracking-[0.2em] text-[#94A3B8] uppercase mt-1">Cognitive AI</p>
          </div>
          
          <nav className="flex flex-col gap-1 mt-4">
            <Link to="/" className="flex items-center gap-4 px-6 py-3 rounded-md hover:bg-[#6366F1]/10 text-[#94A3B8] hover:text-white transition-all group" onClick={() => setSidebarOpen(false)}>
              <LayoutDashboard size={18} className="group-hover:text-[#6366F1] transition-colors" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link to="/pdf" className="flex items-center gap-4 px-6 py-3 rounded-md hover:bg-[#6366F1]/10 text-[#94A3B8] hover:text-white transition-all group" onClick={() => setSidebarOpen(false)}>
              <FileText size={18} className="group-hover:text-[#6366F1] transition-colors" />
              <span className="text-sm font-medium">PDF Reader</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
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
