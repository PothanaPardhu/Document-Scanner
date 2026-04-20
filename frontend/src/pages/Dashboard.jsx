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
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-500 mt-2">Here is your learning impact for this week.</p>
      </header>

      {/* Impact Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        
        <div className="glass-panel p-6 hover-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <Target size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Focus Score</p>
              <h3 className="text-3xl font-bold text-gray-900">{focusScore}<span className="text-lg text-gray-500">/100</span></h3>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 hover-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Time Saved</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.timeSaved} <span className="text-lg text-gray-500">min</span></h3>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 hover-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tasks Completed</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.tasksCompleted}</h3>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 hover-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pages Simplified</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.pagesSimplified}</h3>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Tasks */}
        <div className="lg:col-span-2 glass-panel p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Recent Micro-Tasks</h3>
            <button className="text-indigo-600 text-sm font-medium hover:underline">View All</button>
          </div>
          
          <div className="flex flex-col gap-4">
            {[
              { title: "Review the definition of Action Potentials", time: "10 mins ago", done: true },
              { title: "Read simplified summary on page 3", time: "2 hours ago", done: true },
              { title: "Answer the 3 generated quiz questions", time: "Yesterday", done: false },
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={task.done} readOnly className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500" />
                  <span className={task.done ? "line-through text-gray-400" : "text-gray-700 font-medium"}>
                    {task.title}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{task.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Focus Trend */}
        <div className="glass-panel p-8">
          <h3 className="text-xl font-bold mb-6">Daily Trend</h3>
          <div className="h-48 flex items-end gap-2">
            {[40, 55, 45, 70, 65, 85, focusScore].map((h, i) => (
              <div key={i} className="w-full bg-indigo-100 rounded-t-md relative group">
                <div 
                  className="absolute bottom-0 w-full bg-indigo-500 rounded-t-md transition-all duration-500" 
                  style={{ height: `${h}%` }}
                ></div>
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded transition-opacity">
                  {h}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Today</span>
          </div>
        </div>

      </div>
    </div>
  );
}
