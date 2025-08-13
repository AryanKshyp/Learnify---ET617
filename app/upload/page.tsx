'use client'
import dynamic from 'next/dynamic'
import PDFUploader from '@/components/PDFUploader'
import { Quiz } from '@/components/quizzes'
import useClickstream from '@/components/useClickstream'
import { useState } from 'react'

const ClickSpeedGame = dynamic(()=>import('@/components/ClickSpeedGame'), { ssr: false })

export default function UploadPage() {
  useClickstream('reader')
  const [pdfPath, setPdfPath] = useState<string|null>(null)

  return (
    <div>
      <h1 className='text-2xl font-bold mb-4'>Reader & Tools — Learnify</h1>

      <div className='grid md:grid-cols-2 gap-6'>
        <div>
          <PDFUploader onUpload={(p)=>setPdfPath(p)} />
          <div className='mt-4 bg-white p-4 rounded shadow'>
            <h3 className='font-bold mb-2'>PDF Reader</h3>
            {pdfPath ? (
              <iframe src={supabaseUrlFor(pdfPath)} className='w-full h-[600px]' />
            ) : <div className='text-sm text-slate-500'>No PDF loaded. Upload one to view it here.</div>}
          </div>
        </div>

        <div>
          <div className='space-y-4'>
            <Quiz level='easy' />
            <Quiz level='medium' />
            <Quiz level='hard' />
            <div className='mt-4'>
              <ClickSpeedGame />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// helper: build public URL for pdf in Supabase storage
function supabaseUrlFor(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  // Supabase storage public URL pattern
  return `${base.replace(/\.co\/$/, '.co')}/storage/v1/object/public/pdfs/${encodeURIComponent(path)}`
}
