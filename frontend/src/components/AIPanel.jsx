import React from 'react';
import { BookOpen, CheckSquare, HelpCircle, FileText } from 'lucide-react';
import { generateStyledPDF } from '../utils/pdfGenerator';

export default function AIPanel({ loading, aiData }) {
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-indigo-600 animate-pulse py-20">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="font-medium text-lg">Generating Study Notes...</p>
        <p className="text-sm text-indigo-400 mt-2">This may take a moment for large PDFs.</p>
      </div>
    );
  }

  if (!aiData || !aiData.summary) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
        <FileText size={48} className="mb-4 opacity-50" />
        <p>Select a section or the full PDF to generate notes.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto pr-2 custom-scrollbar animate-fade-in">
      
      {/* Download Actions */}
      <div className="flex gap-2 justify-end mb-6 sticky top-0 bg-white/90 backdrop-blur pb-2 z-10 pt-2">
        <button 
          onClick={() => generateStyledPDF(aiData, 'revision')}
          className="text-xs font-medium px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          ↓ Quick Revision PDF
        </button>
        <button 
          onClick={() => generateStyledPDF(aiData, 'full')}
          className="text-xs font-medium px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
        >
          ↓ Full Notes PDF
        </button>
      </div>

      {/* Summary */}
      {aiData.summary && (
        <div className="mb-8">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">
            <BookOpen size={20} className="text-indigo-600" />
            Executive Summary
          </h3>
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-gray-700 leading-relaxed text-sm">
            {aiData.summary}
          </div>
        </div>
      )}

      {/* Key Points */}
      {aiData.key_points && aiData.key_points.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Key Concepts</h3>
          <ul className="flex flex-col gap-2">
            {aiData.key_points.map((point, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700 items-start">
                <span className="text-indigo-500 mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Micro Tasks */}
      {aiData.tasks && aiData.tasks.length > 0 && (
        <div className="mb-8">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">
            <CheckSquare size={20} className="text-emerald-600" />
            Micro-Tasks (2-5 mins)
          </h3>
          <div className="flex flex-col gap-2">
            {aiData.tasks.map((task, i) => (
              <label key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer group shadow-sm">
                <input type="checkbox" className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{task}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Quiz */}
      {aiData.quiz && aiData.quiz.length > 0 && (
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">
            <HelpCircle size={20} className="text-purple-600" />
            Self-Assessment Quiz
          </h3>
          <div className="flex flex-col gap-3">
            {aiData.quiz.map((q, i) => (
              <div key={i} className="p-4 bg-purple-50/50 rounded-xl border border-purple-100/50">
                <p className="text-sm font-medium text-gray-800 mb-2">Q{i+1}: {q}</p>
                <input 
                  type="text" 
                  placeholder="Think of your answer..." 
                  className="w-full text-sm bg-white border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
