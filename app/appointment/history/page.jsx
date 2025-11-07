'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(to bottom right, #DBEAFE, #C7D2FE)' }}>
    <div style={{ width: '4rem', height: '4rem', border: '6px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default function PatientHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push('/');
    
    if (status === "authenticated" && session?.jwt) {
      const saved = localStorage.getItem('selectedPatient') || localStorage.getItem('selectedPatientForHistory');
      if (!saved) {
        setLoading(false);
        return;
      }

      const patientData = JSON.parse(saved);
      setPatient(patientData);

      fetch('https://medify-service-production.up.railway.app/v1/appointments', {
        headers: {
          'Authorization': `Bearer ${session.jwt}`,
          'patientId': patientData.id.toString(),
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          const appts = data.appointments || [];
          setAppointments(appts);
        })
        .catch(err => {
          console.error("Fetch failed:", err);
          setAppointments([]);
        })
        .finally(() => setLoading(false));
    }
  }, [status, session, router]);

  const formatDate = (d) => d.split('-').reverse().join('/');
  const formatTime = (t) => t.slice(0, 5);

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return { color: '#f59e0b', text: 'PENDING' };
      case 'CONFIRMED': return { color: '#10b981', text: 'CONFIRMED' };
      case 'CANCELLED': return { color: '#dc2626', text: 'CANCELLED' };
      case 'COMPLETED': return { color: '#3b82f6', text: 'COMPLETED' };
      default: return { color: '#6b7280', text: status || 'UNKNOWN' };
    }
  };

  const handleBook = () => {
    localStorage.setItem('selectedPatient', JSON.stringify(patient));
    router.push('/appointment/book-appointment');
  };

  const handleBack = () => {
    localStorage.removeItem('selectedPatientForHistory');
    router.push('/appointment');
  };

  if (status === "loading" || loading) return <LoadingSpinner />;

  if (!patient) {
    return (
      <>
        <style jsx>{`
          @media (max-width: 640px) {
            .no-patient-card h2 { font-size: 1.8rem !important; }
            .no-patient-card button { padding: 1rem 2rem !important; font-size: 1.1rem !important; }
          }
        `}</style>
        <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #DBEAFE 0%, #C7D2FE 100%)', padding: '2rem' }}>
          <div className="no-patient-card" style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '3rem', borderRadius: '1.5rem', textAlign: 'center' }}>
            <h2 style={{ color: '#dc2626', fontSize: '2rem' }}>No Patient Selected</h2>
            <button onClick={handleBack} style={{ marginTop: '1rem', backgroundColor: '#3b82f6', color: 'white', padding: '1rem 2rem', borderRadius: '1rem', border: 'none', fontWeight: '700' }}>
              Back to Patients
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <style jsx>{`
        @media (max-width: 640px) {
          .history-header h1 { font-size: 2.5rem !important; }
          .history-header h2 { font-size: 1.8rem !important; margin: 0.8rem 0 !important; }
          .history-header p { font-size: 1.1rem !important; }
          .history-header button { padding: 0.8rem 1.5rem !important; font-size: 1rem !important; left: 1rem !important; }
          
          .appt-card { padding: 1.5rem !important; gap: 1.5rem !important; }
          .appt-card .grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
          .appt-card p { font-size: 1.1rem !important; margin: 0.5rem 0 !important; }
          .appt-card strong { font-size: 1.15rem !important; }
          .latest-badge { top: -14px !important; right: 20px !important; padding: 0.8rem 1.8rem !important; font-size: 1rem !important; }
          
          .no-appt-box { padding: 4rem 2rem !important; }
          .no-appt-box h3 { font-size: 1.8rem !important; }
          .no-appt-box p { font-size: 1.2rem !important; }
          .no-appt-box button { padding: 1.2rem 3rem !important; font-size: 1.3rem !important; }
          
          .book-next-btn {
            padding: 1.2rem 2rem !important;
            font-size: 1.4rem !important;
            width: 90% !important;
            max-width: 320px !important;
          }
        }
      `}</style>

      <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #DBEAFE 0%, #C7D2FE 100%)', padding: '1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: 'white', borderRadius: '2rem', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
          <div className="history-header" style={{ background: 'linear-gradient(to right, #1e40af, #3b82f6)', color: 'white', padding: '3rem 2rem', textAlign: 'center', position: 'relative' }}>
            <button onClick={handleBack} style={{
              position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '1rem', fontWeight: '700', backdropFilter: 'blur(10px)'
            }}>
              Back
            </button>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '900', margin: 0 }}>History</h1>
            <h2 style={{ fontSize: '2.2rem', margin: '1rem 0' }}>{patient.name}</h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1.3rem' }}>
              Age: {patient.age} • Visits: {appointments.length}
            </p>
          </div>

          <div style={{ padding: '2rem' }}>
            {appointments.length === 0 ? (
              <div className="no-appt-box" style={{ textAlign: 'center', padding: '6rem', backgroundColor: '#f0f9ff', borderRadius: '2rem', border: '4px dashed #0ea5e9' }}>
                <h3 style={{ fontSize: '2.2rem', color: '#0369a1', fontWeight: '800' }}>No Appointments Yet</h3>
                <p style={{ fontSize: '1.3rem', color: '#0c4a6e', margin: '1.5rem 0' }}>
                  {patient.name} has not visited yet.
                </p>
                <button onClick={handleBook} style={{
                  backgroundColor: '#10b981', color: 'white', padding: '1.5rem 4rem', borderRadius: '2rem', border: 'none', fontWeight: '900', fontSize: '1.6rem', boxShadow: '0 20px 40px rgba(16,185,129,0.3)'
                }}>
                  Book First Visit
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {appointments
                  .sort((a, b) => new Date(b.slot.slot_date) - new Date(a.slot.slot_date))
                  .map((appt, i) => {
                    const statusStyle = getStatusStyle(appt.status);
                    return (
                      <div key={appt.id} className="appt-card" style={{
                        backgroundColor: i === 0 ? '#ecfdf5' : '#f8fafc',
                        border: i === 0 ? '5px solid #10b981' : '3px solid #e2e8f0',
                        borderRadius: '1.5rem',
                        padding: '2rem',
                        position: 'relative',
                        boxShadow: i === 0 ? '0 25px 50px rgba(16,185,129,0.25)' : '0 10px 25px rgba(0,0,0,0.1)'
                      }}>
                        {i === 0 && (
                          <div className="latest-badge" style={{
                            position: 'absolute', top: '-18px', right: '30px',
                            backgroundColor: '#10b981', color: 'white', padding: '1rem 2.5rem',
                            borderRadius: '999px', fontWeight: '900', fontSize: '1.2rem', letterSpacing: '1px'
                          }}>
                            LATEST VISIT
                          </div>
                        )}
                        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                          <div>
                            <p style={{ fontSize: '1.2rem', margin: '0.8rem 0' }}>
                              <strong>Date:</strong> {formatDate(appt.slot.slot_date)}
                            </p>
                            <p style={{ fontSize: '1.2rem', margin: '0.8rem 0' }}>
                              <strong>Time:</strong> {formatTime(appt.slot.start_time)} - {formatTime(appt.slot.end_time)}
                            </p>
                            <p style={{ fontSize: '1.2rem', margin: '0.8rem 0' }}>
                              <strong>Status:</strong>{' '}
                              <span style={{ 
                                color: statusStyle.color,
                                fontWeight: '900', 
                                fontSize: '1.3rem'
                              }}>
                                {statusStyle.text}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '1.2rem', margin: '0.8rem 0' }}>
                              <strong>Doctor:</strong> Dr. {appt.doctor.name}
                            </p>
                            <p style={{ fontSize: '1.2rem', margin: '0.8rem 0' }}>
                              <strong>Specialization:</strong> {appt.doctor.specialization}
                            </p>
                            <p style={{ fontSize: '1.2rem', margin: '0.8rem 0' }}>
                              <strong>Fees:</strong> ₹{appt.price}
                            </p>
                          </div>
                        </div>
                        {(appt.reason || appt.notes) && (
                          <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '1rem', border: '2px solid #e5e7eb' }}>
                            {appt.reason && <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}><strong>Reason:</strong> {appt.reason}</p>}
                            {appt.notes && <p style={{ margin: '0.5rem 0', fontSize: '1.1rem' }}><strong>Notes:</strong> {appt.notes}</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

            {appointments.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <button 
                  onClick={handleBook} 
                  className="book-next-btn"
                  style={{
                    backgroundColor: '#3b82f6', 
                    color: 'white', 
                    padding: '2rem 7rem', 
                    borderRadius: '2rem', 
                    border: 'none', 
                    fontWeight: '900', 
                    fontSize: '2.2rem', 
                    boxShadow: '0 25px 50px rgba(59,130,246,0.4)', 
                    letterSpacing: '1px'
                  }}>
                  BOOK NEXT VISIT
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}