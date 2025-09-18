import data from '@/src/lib/data'
import { connectToDatabase } from '.'
import * as ProductModel from './models/product.model'
import { cwd } from 'process'
import { loadEnvConfig } from '@next/env'
import User from './models/user.model'
import Review from './models/review.model'

// Load environment variables
loadEnvConfig(cwd())

// Extract the default export properly for ES module + tsx compatibility
const Product = ProductModel.default

const main = async () => {
  try {
    const { products, users,reviews } = data

    await connectToDatabase(process.env.MONGODB_URI)

    // Clear existing collections
    await Product.deleteMany()
    await User.deleteMany() // 🧹 clear users collection


    // Insert new seed data
    const createdUser = await User.insertMany(users)
    const createdProducts = await Product.insertMany(products)

    await Review.deleteMany()
    const rws = []
    for (let i = 0; i < createdProducts.length; i++) {
      let x = 0
      const { ratingDistribution } = createdProducts[i]
      for (let j = 0; j < ratingDistribution.length; j++) {
        for (let k = 0; k < ratingDistribution[j].count; k++) {
          x++
          rws.push({
            ...reviews.filter((x) => x.rating === j + 1)[
              x % reviews.filter((x) => x.rating === j + 1).length //get review from data
            ],
            isVerifiedPurchase: true,
            product: createdProducts[i]._id,
            user: createdUser[x % createdUser.length]._id,
            updatedAt: Date.now(),
            createdAt: Date.now(),
          })
        }
      }
    }
    const createReviews = await Review.insertMany(rws)
    console.log({
      createdUser,
      createdProducts,
      createReviews,
      message: 'Seeded database successfully',
    })

    process.exit(0)
  } catch (error) {
    console.error(error)
    throw new Error('Failed to Seed database')
  }
}

main()
