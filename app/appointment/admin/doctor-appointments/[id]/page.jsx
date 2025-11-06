'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' }}>
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

export default function DoctorAppointments() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const doctorId = params.id;

  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState({});
  const [loading, setLoading] = useState(true);
  const [apptsLoading, setApptsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === "authenticated" && !session?.roles?.includes("ROLE_ADMIN")) {
      router.push("/appointment");
    }
  }, [status, session, router]);

  // Fetch Doctor Name
  useEffect(() => {
    if (status === "authenticated" && session?.jwt && doctorId) {
      const fetchDoctor = async () => {
        try {
          const res = await fetch(`https://medify-service-production.up.railway.app/v1/doctors/${doctorId}`, {
            headers: { 'Authorization': `Bearer ${session.jwt}` }
          });
          if (res.ok) {
            const data = await res.json();
            setDoctor(data);
          }
        } catch (err) {
          console.error("Failed to fetch doctor");
        }
      };
      fetchDoctor();
    }
  }, [doctorId, session, status]);

  // Fetch Patient Name
  const fetchPatientName = async (patientId) => {
    if (patients[patientId]) return patients[patientId];
    try {
      const res = await fetch(`https://medify-service-production.up.railway.app/v1/patients/${patientId}`, {
        headers: { 'Authorization': `Bearer ${session.jwt}` }
      });
      if (res.ok) {
        const data = await res.json();
        const name = data.name || "Unknown Patient";
        setPatients(prev => ({ ...prev, [patientId]: name }));
        return name;
      }
    } catch {}
    return "Loading...";
  };

  // Fetch Appointments
  const fetchAppointments = async (pageNum = 0) => {
    if (!doctorId) return;
    setApptsLoading(true);
    setAppointments([]);

    const url = `https://medify-service-production.up.railway.app/v1/appointments/doctor/${doctorId}?page=${pageNum}&size=8&sort=slot.slotDate,desc&sort=slot.startTime,desc`;

    try {
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${session.jwt}` }
      });

      if (res.ok) {
        const data = await res.json();
        const appts = data.content || [];
        setTotalPages(data.totalPages || 1);
        setPage(data.pageable.pageNumber);

        const resolved = await Promise.all(
          appts.map(async (appt) => ({
            ...appt,
            patientName: await fetchPatientName(appt.patient_id || appt.patient?.id || 0)
          }))
        );
        setAppointments(resolved);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setApptsLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId && session?.jwt) {
      fetchAppointments(0);
    }
  }, [doctorId, session]);

  const formatDate = (d) => d.split('-').reverse().join('/');
  const formatTime = (t) => t.slice(0, 5);

  if (status === "loading" || loading) return <LoadingSpinner />;
  if (!session?.roles?.includes("ROLE_ADMIN")) return null;

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #DBEAFE, #C7D2FE)',
      padding: '2rem 1rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#1e40af',
          color: 'white',
          padding: '2.5rem',
          textAlign: 'center',
          position: 'relative'
        }}>
          <button
            onClick={() => router.push('/appointment/admin')}
            style={{
              position: 'absolute',
              left: '2rem',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)'
            }}
          >
            Back to Admin
          </button>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '900', margin: 0 }}>
            Appointments
          </h1>
          {doctor && (
            <p style={{ fontSize: '1.6rem', margin: '1rem 0 0', opacity: 0.9 }}>
              Dr. {doctor.name} • {doctor.specialization}
            </p>
          )}
        </div>

        <div style={{ padding: '2.5rem' }}>

          {apptsLoading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ width: '3rem', height: '3rem', border: '6px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#fef3c7', borderRadius: '1.5rem', border: '3px dashed #f59e0b' }}>
              <p style={{ fontSize: '1.8rem', color: '#92400e', fontWeight: '700' }}>
                No appointments booked yet
              </p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1e40af', color: 'white' }}>
                      <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '1.1rem' }}>Date</th>
                      <th style={{ padding: '1.5rem', textAlign: 'left' }}>Time</th>
                      <th style={{ padding: '1.5rem', textAlign: 'left' }}>Patient</th>
                      <th style={{ padding: '1.5rem', textAlign: 'left' }}>Reason</th>
                      <th style={{ padding: '1.5rem', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '1.5rem', textAlign: 'left' }}>Fees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appt, i) => (
                      <tr key={appt.id} style={{ backgroundColor: i % 2 === 0 ? '#f8fafc' : '#ffffff', borderBottom: '2px solid #e2e8f0' }}>
                        <td style={{ padding: '1.5rem', fontWeight: '700' }}>{formatDate(appt.slot.slot_date)}</td>
                        <td style={{ padding: '1.5rem' }}>{formatTime(appt.slot.start_time)} - {formatTime(appt.slot.end_time)}</td>
                        <td style={{ padding: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                          {appt.patientName}
                        </td>
                        <td style={{ padding: '1.5rem' }}>{appt.reason || "-"}</td>
                        <td style={{ padding: '1.5rem' }}>
                          <span style={{
                            backgroundColor: appt.payment_status === 'PAID' ? '#10b981' : '#dc2626',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '999px',
                            fontWeight: '700',
                            fontSize: '0.9rem'
                          }}>
                            {appt.payment_status}
                          </span>
                        </td>
                        <td style={{ padding: '1.5rem', fontWeight: '700' }}>₹{appt.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', alignItems: 'center' }}>
                <button
                  onClick={() => fetchAppointments(page - 1)}
                  disabled={page === 0}
                  style={{
                    padding: '1rem 2rem',
                    backgroundColor: page === 0 ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontWeight: '700',
                    cursor: page === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1f2937' }}>
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => fetchAppointments(page + 1)}
                  disabled={page >= totalPages - 1}
                  style={{
                    padding: '1rem 2rem',
                    backgroundColor: page >= totalPages - 1 ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontWeight: '700',
                    cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}