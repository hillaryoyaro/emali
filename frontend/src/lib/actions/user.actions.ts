'use server'

import bcrypt from 'bcryptjs'
import {  auth, signIn, signOut } from '@/auth'
import { IUserName, IUserSignIn, IUserSignUp } from '@/src/types'
import { redirect } from 'next/navigation'
import { UserSignUpSchema } from '../validation/validator'
import { connectToDatabase } from '../db'
import User from '../db/models/user.model'
import { formatError } from '../utils/utils'


// CREATE
export async function registerUser(userSignUp: IUserSignUp) {
  try {
    const user = await UserSignUpSchema.parseAsync({
      name: userSignUp.name,
      email: userSignUp.email,
      password: userSignUp.password,
      confirmPassword: userSignUp.confirmPassword,
    })

    await connectToDatabase()
    await User.create({
      ...user,
      password: await bcrypt.hash(user.password, 5),
    })
    return { success: true, message: 'User created successfully' }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}


export async function updateUserName(user: IUserName) {
  try {
    await connectToDatabase() //connect to database
    const session = await auth() //get session by calling auth function
    const currentUser = await User.findById(session?.user?.id)
    if (!currentUser) throw new Error('User not found')
    currentUser.name = user.name
    const updatedUser = await currentUser.save()
    return {
      success: true,
      message: 'User updated successfully',
      data: JSON.parse(JSON.stringify(updatedUser)),
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}


// SignInWithCredentials
export async function signInWithCredentials(user: IUserSignIn) {
  return await signIn('credentials', { ...user, redirect: false })
}

// SignInWithGoogle
export const SignInWithGoogle = async () => {
  await signIn('google')
}

// SignOut
export const SignOut = async () => {
  const redirectTo = await signOut({ redirect: false })
  redirect(redirectTo.redirect)
}

