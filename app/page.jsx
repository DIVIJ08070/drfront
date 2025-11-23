'use client';

import { signIn, useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#F3F4F6'
  }}>
    <div style={{
      width: '4rem',
      height: '4rem',
      border: '6px solid #3b82f6',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <style jsx>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

const AuthCard = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const errorMessages = {
    CredentialsSignin: "Login failed. Please check your email and password.",
    default: "An unknown error occurred. Please try again.",
  };

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    await signIn('credentials', { email, password, callbackUrl: '/appointment' });
  };

  const handleCredentialsSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    await signIn('credentials', { action: 'signup', email, password, callbackUrl: '/appointment' });
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '2.5rem 2rem',
      borderRadius: '1.5rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      textAlign: 'center',
      maxWidth: '28rem',
      width: '90%',              /* CHANGED: was 100% */
      margin: '0 auto',         /* CHANGED: forces center */
      animation: 'fadeIn 0.6s ease-out',
      boxSizing: 'border-box'   /* CHANGED: prevents overflow */
    }}>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          width: '4.5rem',
          height: '4.5rem',
          background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
          borderRadius: '50%',
          margin: '0 auto 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '2rem',
          fontWeight: '900'
        }}>
          M
        </div>
        <h1 style={{ fontSize: '2.125rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>
          Medify
        </h1>
        <p style={{ color: '#64748b', margin: '0.5rem 0 0', fontSize: '1.1rem' }}>
          {isLogin ? 'Welcome back!' : 'Join Medify today'}
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          color: '#dc2626',
          padding: '1rem',
          borderRadius: '1rem',
          margin: '1.5rem 0',
          fontSize: '0.95rem',
          fontWeight: '500'
        }}>
          {errorMessages[error] || errorMessages.default}
        </div>
      )}

      <button
        onClick={() => signIn("google", { callbackUrl: '/appointment' })}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          width: '100%',
          backgroundColor: '#ffffff',
          border: '2px solid #e2e8f0',
          color: '#374151',
          fontWeight: '600',
          padding: '1rem',
          borderRadius: '1rem',
          cursor: 'pointer',
          fontSize: '1.05rem',
          marginBottom: '1.5rem'
        }}
      >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '1.5rem', height: '1.5rem' }} />
        {isLogin ? 'Continue with Google' : 'Sign up with Google'}
      </button>

      {/* <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0' }}>
        <div style={{ flexGrow: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
        <span style={{ margin: '0 1rem', color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600' }}>OR</span>
        <div style={{ flexGrow: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
      </div> */}

      {/* <form onSubmit={isLogin ? handleCredentialsLogin : handleCredentialsSignup}>
        <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px solid #e2e8f0',
              borderRadius: '1rem',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px solid #e2e8f0',
              borderRadius: '1rem',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {!isLogin && (
          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '1rem',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        <button
          type="submit"
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: '#ffffff',
            fontWeight: '700',
            padding: '1rem',
            borderRadius: '1rem',
            border: 'none',
            fontSize: '1.1rem',
            cursor: 'pointer',
            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)',
            marginTop: '0.5rem'
          }}
        >
          {isLogin ? 'Sign In with Email' : 'Create Account'}
        </button>
      </form>

      <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '2rem', fontWeight: '500' }}>
        {isLogin ? "New to Medify?" : "Already have an account?"}
        <button onClick={toggleAuthMode} style={{ fontWeight: '700', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '0.5rem', textDecoration: 'underline' }}>
          {isLogin ? 'Create account' : 'Sign in'}
        </button>
      </p> */}
    </div>
  );
};

export default function Page() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push('/appointment');
    }
  }, [status, router]);

  if (status === "loading") return <LoadingSpinner />;

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #DBEAFE 0%, #C7D2FE 50%, #E0E7FF 100%)',
      padding: '1rem',
      boxSizing: 'border-box'
    }}>
      <AuthCard />
    </main>
  );
}