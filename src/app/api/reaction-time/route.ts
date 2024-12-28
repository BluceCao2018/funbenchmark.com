import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

// 初始化 R2 客户端
const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME!
const RESULTS_KEY = 'test-results.json'

// 辅助函数：从 R2 读取数据
async function getResults(): Promise<AllResults> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: RESULTS_KEY,
    })
    const response = await S3.send(command)
    const data = await response.Body?.transformToString()
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error('Error reading from R2:', error)
    return {}
  }
}

// 辅助函数：写入数据到 R2
async function saveResults(results: AllResults) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: RESULTS_KEY,
    Body: JSON.stringify(results),
    ContentType: 'application/json',
  })
  await S3.send(command)
}

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

export async function POST(request: NextRequest) {
  try {
    const { reactionTime, userId } = await request.json()
    const headersList = headers()
    const countryCode = headersList.get('x-vercel-ip-country') || 'UN'
    const region = headersList.get('x-vercel-ip-country-region') || 'Unknown'
    const city = headersList.get('x-vercel-ip-city') || 'Unknown'
    
    // 从 R2 读取现有结果
    const allResults = await getResults()

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

    // 保存到 R2
    await saveResults(allResults)

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
    
    // 从 R2 读取结果
    const allResults = await getResults()
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