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

function getPeriodDate(period: string): Date {
  const now = new Date()
  switch (period) {
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case '7d':
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') || '7d'
  const since = getPeriodDate(period)

  try {
    const [
      totalUsers,
      newUsers,
      activeUsers,
      totalSalons,
      totalStaff,
      totalServices,
      totalBookings,
      periodBookings,
      revenueResult,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: since } } }),
      prisma.user.count({
        where: {
          customerBookings: {
            some: { createdAt: { gte: since } },
          },
        },
      }),
      prisma.salon.count(),
      prisma.staff.count(),
      prisma.service.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { createdAt: { gte: since } } }),
      prisma.booking.aggregate({
        where: {
          createdAt: { gte: since },
          status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
        _sum: { price: true },
      }),
    ])

    const periodRevenue = revenueResult._sum.price
      ? Number(revenueResult._sum.price)
      : 0

    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
      },
      usage: {
        salons: totalSalons,
        bookings: periodBookings,
        totalBookings,
        staff: totalStaff,
        services: totalServices,
      },
      revenue: {
        period: periodRevenue,
        mrr: 0,
      },
      period,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Management stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
