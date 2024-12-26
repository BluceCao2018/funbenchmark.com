import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import axios from 'axios'

const FACES_DIR = path.join(process.cwd(), 'public', 'faces')
const MAX_FACES = 500

export async function GET() {
  // Get random face
  const files = fs.readdirSync(FACES_DIR).filter(file => 
    file.endsWith('.jpg') || file.endsWith('.png')
  )
  const randomFile = files[Math.floor(Math.random() * files.length)]
  return NextResponse.json({ path: `/faces/${randomFile}` })
}

export async function POST() {
  try {
    // 确保目录存在
    if (!fs.existsSync(FACES_DIR)) {
      fs.mkdirSync(FACES_DIR, { recursive: true })
    }

    const files = fs.readdirSync(FACES_DIR).filter(file => 
      file.endsWith('.jpg') || file.endsWith('.png')
    )

    // 如果已经有500张图片，直接返回一个随机的本地图片
    if (files.length >= MAX_FACES) {
      const randomFile = files[Math.floor(Math.random() * files.length)]
      return NextResponse.json({ path: `/faces/${randomFile}` })
    }

    // 否则下载新图片
    const response = await axios.get('https://thispersondoesnotexist.com', {
      responseType: 'arraybuffer',
      timeout: 5000
    })

    const filename = `face_${Date.now()}.jpg`
    const filepath = path.join(FACES_DIR, filename)
    fs.writeFileSync(filepath, response.data)
    return NextResponse.json({ path: `/faces/${filename}` })
  } catch (error) {
    console.error('Request error:', error)
    return NextResponse.json({ error: 'Failed to download face' }, { status: 500 })
  }
}
