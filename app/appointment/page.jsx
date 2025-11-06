'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(to bottom right, #DBEAFE, #C7D2FE)',
  }}>
    <div className="loader-spin" style={{
      width: '4rem',
      height: '4rem',
      border: '4px dashed #3b82f6',
      borderRadius: '50%',
      borderTopColor: 'transparent',
    }} />
  </div>
);

const PatientCard = ({ patient, onSelectPatient, onViewHistory, appointments = [] }) => {
  // Get patient's past appointments
  const patientAppts = appointments.filter(a => 
    a.reason?.includes(patient.name) || 
    a.notes?.includes(patient.name) ||
    a.reason?.toLowerCase().includes(patient.name.toLowerCase())
  );

  const hasHistory = patientAppts.length > 0;
  const lastVisit = hasHistory ? patientAppts[0] : null;

  const handleCardClick = (e) => {
    // Only trigger if the click is directly on the card, not on buttons
    if (e.target === e.currentTarget || e.target.closest('button') === null) {
      onViewHistory(patient, patientAppts);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '2px solid transparent',
        position: 'relative',
        overflow: 'hidden',
        height: 'fit-content',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        e.currentTarget.style.borderColor = '#3b82f6';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#111827',
        margin: '0 0 0.5rem 0',
        lineHeight: '1.3'
      }}>
        {patient.name}
      </h3>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.35rem',
        fontSize: '0.875rem',
        color: '#4b5563',
        marginBottom: '0.75rem'
      }}>
        <p style={{ margin: 0 }}>Age: {patient.age}</p>
        {patient.phone && <p style={{ margin: 0 }}>Phone: {patient.phone}</p>}
      </div>

      {/* HISTORY BADGE */}
      {hasHistory && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '2px solid #10b981',
          borderRadius: '0.75rem',
          padding: '0.5rem 0.75rem',
          marginBottom: '0.75rem',
          fontSize: '0.8rem',
          fontWeight: '600',
          color: '#065f46'
        }}>
          Last Visit: Dr. {lastVisit.doctor.name} • {lastVisit.slot.start_time.slice(0,5)}
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginTop: 'auto'
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectPatient(patient);
          }}
          style={{
            flex: 1,
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.6rem',
            borderRadius: '0.75rem',
            border: 'none',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          Book Appointment
        </button>
        
        {hasHistory && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewHistory(patient, patientAppts);
            }}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '0.6rem 0.8rem',
              borderRadius: '0.75rem',
              border: 'none',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            History
          </button>
        )}
      </div>
    </div>
  );
};

export default function AppointmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push('/');
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.jwt) {
      setPatientsLoading(true);

      // Fetch Patients
      fetch('https://medify-service-production.up.railway.app/v1/patients', {
        headers: { 'Authorization': `Bearer ${session.jwt}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setPatients(data.patients || []))
        .catch(() => setPatients([]));

      // Fetch All Appointments (for history)
      fetch('https://medify-service-production.up.railway.app/v1/appointments', {
        headers: { 'Authorization': `Bearer ${session.jwt}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setAppointments(data.appointments || []))
        .catch(() => setAppointments([]))
        .finally(() => setPatientsLoading(false));
    }
  }, [status, session?.jwt]);

  const handleShowAddPatientForm = () => router.push('/appointment/add-patient');
  
  const handleSelectPatient = (patient) => {
    localStorage.setItem('selectedPatient', JSON.stringify(patient));
    router.push('/appointment/book-appointment');
  };

  const handleViewHistory = (patient, patientAppointments) => {
    localStorage.setItem('selectedPatient', JSON.stringify(patient));
    localStorage.setItem('patientAppointments', JSON.stringify(patientAppointments));
    router.push('/appointment/history');
  };

  if (status === "loading") return <LoadingSpinner />;

  if (status === "authenticated" && session) {
    return (
      <>
        <style jsx global>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          .loader-spin { animation: spin 1s linear infinite; }

          @media (max-width: 768px) {
            .main-container { padding: 1rem !important; border-radius: 1rem !important; }
            .header-section { flex-direction: column !important; text-align: center !important; }
            .action-buttons { flex-direction: column !important; width: 100% !important; }
            .action-buttons button { width: 100% !important; padding: 1rem !important; }
            .patients-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
          }
        `}</style>

        <main style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #DBEAFE 0%, #C7D2FE 50%, #A78BFA 100%)',
          padding: '2rem',
          boxSizing: 'border-box',
        }}>
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          }} />

          <div className="main-container" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            padding: '2.5rem',
            borderRadius: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxWidth: '90rem',
            margin: '0 auto',
            minHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Header */}
            <div className="header-section" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h2 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                  Welcome, Dr. {session.user?.name}!
                </h2>
                <p style={{ color: '#6b7280', margin: '0.5rem 0 0' }}>
                  Select a patient to book appointment
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Sign Out
              </button>
            </div>

            {/* Patients Header */}
            <div className="action-buttons" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                Your Patients ({patients.length})
              </h3>
              <button
                onClick={handleShowAddPatientForm}
                style={{
                  background: 'linear-gradient(to right, #3b82f6, #1d4ed8)',
                  color: '#ffffff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
                }}
              >
                + Add New Patient
              </button>
            </div>

            {/* Grid */}
            <div className="patients-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem',
              flex: 1
            }}>
              {patientsLoading ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                  <div className="loader-spin" style={{ width: '3rem', height: '3rem', border: '4px dashed #3b82f6', borderRadius: '50%', borderTopColor: 'transparent' }} />
                </div>
              ) : patients.length > 0 ? (
                patients.map((patient) => (
                  <PatientCard 
                    key={patient.id} 
                    patient={patient} 
                    onSelectPatient={handleSelectPatient}
                    onViewHistory={handleViewHistory}
                    appointments={appointments}
                  />
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
                  <p style={{ fontSize: '1.1rem' }}>No patients yet.</p>
                  <button onClick={handleShowAddPatientForm} style={{
                    marginTop: '1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '0.75rem 2rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}>
                    Add Your First Patient
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </>
    );
  }

  return <LoadingSpinner />;
}