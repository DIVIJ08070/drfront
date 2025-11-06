'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AddDoctorPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    degree: '',
    specialization: '',
    experience: '',
    gender: 'MALE',
    phone_number: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Redirect non-admins
  if (status === "authenticated" && !session?.roles?.includes("ROLE_ADMIN")) {
    router.push("/appointment");
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.jwt) return alert("Not authenticated");

    setSubmitting(true);

    const payload = {
      ...formData,
      experience: parseInt(formData.experience) || 0,
    };

    try {
      const res = await fetch('https://medify-service-production.up.railway.app/v1/doctors', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Doctor added successfully!");
        router.push('/appointment/admin');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Failed: ${err.message || res.status}`);
      }
    } catch (error) {
      alert("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ width: '3rem', height: '3rem', border: '5px dashed #3b82f6', borderRadius: '50%', borderTopColor: 'transparent' }} />
      </div>
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
      <div style={{
        backgroundColor: '#ffffff',
        padding: '2.5rem 3rem',
        borderRadius: '1rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '36rem',
        boxSizing: 'border-box',
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}>
          Add New Doctor
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Name */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Dr. John Doe"
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' }}
              />
            </div>

            {/* Email */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="doctor@example.com"
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' }}
              />
            </div>

            {/* Degree */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Degree
              </label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                required
                placeholder="MBBS, MD"
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
              />
            </div>

            {/* Specialization */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Specialization
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
                placeholder="Neurology"
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
              />
            </div>

            {/* Experience */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Experience (years)
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                min="0"
                placeholder="10"
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
              />
            </div>

            {/* Gender */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  background: 'white',
                  fontSize: '1rem',
                }}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>

            {/* Phone */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                placeholder="9876543210"
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={() => router.push('/appointment/admin')}
              disabled={submitting}
              style={{
                width: '100%',
                backgroundColor: '#e5e7eb',
                color: '#374151',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {submitting ? 'Saving...' : 'Save Doctor'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}