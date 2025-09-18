'use client'
import { ChevronUp } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/src/components/ui/button'


import { APP_NAME } from '@/src/lib/constants'


export default function Footer() {
  return (
    <footer className='text-white underline-link' style={{ backgroundColor:  ' #011F1D' }} >
      <div className='w-full'>
        <Button
          variant='ghost'
          className='w-full  rounded-none ' style={{ backgroundColor: '	#00593F' }} 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp className='mr-2 h-4 w-4' />
          Back to top 
        </Button>

      </div>
      <div className='p-4'>
        <div className='flex justify-center  gap-3 text-sm'>
          <Link href='/page/conditions-of-use'> Conditions of Use </Link>
          <Link href='/page/privacy-policy'>Privacy Notice</Link>
          <Link href='/page/help'>Help</Link>
        </div>
        <div className='flex justify-center text-sm'>
          <p> © 2004-2024,{APP_NAME}</p>
        </div>
        <div className='mt-8 flex justify-center text-sm text-gray-400'>
          Mombasa Kenya 777889 | +254728841228
        </div>
      </div>
    </footer>
  )
}