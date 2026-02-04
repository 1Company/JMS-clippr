import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  const token = auth?.replace('Bearer ', '')
  if (!token || token !== process.env.MANAGEMENT_API_KEY) {
    return false
  }
  return true
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  try {
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.customer.count(),
    ])

    return NextResponse.json({
      customers,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Management customers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}
