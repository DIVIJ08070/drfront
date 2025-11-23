"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', backgroundColor: '#f3f4f6' }}>
    <div style={{
      width: '3rem',
      height: '3rem',
      border: '6px solid #3b82f6',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default function AddDetailsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  // dob state uses ISO date string "YYYY-MM-DD" from <input type="date">
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const backendBase = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:8080";

  useEffect(() => {
    if (status === "unauthenticated") router.push('/');
  }, [status, router]);

  if (status === "loading") return <LoadingSpinner />;

  // helper: convert "YYYY-MM-DD" -> "DD-MM-YYYY"
  function formatDobForApi(isoDate) {
    if (!isoDate) return "";
    const parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    const [year, month, day] = parts;
    return `${day}-${month}-${year}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg(null);

    if (!dob || !phone) {
      setErrorMsg("Please fill both date of birth and phone.");
      return;
    }

    // Basic phone normalization (optional)
    const phoneNormalized = phone.replace(/\D/g, ""); // remove non-digits
    if (phoneNormalized.length < 6) {
      setErrorMsg("Please enter a valid phone number.");
      return;
    }

    const jwt = session?.jwt;
    if (!jwt) {
      setErrorMsg("Missing auth token. Please sign in again.");
      return;
    }

    const apiDob = formatDobForApi(dob);

    setLoading(true);
    try {
      const res = await fetch(`${backendBase}/v1/auth/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        // include cookies (JSESSIONID) if backend expects them
        credentials: "include",
        body: JSON.stringify({
          dob: apiDob,
          phone: phoneNormalized
        }),
      });

      if (!res.ok) {
        // try to parse json error body
        let errText = `Request failed with status ${res.status}`;
        try {
          const errBody = await res.json();
          if (errBody?.message) errText = errBody.message;
          else if (errBody?.error) errText = errBody.error;
          else errText = JSON.stringify(errBody);
        } catch (jsonErr) {
          const txt = await res.text().catch(() => "");
          if (txt) errText = txt;
        }
        throw new Error(errText);
      }

      // success — redirect to appointment
      router.push("/appointment");
    } catch (err) {
      console.error("Create error:", err);
      setErrorMsg(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  // helper: today in "YYYY-MM-DD" format to cap date input
  const todayIso = (new Date()).toISOString().split("T")[0];

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #F8FAFC, #EEF2FF)',
      padding: '3rem 1rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '1rem',
        boxShadow: '0 20px 40px rgba(2,6,23,0.08)',
        padding: '2rem'
      }}>
        <h1 style={{ fontSize: '1.9rem', margin: 0, color: '#0f172a' }}>Complete your profile</h1>
        <p style={{ color: '#475569', marginTop: '0.5rem' }}>
          We need a couple of details to finish setting up your account.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>Date of birth</span>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              max={todayIso}
              required
              style={{
                padding: '0.85rem',
                fontSize: '1rem',
                borderRadius: '0.6rem',
                border: '2px solid #e6edf8',
                backgroundColor: 'white'
              }}
            />
            <small style={{ color: '#64748b' }}>Format: DD-MM-YYYY (we convert automatically)</small>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>Phone</span>
            <input
              type="tel"
              placeholder="7203979619"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{
                padding: '0.85rem',
                fontSize: '1rem',
                borderRadius: '0.6rem',
                border: '2px solid #e6edf8'
              }}
            />
          </label>

          {errorMsg && <div style={{ color: 'crimson', fontWeight: 600 }}>{errorMsg}</div>}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#0ea5e9',
                color: 'white',
                padding: '0.9rem 1.2rem',
                borderRadius: '0.6rem',
                border: 'none',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? "Saving..." : "Submit"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#0f172a',
                padding: '0.9rem 1.2rem',
                borderRadius: '0.6rem',
                border: '1px solid #e2e8f0',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>

        <div style={{ marginTop: '1.25rem', color: '#64748b', fontSize: '0.95rem' }}>
          <p style={{ margin: 0 }}>We will not share your phone number publicly. You can update these details later in profile settings.</p>
        </div>
      </div>
    </main>
  );
}
