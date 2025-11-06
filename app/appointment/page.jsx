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

const PatientCard = ({ patient, onSelectPatient }) => (
  <div
    onClick={() => onSelectPatient(patient)}
    style={{
      backgroundColor: '#ffffff',
      padding: '1.5rem',  // REDUCED FROM 1.75rem
      borderRadius: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: '2px solid transparent',
      position: 'relative',
      overflow: 'hidden',
      height: 'fit-content',  // FIXED: no forced height
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
      fontSize: '1.25rem',  // SMALLER
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
      color: '#4b5563'
    }}>
      <p style={{ margin: 0 }}>Age: {patient.age} | Gender: {patient.gender || 'N/A'}</p>
      {patient.phone && <p style={{ margin: 0 }}>Phone: {patient.phone}</p>}
    </div>
    <div style={{
      marginTop: 'auto',
      paddingTop: '0.75rem',
      textAlign: 'right',
      opacity: 0,
      transition: 'opacity 0.3s'
    }}
    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
    onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
    >
      <span style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: '600' }}>
        Select →
      </span>
    </div>
  </div>
);

export default function AppointmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push('/');
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.jwt) {
      setPatientsLoading(true);
      fetch('https://medify-service-production.up.railway.app/v1/patients', {
        headers: { 'Authorization': `Bearer ${session.jwt}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setPatients(data.patients || []))
        .catch(() => setPatients([]))
        .finally(() => setPatientsLoading(false));
    }
  }, [status, session?.jwt]);

  const handleShowAddPatientForm = () => router.push('/appointment/add-patient');
  const handleSelectPatient = (patient) => {
    localStorage.setItem('selectedPatient', JSON.stringify(patient));
    router.push('/appointment/book-appointment');
  };

  if (status === "loading") return <LoadingSpinner />;

  if (status === "authenticated" && session) {
    return (
      <>
        <style jsx global>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          .loader-spin { animation: spin 1s linear infinite; }

          /* MOBILE PERFECTION — DESKTOP UNTOUCHED */
          @media (max-width: 768px) {
            .main-container {
              padding: 1rem !important;
              margin: 0 !important;
              border-radius: 1rem !important;
              max-width: 100vw !important;
            }
            .header-section {
              flex-direction: column !important;
              text-align: center !important;
              gap: 1rem !important;
            }
            .action-buttons {
              flex-direction: column !important;
              width: 100% !important;
            }
            .action-buttons button {
              width: 100% !important;
              padding: 1rem !important;
            }
            .patients-grid {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
            }
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
                  Welcome, {session.user?.name}!
                </h2>
                <p style={{ color: '#6b7280', margin: '0.5rem 0 0' }}>
                  Manage your patient appointments.
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
                Your Patients
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
              flex: 1
            }}>
              {patientsLoading ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                  <div className="loader-spin" style={{ width: '3rem', height: '3rem', border: '4px dashed #3b82f6', borderRadius: '50%', borderTopColor: 'transparent' }} />
                </div>
              ) : patients.length > 0 ? (
                patients.map((patient) => (
                  <PatientCard key={patient.id} patient={patient} onSelectPatient={handleSelectPatient} />
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