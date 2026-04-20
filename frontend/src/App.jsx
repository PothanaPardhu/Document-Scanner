import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, FileText } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import PdfReader from './pages/PdfReader';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50 text-gray-900">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 px-4 py-8 flex flex-col gap-6">
          <div className="px-4">
            <h1 className="text-2xl font-bold text-indigo-600">Focus-Flow</h1>
            <p className="text-xs text-gray-500 mt-1">Cognitive Support System</p>
          </div>
          
          <nav className="flex flex-col gap-2 mt-4">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition-colors">
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link to="/pdf" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition-colors">
              <FileText size={20} />
              <span className="font-medium">PDF Reader</span>
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
