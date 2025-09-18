'use client'

import { Button } from '@/src/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { useToast } from '@/src/hooks/client/use-toast'
import useCartStore from '@/src/hooks/stores/use-cart-store'
// Replace old use-toast with new use-sonner

import { OrderItem } from '@/src/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AddToCart({
  item,
  minimal = false,
}: {
  item: OrderItem
  minimal?: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()
  const { addItem } = useCartStore()

  const [quantity, setQuantity] = useState(1)

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      toast({
        variant: 'destructive',
        description: error.message,
      })
    } else {
      toast({
        variant: 'destructive',
        description: 'An unexpected error occurred',
      })
    }
  }

  return minimal ? (
    <Button
      className='rounded-full w-auto'
      onClick={() => {
        try {
          addItem(item, 1)
          toast({
            description: 'Added to Cart',
            action: (
              <Button
                onClick={() => {
                  router.push('/cart')
                }}
              >
                Go to Cart
              </Button>
            ),
          })
        } catch (error: unknown) {
          handleError(error)
        }
      }}
    >
      Add to Cart
    </Button>
  ) : (
    <div className='w-full space-y-2'>
      <Select
        value={quantity.toString()}
        onValueChange={(i) => setQuantity(Number(i))}
      >
        <SelectTrigger>
          <SelectValue>Quantity: {quantity}</SelectValue>
        </SelectTrigger>
        <SelectContent position='popper'>
          {Array.from({ length: item.countInStock }).map((_, i) => (
            <SelectItem key={i + 1} value={`${i + 1}`}>
              {i + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        className='rounded-full w-full'
        type='button'
        onClick={async () => {
          try {
            const itemId = await addItem(item, quantity)
            router.push(`/cart/${itemId}`)
          } catch (error: unknown) {
            handleError(error)
          }
        }}
      >
        Add to Cart
      </Button>

      <Button
        variant='secondary'
        onClick={() => {
          try {
            addItem(item, quantity)
            router.push(`/checkout`)
          } catch (error: unknown) {
            handleError(error)
          }
        }}
        className='w-full rounded-full'
      >
        Buy Now
      </Button>
    </div>
  )
}
