export default function Home() {
  return (
    <div className='py-12'>
      <div className='bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl p-10 text-white shadow-lg'>
        <h1 className='text-4xl font-extrabold mb-2'>Learnify</h1>
        <p className='text-lg opacity-90'>Read research PDFs, generate quizzes, track interactions, and play the Click Speed Game.</p>
        <div className='mt-6 flex gap-4'>
          <a href='/upload' className='bg-white text-indigo-600 px-4 py-2 rounded shadow'>Open Reader</a>
          <a href='/dashboard' className='bg-white/20 border border-white/40 px-4 py-2 rounded'>View Dashboard</a>
        </div>
      </div>

      <section className='mt-10 grid md:grid-cols-3 gap-6'>
        <div className='bg-white p-6 rounded shadow'>
          <h3 className='font-bold mb-2'>Read Research Papers</h3>
          <p className='text-sm text-slate-600'>Upload PDFs and read them inside Learnify. Clicks and scrolls are tracked automatically.</p>
        </div>
        <div className='bg-white p-6 rounded shadow'>
          <h3 className='font-bold mb-2'>Generate Quizzes</h3>
          <p className='text-sm text-slate-600'>Create quizzes (Easy / Medium / Hard) from uploaded PDFs. 3 starter quizzes are included.</p>
        </div>
        <div className='bg-white p-6 rounded shadow'>
          <h3 className='font-bold mb-2'>Click Speed Game</h3>
          <p className='text-sm text-slate-600'>Play a 10s click challenge. Top scores are saved to the leaderboard.</p>
        </div>
      </section>
    </div>
  )
}
