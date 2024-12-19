import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

interface TestResult {
  timestamp: number
  reactionTime: number
  userId?: string
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

    // 读取现有结果
    const allResults = await readResultsFile()

    // 确保 'reactionTime' 测试类型存在
    if (!allResults['reactionTime']) {
      allResults['reactionTime'] = []
    }

    // 添加新结果
    const newResult: TestResult = {
      timestamp: Date.now(),
      reactionTime: reactionTime,
      userId: userId || 'anonymous'
    }

    allResults['reactionTime'].push(newResult)

    // 写回文件
    await writeResultsFile(allResults)

    return NextResponse.json({ 
      message: 'Result saved successfully', 
      result: newResult 
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
    return NextResponse.json(allResults, { status: 200 })
  } catch (error) {
    return NextResponse.json({ 
      message: 'Error retrieving results', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 