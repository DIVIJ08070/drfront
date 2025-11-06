'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(to bottom right, #DBEAFE, #C7D2FE)' }}>
    <div style={{ width: '4rem', height: '4rem', border: '6px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default function BookAppointmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patient, setPatient] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState({ reason: "", notes_internal: "" });

  useEffect(() => {
    if (status === "unauthenticated") router.push('/');
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.jwt) {
      const saved = localStorage.getItem('selectedPatient');
      if (!saved) {
        router.push('/appointment');
        return;
      }
      const patientData = JSON.parse(saved);
      setPatient(patientData);

      const fetchDoctors = async () => {
        setLoading(true);
        try {
          const res = await fetch('https://medify-service-production.up.railway.app/v1/doctors', {
            headers: { 'Authorization': `Bearer ${session.jwt}` }
          });
          if (res.ok) {
            const data = await res.json();
            setDoctors(data.doctors || []);
          }
        } catch (err) {
          console.error("Failed to fetch doctors");
        } finally {
          setLoading(false);
        }
      };
      fetchDoctors();
    }
  }, [status, session, router]);

  const normalizeDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split('-');
    const [a, b, c] = parts.map(Number);
    if (a > 2000) return `${a}-${String(b).padStart(2,'0')}-${String(c).padStart(2,'0')}`;
    if (c > 2000) return `${c}-${String(b).padStart(2,'0')}-${String(a).padStart(2,'0')}`;
    return dateStr;
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    if (!doctorId || !date) {
      setAvailableSlots([]);
      return;
    }
    setSlotsLoading(true);
    try {
      const res = await fetch(`https://medify-service-production.up.railway.app/v1/doctors/slots?doctorId=${doctorId}`, {
        headers: { 'Authorization': `Bearer ${session.jwt}` }
      });
      if (res.ok) {
        const data = await res.json();
        const target = normalizeDate(date);
        const filtered = (data.slots || [])
          .filter(s => s.available && normalizeDate(s.slot_date) === target)
          .map(s => ({
            ...s,
            dateFormatted: normalizeDate(s.slot_date).split('-').reverse().join('/'),
            startTime: s.start_time.slice(0, 5),
            endTime: s.end_time.slice(0, 5)
          }));
        setAvailableSlots(filtered);
      }
    } catch (err) {
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate("");
    setAvailableSlots([]);
    setSelectedSlot(null);
    setShowBookingForm(false);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSlot(null);
    setShowBookingForm(false);
    if (selectedDoctor) fetchAvailableSlots(selectedDoctor.id, date);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setShowBookingForm(true);
  };

  const handleBookAppointment = async () => {
    if (!appointmentDetails.reason.trim()) return;

    setBookingLoading(true);
    try {
      // Double-check slot availability
      const res = await fetch(`https://medify-service-production.up.railway.app/v1/doctors/slots?doctorId=${selectedDoctor.id}`, {
        headers: { 'Authorization': `Bearer ${session.jwt}` }
      });
      if (res.ok) {
        const data = await res.json();
        const slot = data.slots.find(s => s.id === selectedSlot.id);
        if (!slot || !slot.available) {
          alert("Slot no longer available. Please choose another.");
          fetchAvailableSlots(selectedDoctor.id, selectedDate);
          setSelectedSlot(null);
          setShowBookingForm(false);
          setBookingLoading(false);
          return;
        }
      }

      const payload = {
        doctor_id: selectedDoctor.id,
        slot_id: selectedSlot.id,
        patient_id: patient.id,
        reason: appointmentDetails.reason.trim(),
        notes_internal: appointmentDetails.notes_internal.trim()
      };

      const bookRes = await fetch('https://medify-service-production.up.railway.app/v1/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.jwt}`
        },
        body: JSON.stringify(payload)
      });

      if (bookRes.ok) {
        alert("Appointment booked successfully!");
        router.push('/appointment');
      } else {
        const err = await bookRes.text();
        alert("Failed to book: " + (JSON.parse(err)?.message || "Try again"));
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (status === "loading" || loading) return <LoadingSpinner />;

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #DBEAFE, #C7D2FE)', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: 'white', borderRadius: '2rem', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ background: 'linear-gradient(to right, #1e40af, #3b82f6)', color: 'white', padding: '3rem', textAlign: 'center', position: 'relative' }}>
          <button onClick={() => router.push('/appointment')} style={{
            position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', border: 'none', padding: '1rem 2rem',
            borderRadius: '1rem', fontWeight: '700', backdropFilter: 'blur(10px)', cursor: 'pointer'
          }}>
            ← Patients
          </button>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', margin: 0 }}>Book Appointment</h1>
          <p style={{ fontSize: '1.5rem', margin: '1rem 0 0', opacity: 0.9 }}>
            Dr. {session?.user?.name}
          </p>
          {patient && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '1rem', display: 'inline-block' }}>
              <strong>{patient.name}</strong> • Age: {patient.age} • ID: {patient.id}
            </div>
          )}
        </div>

        <div style={{ padding: '3rem' }}>

          {/* Doctors Grid */}
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '2rem', color: '#1f2937' }}>Select Doctor</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              {doctors.map(d => (
                <div key={d.id} onClick={() => handleDoctorSelect(d)} style={{
                  backgroundColor: selectedDoctor?.id === d.id ? '#dbeafe' : '#f8fafc',
                  border: selectedDoctor?.id === d.id ? '4px solid #3b82f6' : '3px solid #e2e8f0',
                  padding: '2rem', borderRadius: '1.5rem', cursor: 'pointer',
                  boxShadow: selectedDoctor?.id === d.id ? '0 20px 40px rgba(59,130,246,0.2)' : '0 10px 25px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease', transform: selectedDoctor?.id === d.id ? 'scale(1.03)' : 'scale(1)'
                }}>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e40af', margin: 0 }}>Dr. {d.name}</h3>
                  <p style={{ fontSize: '1.2rem', color: '#4b5563', margin: '0.75rem 0' }}>{d.specialization}</p>
                  <p style={{ fontSize: '1rem', color: '#6b7280' }}>Exp: {d.experience} yrs • ID: {d.id}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Date & Slots */}
          {selectedDoctor && (
            <>
              <div style={{ maxWidth: '500px', margin: '0 auto 3rem' }}>
                <input type="date" value={selectedDate} onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]}
                  style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem', border: '4px solid #fbbf24', borderRadius: '1.5rem', fontWeight: '700' }}
                />
              </div>

              {selectedDate && (
                slotsLoading ? (
                  <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ width: '4rem', height: '4rem', border: '6px solid #fbbf24', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '6rem', backgroundColor: '#fffbeb', borderRadius: '2rem', border: '4px dashed #f59e0b' }}>
                    <p style={{ fontSize: '1.8rem', color: '#92400e', fontWeight: '700' }}>No slots available on this date</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
                    {availableSlots.map(slot => (
                      <div key={slot.id} onClick={() => handleSlotSelect(slot)} style={{
                        backgroundColor: selectedSlot?.id === slot.id ? '#d1fae5' : '#ecfdf5',
                        border: selectedSlot?.id === slot.id ? '5px solid #059669' : '4px solid #10b981',
                        padding: '1.5rem', borderRadius: '1.5rem', textAlign: 'center', cursor: 'pointer',
                        boxShadow: selectedSlot?.id === slot.id ? '0 20px 40px rgba(5,150,105,0.3)' : '0 10px 25px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease', transform: selectedSlot?.id === slot.id ? 'scale(1.08)' : 'scale(1)'
                      }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#065f46' }}>
                          {slot.startTime} - {slot.endTime}
                        </div>
                        <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>{slot.dateFormatted}</div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          )}

          {/* Booking Form */}
          {showBookingForm && selectedSlot && (
            <div style={{ marginTop: '4rem', padding: '3rem', backgroundColor: '#f8fafc', borderRadius: '2rem', border: '4px solid #3b82f6' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', textAlign: 'center', color: '#1e40af', marginBottom: '2rem' }}>
                Confirm Appointment
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1.5rem', border: '3px solid #e5e7eb' }}>
                  <p><strong>Patient:</strong> {patient.name} (ID: {patient.id})</p>
                  <p><strong>Doctor:</strong> Dr. {selectedDoctor.name}</p>
                  <p><strong>Date:</strong> {selectedSlot.dateFormatted}</p>
                  <p><strong>Time:</strong> {selectedSlot.startTime} - {selectedSlot.endTime}</p>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '700', fontSize: '1.2rem' }}>Reason for Visit *</label>
                  <input type="text" name="reason" value={appointmentDetails.reason} onChange={e => setAppointmentDetails(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="e.g. Fever, Checkup" style={{ width: '100%', padding: '1rem', border: '3px solid #d1d5db', borderRadius: '1rem', fontSize: '1.1rem' }} />
                  <label style={{ display: 'block', margin: '1.5rem 0 0.5rem', fontWeight: '700' }}>Notes (Optional)</label>
                  <textarea name="notes_internal" value={appointmentDetails.notes_internal} onChange={e => setAppointmentDetails(prev => ({ ...prev, notes_internal: e.target.value }))}
                    rows="3" placeholder="Any special instructions..." style={{ width: '100%', padding: '1rem', border: '3px solid #d1d5db', borderRadius: '1rem', fontSize: '1.1rem', resize: 'vertical' }} />
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button onClick={handleBookAppointment} disabled={bookingLoading || !appointmentDetails.reason.trim()}
                  style={{ backgroundColor: bookingLoading || !appointmentDetails.reason.trim() ? '#9ca3af' : '#10b981', color: 'white', padding: '1.5rem 6rem', borderRadius: '2rem', border: 'none', fontWeight: '900', fontSize: '1.8rem', cursor: 'pointer', boxShadow: '0 20px 40px rgba(16,185,129,0.4)' }}>
                  {bookingLoading ? "Booking..." : "CONFIRM & BOOK"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}