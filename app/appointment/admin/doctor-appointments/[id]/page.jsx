'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9fafb' }}>
    <div style={{
      width: '3.5rem',
      height: '3.5rem',
      border: '5px solid #3b82f6',
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

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ADMIN CHECK
  useEffect(() => {
    if (status === "authenticated" && !session?.roles?.includes("ROLE_ADMIN")) {
      router.push("/appointment");
    }
  }, [status, session, router]);

  // ONLY 1 API CALL — NO DOCTOR FETCH
  const fetchAppointments = async (pageNum = 0) => {
    if (!doctorId || !session?.jwt) return;

    setLoading(true);
    const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/appointments/doctor/${doctorId}?page=${pageNum}&size=10&sort=slot.slotDate,desc&sort=slot.startTime,desc`;

    try {
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${session.jwt}` }
      });

      if (res.ok) {
        const data = await res.json();
        setAppointments(data.content || []);
        setTotalPages(data.totalPages || 1);
        setPage(data.pageable?.pageNumber || 0);
      } else {
        console.warn(`API returned ${res.status}`);
        setAppointments([]);
        if(res.status==403) {
          router.push('/');
        }
        else if(res.status==417) {
          router.push('/add-details');
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId && session?.jwt) {
      fetchAppointments(0);
    }
  }, [doctorId, session]);

  const formatDate = (d) => d ? d.split('-').reverse().join('/') : '-';
  const formatTime = (t) => t ? t.slice(0, 5) : '-';

  const getStatusBadge = (status) => {
    const colors = {
      PENDING: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
      CONFIRMED: { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
      CANCELLED: { bg: '#fee2e2', border: '#dc2626', text: '#991b1b' },
      COMPLETED: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' }
    };
    const style = colors[status] || { bg: '#f3f4f6', border: '#6b7280', text: '#374151' };

    return (
      <span style={{
        backgroundColor: style.bg,
        border: `2px solid ${style.border}`,
        color: style.text,
        padding: '0.5rem 1.2rem',
        borderRadius: '999px',
        fontSize: '0.85rem',
        fontWeight: '700',
        textTransform: 'uppercase'
      }}>
        {status}
      </span>
    );
  };

  if (status === "loading" || loading) return <LoadingSpinner />;
  if (!session?.roles?.includes("ROLE_ADMIN")) return null;

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #DBEAFE 0%, #C7D2FE 50%, #A78BFA 100%)',
      padding: '1rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '1.5rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        overflow: 'hidden'
      }}>
        {/* Header — NO DOCTOR NAME NEEDED */}
        <div style={{
          background: 'linear-gradient(to right, #1e40af, #3b82f6)',
          color: 'white',
          padding: '2rem',
          textAlign: 'center',
          position: 'relative'
        }}>
          <button
            onClick={() => router.push('/appointment/admin')}
            style={{
              position: 'absolute',
              left: '1.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255,255,255,0.25)',
              color: 'white',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '0.7rem',
              fontWeight: '700',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              fontSize: '0.9rem'
            }}
          >
            Back
          </button>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', margin: 0 }}>
            Doctor Appointments
          </h1>
          <p style={{ fontSize: '1.2rem', margin: '0.5rem 0 0', opacity: 0.9 }}>
            ID: {doctorId}
          </p>
        </div>

        <div style={{ padding: '2rem' }}>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ width: '3rem', height: '3rem', border: '5px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#fefce8', borderRadius: '1.5rem', border: '3px dashed #f59e0b' }}>
              <p style={{ fontSize: '1.4rem', color: '#92400e', fontWeight: '700' }}>
                No appointments for Doctor ID: {doctorId}
              </p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto', borderRadius: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1e40af', color: 'white' }}>
                      <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '0.95rem' }}>Patient</th>
                      <th style={{ padding: '1.2rem', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '1.2rem', textAlign: 'left' }}>Time</th>
                      <th style={{ padding: '1.2rem', textAlign: 'left' }}>Reason</th>
                      <th style={{ padding: '1.2rem', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '1.2rem', textAlign: 'left' }}>Fees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appt, i) => (
                      <tr key={appt.id} style={{ backgroundColor: i % 2 === 0 ? '#f8fafc' : 'white', borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '1.2rem', fontWeight: '700', color: '#1e40af' }}>
                          {appt.patient?.name || 'Unknown'}
                        </td>
                        <td style={{ padding: '1.2rem', fontWeight: '600' }}>
                          {formatDate(appt.slot?.slot_date)}
                        </td>
                        <td style={{ padding: '1.2rem' }}>
                          {formatTime(appt.slot?.start_time)} - {formatTime(appt.slot?.end_time)}
                        </td>
                        <td style={{ padding: '1.2rem' }}>
                          {appt.reason || '-'}
                        </td>
                        <td style={{ padding: '1.2rem' }}>
                          {getStatusBadge(appt.status)}
                        </td>
                        <td style={{ padding: '1.2rem', fontWeight: '700' }}>
                          ₹{appt.price || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginTop: '1.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => fetchAppointments(page - 1)}
                  disabled={page === 0}
                  style={{
                    padding: '0.8rem 1.5rem',
                    backgroundColor: page === 0 ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.7rem',
                    fontWeight: '700',
                    fontSize: '0.9rem'
                  }}
                >
                  Prev
                </button>
                <span style={{ fontSize: '1rem', fontWeight: '600', color: '#374151' }}>
                  Page {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => fetchAppointments(page + 1)}
                  disabled={page >= totalPages - 1}
                  style={{
                    padding: '0.8rem 1.5rem',
                    backgroundColor: page >= totalPages - 1 ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.7rem',
                    fontWeight: '700',
                    fontSize: '0.9rem'
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