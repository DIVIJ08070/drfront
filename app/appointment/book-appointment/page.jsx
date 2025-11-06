'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
    <div style={{
      width: '4rem',
      height: '4rem',
      border: '6px solid #3b82f6',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default function AppointmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push('/');
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.jwt) {
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
          console.error("Failed to fetch doctors:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchDoctors();
    }
  }, [status, session]);

  // UNIVERSAL DATE NORMALIZER — WORKS WITH BOTH FORMATS
  const normalizeDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
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
        const targetDate = normalizeDate(date);

        const filtered = (data.slots || [])
          .filter(slot => slot.available && normalizeDate(slot.slot_date) === targetDate)
          .map(slot => ({
            ...slot,
            dateFormatted: normalizeDate(slot.slot_date).split('-').reverse().join('/'),
            startTime: slot.start_time.slice(0, 5),
            endTime: slot.end_time.slice(0, 5)
          }));
        setAvailableSlots(filtered);
      } else {
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error("Failed to fetch slots:", err);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate("");
    setAvailableSlots([]);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (selectedDoctor && date) {
      fetchAvailableSlots(selectedDoctor.id, date);
    }
  };

  const handleBookSlot = (slot) => {
    localStorage.setItem('selectedSlot', JSON.stringify(slot));
    localStorage.setItem('selectedDoctor', JSON.stringify(selectedDoctor));
    router.push('/appointment/book-appointment');
  };

  if (status === "loading" || loading) return <LoadingSpinner />;

  if (status === "authenticated" && session) {
    return (
      <main style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #DBEAFE, #C7D2FE)',
        padding: '2rem 1rem',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden'
        }}>
          <div style={{ backgroundColor: '#1e40af', color: 'white', padding: '2.5rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '900', margin: 0 }}>
              Book Appointment
            </h1>
            <p style={{ margin: '0.75rem 0 0', fontSize: '1.2rem', opacity: 0.9 }}>
              Welcome, {session.user?.name}
            </p>
          </div>

          <div style={{ padding: '2.5rem' }}>
            <div style={{ textAlign: 'right', marginBottom: '2rem' }}>
              <button onClick={() => signOut({ callbackUrl: '/' })} style={{
                backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.65rem 1.5rem',
                borderRadius: '0.75rem', border: 'none', fontWeight: '600', cursor: 'pointer'
              }}>
                Sign Out
              </button>
            </div>

            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem', color: '#111827' }}>
                Choose Your Doctor
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.8rem' }}>
                {doctors.map(doctor => (
                  <div key={doctor.id} onClick={() => handleDoctorSelect(doctor)} style={{
                    backgroundColor: selectedDoctor?.id === doctor.id ? '#dbeafe' : '#f8fafc',
                    border: selectedDoctor?.id === doctor.id ? '3px solid #3b82f6' : '2px solid #e2e8f0',
                    padding: '2rem', borderRadius: '1.25rem', cursor: 'pointer',
                    boxShadow: selectedDoctor?.id === doctor.id ? '0 10px 25px rgba(59, 130, 246, 0.2)' : '0 4px 12px rgba(0,0,0,0.05)',
                  }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: '#1e40af' }}>
                      Dr. {doctor.name}
                    </h3>
                    <p style={{ margin: '0.75rem 0', fontSize: '1.1rem', color: '#4b5563' }}>
                      {doctor.specialization}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {selectedDoctor && (
              <section>
                <h2 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 2rem', color: '#111827' }}>
                  Slots for Dr. {selectedDoctor.name}
                </h2>

                <div style={{ maxWidth: '400px', margin: '0 auto 2.5rem' }}>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', border: '3px solid #fbbf24', borderRadius: '1rem', backgroundColor: 'white' }}
                  />
                </div>

                {selectedDate && (
                  <>
                    {slotsLoading ? (
                      <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div style={{ width: '3rem', height: '3rem', border: '5px solid #fbbf24', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '5rem', backgroundColor: '#fef3c7', borderRadius: '1.5rem', border: '2px dashed #f59e0b' }}>
                        <p style={{ fontSize: '1.5rem', color: '#92400e', fontWeight: '600' }}>
                          No slots on {normalizeDate(selectedDate).split('-').reverse().join('/')}
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                        {availableSlots.map(slot => (
                          <div key={slot.id} onClick={() => handleBookSlot(slot)} style={{
                            backgroundColor: '#ecfdf5', border: '3px solid #10b981', padding: '1rem',
                            borderRadius: '1rem', textAlign: 'center', cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                          >
                            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '4px' }}>
                              {slot.dateFormatted}
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#065f46' }}>
                              {slot.startTime} - {slot.endTime}
                            </div>
                            <div style={{ marginTop: '6px', backgroundColor: '#10b981', color: 'white', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>
                              BOOK NOW
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </section>
            )}
          </div>
        </div>
      </main>
    );
  }

  return <LoadingSpinner />;
}