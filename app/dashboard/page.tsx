'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
} from 'chart.js'
import useClickstream from '@/components/useClickstream'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
)

export default function DashboardPage() {
  useClickstream('dashboard')
  const [events, setEvents] = useState<any[]>([])
  const [scores, setScores] = useState<any[]>([])

  useEffect(()=> {
    let pollTimer: any

    const fetchAll = async () => {
      try {

        const { data: ev, error: evError } = await supabase
          .from('clickstream')
          .select('*')
          .order('time', { ascending: true })
          .limit(1000)
        if (evError) {
          console.error('Error fetching clickstream:', evError)
        } else {
          setEvents(ev ?? [])
        }

        const { data: hs, error: hsError } = await supabase
          .from('highscores')
          .select('*')
          .order('score', { ascending: false })
          .limit(10)
        if (hsError) {
          console.error('Error fetching highscores:', hsError)
        } else {
          setScores(hs ?? [])
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error)
      }
    }

    fetchAll()
    pollTimer = setInterval(fetchAll, 5000)

    const channel = supabase.channel('public:clickstream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clickstream' }, payload => {
        setEvents(prev => [...prev, payload.new])
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'highscores' }, payload => {
        setScores(prev => [payload.new, ...prev].slice(0,20))
      })
      .subscribe()

    return ()=> {
      if (pollTimer) clearInterval(pollTimer)
      supabase.removeChannel(channel)
    }
  }, [])

  const counts = events.reduce((acc:any, e:any)=> { acc[e.event_name] = (acc[e.event_name]||0)+1; return acc }, {})

  function downloadCsv(filename: string, rows: any[]) {
    if (!rows || rows.length === 0) {
      const blob = new Blob(['No data'], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      return
    }
    const headers = Array.from(
      rows.reduce((set: Set<string>, row: any) => {
        Object.keys(row || {}).forEach(k => set.add(k))
        return set
      }, new Set<string>())
    )
    const csv = [headers.join(',')]
    for (const row of rows) {
      const line = headers.map(h => formatCsvCell((row as any)[h]))
      csv.push(line.join(','))
    }
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function formatCsvCell(value: any) {
    if (value == null) return ''
    if (typeof value === 'object') {
      try { return JSON.stringify(value).replaceAll('"', '""') } catch {}
    }
    const str = String(value).replaceAll('"', '""')
    if (str.includes(',') || str.includes('"') || str.includes('\n')) return `"${str}"`
    return str
  }

  return (
    <div>
      <h1 className='text-2xl font-bold mb-4'>Learnify Dashboard</h1>
      
      {/* Dashboard */}
      <div className='flex items-center gap-3 mb-4'>
        <button
          className='bg-slate-800 text-white px-3 py-2 rounded text-sm'
          onClick={() => downloadCsv('clickstream.csv', events)}
        >
          Download Clickstream CSV
        </button>
        <button
          className='bg-slate-800 text-white px-3 py-2 rounded text-sm'
          onClick={() => downloadCsv('highscores.csv', scores)}
        >
          Download Highscores CSV
        </button>
      </div>

      <div className='grid md:grid-cols-2 gap-6'>
        <div className='bg-white p-4 rounded shadow'>
          <h3 className='font-bold mb-2'>Event counts</h3>
          <Bar data={{
            labels: Object.keys(counts),
            datasets: [{ label: 'Events', data: Object.values(counts) }]
          }} />
        </div>

        <div className='bg-white p-4 rounded shadow'>
          <h3 className='font-bold mb-2'>Top Highscores</h3>
          <ol className='list-decimal ml-6'>
            {scores.map((s:any)=>(<li key={s.id}>{s.score} — {s.user_id ?? 'anon'}</li>))}
          </ol>
        </div>
      </div>

      <section className='mt-6 bg-white p-4 rounded shadow'>
        <h3 className='font-bold mb-2'>Recent Events</h3>
        <div className='overflow-auto max-h-80'>
          <table className='w-full text-sm'>
            <thead className='text-left'>
              <tr><th>Time</th><th>Event</th><th>Component</th><th>Desc</th><th>Origin</th><th>IP</th></tr>
            </thead>
            <tbody>
              {events.slice().reverse().slice(0,200).map(e=>(
                <tr key={e.id} className='border-t'>
                  <td>{new Date(e.time).toLocaleString()}</td>
                  <td>{e.event_name}</td>
                  <td>{e.component}</td>
                  <td className='max-w-xs truncate'>{e.description}</td>
                  <td className='max-w-xs truncate'>{e.origin}</td>
                  <td>{e.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
