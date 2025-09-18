// /app/api/products/image-search/route.ts
import { NextResponse } from 'next/server'

const PYTHON_API = process.env.PY_API_URL ?? 'http://localhost:8000'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const res = await fetch(`${PYTHON_API}/api/search/image-search`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      throw new Error(`Image search API failed: ${res.status}`)
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: unknown) {
    console.error('Image search proxy error:', error)
    const message =
      error instanceof Error ? error.message : 'Unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
