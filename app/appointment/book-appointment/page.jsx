'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

/* ---------- Loading spinner ---------- */
const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(to bottom right, #DBEAFE, #C7D2FE)' }}>
    <div style={{ width: '4rem', height: '4rem', border: '6px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
    <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

/* ---------- PayU endpoints selection ---------- */
// Use NEXT_PUBLIC_PAYU_ENV = 'test' (default) or 'prod'
const PAYU_ENDPOINTS = {
  test: 'https://test.payu.in/_payment',
  prod: 'https://secure.payu.in/_payment'
};

/* ---------- Main component ---------- */
export default function BookAppointmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patient, setPatient] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState({ reason: "", notes_internal: "" });

  // After booking: terms & payment modal
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [justBookedAppointment, setJustBookedAppointment] = useState(null); // appointment object from backend
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Refs
  const dateSectionRef = useRef(null);
  const bookingFormRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push('/');
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.jwt) {
      const saved = localStorage.getItem('selectedPatient');
      if (!saved) {
        router.push('/appointment');
        return;
      }
      const patientData = JSON.parse(saved);
      setPatient(patientData);

      const fetchDoctors = async () => {
        setLoading(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/doctors`, {
            headers: { 'Authorization': `Bearer ${session.jwt}` }
          });
          if (res.ok) {
            const data = await res.json();
            setDoctors(data.doctors || []);
          } else if (res.status == 403) {
            router.push('/');
          } else if (res.status == 417) {
            router.push('/add-details');
          }
        } catch (err) {
          console.error("Failed to fetch doctors", err);
        } finally {
          setLoading(false);
        }
      };
      fetchDoctors();
    }
  }, [status, session, router]);

  const normalizeDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split('-');
    const [a, b, c] = parts.map(Number);
    if (a > 2000) return `${a}-${String(b).padStart(2,'0')}-${String(c).padStart(2,'0')}`;
    if (c > 2000) return `${c}-${String(b).padStart(2,'0')}-${String(a).padStart(2,'0')}`;
    return dateStr;
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    if (!doctorId || !date) {
      setAvailableSlots([]);
      return;
    }
    setSlotsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/doctors/slots?doctorId=${doctorId}`, {
        headers: { 'Authorization': `Bearer ${session.jwt}` }
      });
      if (res.ok) {
        const data = await res.json();
        const target = normalizeDate(date);
        const filtered = (data.slots || [])
          .filter(s => s.available && normalizeDate(s.slot_date) === target)
          .map(s => ({
            ...s,
            dateFormatted: normalizeDate(s.slot_date).split('-').reverse().join('/'),
            startTime: s.start_time.slice(0, 5),
            endTime: s.end_time.slice(0, 5)
          }));
        setAvailableSlots(filtered);
      } else if (res.status == 403) {
        router.push('/');
      } else if (res.status == 417) {
        router.push('/add-details');
      }
    } catch (err) {
      console.error("Failed to fetch slots", err);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  // SCROLL HELPERS
  const scrollToDatePicker = () => {
    if (!dateSectionRef.current || !contentRef.current) return;
    const headerOffset = window.innerWidth <= 640 ? 160 : 200;
    const elementPosition = dateSectionRef.current.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - headerOffset;
    contentRef.current.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  };
  const scrollToConfirmForm = () => {
    if (!bookingFormRef.current || !contentRef.current) return;
    const headerOffset = window.innerWidth <= 640 ? 140 : 180;
    const elementPosition = bookingFormRef.current.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - headerOffset;
    contentRef.current.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate("");
    setAvailableSlots([]);
    setSelectedSlot(null);
    setShowBookingForm(false);
    setTimeout(scrollToDatePicker, 100);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSlot(null);
    setShowBookingForm(false);
    if (selectedDoctor) fetchAvailableSlots(selectedDoctor.id, date);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setShowBookingForm(true);
    setTimeout(scrollToConfirmForm, 150);
  };

  // parse response safely
  const tryParseJson = async (res) => {
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { return txt; }
  };

  /* ---------- BOOK APPOINTMENT ---------- */
  const handleBookAppointment = async () => {
    if (!appointmentDetails.reason.trim()) return;

    setBookingLoading(true);
    try {
      // Re-validate slot
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/doctors/slots?doctorId=${selectedDoctor.id}`, {
        headers: { 'Authorization': `Bearer ${session.jwt}` }
      });
      if (res.ok) {
        const data = await res.json();
        const slot = data.slots.find(s => s.id === selectedSlot.id);
        if (!slot || !slot.available) {
          alert("Slot no longer available. Please choose another.");
          fetchAvailableSlots(selectedDoctor.id, selectedDate);
          setSelectedSlot(null);
          setShowBookingForm(false);
          setBookingLoading(false);
          return;
        }
      } else if (res.status == 403) {
        router.push('/');
        return;
      } else if (res.status == 417) {
        router.push('/add-details');
        return;
      }

      const payload = {
        doctor_id: selectedDoctor.id,
        slot_id: selectedSlot.id,
        patient_id: patient.id,
        reason: appointmentDetails.reason.trim(),
        notes_internal: appointmentDetails.notes_internal.trim()
      };

      const storageKey = `appt:${payload.patient_id}:slot:${payload.slot_id}:idempotencyKey`;
      let idempotencyKey = localStorage.getItem(storageKey);
      if (!idempotencyKey) {
        idempotencyKey = (typeof crypto !== 'undefined' && crypto.randomUUID)
          ? crypto.randomUUID()
          : 'idemp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
        localStorage.setItem(storageKey, idempotencyKey);
      }

      const bookRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.jwt}`,
          'X-Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(payload)
      });

      if (bookRes.ok) {
        const booked = await tryParseJson(bookRes);
        localStorage.removeItem(storageKey);

        // Helpers to safely read nested fields
        const serverSlot = booked && booked.slot ? booked.slot : null;
        const serverDate = serverSlot?.slot_date || booked?.slot_date || booked?.date || null;

        // normalize time strings like "02:00:00" -> "02:00"
        const normalizeTime = (t) => {
          if (!t) return null;
          return t.length >= 5 ? t.slice(0,5) : t;
        };

        const serverTime = (serverSlot && (serverSlot.start_time || serverSlot.end_time))
    ? `${normalizeTime(serverSlot.start_time)} - ${normalizeTime(serverSlot.end_time)}`
    : (booked?.time || booked?.slot_time || null);

        const appointmentObj = (booked && booked.id) ? booked : {
          id: (booked && booked.appointmentId) ? booked.appointmentId : null,
          doctor_id: selectedDoctor.id,
          slot_id: selectedSlot.id,
          patient_id: patient.id,
           // human-friendly date/time with fallbacks
          date: serverDate ? (
            // prefer server date in yyyy-mm-dd, convert to dd/mm/yyyy for display
            serverDate.includes('-') ? serverDate.split('-').reverse().join('/') : serverDate
          ) : (selectedSlot?.dateFormatted || null),

          time: serverTime || (selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : null),
            raw: booked
        };

        console.log("slots"+selectedSlot.dateFormatted)
        setJustBookedAppointment(appointmentObj);
        setShowTermsModal(true);
        // don't navigate away; let user decide to pay now or later
      } else {
        const err = await tryParseJson(bookRes);
        localStorage.removeItem(storageKey);
        const message = (err && err.message) ? err.message : (typeof err === 'string' ? err : 'Booking failed');
        alert("Failed to book: " + message);
      }
    } catch (err) {
      console.log("Error: ", err);
      alert("Network error. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  /* ---------- PAYU PAYMENT (client side) ---------- */
  // choose endpoint
  const payuEnv = (process.env.NEXT_PUBLIC_PAYU_ENV || 'test').toLowerCase();
  const payuEndpoint = PAYU_ENDPOINTS[payuEnv === 'prod' ? 'prod' : 'test'];

  // post hidden form to PayU
  const postFormToUrl = (actionUrl, params) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = actionUrl;
    form.style.display = 'none';

    Object.entries(params).forEach(([k, v]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = k;
      input.value = v == null ? '' : String(v);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    setTimeout(() => form.remove(), 1500);
  };

  // Initiate payment: call your backend and submit to PayU _payment endpoint
  const handleInitiatePayment = async () => {
    if (!justBookedAppointment || !justBookedAppointment.id) {
      setPaymentError("Appointment ID unavailable. Please contact support.");
      return;
    }
    setPaymentError(null);
    setPaymentLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/v1/payments/initiateTransaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.jwt}`,
          'appointment_id': justBookedAppointment.id
        },
        body: JSON.stringify({})
      });

      if (!res.ok) {
        const err = await tryParseJson(res);
        const msg = (err && err.message) ? err.message : `Payment initiation failed (HTTP ${res.status})`;
        setPaymentError(msg);
        setPaymentLoading(false);
        return;
      }

      const dto = await res.json();

      // Build PayU payload from backend DTO (must include server-generated hash)
      const payuPayload = {
        key: dto.key || '',
        txnid: dto.txnid || '',
        amount: dto.amount != null ? String(dto.amount) : '',
        productinfo: dto.productinfo || '',
        firstname: dto.firstname || '',
        email: dto.email || '',
        phone: dto.phone || '',
        udf1: dto.udf1 ?? '',
        udf2: dto.udf2 ?? '',
        udf3: dto.udf3 ?? '',
        udf4: dto.udf4 ?? '',
        udf5: dto.udf5 ?? '',
        hash: dto.hash || '',
        // success / failure redirect (optional overrides from backend)
        surl: dto.surl || `${window.location.origin}/payu/success`,
        furl: dto.furl || `${window.location.origin}/payu/failure`
      };

      // Validate
      if (!payuPayload.key || !payuPayload.txnid || !payuPayload.amount || !payuPayload.hash) {
        setPaymentError('Invalid payment response from server. Missing key/txnid/amount/hash.');
        setPaymentLoading(false);
        return;
      }

      // Submit to PayU
      postFormToUrl(payuEndpoint, payuPayload);
      // navigation will occur; don't set loading false here
    } catch (err) {
      console.error('Payment initiation error', err);
      setPaymentError('Network error while initiating payment. Try again.');
      setPaymentLoading(false);
    }
  };

  // Pay later
  const handlePayLater = () => {
    setShowTermsModal(false);
    alert('Appointment confirmed. You can pay later from your Appointments page.');
    router.push('/appointment');
  };

  /* ---------- RENDER ---------- */
  if (status === "loading" || loading) return <LoadingSpinner />;

  return (
    <>
      <style jsx>{`
        @media (max-width: 640px) {
          .mobile-fullscreen { padding: 0 !important; }
          .mobile-container { 
            max-width: 100% !important; margin: 0 !important; border-radius: 0 !important; 
            box-shadow: none !important; height: 100vh !important; display: flex !important; 
            flex-direction: column !important; overflow: hidden !important;
          }
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(2,6,23,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        .modal {
          background: white;
          border-radius: 1rem;
          max-width: 760px;
          width: 95%;
          padding: 1.5rem;
          box-shadow: 0 30px 60px rgba(2,6,23,0.4);
        }
        .terms-list { margin: 0; padding-left: 1.2rem; color: #0f172a; }
        .terms-list li { margin: 0.6rem 0; font-weight: 600; }
        .tc-note { margin-top: 0.6rem; font-size: 0.95rem; color: #334155; }
      `}</style>

      <main className="mobile-fullscreen" style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #DBEAFE, #C7D2FE)', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
        <div className="mobile-container" style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: 'white', borderRadius: '2rem', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
          
          {/* Header */}
          <div className="mobile-header" style={{ background: 'linear-gradient(to right, #1e40af, #3b82f6)', color: 'white', padding: '3rem', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => router.push('/appointment')} style={{
              position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', border: 'none', padding: '1rem 2rem',
              borderRadius: '1rem', fontWeight: '700', backdropFilter: 'blur(10px)', cursor: 'pointer'
            }}>
              Patients
            </button>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '900', margin: 0 }}>Book Appointment</h1>
            <p style={{ fontSize: '1.5rem', margin: '1rem 0 0', opacity: 0.9 }}>
              Dr. {session?.user?.name}
            </p>
            {patient && (
              <div className="patient-info" style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '1rem', display: 'inline-block' }}>
                <strong>{patient.name}</strong> • Age: {patient.age}
              </div>
            )}
          </div>

          {/* Scrollable Content */}
          <div ref={contentRef} className="mobile-content" style={{ padding: '3rem', overflowY: 'auto' }}>

            {/* Doctors Grid */}
            <section className="mobile-section" style={{ marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '2rem', color: '#1f2937' }}>Select Doctor</h2>
              <div className="doctor-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {doctors.map(d => (
                  <div key={d.id} onClick={() => handleDoctorSelect(d)} className="doctor-card" style={{
                    backgroundColor: selectedDoctor?.id === d.id ? '#dbeafe' : '#f8fafc',
                    border: selectedDoctor?.id === d.id ? '4px solid #3b82f6' : '3px solid #e2e8f0',
                    padding: '2rem', borderRadius: '1.5rem', cursor: 'pointer',
                    boxShadow: selectedDoctor?.id === d.id ? '0 20px 40px rgba(59,130,246,0.2)' : '0 10px 25px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease', transform: selectedDoctor?.id === d.id ? 'scale(1.03)' : 'scale(1)'
                  }}>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e40af', margin: 0 }}>Dr. {d.name}</h3>
                    <p style={{ fontSize: '1.2rem', color: '#4b5563', margin: '0.75rem 0' }}>{d.specialization}</p>
                    <p style={{ fontSize: '1rem', color: '#6b7280' }}>Exp: {d.experience} yrs</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Date Picker */}
            {selectedDoctor && (
              <>
                <div ref={dateSectionRef} className="date-hint" style={{
                  textAlign: 'center', padding: '1rem 1.5rem', background: '#dbeafe', 
                  borderRadius: '1rem', margin: '2rem 0 1.5rem', fontSize: '1.1rem', 
                  fontWeight: '600', color: '#1e40af'
                }}>
                  Select a date to see available slots
                </div>
                <div className="date-input-wrapper" style={{ maxWidth: '500px', margin: '0 auto 3rem' }}>
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={handleDateChange} 
                    className="date-input"
                    min={new Date().toISOString().split('T')[0]}
                    style={{ 
                      width: '100%', 
                      padding: '1.2rem', 
                      fontSize: '1.2rem', 
                      border: '4px solid #fbbf24', 
                      borderRadius: '1.5rem', 
                      fontWeight: '700',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {selectedDate && (
                  slotsLoading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                      <div style={{ width: '4rem', height: '4rem', border: '6px solid #fbbf24', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="no-slots-box" style={{ textAlign: 'center', padding: '6rem', backgroundColor: '#fffbeb', borderRadius: '2rem', border: '4px dashed #f59e0b' }}>
                      <p style={{ fontSize: '1.8rem', color: '#92400e', fontWeight: '700' }}>No slots available on this date</p>
                    </div>
                  ) : (
                    <div className="slot-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
                      {availableSlots.map(slot => (
                        <div key={slot.id} onClick={() => handleSlotSelect(slot)} className="slot-card" style={{
                          backgroundColor: selectedSlot?.id === slot.id ? '#d1fae5' : '#ecfdf5',
                          border: selectedSlot?.id === slot.id ? '5px solid #059669' : '4px solid #10b981',
                          padding: '1.5rem', borderRadius: '1.5rem', textAlign: 'center', cursor: 'pointer',
                          boxShadow: selectedSlot?.id === slot.id ? '0 20px 40px rgba(5,150,105,0.3)' : '0 10px 25px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s ease', transform: selectedSlot?.id === slot.id ? 'scale(1.08)' : 'scale(1)'
                        }}>
                          <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#065f46' }}>
                            {slot.startTime} - {slot.endTime}
                          </div>
                          <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>{slot.dateFormatted}</div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </>
            )}

            {/* Confirm Form */}
            {showBookingForm && selectedSlot && (
              <div ref={bookingFormRef} className="booking-form" style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '1.5rem', border: '4px solid #3b82f6' }}>
                <h2 style={{ fontSize: '1.9rem', fontWeight: '900', textAlign: 'center', color: '#1e40af', marginBottom: '1.2rem' }}>
                  Confirm Appointment
                </h2>
                <div className="grid">
                  <div className="info-box" style={{ backgroundColor: 'white', padding: '1.2rem', borderRadius: '1rem', border: '2px solid #e5e7eb', fontSize: '0.85rem' }}>
                    <p style={{ margin: '0.3rem 0' }}><strong>Patient:</strong> {patient.name}</p>
                    <p style={{ margin: '0.3rem 0' }}><strong>Doctor:</strong> Dr. {selectedDoctor.name}</p>
                    <p style={{ margin: '0.3rem 0' }}><strong>Date:</strong> {selectedSlot.dateFormatted}</p>
                    <p style={{ margin: '0.3rem 0' }}><strong>Time:</strong> {selectedSlot.startTime} - {selectedSlot.endTime}</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '700', fontSize: '0.95rem' }}>Reason for Visit *</label>
                    <input type="text" name="reason" value={appointmentDetails.reason} onChange={e => setAppointmentDetails(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="e.g. Fever" style={{ width: '100%', padding: '0.6rem', border: '2px solid #d1d5db', borderRadius: '0.8rem', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                    <label style={{ display: 'block', margin: '0.8rem 0 0.4rem', fontWeight: '700', fontSize: '0.9rem' }}>Notes (Optional)</label>
                    <textarea name="notes_internal" value={appointmentDetails.notes_internal} onChange={e => setAppointmentDetails(prev => ({ ...prev, notes_internal: e.target.value }))}
                      rows="2" placeholder="Any notes..." style={{ width: '100%', padding: '0.6rem', border: '2px solid #d1d5db', borderRadius: '0.8rem', fontSize: '0.9rem', resize: 'none', boxSizing: 'border-box', minHeight: '50px' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button onClick={handleBookAppointment} disabled={bookingLoading || !appointmentDetails.reason.trim()}
                    style={{ backgroundColor: bookingLoading || !appointmentDetails.reason.trim() ? '#9ca3af' : '#10b981', color: 'white', padding: '0.9rem 3rem', borderRadius: '1.5rem', border: 'none', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', width: '100%', maxWidth: '240px' }}>
                    {bookingLoading ? "Booking..." : "CONFIRM & BOOK"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Terms & Payment Modal */}
      {showTermsModal && justBookedAppointment && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal" role="document">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#0f172a' }}>Booking Confirmed</h2>
                <p style={{ margin: '0.4rem 0 0', color: '#334155' }}>Appointment ID: <strong>{justBookedAppointment.id || 'N/A'}</strong></p>
                <p style={{ margin: '0.2rem 0 0', color: '#334155' }}>{justBookedAppointment.date} • {justBookedAppointment.time}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-block', padding: '0.4rem 0.8rem', background: '#0ea5e9', color: 'white', borderRadius: '0.6rem', fontWeight: 800 }}>Next: Payment</div>
              </div>
            </div>

            <hr style={{ margin: '1rem 0', border: 'none', height: '1px', background: '#e6edf7' }} />

            <div>
              <h3 style={{ margin: '0 0 0.6rem 0', color: '#0f172a' }}>Terms & Conditions</h3>
              <ul className="terms-list">
                <li>Slot times may change based on doctor's availability. We will inform you in advance where possible.</li>
                <li>Cancellations must be done at least 12 hours before the appointment to be eligible for refund.</li>
                <li>No refund will be provided for cancellations made within 12 hours of the appointment.</li>
                <li>Please arrive 10 minutes early and carry valid ID and any prior reports.</li>
                <li>By proceeding to payment you agree to our clinic policies.</li>
              </ul>
              <p className="tc-note">If you prefer not to pay now, you can pay later from your Appointments page. Payment failure does not cancel your appointment automatically. Contact support for assistance.</p>
            </div>

            {paymentError && <div style={{ marginTop: '0.8rem', color: '#b91c1c', fontWeight: 700 }}>{paymentError}</div>}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.2rem' }}>
              <button onClick={handlePayLater} style={{ flex: 1, background: '#e2e8f0', color: '#0f172a', padding: '0.9rem 1rem', borderRadius: '0.8rem', fontWeight: 800 }}>
                Pay Later
              </button>

              <button onClick={handleInitiatePayment} disabled={paymentLoading} style={{ flex: 1, background: paymentLoading ? '#9ca3af' : '#3b82f6', color: 'white', padding: '0.9rem 1rem', borderRadius: '0.8rem', fontWeight: 900 }}>
                {paymentLoading ? 'Processing...' : 'Make Payment'}
              </button>
            </div>

            <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: '#475569' }}>
              <strong>Note:</strong> You will be redirected to a secure PayU page to complete the transaction.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
