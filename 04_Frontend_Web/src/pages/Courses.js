import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BookOpen, CheckCircle, XCircle, Download, Calendar, GraduationCap } from "lucide-react";

const API_BASE = "http://localhost:8000/api";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const [riskReport, setRiskReport] = useState([]);
  const [dailyList, setDailyList] = useState([]);
  
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableDates, setAvailableDates] = useState([]); 

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/courses`);
      setCourses(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCourseLogin = async (course) => {
    const { value: password } = await Swal.fire({
      title: `Access ${course.course_name}`, input: 'password', inputPlaceholder: 'Enter Course Password',
      background: 'var(--bg-div)', color: 'var(--text-p)', confirmButtonColor: '#e14eca'
    });

    if (password) {
      const res = await axios.post(`${API_BASE}/course/login`, { password, course_code: course.course_code });
      if (res.data.status === "success") { loadCourseData(course); } 
      else { Swal.fire({title: "Access Denied", text: "Wrong Password", icon: "error", background: 'var(--bg-div)', color: 'var(--text-p)'}); }
    }
  };

  const loadCourseData = async (course) => {
    setSelectedCourse(course);
    const datesRes = await axios.get(`${API_BASE}/course/${course.course_code}/dates`);
    setAvailableDates(datesRes.data);
    setManualDate(datesRes.data[0]); 
    fetchDailyList(course.course_code, datesRes.data[0]);
    const riskRes = await axios.get(`${API_BASE}/course/${course.course_code}/report`);
    setRiskReport(riskRes.data);
  };

  const fetchDailyList = async (code, date) => {
      try {
          const res = await axios.get(`${API_BASE}/course/${code}/date/${date}`);
          setDailyList(res.data);
      } catch (err) { console.error(err); }
  };

  const toggleAttendance = async (student) => {
      const newStatus = student.status === "Present" ? "Absent" : "Present";
      try {
          await axios.post(`${API_BASE}/attendance/manual`, { student_id: student.student_id, course_code: selectedCourse.course_code, status: newStatus, date: manualDate });
          setDailyList(prev => prev.map(s => s.student_id === student.student_id ? { ...s, status: newStatus } : s));
      } catch (err) { Swal.fire({title: "Error", text: "Could not update attendance", icon: "error", background: 'var(--bg-div)', color: 'var(--text-p)'}); }
  };

  const handleExport = () => { window.open(`${API_BASE}/export/course/${selectedCourse.course_code}/${manualDate}`, '_blank'); };

  if (selectedCourse) {
    return (
      <div className="fade-in">
        <button onClick={() => setSelectedCourse(null)} style={{background: 'transparent', color: 'var(--text-s)', marginBottom: '20px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}>← Back to Courses</button>
        
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'35px', borderBottom: '1px solid var(--border)', paddingBottom: '20px'}}>
            <h1 style={{border: 'none', margin: 0, paddingBottom: 0, marginBottom: 0}}>
                <BookOpen size={32} /> {selectedCourse.course_name} <span style={{fontSize:'16px', color:'var(--accent)', marginLeft: '10px'}}>{selectedCourse.course_code}</span>
            </h1>
            <div style={{textAlign:'right'}}>
                <p style={{margin:0, color:'var(--text-s)'}}>Instructor</p>
                <h4 style={{margin:0, color:'var(--text-p)'}}>{selectedCourse.instructor}</h4>
            </div>
        </div>

        <div className="card" style={{border: '1px solid var(--border)', marginBottom: '30px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <h3>📝 Manual Attendance Sheet</h3>
                </div>
                
                <div style={{display:'flex', gap:'10px'}}>
                    <div style={{position: 'relative'}}>
                        <Calendar size={16} style={{position: 'absolute', left: '10px', top: '12px', color: 'var(--text-s)'}}/>
                        <select 
                            value={manualDate}
                            onChange={(e) => { setManualDate(e.target.value); fetchDailyList(selectedCourse.course_code, e.target.value); }}
                            style={{ padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-p)', fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}
                        >
                            {availableDates.map(d => ( <option key={d} value={d}>{d === new Date().toISOString().split('T')[0] ? `${d} (Today)` : d}</option> ))}
                        </select>
                    </div>

                    <button onClick={handleExport} className="add-btn" style={{background: 'var(--success)', color: '#000', padding: '10px 20px'}}>
                        <Download size={18} style={{marginRight: '5px'}}/> Export Excel
                    </button>
                </div>
            </div>

            <div className="table-container" style={{maxHeight: '400px', overflowY: 'auto'}}>
                <table>
                    <thead><tr><th>Student ID</th><th>Name</th><th>Current Status</th><th>Action</th></tr></thead>
                    <tbody>
                        {dailyList.map((student, idx) => (
                            <tr key={idx}>
                                <td style={{color:'var(--accent)', fontFamily:'monospace'}}>{student.student_id}</td>
                                <td style={{fontWeight:'bold'}}>{student.name}</td>
                                <td>
                                    <span style={{
                                        padding: '5px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold',
                                        background: student.status === 'Present' ? 'rgba(0, 242, 195, 0.1)' : 'rgba(255, 59, 59, 0.1)',
                                        color: student.status === 'Present' ? 'var(--success)' : 'var(--danger)',
                                        border: `1px solid ${student.status === 'Present' ? 'rgba(0, 242, 195, 0.3)' : 'rgba(255, 59, 59, 0.3)'}`
                                    }}>
                                        {student.status}
                                    </span>
                                </td>
                                <td>
                                    <button 
                                        onClick={() => toggleAttendance(student)}
                                        style={{
                                            padding: '6px 15px', borderRadius: '6px', cursor: 'pointer',
                                            background: student.status === 'Present' ? 'var(--danger)' : 'var(--success)', 
                                            color: student.status === 'Present' ? 'white' : 'black',
                                            fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', border: 'none'
                                        }}
                                    >
                                        {student.status === 'Present' ? <XCircle size={14}/> : <CheckCircle size={14}/>}
                                        {student.status === 'Present' ? "Mark Absent" : "Mark Present"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {dailyList.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', padding:'20px', color: 'var(--text-s)'}}>No students enrolled in this course.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="card">
            <h3>🚫 Risk Analysis (Barred Students)</h3>
            <div className="table-container">
                <table>
                    <thead><tr><th>ID</th><th>Name</th><th>Attended</th><th>Missed</th><th>Status</th></tr></thead>
                    <tbody>
                        {riskReport.map((s, idx) => (
                            <tr key={idx} style={{background: s.status.includes('BARRED') ? 'rgba(255, 59, 59, 0.05)' : 'transparent'}}>
                                <td>{s.id}</td>
                                <td>{s.name}</td>
                                <td>{s.attended}</td>
                                <td>{s.absent}</td>
                                <td><span className={s.status.includes('BARRED') ? 'status-barred' : 'status-safe'}>{s.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
          <h1 style={{ border: 'none', margin: 0, paddingBottom: 0, marginBottom: 0 }}>
              <GraduationCap size={32} /> Courses Management
          </h1>
      </div>
      <div className="stats-grid">
        {courses.map(course => (
          <div key={course.course_code} className="card" onClick={() => handleCourseLogin(course)} style={{cursor: 'pointer', borderLeft: '5px solid var(--accent)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                    <h3 style={{color: 'var(--text-s)'}}>{course.course_code}</h3>
                    <h2 style={{margin: '10px 0', fontSize: '22px', color: 'var(--text-p)'}}>{course.course_name}</h2>
                    <p style={{color: 'var(--text-s)', margin: 0}}>👨‍🏫 {course.instructor}</p>
                </div>
                <BookOpen size={40} color="var(--accent)" opacity={0.3}/>
            </div>
            <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-s)'}}>
                <span>📍 {course.hall_number}</span>
                <span>🔒 Protected</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}