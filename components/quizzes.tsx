'use client'
import { useState } from 'react'

type Q = { id: number, q: string, options: string[], a: number }

// Three quizzes (Easy, Medium, Hard) — questions are paraphrased from Brainstellar puzzles as starter content.
export const QUIZZES: Record<string, Q[]> = {
  easy: [
    { id:1, q:'A fair coin is flipped repeatedly. What is the probability of getting two heads in a row before two tails in a row?', options:['1/2','1/3','2/3','3/4'], a:0 },
    { id:2, q:'You have 2 eggs and 100-floor building. What is the minimum worst-case drops required?', options:['10','14','20','7'], a:1 },
    { id:3, q:'Monty Hall: pick door 1, host opens door 3 revealing a goat. Should you switch to door 2?', options:['Yes','No','Doesn\'t matter','Only if host is random'], a:0 },
    { id:4, q:'A snail climbs 3ft by day and slides 2ft by night. How many days to climb 30ft?', options:['28','27','30','26'], a:0 },
    { id:5, q:'Two envelopes problem: you have two envelopes, one has double the other. Is it beneficial to switch?', options:['Yes','No','Indeterminate','Only if you know distribution'], a:3 }
  ],
  medium: [
    { id:1, q:'You start at origin and do symmetric random walk. What is probability you reach +a before -b?', options:['a/(a+b)','b/(a+b)','a-b/(a+b)','a*a/(a+b)'], a:1 },
    { id:2, q:'You have n coins; expected number of flips until first head?', options:['1','2','n','Depends'], a:0 },
    { id:3, q:'Given 100 light bulbs toggled by divisors, how many remain ON?', options:['10','9','1','sqrt(100)'], a:3 },
    { id:4, q:'A deck is shuffled; probability two adjacent cards are in increasing order?', options:['1/2','1/3','1/4','2/3'], a:0 },
    { id:5, q:'You want to partition candies equally with minimal swaps; general approach?', options:['Greedy','Sort and split','Randomize','Impossible'], a:1 }
  ],
  hard: [
    { id:1, q:'What is the smallest k such that 1+2+...+k >= 100?', options:['13','14','15','12'], a:0 },
    { id:2, q:'Random point inside unit disk: probability it lies closer to center than to boundary?', options:['1/4','1/2','3/4','1'], a:1 },
    { id:3, q:'Expected number of trials to collect all coupons with n types?', options:['n','n log n','sqrt(n)','n^2'], a:1 },
    { id:4, q:'Probability of no fixed point in a random permutation (derangement) tends to?', options:['1/e','0','1','1/2'], a:0 },
    { id:5, q:'Given coins fair, probability of exactly k heads in n flips?', options:['C(n,k)/2^n','k/n','1/2^k','nCk'], a:0 }
  ]
}

export function Quiz({ level }:{ level: 'easy'|'medium'|'hard'}) {
  const qs = QUIZZES[level]
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const answer = (i:number) => {
    if (done) return
    if (i === qs[index].a) setScore(s=>s+1)
    if (index+1 === qs.length) setDone(true)
    else setIndex(index+1)
  }

  return (
    <div className='bg-white p-4 rounded shadow'>
      <h4 className='font-bold mb-2'>{level.toUpperCase()} Quiz</h4>
      {!done ? (
        <>
          <div className='mb-4'>{qs[index].q}</div>
          <div className='grid gap-2'>
            {qs[index].options.map((opt, i)=>(
              <button key={i} className='text-left p-2 border rounded' onClick={()=>answer(i)}>{opt}</button>
            ))}
          </div>
        </>
      ) : (
        <div>
          <div className='text-lg font-bold'>Score: {score}/{qs.length}</div>
          <button className='mt-3 bg-indigo-600 text-white px-3 py-2 rounded' onClick={()=>{ setIndex(0); setScore(0); setDone(false)}}>Retry</button>
        </div>
      )}
    </div>
  )
}
