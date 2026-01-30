import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '..', 'data', 'sources.json')

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE)
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
    await fs.writeFile(DATA_FILE, '[]')
  }
}

export async function getAllSources() {
  await ensureDataFile()
  const data = await fs.readFile(DATA_FILE, 'utf-8')
  return JSON.parse(data)
}

export async function getEnabledSources() {
  const sources = await getAllSources()
  return sources.filter(s => s.enabled)
}

export async function getSourceById(id) {
  const sources = await getAllSources()
  return sources.find(s => s.id === id) || null
}

export async function createSource(input) {
  const sources = await getAllSources()
  const newSource = {
    id: uuidv4(),
    ...input,
    enabled: input.enabled !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  sources.push(newSource)
  await fs.writeFile(DATA_FILE, JSON.stringify(sources, null, 2))
  return newSource
}

export async function updateSource(id, input) {
  const sources = await getAllSources()
  const idx = sources.findIndex(s => s.id === id)
  if (idx === -1) {
    throw new Error('Source not found')
  }

  sources[idx] = {
    ...sources[idx],
    ...input,
    updatedAt: new Date().toISOString()
  }
  await fs.writeFile(DATA_FILE, JSON.stringify(sources, null, 2))
  return sources[idx]
}

export async function deleteSource(id) {
  const sources = await getAllSources()
  const filtered = sources.filter(s => s.id !== id)
  if (filtered.length === sources.length) {
    throw new Error('Source not found')
  }
  await fs.writeFile(DATA_FILE, JSON.stringify(filtered, null, 2))
}

export async function toggleSource(id, enabled) {
  return updateSource(id, { enabled })
}
