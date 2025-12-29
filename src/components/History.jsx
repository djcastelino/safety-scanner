import { Clock, AlertTriangle, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react'

export default function History({ items, onSelectItem }) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scan History</h3>
        <p className="text-gray-600">Your scanned products will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Scan History</h2>
      
      <div className="space-y-3">
        {items.map((item, index) => (
          <HistoryItem key={index} item={item} onSelect={() => onSelectItem(item)} />
        ))}
      </div>
    </div>
  )
}

function HistoryItem({ item, onSelect }) {
  const getStatusIcon = (safetyStatus) => {
    switch (safetyStatus) {
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />
    }
  }

  const getStatusColor = (safetyStatus) => {
    switch (safetyStatus) {
      case 'danger':
        return 'border-l-red-500'
      case 'warning':
        return 'border-l-yellow-500'
      default:
        return 'border-l-green-500'
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const result = item.result || {}
  const hasError = !!result.error

  return (
    <button
      onClick={onSelect}
      className={`w-full bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 border-l-4 ${getStatusColor(result.safetyStatus)} text-left`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-1">
            {getStatusIcon(result.safetyStatus)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {hasError ? 'No recalls found' : result.itemName || item.barcode}
            </p>
            <p className="text-sm text-gray-600 truncate">{item.barcode}</p>
            <p className="text-xs text-gray-500 mt-1">
              {formatTimestamp(item.timestamp)}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
      </div>
    </button>
  )
}
