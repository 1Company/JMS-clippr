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

const startTime = Date.now()

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let dbStatus: 'connected' | 'disconnected' = 'disconnected'

  try {
    await prisma.$queryRaw`SELECT 1`
    dbStatus = 'connected'
  } catch {
    dbStatus = 'disconnected'
  }

  const status = dbStatus === 'connected' ? 'healthy' : 'unhealthy'
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000)

  return NextResponse.json({
    status,
    version: '0.1.0',
    uptime: uptimeSeconds,
    database: dbStatus,
    timestamp: new Date().toISOString(),
  })
}
