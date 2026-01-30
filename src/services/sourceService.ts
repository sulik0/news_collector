import { CustomSource, CreateSourceInput } from '../types/source'

const API_BASE = '/api/sources'

export async function getSources(): Promise<CustomSource[]> {
  const res = await fetch(API_BASE)
  if (!res.ok) {
    throw new Error('获取源列表失败')
  }
  return res.json()
}

export async function createSource(data: CreateSourceInput): Promise<CustomSource> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw new Error('创建源失败')
  }
  return res.json()
}

export async function updateSource(
  id: string,
  data: Partial<CustomSource>
): Promise<CustomSource> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw new Error('更新源失败')
  }
  return res.json()
}

export async function deleteSource(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    throw new Error('删除源失败')
  }
}

export async function toggleSource(id: string, enabled: boolean): Promise<CustomSource> {
  const res = await fetch(`${API_BASE}/${id}/toggle`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  })
  if (!res.ok) {
    throw new Error('切换源状态失败')
  }
  return res.json()
}
