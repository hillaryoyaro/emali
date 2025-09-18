export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'EmaliExpress '
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const SENDER_EMAIL = process.env.SENDER_EMAIL || 'admin@example.com'
export const SENDER_NAME = process.env.SENDER_NAME || APP_NAME


export const APP_SLOGAN = process.env.NEXT_PUBLIC_APP_SLOGAN || 'Spend less,enjoy more.'  
export const APP_DESCRIPTION = 
    process.env.NEXT_PUBLIC_APP_DESCRIPTION || 
    'Marketplace app,build with Next.js, Tailwind CSS, and MongoDB'  

export const APP_COPYRIGHT = process.env.NEXT_PUBLIC_APP_COPYRIGHT || `Copyright © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.`    

export const PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE || 10)   
export const FREE_SHIPPING_PRICE = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_PRICE || 35) 

export const AVAILABLE_PAYMENT_METHODS = [
  {
    name: 'PayPal',
    commission: 0,
    isDefault: true,
  },
  {
    name: 'Stripe',
    commission: 0,
    isDefault: false,
  },
  {
    name: 'Cash On Delivery',
    commission: 0,
    isDefault: false,
  },
  {
    name: 'Mpesa',
    commission: 0,
    isDefault: false,
  },
]

export const DEFAULT_PAYMENT_METHOD = process.env.DEFAULT_PAYMENT_METHOD || 'PayPal'

export const AVAILABLE_DELIVERY_DATES = [
    {
        name: 'Tomorrow',
        daysToDeliver: 1,
        shippingPrice: 12.9,
        freeShippingMinPrice: 0
    },
    {
        name: 'Next 3 days',
        daysToDeliver: 3,
        shippingPrice: 6.9,
        freeShippingMinPrice: 0
    },
    {
        name: 'Next 5 days',
        daysToDeliver: 5,
        shippingPrice: 4.9,
        freeShippingMinPrice: 35
    }
]
