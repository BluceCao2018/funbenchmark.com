import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { headers } from 'next/headers'

interface TestResult {
  timestamp: number
  reactionTime: number
  userId?: string
  countryCode: string
  region: string
}

interface AllResults {
  [testType: string]: TestResult[]
}

const RESULTS_FILE_PATH = path.join(process.cwd(), 'public', 'test-results.json')

async function readResultsFile(): Promise<AllResults> {
  try {
    const fileContents = await fs.readFile(RESULTS_FILE_PATH, 'utf-8')
    return JSON.parse(fileContents)
  } catch (error) {
    // 如果文件不存在，返回空对象
    return {}
  }
}

async function writeResultsFile(data: AllResults) {
  await fs.writeFile(RESULTS_FILE_PATH, JSON.stringify(data, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    const { reactionTime, userId } = await request.json()
    const headersList = headers()
    const countryCode = headersList.get('cf-ipcountry') || 'UN'
    const region = headersList.get('cf-region') || 'Unknown'

    // 读取现有结果
    const allResults = await readResultsFile()

    // 确保 'reactionTime' 测试类型存在
    if (!allResults['reactionTime']) {
      allResults['reactionTime'] = []
    }

    // 清理24小时前的数据
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    allResults['reactionTime'] = allResults['reactionTime'].filter(r => r.timestamp > oneDayAgo)

    // 添加新结果
    const newResult: TestResult = {
      timestamp: Date.now(),
      reactionTime: reactionTime,
      userId: userId || 'anonymous',
      countryCode,
      region
    }

    allResults['reactionTime'].push(newResult)

    // 写回文件
    await writeResultsFile(allResults)

    // 计算排名
    const results = allResults['reactionTime']
    const regionalResults = results.filter(r => 
      r.region === region && r.countryCode === countryCode
    )
    const nationalResults = results.filter(r => 
      r.countryCode === countryCode
    )
    
    const regionalRank = regionalResults.filter(r => r.reactionTime < reactionTime).length + 1
    const nationalRank = nationalResults.filter(r => r.reactionTime < reactionTime).length + 1
    const globalRank = results.filter(r => r.reactionTime < reactionTime).length + 1

    return NextResponse.json({ 
      message: 'Result saved successfully', 
      result: newResult,
      rankings: {
        regionalRank,
        totalRegional: regionalResults.length,
        nationalRank,
        totalNational: nationalResults.length,
        globalRank,
        totalGlobal: results.length,
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error saving result:', error)
    return NextResponse.json({ 
      message: 'Error saving result', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const allResults = await readResultsFile()
    
    // 清理24小时前的数据
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    if (allResults['reactionTime']) {
      allResults['reactionTime'] = allResults['reactionTime'].filter(r => r.timestamp > oneDayAgo)
      await writeResultsFile(allResults)

      const times = allResults['reactionTime'].map(r => r.reactionTime)
      return NextResponse.json({
        results: allResults,
        stats: {
          totalParticipants: times.length,
          averageTime: times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0,
          bestTime: times.length ? Math.min(...times) : 0,
        }
      }, { status: 200 })
    }
    
    return NextResponse.json(allResults, { status: 200 })
  } catch (error) {
    return NextResponse.json({ 
      message: 'Error retrieving results', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 