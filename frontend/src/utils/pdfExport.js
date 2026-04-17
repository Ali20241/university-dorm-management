import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Export table to PDF
export const exportToPDF = (data, columns, title, filename) => {
  const doc = new jsPDF('landscape');
  
  // Add title
  doc.setFontSize(18);
  doc.setTextColor(91, 92, 226);
  doc.text(title, 14, 15);
  
  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);
  
  // Create table
  doc.autoTable({
    head: [columns],
    body: data,
    startY: 35,
    theme: 'striped',
    headStyles: {
      fillColor: [91, 92, 226],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    margin: { top: 35 }
  });
  
  // Save PDF
  doc.save(`${filename}.pdf`);
};

// Export students list to PDF
export const exportStudentsToPDF = (students) => {
  const columns = ['ID', 'Student ID', 'Name', 'Email', 'Phone', 'Major', 'Year', 'Status'];
  const data = students.map(s => [
    s.id,
    s.student_id,
    `${s.first_name} ${s.last_name}`,
    s.email,
    s.phone || '-',
    s.major || '-',
    s.year || '-',
    s.status || 'active'
  ]);
  exportToPDF(data, columns, 'Students Report', 'students_report');
};

// Export rooms to PDF
export const exportRoomsToPDF = (rooms) => {
  const columns = ['Room Number', 'Building', 'Floor', 'Type', 'Capacity', 'Occupancy', 'Status'];
  const data = rooms.map(r => [
    r.room_number,
    r.building,
    r.floor,
    r.room_type,
    r.capacity,
    `${r.current_occupancy || 0}/${r.capacity}`,
    r.room_status
  ]);
  exportToPDF(data, columns, 'Rooms Report', 'rooms_report');
};

// Export payments to PDF
export const exportPaymentsToPDF = (payments) => {
  const columns = ['Student', 'Student ID', 'Amount', 'Due Date', 'Status'];
  const data = payments.map(p => [
    `${p.first_name} ${p.last_name}`,
    p.student_id,
    `ETB ${parseFloat(p.amount || p.penalty_amount).toFixed(2)}`,
    new Date(p.due_date).toLocaleDateString(),
    p.status
  ]);
  exportToPDF(data, columns, 'Payments Report', 'payments_report');
};

// Export maintenance to PDF
export const exportMaintenanceToPDF = (requests) => {
  const columns = ['Title', 'Room', 'Student', 'Priority', 'Status', 'Submitted'];
  const data = requests.map(r => [
    r.title,
    r.room_number,
    `${r.first_name || ''} ${r.last_name || ''}`,
    r.priority,
    r.status,
    new Date(r.created_at).toLocaleDateString()
  ]);
  exportToPDF(data, columns, 'Maintenance Report', 'maintenance_report');
};

// Export applications to PDF
export const exportApplicationsToPDF = (applications) => {
  const columns = ['Student', 'Student ID', 'Room', 'Application Date', 'Status'];
  const data = applications.map(a => [
    `${a.first_name} ${a.last_name}`,
    a.student_id,
    a.room_number,
    new Date(a.application_date).toLocaleDateString(),
    a.status
  ]);
  exportToPDF(data, columns, 'Applications Report', 'applications_report');
};