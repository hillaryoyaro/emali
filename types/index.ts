import { MpesaInputSchema } from "@/lib/validation/mpesa";
import { 
  CartSchema, 
  OrderInputSchema, 
  OrderItemSchema, 
  ProductInputSchema, 
  ReviewInputSchema, 
  ShippingAddressSchema, 
  UserInputSchema, 
  UserNameSchema, 
  UserSignInSchema,
  UserSignUpSchema
 } from "@/lib/validation/validator";
import {  z } from 'zod'

export type IReviewInput = z.infer<typeof ReviewInputSchema>
export type IReviewDetails = IReviewInput & {
  _id: string
  createdAt: string
  user: {
    name: string
  }
}


export type Data = {
    users: IUserInput[]
    products: IProductInput[]
    reviews: {
      title: string
      rating: number
      comment: string
    }[]
    headerMenus: {
      name: string
      href: string
    }[]
    carousels: {
      image: string
      url: string
      title: string
      buttonCaption: string
      isPublished: boolean
    }[]
  }

//Product --from zod product-schema  
export type IProductInput = z.infer<typeof ProductInputSchema>  

//Order Section
//Order --from zod order-schema
export type IOrderInput = z.infer<typeof OrderInputSchema>
export type IOrderList = IOrderInput & {
  _id: string
  user: {
    name: string
    email: string
  }
  createdAt: Date
}
export type OrderItem = z.infer<typeof OrderItemSchema>

export type Cart = z.infer<typeof CartSchema>
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>

//User --from zod user-schema
export type IUserInput = z.infer<typeof UserInputSchema>
export type IUserSignIn = z.infer<typeof UserSignInSchema>
export type IUserSignUp = z.infer<typeof UserSignUpSchema>
export type IUserName = z.infer<typeof UserNameSchema>

export type IMpesaTransactionInput = z.infer<typeof MpesaInputSchema>
