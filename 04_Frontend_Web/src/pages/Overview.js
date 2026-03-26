import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  Users, BookOpen, Clock, Activity, ArrowUpRight, Filter, LayoutDashboard 
} from "lucide-react";

const API_BASE = "http://localhost:8000/api";

const StatCard = ({ title, value, icon: Icon, color, subValue }) => (
  <div className="kpi-card" style={{
    background: 'var(--bg-div)', borderRadius: '16px', padding: '24px',
    border: '1px solid var(--border)', borderBottom: `4px solid ${color}`,
    position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
    justifyContent: 'space-between', minHeight: '140px', transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
  }}>
    <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.05, color: color }}>
      <Icon size={100} />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ background: `${color}15`, padding: '12px', borderRadius: '12px', color: color, border: `1px solid ${color}30` }}>
        <Icon size={24} />
      </div>
      {subValue && (
        <span style={{ fontSize: '11px', color: color, display: 'flex', alignItems: 'center', background: `${color}15`, padding: '4px 8px', borderRadius: '20px', fontWeight: 'bold' }}>
          <ArrowUpRight size={12} style={{marginRight: 4}}/> {subValue}
        </span>
      )}
    </div>
    <div style={{ marginTop: '20px' }}>
      <h3 style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: 'var(--text-p)', letterSpacing: '1px' }}>{value}</h3>
      <p style={{ margin: '5px 0 0', color: 'var(--text-s)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-div)', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: '8px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
        <p style={{ color: 'var(--text-p)', fontWeight: 'bold', marginBottom: 5, fontSize: '14px' }}>{label}</p>
        <p style={{ color: payload[0].fill || 'var(--accent)', margin: 0, fontWeight: 'bold', fontSize: '13px' }}>
          {payload[0].name}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function Overview() {
  const [stats, setStats] = useState({ total_attendance: 0, active_courses: 0, unique_students: 0, avg_attendance: 0 });
  const [chartData, setChartData] = useState([]);
  const [filter, setFilter] = useState("Today");

  const fetchDashboardData = useCallback(async () => {
    try {
      const statsRes = await axios.get(`${API_BASE}/dashboard/stats?filter=${filter}`);
      setStats(statsRes.data);
      const chartRes = await axios.get(`${API_BASE}/dashboard/chart_data?filter=${filter}`);
      setChartData(chartRes.data);
    } catch (error) { console.error("Error fetching data", error); }
  }, [filter]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const COLORS = ["#e14eca", "#00f2c3", "#7b2cbf", "#ffb703", "#4cc9f0"];

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* --- 1. Header Section --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
        <h1 style={{ border: 'none', margin: 0, paddingBottom: 0, marginBottom: 0 }}>
          <LayoutDashboard size={32} /> System Dashboard
        </h1>

        <div style={{ position: 'relative', minWidth: '200px' }}>
          <Filter size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)', zIndex: 1 }} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px',
              border: '1px solid var(--border)', background: 'var(--bg-div)',
              color: 'var(--text-p)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', appearance: 'none', outline: 'none',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}
          >
            <option value="Today">Today's Data</option>
            <option value="Week">This Week</option>
            <option value="Month">This Month</option>
            <option value="All">All History</option>
          </select>
        </div>
      </div>

      {/* --- 2. Stats Grid --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <StatCard title="Total Attendance" value={stats.total_attendance} icon={Users} color="#e14eca" subValue={filter === 'Today' ? "Live" : null} />
        <StatCard title="Active Courses" value={stats.active_courses} icon={BookOpen} color="#00f2c3" />
        <StatCard title="Unique Students" value={stats.unique_students} icon={Activity} color="#ffb703" />
        <StatCard title="Avg. per Course" value={stats.avg_attendance} icon={Clock} color="#4cc9f0" />
      </div>

      {/* --- 3. Charts Section --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <div className="chart-card" style={{ background: 'var(--bg-div)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h3 style={{margin: 0, fontSize: '16px', color: 'var(--text-p)', fontWeight: '700', textTransform: 'uppercase'}}>Attendance By Course</h3>
            <span style={{fontSize: '11px', color: 'var(--accent)', background: 'rgba(225, 78, 202, 0.1)', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold'}}>{filter}</span>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-s)" tick={{fill: 'var(--text-s)', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-s)" tick={{fill: 'var(--text-s)', fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--bg-main)', opacity: 0.4}} />
                <Bar dataKey="value" fill="var(--accent)" radius={[6, 6, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card" style={{ background: 'var(--bg-div)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
           <h3 style={{margin: '0 0 20px 0', fontSize: '16px', color: 'var(--text-p)', fontWeight: '700', textTransform: 'uppercase'}}>Course Distribution</h3>
           <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" iconType="circle" formatter={(value) => <span style={{color: 'var(--text-s)', fontSize: '13px', fontWeight: '500'}}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}