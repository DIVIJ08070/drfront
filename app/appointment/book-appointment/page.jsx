'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Mock doctors data
const MOCK_DOCTORS = [
  { id: 1, name: 'Dr. Alice Johnson', specialty: 'Cardiologist', avatar: '👩‍⚕️' },
  { id: 2, name: 'Dr. Bob Smith', specialty: 'Dermatologist', avatar: '👨‍⚕️' },
  { id: 3, name: 'Dr. Carol Lee', specialty: 'Pediatrician', avatar: '👩‍⚕️' },
];

// Mock function to get available slots for a doctor on a date (simplified: 9AM-5PM in 30min intervals, some "booked")
const getAvailableSlots = (doctorId, date) => {
  // Simulate booked slots (e.g., random or hardcoded for demo)
  const allSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];
  const bookedSlots = new Set(); // Simulate bookings
  if (doctorId === 1 && date === '2025-10-25') bookedSlots.add('10:00');
  if (doctorId === 2 && date === '2025-10-25') bookedSlots.add('14:30');
  // Add more logic as needed (e.g., fetch from API/DB)

  return allSlots.filter(slot => !bookedSlots.has(slot));
};

export default function BookAppointmentPage() {
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [doctors] = useState(MOCK_DOCTORS);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');

  // Load the selected patient from localStorage
  useEffect(() => {
    const storedPatient = localStorage.getItem('selectedPatient');
    if (storedPatient) {
      setPatient(JSON.parse(storedPatient));
    } else {
      // If no patient is found (e.g., page reload), send user back
      router.push('/appointment');
    }
  }, [router]);

  // Update available slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const slots = getAvailableSlots(selectedDoctor.id, selectedDate);
      setAvailableSlots(slots);
      setSelectedSlot(''); // Reset slot selection
    } else {
      setAvailableSlots([]);
      setSelectedSlot('');
    }
  }, [selectedDoctor, selectedDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      alert('Please select a doctor, date, and time slot.');
      return;
    }
    // Logic to save the appointment would go here (e.g., API call)
    alert(`Appointment booked for ${patient.name} with ${selectedDoctor.name} on ${selectedDate} at ${selectedSlot}! Notes: ${notes}`);
    router.push('/appointment');
  };

  if (!patient) {
    // Show a loading or empty state while patient data is loading
    return (
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to bottom right, #DBEAFE, #C7D2FE)',
      }}>
        {/* You could put a LoadingSpinner component here */}
      </main>
    );
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(to bottom right, #DBEAFE, #C7D2FE)',
      padding: '1rem',
    }}>
      <div 
        className="card-fade-in"
        style={{
          backgroundColor: '#ffffff',
          padding: '2rem 2.5rem',
          borderRadius: '1rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          width: '100%',
          maxWidth: '32rem',
          boxSizing: 'border-box'
        }}
      >
        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem', margin: 0 }}>Book Appointment</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '1.125rem' }}>
          For: <span style={{ fontWeight: '600', color: '#111827' }}>{patient.name}</span>
        </p>
        
        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          {/* Doctor Selection */}
          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Select Doctor</label>
            <select 
              value={selectedDoctor?.id || ''}
              onChange={(e) => {
                const doctor = doctors.find(d => d.id === parseInt(e.target.value));
                setSelectedDoctor(doctor);
              }}
              required
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.5rem', 
                boxSizing: 'border-box',
                backgroundColor: '#f9fafb',
                fontSize: '1rem'
              }}
            >
              <option value="">Choose a doctor...</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.avatar} {doctor.name} - {doctor.specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <label htmlFor="date" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Appointment Date</label>
            <input 
              type="date" 
              id="date" 
              name="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required 
              min={new Date().toISOString().split('T')[0]} // No past dates
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.5rem', 
                boxSizing: 'border-box' 
              }} 
            />
          </div>

          {/* Time Slots Selection (if available) */}
          {availableSlots.length > 0 && (
            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Available Time Slots</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      padding: '0.5rem 1rem',
                      border: selectedSlot === slot ? '2px solid #3b82f6' : '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      backgroundColor: selectedSlot === slot ? '#dbeafe' : '#f9fafb',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {selectedSlot && <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Selected: {selectedSlot}</p>}
            </div>
          )}

          {selectedDoctor && selectedDate && availableSlots.length === 0 && (
            <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>No available slots for this doctor on the selected date. Try another date.</p>
          )}

          {/* Notes */}
          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <label htmlFor="notes" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Reason for Visit (Optional)</label>
            <textarea 
              id="notes" 
              name="notes" 
              rows="3" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem', 
                border: '1px solid #d1d5db', 
                borderRadius: '0.5rem', 
                boxSizing: 'border-box',
                resize: 'vertical'
              }} 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="button" 
              id="back-button" // ID for hover/focus
              onClick={() => router.push('/appointment')}
              style={{
                width: '100%',
                backgroundColor: '#e5e7eb',
                color: '#374151',
                fontWeight: '500',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              id="confirm-appointment-button" // ID for hover/focus
              disabled={!selectedDoctor || !selectedDate || !selectedSlot} // Disable if incomplete
              style={{
                width: '100%',
                backgroundColor: !selectedDoctor || !selectedDate || !selectedSlot ? '#9ca3af' : '#10b981', // Gray if disabled
                color: '#ffffff',
                fontWeight: '500',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: !selectedDoctor || !selectedDate || !selectedSlot ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              Confirm Appointment
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}