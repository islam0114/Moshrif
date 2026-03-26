import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Trash2, Edit, Plus, Users, BookOpen, Calendar, Link as LinkIcon, Clock, Search, Filter, Database } from "lucide-react";
import moment from "moment"; 

const API_BASE = "http://localhost:8000/api";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("students");
  const [rawData, setRawData] = useState([]); 
  const [filteredData, setFilteredData] = useState([]); 

  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("All"); 

  const [coursesList, setCoursesList] = useState([]);
  const roomsList = ["Hall_1", "Hall_2", "Lab_1", "Lab_2", "Auditorium"];

  useEffect(() => {
    fetchData("students");
    fetchDropdownData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDropdownData = async () => {
      try { const cRes = await axios.get(`${API_BASE}/courses`); setCoursesList(cRes.data); } catch (e) { console.error(e); }
  };

  const fetchData = async (table) => {
      setActiveTab(table); setSearchTerm(""); setTimeFilter("All");
      try {
        const res = await axios.get(`${API_BASE}/admin/get/${table}`);
        setRawData(res.data); setFilteredData(res.data);
      } catch (e) { console.error("Error fetching data", e); }
      if(table !== 'attendance') fetchDropdownData(); 
  };

  useEffect(() => {
    let result = rawData;
    if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        result = result.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes(lowerSearch)));
    }
    if (activeTab === "attendance" && timeFilter !== "All") {
        const now = moment();
        result = result.filter(item => {
            const itemDate = moment(item.timestamp);
            if (timeFilter === "Today") return itemDate.isSame(now, 'day');
            if (timeFilter === "Week") return itemDate.isSame(now, 'week');
            if (timeFilter === "Month") return itemDate.isSame(now, 'month');
            return true;
        });
    }
    if (activeTab === "schedule" && timeFilter !== "All") {
        const todayDay = moment().format('dddd'); 
        if (timeFilter === "Today") result = result.filter(i => i.day_of_week === todayDay);
    }
    setFilteredData(result);
  }, [searchTerm, timeFilter, rawData, activeTab]);

  const handleDelete = async (item) => {
      const confirm = await Swal.fire({ title: 'Delete Record?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ff3b3b', background: 'var(--bg-div)', color: 'var(--text-p)' });
      if (confirm.isConfirmed) {
          let id = activeTab === "students" ? item.student_id : (activeTab === "courses" ? item.course_code : item.id);
          await axios.post(`${API_BASE}/admin/crud`, { table: activeTab, action: "delete", data: activeTab === "schedule" || activeTab === "registrations" || activeTab === "attendance" ? { id } : (activeTab === "courses" ? { code: id } : { id }) });
          fetchData(activeTab);
          Swal.fire({ icon: 'success', title: 'Deleted!', background: 'var(--bg-div)', color: 'var(--text-p)', showConfirmButton: false, timer: 1500 });
      }
  };

  const handleForm = async (action, item = null) => {
      if (activeTab === "attendance") { Swal.fire({ icon: "info", title: "Info", text: "Attendance logs are read-only.", background: 'var(--bg-div)', color: 'var(--text-p)' }); return; }
      
      let htmlForm = '';
      if (activeTab === "students") {
          htmlForm = `<input id="swal-id" class="swal2-input" placeholder="Student ID" value="${item?.student_id||''}" ${action==='update'?'readonly':''}>
                      <input id="swal-name" class="swal2-input" placeholder="Full Name" value="${item?.name||''}">
                      <input id="swal-email" class="swal2-input" placeholder="Email (Optional)" value="${item?.email||''}">`;
      } else if (activeTab === "courses") {
          htmlForm = `<input id="swal-code" class="swal2-input" placeholder="Course Code" value="${item?.course_code||''}" ${action==='update'?'readonly':''}>
                      <input id="swal-name" class="swal2-input" placeholder="Course Name" value="${item?.course_name||''}">
                      <input id="swal-inst" class="swal2-input" placeholder="Instructor" value="${item?.instructor||''}">
                      <input id="swal-pass" class="swal2-input" placeholder="Password" value="${item?.password||''}">`;
      } else if (activeTab === "schedule") {
          htmlForm = `<select id="swal-course" class="swal2-select" style="width: 80%; margin: 10px auto; display: block;"><option value="" disabled ${!item ? 'selected' : ''}>Select Course</option>${coursesList.map(c => `<option value="${c.course_code}" ${item?.course_code === c.course_code ? 'selected' : ''}>${c.course_name}</option>`).join('')}</select>
                      <select id="swal-room" class="swal2-select" style="width: 80%; margin: 10px auto; display: block;"><option value="" disabled ${!item ? 'selected' : ''}>Select Room</option>${roomsList.map(r => `<option value="${r}" ${item?.room_number === r ? 'selected' : ''}>${r}</option>`).join('')}</select>
                      <select id="swal-day" class="swal2-select" style="width: 80%; margin: 10px auto; display: block;"><option value="Sunday" ${item?.day_of_week === 'Sunday' ? 'selected' : ''}>Sunday</option><option value="Monday" ${item?.day_of_week === 'Monday' ? 'selected' : ''}>Monday</option><option value="Tuesday" ${item?.day_of_week === 'Tuesday' ? 'selected' : ''}>Tuesday</option><option value="Wednesday" ${item?.day_of_week === 'Wednesday' ? 'selected' : ''}>Wednesday</option><option value="Thursday" ${item?.day_of_week === 'Thursday' ? 'selected' : ''}>Thursday</option></select>
                      <input id="swal-start" class="swal2-input" type="time" value="${item?.start_time||''}">
                      <input id="swal-end" class="swal2-input" type="time" value="${item?.end_time||''}">`;
      } else if (activeTab === "registrations") {
          htmlForm = `<input id="swal-sid" class="swal2-input" placeholder="Student ID (e.g. 2024001)" value="${item?.student_id||''}">
                      <select id="swal-cid" class="swal2-select" style="width: 80%; margin: 10px auto; display: block;"><option value="" disabled ${!item ? 'selected' : ''}>Select Course</option>${coursesList.map(c => `<option value="${c.course_code}" ${item?.course_code === c.course_code ? 'selected' : ''}>${c.course_name}</option>`).join('')}</select>`;
      }

      const { value: formValues } = await Swal.fire({
          title: `${action === 'add' ? 'Add' : 'Edit'} ${activeTab}`, html: htmlForm, focusConfirm: false, showCancelButton: true, confirmButtonColor: '#e14eca', background: 'var(--bg-div)', color: 'var(--text-p)',
          preConfirm: () => {
             if (activeTab === "students") return { id: document.getElementById('swal-id').value, name: document.getElementById('swal-name').value, email: document.getElementById('swal-email').value };
             if (activeTab === "courses") return { code: document.getElementById('swal-code').value, name: document.getElementById('swal-name').value, instructor: document.getElementById('swal-inst').value, password: document.getElementById('swal-pass').value };
             if (activeTab === "schedule") return { id: item?.id, course_code: document.getElementById('swal-course').value, room: document.getElementById('swal-room').value, day: document.getElementById('swal-day').value, start: document.getElementById('swal-start').value, end: document.getElementById('swal-end').value };
             if (activeTab === "registrations") return { id: item?.id, student_id: document.getElementById('swal-sid').value, course_code: document.getElementById('swal-cid').value };
          }
      });

      if (formValues) {
          try {
              const res = await axios.post(`${API_BASE}/admin/crud`, { table: activeTab, action, data: formValues });
              if (res.data.status === "success") { fetchData(activeTab); Swal.fire({ icon: 'success', title: 'Saved!', background: 'var(--bg-div)', color: 'var(--text-p)', showConfirmButton: false, timer: 1500 }); } 
              else { Swal.fire({ icon: 'error', title: 'Failed', text: res.data.message, background: 'var(--bg-div)', color: 'var(--text-p)' }); }
          } catch (error) { Swal.fire({ icon: 'error', title: 'Error', text: 'Server Error', background: 'var(--bg-div)', color: 'var(--text-p)' }); }
      }
  };

  return (
    <div className="fade-in">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '35px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
          <h1 style={{border: 'none', margin: 0, paddingBottom: 0, marginBottom: 0}}>
              <Database size={32} /> System Database
          </h1>
          
          <div style={{display: 'flex', gap: '10px', flex: 1, justifyContent: 'flex-end'}}>
             <div style={{position: 'relative'}}>
                 <Search size={16} style={{position: 'absolute', left: 10, top: 12, color: 'var(--text-s)'}}/>
                 <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-p)', width: '200px'}} />
             </div>

             {(activeTab === "attendance" || activeTab === "schedule") && (
                 <div style={{position: 'relative'}}>
                    <Filter size={16} style={{position: 'absolute', left: 10, top: 12, color: 'var(--text-s)'}}/>
                    <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} style={{padding: '10px 10px 10px 35px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-p)', cursor: 'pointer'}}>
                        <option value="All">All Time</option><option value="Today">Today</option>
                        {activeTab === "attendance" && <option value="Week">This Week</option>}
                        {activeTab === "attendance" && <option value="Month">This Month</option>}
                    </select>
                 </div>
             )}

             {activeTab !== 'attendance' && (
                <button className="add-btn" onClick={() => handleForm('add')}><Plus size={20}/> Add New</button>
             )}
          </div>
      </div>

      <div className="tabs-container">
          <button className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => fetchData('students')}><Users size={18}/> Students</button>
          <button className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => fetchData('courses')}><BookOpen size={18}/> Courses</button>
          <button className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => fetchData('schedule')}><Calendar size={18}/> Schedule</button>
          <button className={`tab-btn ${activeTab === 'registrations' ? 'active' : ''}`} onClick={() => fetchData('registrations')}><LinkIcon size={18}/> Enrollments</button>
          <button className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => fetchData('attendance')}><Clock size={18}/> Logs</button>
      </div>

      <div className="table-container">
        <table>
            <thead>
                <tr>
                    {activeTab === 'students' && <><th>ID</th><th>Full Name</th><th>Email</th></>}
                    {activeTab === 'courses' && <><th>Code</th><th>Course Name</th><th>Instructor</th><th>Pass</th></>}
                    {activeTab === 'schedule' && <><th>Course</th><th>Day</th><th>Time</th><th>Room</th></>}
                    {activeTab === 'registrations' && <><th>Student</th><th>Course</th></>}
                    {activeTab === 'attendance' && <><th>Log ID</th><th>Student ID</th><th>Student Name</th><th>Course</th><th>Time</th><th>Status</th></>}
                    <th style={{textAlign: 'right'}}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {filteredData.map((row, idx) => (
                    <tr key={idx}>
                        {activeTab === 'students' && <><td>{row.student_id}</td><td style={{fontWeight: 'bold', color: 'var(--text-p)'}}>{row.name}</td><td>{row.email}</td></>}
                        {activeTab === 'courses' && <><td>{row.course_code}</td><td>{row.course_name}</td><td>{row.instructor}</td><td style={{fontFamily: 'monospace', color: 'var(--accent)'}}>****</td></>}
                        {activeTab === 'schedule' && <><td>{row.course_code}</td><td><span style={{color: 'var(--accent)'}}>{row.day_of_week}</span></td><td>{row.start_time} - {row.end_time}</td><td>{row.room_number}</td></>}
                        {activeTab === 'registrations' && <><td>{row.student_name} <span style={{color:'var(--text-s)', fontSize:'11px'}}>({row.student_id})</span></td><td>{row.course_name} <span style={{color:'var(--accent)', fontSize:'11px'}}>({row.course_code})</span></td></>}
                        {activeTab === 'attendance' && <>
                            <td>#{row.id}</td><td style={{color: 'var(--accent)', fontFamily: 'monospace', fontSize: '13px'}}>{row.student_id}</td>
                            <td style={{fontWeight: 'bold', color: 'var(--text-p)'}}>{row.student_name}</td>
                            <td><span className="status-badge" style={{background: 'rgba(225, 78, 202, 0.1)', color: 'var(--accent)', border: '1px solid rgba(225, 78, 202, 0.2)'}}>{row.course_code}</span></td>
                            <td>{moment(row.timestamp).format('MMM D, h:mm A')}</td>
                            <td><span className="status-badge status-present" style={{ background: 'rgba(0, 242, 195, 0.1)', color: 'var(--success)' }}>Present</span></td>
                        </>}
                        <td style={{display: 'flex', justifyContent: 'flex-end'}}>
                            {activeTab !== 'registrations' && activeTab !== 'attendance' && <button className="action-btn btn-edit" onClick={() => handleForm('update', row)}><Edit size={16}/></button>}
                            <button className="action-btn btn-delete" onClick={() => handleDelete(row)}><Trash2 size={16}/></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {filteredData.length === 0 && (
            <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-s)'}}><Filter size={40} style={{marginBottom: '10px', opacity: 0.5}}/><p>No records found matching your filters.</p></div>
        )}
      </div>
    </div>
  );
}