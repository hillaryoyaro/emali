'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2Icon } from 'lucide-react'

import useCartStore from '@/src/hooks/stores/use-cart-store'
import { FREE_SHIPPING_PRICE } from '@/src/lib/constants'
import { cn } from '@/src/lib/utils/utils'
import { buttonVariants } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import ProductPrice from '@/src/components/shared/product/product-price'
import BrowsingHistoryList from '@/src/components/shared/common/browsing-history-list'


export default function CartAddItem({ itemId }: { itemId: string }) {
  const {
    cart: { items, itemsPrice },
  } = useCartStore()

  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState(() => items.find(i => i.clientId === itemId))

  useEffect(() => {
    setItem(items.find(i => i.clientId === itemId))
    setLoading(false)
  }, [items, itemId])

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">Loading cart...</div>
  }

  if (!item) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2">Item not found in your cart</h2>
        <Link href="/products" className={cn(buttonVariants(), 'rounded-full')}>
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
        {/* Left Card - Product Info */}
        <Card className="w-full rounded-none">
          <CardContent className="flex h-full items-center justify-center gap-3 py-4">
            <Link href={`/product/${item.slug}`}>
              <Image
                src={item.image}
                alt={item.name}
                width={80}
                height={80}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </Link>
            <div>
              <h3 className="text-xl font-bold flex gap-2 my-2">
                <CheckCircle2Icon className="h-6 w-6 text-green-700" />
                Added to cart
              </h3>
              <p className="text-sm">
                <span className="font-bold">Color:</span> {item.color ?? '-'}
              </p>
              <p className="text-sm">
                <span className="font-bold">Size:</span> {item.size ?? '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right Card - Summary */}
        <Card className="w-full rounded-none">
          <CardContent className="p-4 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex justify-center items-center text-center">
                {itemsPrice < FREE_SHIPPING_PRICE ? (
                  <div>
                    Add{' '}
                    <span className="text-green-700">
                      <ProductPrice
                        price={FREE_SHIPPING_PRICE - itemsPrice}
                        plain
                      />
                    </span>{' '}
                    more to qualify for <strong>FREE Shipping</strong>
                  </div>
                ) : (
                  <div className="text-green-700">
                    Your order qualifies for <strong>FREE Shipping</strong>. Choose this option at checkout.
                  </div>
                )}
              </div>
              <div className="lg:border-l lg:border-muted lg:pl-3 flex flex-col items-center gap-3">
                <div className="flex gap-3">
                  <span className="text-lg font-bold">Cart Subtotal:</span>
                  <ProductPrice className="text-2xl" price={itemsPrice} />
                </div>
                <Link
                  href="/checkout"
                  className={cn(buttonVariants(), 'rounded-full w-full')}
                >
                  Proceed to checkout ({items.reduce((a, c) => a + c.quantity, 0)} items)
                </Link>
                <Link
                  href="/cart"
                  className={cn(buttonVariants({ variant: 'outline' }), 'rounded-full w-full')}
                >
                  Go to Cart
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Browsing History Section */}
      <BrowsingHistoryList />
    </div>
  )
}
