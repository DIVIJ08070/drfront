'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

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
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === "authenticated" && !session?.roles?.includes("ROLE_ADMIN")) {
      router.push("/appointment");
    }
  }, [status, session, router]);

  // Fetch Doctor
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

  // Fetch Appointments
  const fetchAppointments = async (pageNum = 0) => {
    if (!doctorId) return;
    setLoading(true);

    const url = `https://medify-service-production.up.railway.app/v1/appointments/doctor/${doctorId}?page=${pageNum}&size=10&sort=slot.slotDate,desc&sort=slot.startTime,desc`;

    try {
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${session.jwt}` }
      });

      if (res.ok) {
        const data = await res.json();
        setAppointments(data.content || []);
        setTotalPages(data.totalPages || 1);
        setPage(data.pageable.pageNumber);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'CONFIRMED': return '#10b981';
      case 'CANCELLED': return '#dc2626';
      case 'COMPLETED': return '#3b82f6';
      default: return '#6b7280';
    }
  };

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
        maxWidth: '1300px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '2rem',
        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(to right, #1e40af, #3b82f6)',
          color: 'white',
          padding: '3rem',
          textAlign: 'center',
          position: 'relative'
        }}>
          <button
            onClick={() => router.push('/appointment/admin')}
            style={{
              position: 'absolute',
              left: '2.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255,255,255,0.25)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '1rem',
              fontWeight: '900',
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
          >
            Back
          </button>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>
            Doctor Appointments
          </h1>
          {doctor && (
            <p style={{ fontSize: '2rem', margin: '1rem 0 0', opacity: 0.95, fontWeight: '700' }}>
              Dr. {doctor.name} • {doctor.specialization}
            </p>
          )}
        </div>

        <div style={{ padding: '3rem' }}>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem' }}>
              <div style={{ width: '4rem', height: '4rem', border: '6px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '6rem', backgroundColor: '#fefce8', borderRadius: '2rem', border: '5px dashed #f59e0b' }}>
              <h3 style={{ fontSize: '2.5rem', color: '#92400e', fontWeight: '900', margin: '0 0 1rem' }}>
                No Appointments Yet
              </h3>
              <p style={{ fontSize: '1.5rem', color: '#a16207' }}>
                Dr. {doctor?.name} has no bookings
              </p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto', borderRadius: '1.5rem', boxShadow: '0 15px 35px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(to right, #1e40af, #3b82f6)', color: 'white' }}>
                      <th style={{ padding: '1.8rem', textAlign: 'left', fontSize: '1.2rem', fontWeight: '800' }}>Patient</th>
                      <th style={{ padding: '1.8rem', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '1.8rem', textAlign: 'left' }}>Time</th>
                      <th style={{ padding: '1.8rem', textAlign: 'left' }}>Reason</th>
                      <th style={{ padding: '1.8rem', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '1.8rem', textAlign: 'left' }}>Fees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appt, i) => (
                      <tr key={appt.id} style={{ 
                        backgroundColor: i % 2 === 0 ? '#f8fafc' : '#ffffff', 
                        borderBottom: '3px solid #e2e8f0',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ecfdf5'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#f8fafc' : '#ffffff'}
                      >
                        <td style={{ padding: '1.8rem', fontWeight: '800', color: '#1e40af', fontSize: '1.1rem' }}>
                          {appt.patient.name}
                        </td>
                        <td style={{ padding: '1.8rem', fontWeight: '700' }}>
                          {formatDate(appt.slot.slot_date)}
                        </td>
                        <td style={{ padding: '1.8rem' }}>
                          {formatTime(appt.slot.start_time)} - {formatTime(appt.slot.end_time)}
                        </td>
                        <td style={{ padding: '1.8rem', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {appt.reason || "-"}
                        </td>
                        <td style={{ padding: '1.8rem' }}>
                          <span style={{
                            backgroundColor: getStatusColor(appt.status),
                            color: 'white',
                            padding: '0.7rem 1.5rem',
                            borderRadius: '999px',
                            fontWeight: '900',
                            fontSize: '1rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                          }}>
                            {appt.status}
                          </span>
                        </td>
                        <td style={{ padding: '1.8rem', fontWeight: '900', color: '#065f46', fontSize: '1.2rem' }}>
                          ₹{appt.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '3rem', alignItems: 'center' }}>
                <button
                  onClick={() => fetchAppointments(page - 1)}
                  disabled={page === 0}
                  style={{
                    padding: '1.2rem 3rem',
                    backgroundColor: page === 0 ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '1rem',
                    fontWeight: '900',
                    fontSize: '1.2rem',
                    cursor: page === 0 ? 'not-allowed' : 'pointer',
                    boxShadow: '0 10px 30px rgba(59,130,246,0.4)'
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1f2937' }}>
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => fetchAppointments(page + 1)}
                  disabled={page >= totalPages - 1}
                  style={{
                    padding: '1.2rem 3rem',
                    backgroundColor: page >= totalPages - 1 ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '1rem',
                    fontWeight: '900',
                    fontSize: '1.2rem',
                    cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                    boxShadow: '0 10px 30px rgba(16,185,129,0.4)'
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