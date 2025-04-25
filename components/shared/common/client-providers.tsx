'use client'
import React from 'react'
import useCartSidebar from '@/hooks/client/use-cart-sidebar'
import CartSidebar from '@/components/shared/cart/cart-sidebar'
import { Toaster } from '@/components/ui/toaster'

//You can remove side bar if you are not using it but uncommenting the code from client providers 

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  const isCartSidebarOpen = useCartSidebar()
  return (
   <>
    {isCartSidebarOpen ? (
      <div className='flex min-h-screen'>
        <div className='flex-1 overflow-hidden'>{children}</div>
        <CartSidebar /> 
      </div>
    ) : (
        <div>{children}</div>
      )}
    <Toaster />
    
   </>
  )
}