'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;


const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(to bottom right, #DBEAFE, #C7D2FE)',
  }}>
    <div style={{
      width: '3rem',
      height: '3rem',
      border: '4px dashed #3b82f6',
      borderRadius: '50%',
      borderTopColor: 'transparent',
      animation: 'spin 1s linear infinite'
    }} />
    <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ORIGINAL DESKTOP CARD — 100% UNCHANGED
const PatientCard = ({ patient, onSelectPatient, onViewHistory }) => {
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget || !e.target.closest('button')) {
          onViewHistory(patient);
        }
      }}
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
      </div>
    </div>
  );
};

export default function AppointmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push('/');
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.jwt) {
      setLoading(true);
      fetch(`${BACKEND_BASE_URL}/v1/patients`, {
        headers: { 'Authorization': `Bearer ${session.jwt}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(data => setPatients(data.patients || []))
        .catch(err => {
          setPatients([]);
          console.log("error: ", err)
          if(err.status==403) {
            router.push('/');
          }
          else if(err.status==417) {
            router.push('/add-details');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [status, session?.jwt]);

  const handleSelectPatient = (patient) => {
    localStorage.setItem('selectedPatient', JSON.stringify(patient));
    router.push('/appointment/book-appointment');
  };

  const handleViewHistory = (patient) => {
    localStorage.setItem('selectedPatient', JSON.stringify(patient));
    router.push('/appointment/history');
  };

  const handleShowAddPatientForm = () => router.push('/appointment/add-patient');

  if (status === "loading" || loading) return <LoadingSpinner />;

  if (status === "authenticated" && session) {
    return (
      <>
        <style jsx global>{`
          @keyframes spin { to { transform: rotate(360deg); } }

          /* MOBILE ONLY — FULLSCREEN, NO OUTER SPACE, WHITE BG PRESERVED */
          @media (max-width: 640px) {
            .mobile-fullscreen {
              margin: 0 !important;
              padding: 0 !important;
              min-height: 100vh !important;
              height: 100vh !important;
            }
            .mobile-container {
              margin: 0 !important;
              padding: 1rem !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              min-height: 100vh !important;
              background: rgba(255, 255, 255, 0.95) !important;
              backdrop-filter: blur(12px) !important;
              display: flex !important;
              flex-direction: column !important;
            }
            .mobile-header, .action-row, .patients-grid {
              margin-bottom: 1rem !important;
            }
            .patients-grid {
              gap: 0.8rem !important;
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

        <main className="mobile-fullscreen" style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #DBEAFE 0%, #C7D2FE 50%, #A78BFA 100%)',
          padding: '2rem',
        }}>
          <div className="mobile-container" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            padding: '2rem',
            borderRadius: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxWidth: '90rem',
            margin: '0 auto',
            minHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Header */}
            <div className="mobile-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '1rem',
            }}>
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                  Welcome, {session.user?.name}!
                </h2>
                <p style={{ color: '#6b7280', margin: '0.4rem 0 0', fontSize: '0.95rem' }}>
                  Select a patient to book
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '0.7rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem'
                }}
              >
                Sign Out
              </button>
            </div>

            {/* Action Row */}
            <div className="action-row" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                Your Patients ({patients.length})
              </h3>
              <button
                onClick={handleShowAddPatientForm}
                style={{
                  background: 'linear-gradient(to right, #3b82f6, #1d4ed8)',
                  color: '#ffffff',
                  padding: '0.7rem 1.2rem',
                  borderRadius: '0.7rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 14px rgba(59,130,246,0.4)'
                }}
              >
                + Add New Patient
              </button>
            </div>

            {/* Patients Grid */}
            <div className="patients-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem',
              flex: 1
            }}>
              {patients.length > 0 ? (
                patients.map((patient) => (
                  <PatientCard
                    key={patient.id}
                    patient={patient}
                    onSelectPatient={handleSelectPatient}
                    onViewHistory={handleViewHistory}
                  />
                ))
              ) : (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '4rem 1rem',
                  color: '#6b7280'
                }}>
                  <p style={{ fontSize: '1.1rem' }}>No patients yet.</p>
                  <button onClick={handleShowAddPatientForm} style={{
                    marginTop: '1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '0.8rem 2rem',
                    borderRadius: '0.7rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem'
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