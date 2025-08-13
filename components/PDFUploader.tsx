'use client'
import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function PDFUploader({ onUpload } : { onUpload?: (path: string)=>void }) {
	const [file, setFile] = useState<File|null>(null)
	const [loading, setLoading] = useState(false)
	const [dragOver, setDragOver] = useState(false)
	const inputRef = useRef<HTMLInputElement|null>(null)

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
		<div className='relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm p-5 shadow-sm'>
			<div className='text-sm font-semibold text-slate-900 mb-2'>Upload PDF</div>
			<div
				onDragOver={(e)=>{ e.preventDefault(); setDragOver(true) }}
				onDragLeave={()=> setDragOver(false)}
				onDrop={(e)=>{
					e.preventDefault();
					setDragOver(false)
					const f = e.dataTransfer.files?.[0]
					if (f) {
						if (f.type !== 'application/pdf') { alert('Please drop a PDF'); return }
						setFile(f)
					}
				}}
				className={[
					'group relative rounded-xl border-2 border-dashed p-6 transition-colors cursor-pointer',
					dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 hover:border-slate-400 bg-white/70'
				].join(' ')}
				onClick={()=> inputRef.current?.click()}
			>
				<input
					ref={inputRef}
					type='file'
					accept='application/pdf'
					className='hidden'
					onChange={e=> setFile(e.target.files?.[0] ?? null)}
				/>
				<div className='flex items-center gap-3 text-slate-700'>
					<div className='inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white'>
						<svg width='18' height='18' viewBox='0 0 24 24' fill='none'><path d='M12 16V4M12 4l-4 4M12 4l4 4' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'/><path d='M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2' stroke='currentColor' strokeWidth='2' strokeLinecap='round'/></svg>
					</div>
					<div>
						<div className='font-medium'>Drag & drop your PDF</div>
						<div className='text-xs text-slate-500'>or click to choose a file</div>
					</div>
				</div>
			</div>

			{file && (
				<div className='mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3'>
					<div className='text-sm text-slate-700 truncate'>
						<span className='font-medium text-slate-900'>Selected:</span> {file.name}
					</div>
					<button
						className='text-xs text-slate-600 hover:text-slate-800'
						onClick={()=> setFile(null)}
					>
						Clear
					</button>
				</div>
			)}

			<div className='mt-4'>
				<button 
					className='bg-slate-900 text-white px-4 py-2 rounded-lg disabled:opacity-50' 
					onClick={handleUpload} 
					disabled={loading || !file}
					data-pdf-action="upload">
					{loading ? 'Uploading…' : 'Upload & Add to Reader'}
				</button>
			</div>
		</div>
	)
}
