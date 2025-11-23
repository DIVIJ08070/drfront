// app/payu/success/page.jsx
// Optional: server-rendered client page for GET visits (keeps style similar to PatientHistoryPage).
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PayuSuccessPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const [params, setParams] = useState({});

  useEffect(() => {
    const obj = {};
    for (const key of sp.keys()) {
      obj[key] = sp.get(key);
    }
    setParams(obj);
  }, [sp]);

  const txId = params.txnid || params.txnId || params.transaction_id || params.mihpayid || '';

  return (
    <>
      <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #DBEAFE 0%, #C7D2FE 100%)', padding: '2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: 'white', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: '#10b981', color: 'white', padding: '0.6rem 1rem', borderRadius: '999px', fontWeight: 900 }}>SUCCESS</div>
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem' }}>Payment Successful</h1>
              <p style={{ margin: 0, color: '#0c4a6e' }}>{txId ? `Transaction ${txId}` : 'Payment completed'}</p>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '1rem', padding: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {Object.keys(params).length === 0 ? (
                  <tr><td style={{ padding: '1rem', textAlign: 'center' }}>No query params</td></tr>
                ) : (
                  Object.entries(params).map(([k, v]) => (
                    <tr key={k}>
                      <td style={{ padding: '0.6rem 1rem', fontWeight: 700, color: '#0369a1', width: '35%' }}>{k}</td>
                      <td style={{ padding: '0.6rem 1rem' }}>{v}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button onClick={() => router.push('/')} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.9rem 1.8rem', borderRadius: '0.8rem', fontWeight: 800 }}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
