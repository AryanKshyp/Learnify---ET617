import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const score = Number(body.score || 0)
    const user_id = body.user_id || null
    const { error } = await supabaseAdmin.from('highscores').insert({ user_id, score })
    if (error) {
      console.error(error)
      return NextResponse.json({ error: String(error) }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'bad' }, { status: 400 })
  }
}
