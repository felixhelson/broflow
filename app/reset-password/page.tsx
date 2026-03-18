'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../src/lib/supabase';
import { Colors } from '../../src/utils/theme';
import { Button } from '../../src/components/ui';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);

  async function handleReset() {
    if (password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) setError(err.message);
    else setDone(true);
  }

  return (
    <main className="min-h-screen px-6 pt-14 pb-10 max-w-md mx-auto" style={{ backgroundColor: Colors.bg }}>
      <h2 className="text-3xl font-bold mb-1" style={{ color: Colors.text }}>New password</h2>
      <p className="text-sm mb-8" style={{ color: Colors.textMid }}>Choose a new password for your account.</p>

      {done ? (
        <div className="flex flex-col gap-4">
          <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
            ✓ Password updated successfully.
          </div>
          <Button label="Log in" onClick={() => router.replace('/')} size="lg" className="w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {error && <div className="px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: Colors.textMid }}>New password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border text-base outline-none"
              style={{ borderColor: Colors.border, color: Colors.text, backgroundColor: Colors.white }}
              placeholder="Minimum 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()}
            />
          </div>
          <Button label="Update password" onClick={handleReset} loading={loading} size="lg" className="w-full mt-2" />
        </div>
      )}
    </main>
  );
}
