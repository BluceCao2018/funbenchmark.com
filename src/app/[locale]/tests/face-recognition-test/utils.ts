// Get random local face
export const getRandomLocalFace = async () => {
  const response = await fetch('/api/faces')
  const data = await response.json()
  return data.path
}

// Download and save new face
export const downloadAndSaveFace = async () => {
  const response = await fetch('/api/faces', { method: 'POST' })
  const data = await response.json()
  return data.path
} 