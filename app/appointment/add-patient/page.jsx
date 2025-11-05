'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

// Form for adding a new patient
export default function AddPatientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    age: '',
    gender: 'Male',
    weight: '',
    height: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Create new patient
    const newPatient = { ...formData, id: Date.now() }; 
    
    // Get existing patients from localStorage
    const storedPatients = localStorage.getItem('patients') || '[]';
    const patients = JSON.parse(storedPatients);
    
    // Add new patient and save back to localStorage
    const updatedPatients = [...patients, newPatient];
    localStorage.setItem('patients', JSON.stringify(updatedPatients));
    
    // Go back to dashboard
    router.push('/appointment'); 
  };

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
        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem', margin: 0 }}>Add New Patient</h2>
        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          {/* Form fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Full Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="login-input" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="address" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Address</label>
              <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="login-input" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label htmlFor="age" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Age</label>
              <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} required className="login-input" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label htmlFor="gender" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Gender</label>
              <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="login-input" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box', height: '2.8rem', appearance: 'none', background: 'white url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0iY3VycmVudENvbG9yIiBhcmlhLWhpZGRlbj0idHJ1ZSI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNNS4yMyA3LjIzYS43NS43NSAwIDAxMS4wNiAwTDEwIDEwLjk0bDMuNzEtMy43MWEuNzUuNzUgMCAxMTEuMDYgMS4wNmwtNC4yNSA0LjI1YS43NS43NSAwIDAxLTEuMDYgMGwtNC4yNS00LjI1YS43NS43NSAwIDAxMC0xLjA2eiIgY2xpcC1ydWxlPSJldmVub2RkIiAvPjwvc3ZnPg==") no-repeat right 0.75rem center / 1.5em' }}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="weight" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Weight (kg)</label>
              <input type="number" name="weight" id="weight" value={formData.weight} onChange={handleChange} className="login-input" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label htmlFor="height" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Height (cm)</label>
              <input type="number" name="height" id="height" value={formData.height} onChange={handleChange} className="login-input" style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Form buttons */}
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
              id="save-button" // ID for hover/focus
              style={{
                width: '100%',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                fontWeight: '500',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              Save Patient
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};
