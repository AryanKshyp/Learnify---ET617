'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function PDFUploader({ onUpload } : { onUpload?: (path: string)=>void }) {
  const [file, setFile] = useState<File|null>(null)
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    if (!file) return alert('Select a PDF')
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) return alert('Not logged in')
    const path = `${user.id}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('pdfs').upload(path, file)
    setLoading(false)
    if (error) alert(error.message)
    else {
      alert('Uploaded')
      onUpload && onUpload(path)
    }
  }

  return (
    <div className='bg-white p-4 rounded shadow'>
      <label className='block text-sm font-medium mb-2'>Upload PDF</label>
      <input type='file' accept='application/pdf' onChange={e=>setFile(e.target.files?.[0] ?? null)} />
      <div className='mt-3'>
        <button className='bg-indigo-600 text-white px-4 py-2 rounded' onClick={handleUpload} disabled={loading}>
          {loading ? 'Uploading...' : 'Upload & Add to Reader'}
        </button>
      </div>
    </div>
  )
}
