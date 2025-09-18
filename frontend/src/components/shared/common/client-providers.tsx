'use client'
import React from 'react'
import useCartSidebar from '@/src/hooks/client/use-cart-sidebar'
import CartSidebar from '../cart/cart-sidebar'
import { ThemeProvider } from '../theme/theme-provider'
import { Toaster } from '@/src/components/ui/toaster'



export default function ClientProviders({
  
  children,
}: {
 
  children: React.ReactNode
}) {
  const visible = useCartSidebar()

  return (
    
      <ThemeProvider
        attribute='class'
        defaultTheme='system'
      >
        {visible ? (
          <div className='flex min-h-screen'>
            <div className='flex-1 overflow-hidden'>{children}</div>
            <CartSidebar />
          </div>
        ) : (
          <div>{children}</div>
        )}
        <Toaster />
      </ThemeProvider>
  
  )
}