'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Bar, Line } from 'react-chartjs-2'
import useClickstream from '@/components/useClickstream'

export default function DashboardPage() {
  useClickstream('dashboard')
  const [events, setEvents] = useState<any[]>([])
  const [scores, setScores] = useState<any[]>([])

  useEffect(()=> {
    const fetchAll = async () => {
      const { data: ev } = await supabase.from('clickstream').select('*').order('time', { ascending: true }).limit(1000)
      setEvents(ev ?? [])

      const { data: hs } = await supabase.from('highscores').select('*').order('score', { ascending: false }).limit(10)
      setScores(hs ?? [])
    }
    fetchAll()

    const channel = supabase.channel('public:clickstream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clickstream' }, payload => {
        setEvents(prev => [...prev, payload.new])
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'highscores' }, payload => {
        setScores(prev => [payload.new, ...prev].slice(0,20))
      })
      .subscribe()

    return ()=> supabase.removeChannel(channel)
  }, [])

  const counts = events.reduce((acc:any, e:any)=> { acc[e.event_name] = (acc[e.event_name]||0)+1; return acc }, {})

  return (
    <div>
      <h1 className='text-2xl font-bold mb-4'>Learnify Dashboard</h1>
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
