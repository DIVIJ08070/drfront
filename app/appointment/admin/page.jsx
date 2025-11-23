'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [makeAdminEmail, setMakeAdminEmail] = useState("");

  useEffect(() => {
    if (status === "authenticated" && !session?.roles?.includes("ROLE_ADMIN")) {
      router.push("/appointment");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.jwt && session?.roles?.includes("ROLE_ADMIN")) {
      const fetchDoctors = async () => {
        setLoading(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/doctors`, {
            headers: { 'Authorization': `Bearer ${session.jwt}` }
          });
          if (res.ok) {
            const data = await res.json();
            setDoctors(data.doctors || []);
          }
        } catch (error) {
          console.error("Failed to fetch doctors:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDoctors();
    }
  }, [status, session]);

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const fetchSlots = async (doctorId, date) => {
    if (!doctorId || !date) {
      setSlots([]);
      return;
    }

    setSlotsLoading(true);
    setSlots([]);

    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/doctors/slots?doctorId=${doctorId}`;
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${session.jwt}` } });

      if (res.ok) {
        const data = await res.json();
        const allSlots = data.slots || [];
        const filtered = allSlots.filter(slot => slot.slot_date === date);
        setSlots(filtered);
      } else {
        setSlots([]);
        if(res.status==403) {
          router.push('/');
        }
        else if(res.status==417) {
          router.push('/add-details');
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate("");
    setSlots([]);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (selectedDoctor && date) {
      fetchSlots(selectedDoctor.id, date);
    } else {
      setSlots([]);
    }
  };

  const addSlot = async (start, end) => {
    const [year, month, day] = selectedDate.split('-');
    const apiDate = `${day}-${month}-${year}`;

    const payload = {
      doctor_id: selectedDoctor.id,
      time_slots: [{
        slot_date: apiDate,
        start_time: `${apiDate}:${start}`,
        end_time: `${apiDate}:${end}`,
        capacity: 30
      }]
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/doctors/slots`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.jwt}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Slot added!");
        fetchSlots(selectedDoctor.id, selectedDate);
      } else {
        const err = await res.text();
        if(res.status==403) {
          router.push('/');
        }
        else if(res.status==417) {
          router.push('/add-details');
        }
        else {
          alert("Failed: " + err);
        }
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const deleteSlot = async (slotId) => {
    if (!confirm("Delete?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/doctors/slots/${slotId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.jwt}` }
      });
      if (res.ok) {
        alert("Deleted!");
        fetchSlots(selectedDoctor.id, selectedDate);
      }
    } catch {
      alert("Error");
    }
  };

  const makeUserAdmin = async () => {
    const email = makeAdminEmail.trim();
    if (!email) return alert("Enter email");

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/auth/make-admin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.jwt}`,
        'email': email
      }
    });

    if (res.ok) {
      alert(`${email} is now ADMIN!`);
      setMakeAdminEmail("");
    } else {
      alert("Failed — check email or JWT");
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
        maxWidth: '1100px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: '#1e40af',
          color: 'white',
          padding: '2.5rem',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '900', margin: 0 }}>
            Admin Panel
          </h1>
        </div>

        <div style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
            <Link href="/appointment/admin/add-doctor">
              <button style={{ backgroundColor: '#10b981', color: 'white', padding: '1rem 2rem', borderRadius: '0.75rem', border: 'none', fontWeight: '700' }}>
                + Add Doctor
              </button>
            </Link>
          </div>

          <section style={{ backgroundColor: '#fef3c7', padding: '2rem', borderRadius: '1.5rem', marginBottom: '3rem', border: '3px dashed #f59e0b' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', margin: '0 0 1.5rem', color: '#92400e', textAlign: 'center' }}>
              Make User Admin
            </h2>
            <div style={{ display: 'flex', gap: '1rem', maxWidth: '600px', margin: '0 auto' }}>
              <input
                type="email"
                placeholder="user@gmail.com"
                value={makeAdminEmail}
                onChange={(e) => setMakeAdminEmail(e.target.value)}
                style={{ flex: 1, padding: '1rem', border: '3px solid #fbbf24', borderRadius: '1rem' }}
              />
              <button onClick={makeUserAdmin} style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '1rem',
                border: 'none',
                fontWeight: '700'
              }}>
                Make Admin
              </button>
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem', textAlign: 'center', color: '#111827' }}>
              Select Doctor
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {doctors.map(doctor => (
                <div
                  key={doctor.id}
                  style={{
                    backgroundColor: selectedDoctor?.id === doctor.id ? '#dbeafe' : '#f8fafc',
                    border: selectedDoctor?.id === doctor.id ? '4px solid #3b82f6' : '2px solid #e2e8f0',
                    padding: '1.8rem',
                    borderRadius: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: selectedDoctor?.id === doctor.id ? '0 10px 25px rgba(59, 130, 246, 0.25)' : '0 4px 12px rgba(0,0,0,0.08)',
                    position: 'relative'
                  }}
                >
                  <div onClick={() => handleDoctorSelect(doctor)}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: '#1e40af' }}>
                      Dr. {doctor.name}
                    </h3>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '1.1rem', color: '#4b5563' }}>
                      {doctor.specialization}
                    </p>
                  </div>

                  {/* NEW BUTTON - View Appointments */}
                  <button
                    onClick={() => router.push(`/appointment/admin/doctor-appointments/${doctor.id}`)}
                    style={{
                      marginTop: '1rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.75rem',
                      border: 'none',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      width: '100%',
                      boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
                    }}
                  >
                    View Appointments
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* YOUR ORIGINAL SLOT SECTION - 100% UNCHANGED */}
          {selectedDoctor && (
            <section style={{ backgroundColor: '#fffbeb', padding: '2.5rem', borderRadius: '1.5rem', border: '3px dashed #f59e0b' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 2rem', color: '#92400e', textAlign: 'center' }}>
                Dr. {selectedDoctor.name} - Slots
              </h2>

              <div style={{ maxWidth: '400px', margin: '0 auto 2rem' }}>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1.1rem',
                    border: '3px solid #fbbf24',
                    borderRadius: '1rem',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {selectedDate && (
                <>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    addSlot(e.target.start.value, e.target.end.value);
                    e.target.reset();
                  }} style={{ display: 'flex', gap: '0.8rem', maxWidth: '500px', margin: '0 auto 2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <input type="time" name="start" required style={{ padding: '0.8rem', border: '2px solid #d1d5db', borderRadius: '0.75rem' }} />
                    <input type="time" name="end" required style={{ padding: '0.8rem', border: '2px solid #d1d5db', borderRadius: '0.75rem' }} />
                    <button type="submit" style={{
                      backgroundColor: '#059669',
                      color: 'white',
                      padding: '0.8rem 1.8rem',
                      borderRadius: '0.75rem',
                      border: 'none',
                      fontWeight: '700'
                    }}>
                      Add
                    </button>
                  </form>

                  {slotsLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <div style={{ width: '2.5rem', height: '2.5rem', border: '4px solid #fbbf24', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                    </div>
                  ) : slots.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#fef3c7', borderRadius: '1rem' }}>
                      <p style={{ fontSize: '1.3rem', color: '#92400e', fontWeight: '600' }}>
                        No slots on {formatDisplayDate(selectedDate)}
                      </p>
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                      gap: '1rem',
                      padding: '0.5rem'
                    }}>
                      {slots.map(slot => (
                        <div key={slot.id} style={{
                          backgroundColor: '#ecfdf5',
                          border: '3px solid #10b981',
                          borderRadius: '1rem',
                          padding: '1rem',
                          textAlign: 'center',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          color: '#065f46',
                          position: 'relative',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                          <button onClick={() => deleteSlot(slot.id)} style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}>x</button>

                          <div style={{ marginBottom: '4px', fontSize: '0.8rem', opacity: 0.8 }}>
                            {formatDisplayDate(selectedDate)}
                          </div>
                          <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>
                            {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                          </div>
                          <div style={{
                            marginTop: '6px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: '700'
                          }}>
                            AVAILABLE
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}