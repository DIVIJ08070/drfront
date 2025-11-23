'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PayuSuccessPage() {
  const router = useRouter();


  const txId = params.txnid || params.txnId || params.transaction_id || params.mihpayid || '';

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      const fb = document.getElementById('copy-feedback');
      fb.textContent = 'Copied!';
      setTimeout(() => (fb.textContent = ''), 1200);
    } catch {}
  };

  return (
    <>
      <style jsx>{`
        :root {
          --acc1: #1e3a8a;
          --acc2: #3b82f6;
          --success: #10b981;
        }

        main {
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(135deg, #dbeafe 0%, #c7d2fe 100%);
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
          background: var(--success);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 999px;
          font-weight: 800;
          display: inline-block;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        h1 {
          margin: 0;
          font-size: 1.9rem;
          color: var(--acc1);
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

          <h1>Payment Successful</h1>

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

            <button className="btn-primary" style={{ background: '#1e3a8a' }} onClick={() => router.push('/appointment')}>
              My Appointments
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
