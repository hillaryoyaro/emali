import React from 'react'

import Header from '@/src/components/shared/header'
import Footer from '@/src/components/shared/footer/footer'



export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='flex-1 flex flex-col p-4'>{children}</main>
      <Footer />
    </div>
  )
}