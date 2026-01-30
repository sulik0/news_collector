import { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, X } from 'lucide-react'
import { CustomSource, CreateSourceInput } from '../../types/source'
import * as sourceApi from '../../services/sourceService'
import { SourceList } from './SourceList'
import { SourceForm } from './SourceForm'

interface SourceManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function SourceManager({ isOpen, onClose }: SourceManagerProps) {
  const [sources, setSources] = useState<CustomSource[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSource, setEditingSource] = useState<CustomSource | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadSources = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await sourceApi.getSources()
      setSources(data)
    } catch (err) {
      setError('加载源列表失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadSources()
    }
  }, [isOpen, loadSources])

  const handleCreate = async (data: CreateSourceInput) => {
    try {
      const newSource = await sourceApi.createSource(data)
      setSources((prev) => [...prev, newSource])
      setShowForm(false)
    } catch (err) {
      console.error(err)
      alert('创建失败，请重试')
    }
  }

  const handleUpdate = async (data: CreateSourceInput) => {
    if (!editingSource) return
    try {
      const updated = await sourceApi.updateSource(editingSource.id, data)
      setSources((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      )
      setEditingSource(null)
      setShowForm(false)
    } catch (err) {
      console.error(err)
      alert('更新失败，请重试')
    }
  }

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const updated = await sourceApi.toggleSource(id, enabled)
      setSources((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      )
    } catch (err) {
      console.error(err)
      alert('操作失败，请重试')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个新闻源吗？')) return
    try {
      await sourceApi.deleteSource(id)
      setSources((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error(err)
      alert('删除失败，请重试')
    }
  }

  const handleEdit = (source: CustomSource) => {
    setEditingSource(source)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingSource(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">自定义新闻源</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={loadSources}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="刷新"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Add button */}
          <button
            onClick={() => setShowForm(true)}
            className="w-full mb-4 p-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            添加新闻源
          </button>

          {/* Source list */}
          <SourceList
            sources={sources}
            loading={loading}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Stats */}
        <div className="p-3 border-t bg-gray-50 text-sm text-gray-500 flex justify-between">
          <span>共 {sources.length} 个源</span>
          <span>{sources.filter((s) => s.enabled).length} 个已启用</span>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <SourceForm
          source={editingSource}
          onSubmit={editingSource ? handleUpdate : handleCreate}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  )
}
