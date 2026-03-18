'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../src/store/authStore';
import { usePartnersStore } from '../src/store/partnersStore';
import { mockPartner, mockUser } from '../src/lib/mockData';
import { Button } from '../src/components/ui';
import { Colors } from '../src/utils/theme';

type Screen = 'welcome' | 'login' | 'signup';

export default function AuthScreen() {
  const router = useRouter();
  const [screen, setScreen]           = useState<Screen>('welcome');
  const [firstName, setFirstName]     = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [profileType, setProfileType] = useState<'SINGLE' | 'MARRIED'>('SINGLE');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const { login, signup } = useAuthStore();

  function handleDemo() {
    usePartnersStore.setState({ partners: [mockPartner], activePartnerId: mockPartner.id });
    useAuthStore.setState({ isAuthenticated: true, user: mockUser });
    router.replace('/home');
  }

  async function handleLogin() {
    if (!email || !password) return setError('Fill in all fields');
    setLoading(true);
    setError('');
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/home');
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Check your details and try again');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup() {
    if (!firstName || !email || !password) return setError('Fill in all fields');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    setError('');
    try {
      await signup({ firstName: firstName.trim(), email: email.trim().toLowerCase(), password, profileType });
      router.replace('/home');
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  // ── Welcome ──────────────────────────────────────────────────────────────
  if (screen === 'welcome') {
    return (
      <main
        className="min-h-screen flex flex-col justify-between px-6 pt-20 pb-10 max-w-md mx-auto"
        style={{ backgroundColor: Colors.bg }}
      >
        <div className="flex flex-col items-center pt-5 text-center">
          <Image src="/logo.png" alt="Broflow" width={96} height={96} className="mb-4 rounded-2xl" />
          <h1 className="text-5xl font-bold mb-3" style={{ color: Colors.coral }}>Broflow</h1>
          <p className="text-base leading-relaxed" style={{ color: Colors.textMid }}>
            Understand her cycle.<br />Show up at the right time.
          </p>
        </div>

        <div className="flex flex-col gap-4 my-10">
          {[
            { emoji: '📅', text: 'Track her cycle phases' },
            { emoji: '🎁', text: 'Order gifts at the right moment' },
            { emoji: '💡', text: 'Know what she needs before she does' },
            { emoji: '💝', text: '15% of every order goes to homeless women' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-sm font-medium" style={{ color: Colors.text }}>{item.text}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Button label="Get started" onClick={() => setScreen('signup')} size="lg" className="w-full" />
          <button
            onClick={() => setScreen('login')}
            className="text-sm py-2 text-center"
            style={{ color: Colors.textMid }}
          >
            Already have an account?{' '}
            <span className="font-semibold" style={{ color: Colors.coral }}>Log in</span>
          </button>
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px" style={{ backgroundColor: Colors.border }} />
            <span className="text-xs" style={{ color: Colors.textMid }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: Colors.border }} />
          </div>
          <button
            onClick={handleDemo}
            className="w-full py-3 rounded-xl border text-sm font-medium transition-colors hover:opacity-80"
            style={{ borderColor: Colors.border, color: Colors.textMid, backgroundColor: Colors.white }}
          >
            Try demo →
          </button>
        </div>
      </main>
    );
  }

  // ── Login / Signup ───────────────────────────────────────────────────────
  return (
    <main
      className="min-h-screen px-6 pt-14 pb-10 max-w-md mx-auto"
      style={{ backgroundColor: Colors.bg }}
    >
      <button onClick={() => setScreen('welcome')} className="text-2xl mb-8 block" style={{ color: Colors.text }}>
        ←
      </button>

      <h2 className="text-3xl font-bold mb-1" style={{ color: Colors.text }}>
        {screen === 'login' ? 'Welcome back' : 'Create account'}
      </h2>
      <p className="text-sm mb-8" style={{ color: Colors.textMid }}>
        {screen === 'login' ? 'Log in to Broflow' : 'Set up your Broflow profile'}
      </p>

      {error && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {screen === 'signup' && (
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: Colors.textMid }}>
              Your first name
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border text-base outline-none"
              style={{ borderColor: Colors.border, color: Colors.text, backgroundColor: Colors.white }}
              placeholder="Marcus"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: Colors.textMid }}>
            Email
          </label>
          <input
            type="email"
            className="w-full px-4 py-3 rounded-xl border text-base outline-none"
            style={{ borderColor: Colors.border, color: Colors.text, backgroundColor: Colors.white }}
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: Colors.textMid }}>
            Password
          </label>
          <input
            type="password"
            className="w-full px-4 py-3 rounded-xl border text-base outline-none"
            style={{ borderColor: Colors.border, color: Colors.text, backgroundColor: Colors.white }}
            placeholder={screen === 'signup' ? 'Minimum 8 characters' : '••••••••'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (screen === 'login' ? handleLogin() : handleSignup())}
          />
        </div>

        {screen === 'signup' && (
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: Colors.textMid }}>
              Relationship status
            </label>
            <div className="flex gap-3">
              {(['SINGLE', 'MARRIED'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setProfileType(type)}
                  className="flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-colors"
                  style={{
                    borderColor: profileType === type ? Colors.coral : Colors.border,
                    backgroundColor: profileType === type ? Colors.coralLight : Colors.white,
                  }}
                >
                  <span className="text-2xl">{type === 'SINGLE' ? '🧍' : '💍'}</span>
                  <span
                    className="text-xs font-medium text-center"
                    style={{ color: profileType === type ? Colors.coral : Colors.textMid }}
                  >
                    {type === 'SINGLE' ? 'Single / dating' : 'Married / long-term'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <Button
          label={screen === 'login' ? 'Log in' : 'Create account'}
          onClick={screen === 'login' ? handleLogin : handleSignup}
          loading={loading}
          size="lg"
          className="w-full mt-2"
        />

        <button
          onClick={() => setScreen(screen === 'login' ? 'signup' : 'login')}
          className="text-sm py-2 text-center mt-2"
          style={{ color: Colors.textMid }}
        >
          {screen === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>

        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-px" style={{ backgroundColor: Colors.border }} />
          <span className="text-xs" style={{ color: Colors.textMid }}>no backend?</span>
          <div className="flex-1 h-px" style={{ backgroundColor: Colors.border }} />
        </div>
        <button
          onClick={handleDemo}
          className="w-full py-3 rounded-xl border text-sm font-medium transition-colors hover:opacity-80"
          style={{ borderColor: Colors.border, color: Colors.textMid, backgroundColor: Colors.white }}
        >
          Try demo →
        </button>
      </div>
    </main>
  );
}
