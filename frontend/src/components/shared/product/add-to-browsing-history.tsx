'use client'
import useBrowsingHistory from '@/src/hooks/stores/use-browsing-history'
import { useEffect } from 'react'

export default function AddToBrowsingHistory({
  id,
  category,
}: {
  id: string
  category: string
}) {
  const { addItem } = useBrowsingHistory()
  useEffect(() => {
    addItem({ id, category })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}