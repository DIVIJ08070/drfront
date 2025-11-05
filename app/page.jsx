'use client';

import { signIn, useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// A simple loading spinner component
const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
    <div 
      className="loader-spin" // Class for animation
      style={{
        width: '4rem',
        height: '4rem',
        border: '4px dashed #3b82f6',
        borderRadius: '9999px',
      }}
    ></div>
  </div>
);

// The card shown to a user who needs to log in or sign up
const AuthCard = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup

  // State for email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Only for signup

  const errorMessages = {
    Signin: "Try signing in with a different account.",
    OAuthSignin: "Error trying to sign in with the provider.",
    OAuthCallback: "Error during the OAuth callback.",
    OAuthCreateAccount: "Could not create user account.",
    EmailCreateAccount: "Could not create user account with email.",
    Callback: "Error in the callback.",
    OAuthAccountNotLinked: "This email is already linked with another provider. Please sign in using the original method.",
    CredentialsSignin: "Login failed. Please check your email and password.",
    default: "An unknown error occurred. Please try again.",
  };

  // Handle email/password login
  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    await signIn('credentials', {
      email,
      password,
      callbackUrl: '/appointment', // Redirect to appointment page on success
    });
  };

  // Handle email/password signup
  const handleCredentialsSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!"); // Simple client-side validation
      return;
    }
    // For signup, pass an action or additional params; your NextAuth authorize callback needs to handle 'signup' logic (e.g., create user if not exists)
    await signIn('credentials', {
      action: 'signup', // Custom param to indicate signup in your authorize function
      email,
      password,
      callbackUrl: '/appointment',
    });
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    // Clear form on toggle
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div 
      className="card-fade-in" // Class for animation
      style={{
        backgroundColor: '#ffffff',
        padding: '2rem 2.5rem',
        borderRadius: '1rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        textAlign: 'center',
        maxWidth: '24rem',
        width: '100%',
      }}
    >
      <h1 style={{
        fontSize: '1.875rem',
        lineHeight: '2.25rem',
        fontWeight: '700',
        marginBottom: '1rem',
        color: '#111827',
      }}>
        {isLogin ? 'Welcome Back 👋' : 'Create Account 👋'}
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        {isLogin ? 'Sign in to access your dashboard.' : 'Sign up to get started.'}
      </p>
      
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #f87171',
          color: '#b91c1c',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          position: 'relative',
          marginBottom: '1.5rem',
          textAlign: 'left'
        }}>
          <span>{errorMessages[error] || errorMessages.default}</span>
        </div>
      )}

      {/* Google Sign-In Button - Works for both login and signup */}
      <button
        id="google-button" // ID for hover/focus styles
        onClick={() => signIn("google", { callbackUrl: '/appointment' })}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          width: '100%',
          backgroundColor: '#ffffff',
          border: '1px solid #d1d5db',
          color: '#374151',
          fontWeight: '500',
          padding: '0.625rem 1rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          cursor: 'pointer',
          transition: 'background-color 0.2s, transform 0.2s',
        }}
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google Logo"
          style={{ width: '1.5rem', height: '1.5rem' }}
        />
        {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0' }}>
          <div style={{ flexGrow: 1, borderTop: '1px solid #e5e7eb' }}></div>
          <span style={{ flexShrink: 0, margin: '0 1rem', color: '#9ca3ab', fontSize: '0.875rem' }}>OR</span>
          <div style={{ flexGrow: 1, borderTop: '1px solid #e5e7eb' }}></div>
      </div>

      {/* Email Form - Conditional for Login/Signup */}
      <form onSubmit={isLogin ? handleCredentialsLogin : handleCredentialsSignup}>
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
              <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Email Address
              </label>
              <input 
                  type="email" 
                  id="email" 
                  name="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="login-input" // Class for focus styles
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    boxSizing: 'border-box' // Ensures padding doesn't affect width
                  }}
              />
          </div>
          
          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Password
              </label>
              <input 
                  type="password" 
                  id="password" 
                  name="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="login-input" // Class for focus styles
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    boxSizing: 'border-box' // Ensures padding doesn't affect width
                  }}
              />
          </div>

          {/* Confirm Password Field - Only for Signup */}
          {!isLogin && (
            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Confirm Password
              </label>
              <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="login-input" // Class for focus styles
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    boxSizing: 'border-box' // Ensures padding doesn't affect width
                  }}
              />
            </div>
          )}

          <button 
              id={isLogin ? "email-button" : "signup-button"} // ID for hover/focus styles
              type="submit"
              style={{
                width: '100%',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                fontWeight: '500',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                cursor: 'pointer',
                transition: 'background-color 0.2s, transform 0.2s',
              }}
          >
              {isLogin ? 'Sign in with Email' : 'Sign up with Email'}
          </button>
      </form>

      {/* Footer Link - Toggle between modes */}
      <p style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '2rem' }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <a 
            href="#" 
            id="toggle-link" 
            onClick={(e) => { e.preventDefault(); toggleAuthMode(); }}
            style={{ fontWeight: '500', color: '#3b82f6', textDecoration: 'none' }}
          >
              {isLogin ? ' Sign up' : ' Sign in'}
          </a>
      </p>
    </div>
  );
};


// Main Page Component
export default function Page() {
  const { status } = useSession();
  const router = useRouter();

  // This effect handles redirecting the user
  useEffect(() => {
    if (status === "authenticated") {
      router.push('/appointment');
    }
  }, [status, router]);

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  // If unauthenticated, show the auth card.
  // If authenticated, the useEffect will trigger a redirect.
  // We return the AuthCard (or a spinner) to prevent a flash of empty content.
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(to bottom right, #DBEAFE, #C7D2FE)',
      padding: '1rem',
    }}>
      {status === "unauthenticated" ? <AuthCard /> : <LoadingSpinner />}
    </main>
  );
}