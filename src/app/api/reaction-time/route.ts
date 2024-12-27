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
  city: string
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
    const countryCode = headersList.get('x-vercel-ip-country') || 'UN'
    const region = headersList.get('x-vercel-ip-country-region') || 'Unknown'
    const city = headersList.get('x-vercel-ip-city') || 'Unknown'
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
      region,
      city
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
    const cityResults = results.filter(r => 
      r.city === city
    )
    
    const regionalRank = regionalResults.filter(r => r.reactionTime < reactionTime).length + 1
    const nationalRank = nationalResults.filter(r => r.reactionTime < reactionTime).length + 1
    const cityRank = cityResults.filter(r => r.reactionTime < reactionTime).length + 1
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
        cityRank,
        totalCity: cityResults.length
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
    const headersList = headers()
    const countryCode = headersList.get('x-vercel-ip-country') || 'UN'
    const region = headersList.get('x-vercel-ip-country-region') || 'Unknown'
    const city = headersList.get('x-vercel-ip-city') || 'Unknown'
    const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) || 'Unknown'
    
    console.log('Location info:', { countryCode, region, city })
    
    const allResults = await readResultsFile()
    const reactionTimeResults = allResults['reactionTime'] || []
    
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    const filteredResults = reactionTimeResults.filter(r => r.timestamp > oneDayAgo)
    
    const rankings = {
      regional: {
        name: region,
        data: filteredResults
          .filter(r => r.region === region && r.countryCode === countryCode)
          .sort((a, b) => a.reactionTime - b.reactionTime)
          .slice(0, 10)
      },
      national: {
        name: countryName,
        data: filteredResults
          .filter(r => r.countryCode === countryCode)
          .sort((a, b) => a.reactionTime - b.reactionTime)
          .slice(0, 10)
      },
      city: {
        name: city,
        data: filteredResults
          .filter(r => r.city === city)
          .sort((a, b) => a.reactionTime - b.reactionTime)
          .slice(0, 10)
      },
      global: {
        name: 'Global',
        data: filteredResults
          .sort((a, b) => a.reactionTime - b.reactionTime)
          .slice(0, 10)
      }
    }

    return NextResponse.json({ rankings }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ 
      message: 'Error retrieving results', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 