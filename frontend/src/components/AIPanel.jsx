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
      <div className="flex gap-4 justify-start mb-10 sticky top-0 bg-[#1A1D23] pb-4 z-10">
        <button 
          onClick={() => generateStyledPDF(aiData, 'revision')}
          className="text-[10px] uppercase tracking-widest text-[#94A3B8] hover:text-white transition-colors"
        >
          Revision PDF
        </button>
        <button 
          onClick={() => generateStyledPDF(aiData, 'full')}
          className="text-[10px] uppercase tracking-widest text-[#6366F1] hover:text-[#4F46E5] transition-colors"
        >
          Full Manuscript
        </button>
      </div>

      {/* Summary */}
      {aiData.summary && (
        <div className="mb-12">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8] mb-6">Executive Summary</h3>
          <div className="serif-content text-lg leading-relaxed text-[#F2F2F2]">
            {aiData.summary}
          </div>
        </div>
      )}

      {/* Key Points */}
      {aiData.key_points && aiData.key_points.length > 0 && (
        <div className="mb-12">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8] mb-6">Strategic Concepts</h3>
          <ul className="flex flex-col gap-6">
            {aiData.key_points.map((point, i) => (
              <li key={i} className="serif-content text-md text-[#D1D5DB] border-l border-[#2D323A] pl-6 py-1">
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Micro Tasks */}
      {aiData.tasks && aiData.tasks.length > 0 && (
        <div className="mb-12">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8] mb-6">Cognitive Tasks</h3>
          <div className="flex flex-col gap-2">
            {aiData.tasks.map((task, i) => (
              <div key={i} className="group flex items-center justify-between p-4 bg-[#0F1115] border border-[#2D323A] rounded hover:border-[#6366F1]/30 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded border border-[#2D323A] group-hover:border-[#6366F1] flex items-center justify-center transition-colors">
                    <div className="w-1 h-1 bg-[#6366F1] scale-0 group-hover:scale-100 transition-transform"></div>
                  </div>
                  <span className="text-xs text-[#94A3B8] group-hover:text-white transition-colors">{task}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz */}
      {aiData.quiz && aiData.quiz.length > 0 && (
        <div className="mb-10">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8] mb-6">Self-Assessment</h3>
          <div className="flex flex-col gap-8">
            {aiData.quiz.map((q, i) => (
              <div key={i} className="serif-content">
                <p className="text-md text-[#F2F2F2] mb-4 italic">"{q}"</p>
                <input 
                  type="text" 
                  placeholder="Draft your reflection..." 
                  className="w-full text-xs bg-transparent border-b border-[#2D323A] py-2 focus:outline-none focus:border-[#6366F1] transition-colors placeholder:text-[#4B5563]"
                />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
