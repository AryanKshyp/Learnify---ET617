'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function PDFUploader({ onUpload } : { onUpload?: (path: string)=>void }) {
	const [file, setFile] = useState<File|null>(null)
	const [loading, setLoading] = useState(false)

	const handleUpload = async () => {
		if (!file) return alert('Select a PDF')
		setLoading(true)
		
		try {
			// Check if user is authenticated
			const { data: userData, error: authError } = await supabase.auth.getUser()
			if (authError) {
				console.error('Auth error:', authError)
				alert('Authentication error. Please log in again.')
				setLoading(false)
				return
			}
			
			const user = userData.user
			if (!user) {
				alert('Please log in to upload PDFs')
				setLoading(false)
				return
			}

			// Upload via server route (uses service role, bypasses RLS)
			const form = new FormData()
			form.append('file', file)
			form.append('user_id', user.id)
			const res = await fetch('/api/upload', {
				method: 'POST',
				body: form
			})
			const json = await res.json()
			if (!res.ok) {
				throw new Error(json.error || 'Upload failed')
			}

			alert('PDF uploaded successfully!')
			onUpload && onUpload(json.path)
		} catch (error: any) {
			console.error('Upload error:', error)
			alert(`Upload failed: ${error.message || error}`)
		} finally {
			setLoading(false)
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
