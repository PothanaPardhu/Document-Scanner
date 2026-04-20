import React, { useState, useEffect } from 'react';
import { Target, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    timeActive: 0,
    inactivity: 0,
    pagesSimplified: 0,
    timeSaved: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/progress/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch stats:", err);
        setLoading(false);
      });
  }, []);

  // Calculate Focus Score: (Tasks * 0.5) + (TimeActive * 0.3) - (Inactivity * 0.2)
  const focusScore = Math.max(0, Math.min(100, Math.round(
    (stats.tasksCompleted * 0.5) + (stats.timeActive * 0.3) - (stats.inactivity * 0.2)
  )));

  if (loading) return <div className="p-10 text-center">Loading your progress...</div>;

  return (
    <div className="p-10 animate-fade-in max-w-6xl mx-auto">
      <header className="mb-12">
        <h2 className="text-2xl font-medium tracking-tight text-white">Dashboard</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Academic performance & focus analysis.</p>
      </header>

      {/* Impact Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        
        <div className="premium-card flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <p className="text-[10px] uppercase tracking-widest text-[#94A3B8]">Focus Score</p>
            <div className="w-8 h-8 rounded-full border border-[#2D323A] flex items-center justify-center">
              <div className="w-1 h-1 bg-[#6366F1] rounded-full"></div>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-light">{focusScore / 100}</h3>
            <span className="text-xs text-[#94A3B8]">pts</span>
          </div>
          {/* Thin progress bar instead of circle */}
          <div className="w-full h-[1px] bg-[#2D323A] mt-2 relative">
            <div 
              className="absolute h-full bg-[#6366F1] transition-all duration-1000" 
              style={{ width: `${focusScore}%` }}
            ></div>
          </div>
        </div>

        <div className="premium-card">
          <p className="text-[10px] uppercase tracking-widest text-[#94A3B8] mb-4">Time Saved</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-light">{stats.timeSaved}</h3>
            <span className="text-xs text-[#94A3B8]">min</span>
          </div>
        </div>

        <div className="premium-card">
          <p className="text-[10px] uppercase tracking-widest text-[#94A3B8] mb-4">Tasks Completed</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-light">{stats.tasksCompleted}</h3>
            <span className="text-xs text-[#94A3B8]">units</span>
          </div>
        </div>

        <div className="premium-card">
          <p className="text-[10px] uppercase tracking-widest text-[#94A3B8] mb-4">AI Simplifications</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-light">{stats.pagesSimplified}</h3>
            <span className="text-xs text-[#94A3B8]">pages</span>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Tasks */}
        <div className="lg:col-span-2 premium-card">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm uppercase tracking-widest text-[#94A3B8]">Recent Micro-Tasks</h3>
            <button className="text-[#6366F1] text-[10px] uppercase tracking-widest hover:underline">View All</button>
          </div>
          
          <div className="flex flex-col gap-2">
            {[
              { title: "Scan Key Concepts", time: "2m", done: true },
              { title: "Review Neural Network Diagram", time: "5m", done: false },
              { title: "Complete AI Quiz", time: "3m", done: false },
            ].map((task, i) => (
              <div key={i} className="group flex items-center justify-between p-4 bg-[#1A1D23] border border-[#2D323A] rounded hover:border-[#6366F1]/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded border ${task.done ? 'bg-[#6366F1] border-[#6366F1]' : 'border-[#2D323A]'} flex items-center justify-center transition-colors`}>
                    {task.done && <span className="text-[8px] text-white">✓</span>}
                  </div>
                  <span className={`text-sm ${task.done ? 'text-[#4B5563] line-through' : 'text-[#F2F2F2]'}`}>
                    {task.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#4B5563]">{task.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Focus Trend */}
        <div className="premium-card">
          <h3 className="text-sm uppercase tracking-widest text-[#94A3B8] mb-8">Activity Trend</h3>
          <div className="h-48 flex items-end gap-3">
            {[40, 55, 45, 70, 65, 85, focusScore].map((h, i) => (
              <div key={i} className="w-full bg-[#1A1D23] border-x border-t border-[#2D323A] rounded-t-sm relative group">
                <div 
                  className="absolute bottom-0 w-full bg-[#6366F1]/20 border-t border-[#6366F1] transition-all duration-700" 
                  style={{ height: `${h}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] uppercase tracking-tighter text-[#4B5563]">
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
            <span>S</span>
          </div>
        </div>

      </div>
    </div>
  );
}
