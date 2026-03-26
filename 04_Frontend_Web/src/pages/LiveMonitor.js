import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, Clock, Filter, CheckCircle, Activity } from "lucide-react";

const API_BASE = "http://localhost:8000/api";
const VIDEO_STREAM_URL = "http://localhost:8001/video_feed"; 

export default function LiveMonitor() {
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("All");

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/attendance/live`);
      setLogs(res.data);
      setIsConnected(true);
    } catch (err) {
      setIsConnected(false);
      console.error(err);
    }
  };

  const activeCourses = [...new Set(logs.map(log => log.course_name))].filter(Boolean);
  const filteredLogs = selectedCourse === "All" ? logs : logs.filter(log => log.course_name === selectedCourse);

  return (
    <div className="fade-in">
      <div className="monitor-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
        <h1 style={{ border: 'none', margin: 0, paddingBottom: 0, marginBottom: 0 }}>
          <Activity size={32} /> Live Monitor
        </h1>
        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
            <div style={{position: 'relative'}}>
                <Filter size={16} style={{position: 'absolute', left: '12px', top: '12px', color: '#aaa'}}/>
                <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}
                    style={{padding: '10px 15px 10px 40px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-p)', cursor: 'pointer', outline: 'none', minWidth: '200px'}}>
                    <option value="All">📡 All Active Sessions</option>
                    {activeCourses.map((course, idx) => (<option key={idx} value={course}>📚 {course}</option>))}
                </select>
            </div>
            <div className={`status-badge ${isConnected ? 'online' : 'offline'}`}>{isConnected ? '● LIVE' : '● OFF'}</div>
        </div>
      </div>

      <div className="monitor-grid" style={{ display: 'flex', gap: '30px', height: 'auto' }}>
        <div className="scanner-panel" style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="id-card fade-in" style={{ padding: '20px', justifyContent: 'flex-start' }}>
                <div className="id-header" style={{ marginBottom: '15px', color: '#fff' }}>
                    <span>SMART GATE LIVE CAMERA</span>
                    <span className="status-badge online" style={{ padding: '5px 15px', border: 'none', background: 'rgba(0, 242, 195, 0.2)' }}>● RECORDING</span>
                </div>
                
                <div style={{ width: '100%', borderRadius: '15px', overflow: 'hidden', border: '2px solid var(--border)', background: '#000', display: 'flex', justifyContent: 'center' }}>
                    <img 
                        src={VIDEO_STREAM_URL} 
                        alt="Live Camera Feed Loading..." 
                        style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>

                {filteredLogs.length > 0 && (
                    <div style={{ background: 'var(--bg-main)', padding: '15px', borderRadius: '15px', border: '1px solid var(--border)', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ textAlign: 'left' }}>
                            <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--text-p)' }}>{filteredLogs[0].name}</h2>
                            <span style={{ color: 'var(--accent)', fontFamily: 'monospace', fontSize: '16px' }}>{filteredLogs[0].student_id}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="entry-status verified" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(0, 242, 195, 0.1)', border: '1px solid rgba(0, 242, 195, 0.3)', color: 'var(--success)', padding: '5px 15px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px' }}>
                                <CheckCircle size={14} style={{ marginRight: '5px' }}/> VERIFIED
                            </div>
                            <div style={{ color: 'var(--text-s)', fontSize: '12px', marginTop: '5px' }}>{filteredLogs[0].timestamp}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="logs-panel">
            <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Clock size={18} color="var(--accent)" /> Recent Logs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredLogs.map((log, index) => (
                    <div key={index} className="log-item fade-in">
                        <div className="log-icon"><Users size={20} /></div>
                        <div style={{ flex: 1 }}>
                            <span className="log-name">
                                {log.name} 
                                <span style={{ color: 'var(--accent)', fontSize: '11px', fontFamily: 'monospace', marginLeft: '8px', padding: '2px 6px', background: 'rgba(225, 78, 202, 0.1)', borderRadius: '4px' }}>
                                    #{log.student_id}
                                </span>
                            </span>
                            <span className="log-course">{log.course_name}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span className="log-time">{log.timestamp}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}