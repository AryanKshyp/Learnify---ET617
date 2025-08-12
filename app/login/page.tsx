'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) alert(error.message)
    else window.location.href = '/upload'
  }

  const handleSignup = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) alert(error.message)
    else alert('Signup complete — check your email to confirm (if required).')
  }

  return (
    <div className='flex items-center justify-center min-h-[70vh]'>
      <div className='w-full max-w-md bg-white p-6 rounded shadow'>
        <h2 className='text-2xl font-bold mb-4'>Sign in / Sign up</h2>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder='Email' className='w-full mb-2 p-2 border rounded' />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder='Password' type='password' className='w-full mb-4 p-2 border rounded' />
        <div className='flex gap-2'>
          <button className='bg-indigo-600 text-white px-4 py-2 rounded' onClick={handleLogin} disabled={loading}>Sign In</button>
          <button className='bg-green-500 text-white px-4 py-2 rounded' onClick={handleSignup} disabled={loading}>Sign Up</button>
        </div>
      </div>
    </div>
  )
}
