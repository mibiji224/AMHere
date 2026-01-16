'use client'

import { login } from './action';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      disabled={pending}
      className="w-full bg-white/20 hover:bg-white/30 text-white font-medium p-3 rounded-xl backdrop-blur-md border border-white/20 transition-all active:scale-95 disabled:opacity-50 shadow-lg"
    >
      {pending ? 'Unlocking...' : 'Enter Dashboard'}
    </button>
  );
}

export default function LoginPage() {
  return (
    // 1. The Colorful Background Container
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
      
      {/* Decorative floating blobs for depth */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* 2. The Glass Card */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl max-w-sm w-full">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4 border border-white/30 shadow-inner">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Access</h1>
          <p className="text-blue-100 text-sm mt-2 font-medium">Please verify your identity</p>
        </div>

        <form action={login} className="space-y-5">
          <div className="relative group">
            <input 
              type="password" 
              name="password" 
              placeholder="Master Password" 
              required
              className="w-full bg-black/20 text-white placeholder-white/60 p-4 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition-all text-center tracking-widest shadow-inner"
            />
          </div>
          <SubmitButton />
        </form>
        
        <div className="mt-6 text-center">
            <p className="text-xs text-white/40">Protected by Secure Session</p>
        </div>
      </div>
    </main>
  );
}