'use client'

import useCartStore from '@/hooks/stores/use-cart-store'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import React, { useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import Image from 'next/image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TrashIcon, XIcon } from 'lucide-react'
import ProductPrice from '@/components/shared/product/product-price'
import { FREE_SHIPPING_PRICE } from '@/lib/constants'

export default function CartSidebar() {
  const [visible, setVisible] = useState(true) // Sidebar toggle state

  const {
    cart: { items, itemsPrice },
    updateItem,
    removeItem,
  } = useCartStore()

  if (!visible) return null // If not visible, don’t render anything

  return (
    <div className='w-32 overflow-y-auto'>
      <div className='w-32 fixed h-full bg-white shadow-md border-r z-50'>
        <div className='p-2 h-full flex flex-col gap-2 justify-center items-center relative'>

          {/* Close Button */}
          <button
            className='absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full'
            onClick={() => setVisible(false)}
            aria-label='Close sidebar'
          >
            <XIcon className='w-4 h-4' />
          </button>

          <div className='text-center space-y-2 mt-6'>
            <div>Subtotal</div>
            <div className='font-bold'>
              <ProductPrice price={itemsPrice} plain />
            </div>

            {itemsPrice > FREE_SHIPPING_PRICE && (
              <div className='text-center text-xs'>
                Your order qualifies for FREE Shipping
              </div>
            )}

            <Link
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'rounded-full hover:no-underline w-full'
              )}
              href='/cart'
            >
              Go to Cart
            </Link>

            <Separator className='mt-3' />
          </div>

          <ScrollArea className='flex-1 w-full'>
            {items.map((item) => (
              <div key={item.clientId}>
                <div className='my-3'>
                  <Link href={`/product/${item.slug}`}>
                    <div className='relative h-24'>
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes='20vw'
                        className='object-contain'
                      />
                    </div>
                  </Link>
                  <div className='text-sm text-center font-bold'>
                    <ProductPrice price={item.price} plain />
                  </div>
                  <div className='flex gap-2 mt-2 justify-center'>
                    <Select
                      value={item.quantity.toString()}
                      onValueChange={(value) => {
                        updateItem(item, Number(value))
                      }}
                    >
                      <SelectTrigger className='text-xs w-12 ml-1 h-auto py-0'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: item.countInStock }).map(
                          (_, i) => (
                            <SelectItem value={(i + 1).toString()} key={i + 1}>
                              {i + 1}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      variant={'outline'}
                      size={'sm'}
                      onClick={() => removeItem(item)}
                    >
                      <TrashIcon className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
                <Separator />
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
