import data from '@/lib/data'
import { connectToDatabase } from '.'
import * as ProductModel from './models/product.model'
import { cwd } from 'process'
import { loadEnvConfig } from '@next/env'
import User from './models/user.model'

// Load environment variables
loadEnvConfig(cwd())

// Extract the default export properly for ES module + tsx compatibility
const Product = ProductModel.default

const main = async () => {
  try {
    const { products, users } = data

    await connectToDatabase(process.env.MONGODB_URI)

    // Clear existing collections
    await Product.deleteMany()
    await User.deleteMany() // 🧹 clear users collection

    // Insert new seed data
    const createUser = await User.insertMany(users)
    const createdProducts = await Product.insertMany(products)

    console.log({
      createUser,
      createdProducts,
      message: 'Seeded database successfully',
    })

    process.exit(0)
  } catch (error) {
    console.error(error)
    throw new Error('Failed to Seed database')
  }
}

main()
