'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

// ----------------------------------------------------------------------
// 1. Inner Component (Client Logic)
// This component contains all the hooks and UI logic that depends on the URL params.
// ----------------------------------------------------------------------
function SuccessDetails() {
  const router = useRouter();
  const sp = useSearchParams(); // This hook is now inside the Suspense boundary

  const [params, setParams] = useState({});

  useEffect(() => {
    // Collect search parameters
    const obj = {};
    for (const key of sp.keys()) {
      obj[key] = sp.get(key);
    }
    setParams(obj);
  }, [sp]);

  const txId = params.txnid || params.txnId || params.transaction_id || params.mihpayid || '';

  // Function to copy text to clipboard
  const handleCopy = async (text) => {
    try {
      // Fallback for document.execCommand for iFrame environments
      if (document.execCommand) {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
      } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
      }

      const fb = document.getElementById('copy-feedback');
      if (fb) {
          fb.textContent = 'Copied!';
          setTimeout(() => (fb.textContent = ''), 1200);
      }
    } catch (e) {
      console.error("Failed to copy text:", e);
    }
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --acc1: #1e3a8a;
          --acc2: #3b82f6;
          --success-dark: #059669;
          --success-light: #10b981;
        }

        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      <style jsx>{`
        main {
          min-height: 100vh;
          padding: 2rem;
          /* Green/Success Gradient */
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); 
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .card {
          width: 100%;
          max-width: 480px;
          background: white;
          padding: 2rem;
          border-radius: 1.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          text-align: center;
        }

        .badge {
          background: var(--success-light); /* Success Green */
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 999px;
          font-weight: 800;
          display: inline-block;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          animation: success-pulse 1.5s infinite;
        }

        @keyframes success-pulse {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        h1 {
          margin: 0;
          font-size: 1.9rem;
          color: var(--success-dark); /* Darker green for heading */
          font-weight: 800;
          margin-bottom: 0.4rem;
        }

        .tx-id {
          margin-top: 0.8rem;
          font-weight: 700;
          font-size: 1rem;
          color: #0f172a;
          word-break: break-word;
        }

        .copy-btn {
          margin-top: 0.5rem;
          background: var(--acc2);
          color: white;
          border: none;
          padding: 0.5rem 0.9rem;
          border-radius: 0.6rem;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.85rem;
          transition: background-color 0.2s;
        }
        .copy-btn:hover {
            background: #2563eb;
        }

        .actions {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .btn-primary {
          background: var(--acc2);
          color: white;
          border: none;
          padding: 0.9rem;
          border-radius: 0.8rem;
          font-size: 1rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s;
        }
        .btn-primary:active {
            transform: scale(0.98);
        }
        .btn-secondary {
            background: #1e3a8a;
        }

        @media (max-width: 480px) {
          .card {
            padding: 1.5rem;
            border-radius: 1.2rem;
          }
          h1 {
            font-size: 1.6rem;
          }
        }
      `}</style>

      <main>
        <div className="card">
          <div className="badge">SUCCESS</div>

          <h1>Payment Successful!</h1>
          <p style={{ color: '#4b5563' }}>Your transaction has been completed successfully. Thank you for your order.</p>

          {txId && (
            <>
              <div className="tx-id">Transaction ID: {txId}</div>
              <button className="copy-btn" onClick={() => handleCopy(txId)}>
                Copy ID
              </button>
              <div id="copy-feedback" style={{ marginTop: '0.4rem', fontWeight: '700', color: '#0f172a' }}></div>
            </>
          )}

          <div className="actions">
            <button className="btn-primary" onClick={() => router.push('/')}>
              Go to Dashboard
            </button>

            <button className="btn-primary btn-secondary" onClick={() => router.push('/appointment')}>
              My Appointments
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

// ----------------------------------------------------------------------
// 2. Main Export Component (The Suspense Wrapper)
// ----------------------------------------------------------------------

// Fallback component to show while the search params are loading
const LoadingFallback = () => (
    <main style={{
        minHeight: '100vh',
        padding: '2rem',
        background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }}>
        <div style={{
            width: '100%',
            maxWidth: '480px',
            background: 'white',
            padding: '2rem',
            borderRadius: '1.5rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            textAlign: 'center'
        }}>
            <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>Loading transaction details...</p>
        </div>
    </main>
);


// The default export now wraps the logic in Suspense.
export default function PayuSuccessPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <SuccessDetails />
        </Suspense>
    );
}