import React, { useState, useRef } from 'react';
import { Upload, File, FileText } from 'lucide-react';
import AIPanel from '../components/AIPanel';
import axios from 'axios';

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
      const response = await axios.post('http://localhost:5000/api/pdf/process-large', formData, {
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
    <div className="flex h-full animate-fade-in bg-gray-100 p-6 gap-6">
      
      {/* Left Area: PDF Viewer */}
      <div className="flex-1 flex flex-col gap-4 max-w-4xl">
        <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="text-indigo-600" /> 
              PDF Focus Mode
            </h2>
            <p className="text-sm text-gray-500">Read and simplify complex documents.</p>
          </div>
          
          <div className="flex gap-3">
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary"
            >
              <Upload size={18} /> Upload PDF
            </button>
            
            {file && (
              <button 
                onClick={handleProcessFullDocument}
                disabled={aiLoading}
                className={`btn-primary ${aiLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                ✨ Simplify Full Document
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 glass-panel overflow-hidden relative bg-white">
          {!pdfUrl ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <File size={64} className="mb-4 opacity-50 text-indigo-300" />
              <p className="text-lg font-medium text-gray-600">No Document Selected</p>
              <p className="text-sm mt-2">Upload a PDF to begin reading and simplifying.</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 text-indigo-600 font-medium hover:underline"
              >
                Browse Files
              </button>
            </div>
          ) : (
            <iframe 
              src={`${pdfUrl}#toolbar=0&navpanes=0`} 
              className="w-full h-full border-none"
              title="PDF Viewer"
            ></iframe>
          )}
        </div>
      </div>

      {/* Right Area: AI Panel */}
      <aside className="w-96 glass-panel flex flex-col overflow-hidden bg-white/80">
        <header className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 className="font-bold text-gray-900">Study Guide</h3>
          {aiData && (
            <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-center">
              Generated
            </span>
          )}
        </header>
        <div className="flex-1 p-5 overflow-hidden">
          <AIPanel loading={aiLoading} aiData={aiData} />
        </div>
      </aside>

    </div>
  );
}
