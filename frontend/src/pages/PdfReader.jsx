import React, { useState, useRef } from 'react';
import { Upload, File, FileText } from 'lucide-react';
import AIPanel from '../components/AIPanel';
import axios from 'axios';
import API_URL from '../api';

export default function PdfReader() {
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setPdfUrl(URL.createObjectURL(selectedFile));
      // Reset state
      setAiData(null);
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  const handleProcessFullDocument = async () => {
    if (!file) return;
    
    setAiLoading(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      // In production, point to real backend. Using localhost for dev.
      const response = await axios.post(`${API_URL}/api/pdf/process-large`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setAiData(response.data);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Failed to process PDF. Make sure the backend is running.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full animate-fade-in bg-[#0F1115] p-4 md:p-10 gap-4 md:gap-10">
      
      {/* Left Area: PDF Viewer */}
      <div className="flex-1 flex flex-col gap-6 max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center bg-[#1A1D23] p-4 md:p-6 rounded border border-[#2D323A]">
          <div>
            <h2 className="text-lg font-medium tracking-tight text-white uppercase flex items-center gap-3">
              <FileText size={18} className="text-[#6366F1]" /> 
              Reading Studio
            </h2>
            <p className="text-[10px] tracking-widest text-[#94A3B8] uppercase mt-1">Focus Mode Active</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary text-[10px] uppercase tracking-widest px-4 md:px-6"
            >
              Upload
            </button>
            
            {file && (
              <button 
                onClick={handleProcessFullDocument}
                disabled={aiLoading}
                className={`btn-primary text-[10px] uppercase tracking-widest px-4 md:px-6 ${aiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {aiLoading ? 'Analyzing...' : 'Simplify'}
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 premium-card overflow-hidden relative p-0 bg-[#0F1115]">
          {!pdfUrl ? (
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center border border-dashed border-[#2D323A] rounded-md m-2 md:m-4 hover:border-[#6366F1]/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-12 h-12 rounded-full border border-[#2D323A] flex items-center justify-center mb-6">
                <Upload size={20} className="text-[#4B5563]" />
              </div>
              <p className="text-sm font-medium text-[#F2F2F2]">Drop your manuscript here</p>
              <p className="text-[10px] uppercase tracking-widest text-[#4B5563] mt-2">Supports PDF up to 50MB</p>
            </div>
          ) : (
            <iframe 
              src={`${pdfUrl}#toolbar=0&navpanes=0`} 
              className="w-full h-full border-none invert brightness-90 grayscale-[0.5]"
              title="PDF Viewer"
            ></iframe>
          )}
        </div>
      </div>

      {/* Right Area: AI Panel */}
      <aside className="w-full lg:w-[400px] premium-card flex flex-col overflow-hidden p-0">
        <header className="p-6 border-b border-[#2D323A] flex justify-between items-center bg-[#1A1D23]">
          <h3 className="text-xs uppercase tracking-[0.2em] text-[#94A3B8]">Study Insights</h3>
          {aiData && (
            <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
          )}
        </header>
        <div className="flex-1 p-6 overflow-hidden">
          <AIPanel loading={aiLoading} aiData={aiData} />
        </div>
      </aside>

    </div>
  );
}
