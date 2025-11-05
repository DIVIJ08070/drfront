'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// A simple loading spinner component
const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
    <div 
      className="loader-spin" // Class for animation
      style={{
        width: '4rem',
        height: '4rem',
        border: '4px dashed #3b82f6',
        borderRadius: '9999px',
      }}
    ></div>
  </div>
);

// Mock patient data for demonstration
const MOCK_PATIENTS = [
  { id: 1, name: 'Jane Doe', age: 45, gender: 'Female' },
  { id: 2, name: 'John Smith', age: 32, gender: 'Male' },
];

// Card for displaying a single patient
const PatientCard = ({ patient, onSelectPatient }) => (
  <div 
    id="patient-card" // ID for hover
    onClick={() => onSelectPatient(patient)}
    style={{
      backgroundColor: '#ffffff',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
  >
    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>{patient.name}</h3>
    <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>{patient.age} years old</p>
  </div>
);

// The main dashboard page shown after login
export default function AppointmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State to manage the list of patients
  const [patients, setPatients] = useState([]);

  // This effect checks for authentication status
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/');
    }
  }, [status, router]);

  // Load patients from localStorage on mount
  useEffect(() => {
    // Only run this if authenticated
    if (status === "authenticated") {
      const storedPatients = localStorage.getItem('patients');
      if (storedPatients) {
        setPatients(JSON.parse(storedPatients));
      } else {
        // If no patients in storage, use mock data
        setPatients(MOCK_PATIENTS);
        localStorage.setItem('patients', JSON.stringify(MOCK_PATIENTS));
      }
    }
  }, [status]); // Re-run when status changes

  // Log the full session (including any tokens) for debugging
  useEffect(() => {
    if (status === "authenticated" && session) {
      console.log('Full Session Data:', session);
      // If your NextAuth config includes the Google access token in the session (e.g., via callbacks),
      // it might be under session.accessToken, session.tokens.access_token, or similar.
      // Adjust the property name below based on your config.
      console.log('Google Access Token (if available):', session.accessToken || session.tokens?.access_token || 'Not found in session - check your NextAuth callbacks');
      console.log('Google ID Token (if available):', session.idToken || 'Not found in session - check your NextAuth callbacks');
    }
  }, [status, session]);

  // Handlers
  const handleShowAddPatientForm = () => {
    router.push('/appointment/add-patient');
  };

  const handleSelectPatient = (patient) => {
    // Save selected patient to localStorage so the next page can read it
    localStorage.setItem('selectedPatient', JSON.stringify(patient));
    router.push('/appointment/book-appointment');
  };

  // Show loading spinner while checking session
  if (status === "loading") {
    return <LoadingSpinner />;
  }

  // If authenticated, show the dashboard
  if (status === "authenticated" && session) {
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
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            width: '100%',
            maxWidth: '48rem', // Larger card for dashboard
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', margin: 0 }}>Welcome, {session.user?.name}!</h2>
              <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>Manage your patient appointments.</p>
            </div>
            <button
              id="signout-button-small" // ID for hover/focus
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background-color 0.2s',
              }}
            >
              Sign Out
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', margin: 0 }}>Your Patients</h3>
            <button
              id="add-patient-button" // ID for hover/focus
              onClick={handleShowAddPatientForm}
              style={{
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                padding: '0.625rem 1.25rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background-color 0.2s, transform 0.2s',
              }}
            >
              + Add New Patient
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {patients.length > 0 ? (
              patients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} onSelectPatient={handleSelectPatient} />
              ))
            ) : (
              <p style={{ color: '#6b7280', gridColumn: '1 / -1' }}>You haven't added any patients yet.</p>
            )}
          </div>
        </div>
      </main>
    );
  }

  // If status is "unauthenticated", useEffect will redirect
  return <LoadingSpinner />;
}