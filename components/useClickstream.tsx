'use client'
import { useEffect } from 'react'

async function postEvent(payload: any) {
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch (e) {
    console.error('Track error', e)
  }
}

export default function useClickstream(context = 'reader') {
  useEffect(() => {
    // send load
    postEvent({
      event_context: context,
      component: 'page',
      event_name: 'load',
      description: 'Page loaded',
      origin: window.location.href,
      metadata: {}
    })

    let scrollTimeout: any = null
    const onScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        postEvent({
          event_context: context,
          component: 'window',
          event_name: 'scroll',
          description: `y=${window.scrollY}`,
          origin: window.location.href,
          metadata: { scrollY: window.scrollY }
        })
      }, 200)
    }
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      postEvent({
        event_context: context,
        component: target.tagName || 'unknown',
        event_name: 'click',
        description: `clicked ${target.className || target.id || target.tagName}`,
        origin: window.location.href,
        metadata: {
          x: (e as MouseEvent).clientX,
          y: (e as MouseEvent).clientY,
          tag: target.tagName,
          id: target.id,
          classes: target.className
        }
      })
    }

    document.addEventListener('click', onClick)
    window.addEventListener('scroll', onScroll)
    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('scroll', onScroll)
      if (scrollTimeout) clearTimeout(scrollTimeout)
    }
  }, [context])
}
