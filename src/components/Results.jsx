import { AlertTriangle, CheckCircle, AlertCircle, Info, ExternalLink, ArrowLeft } from 'lucide-react'

export default function Results({ data, onNewScan }) {
  if (data.error) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">No Recalls Found</h3>
              <p className="text-yellow-800">{data.error}</p>
            </div>
          </div>
        </div>
        {data.aiAnalysis && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <AIAnalysis analysis={data.aiAnalysis} />
          </div>
        )}
        <button
          onClick={onNewScan}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          New Scan
        </button>
      </div>
    )
  }

  const getRiskColor = (status) => {
    switch (status) {
      case 'danger':
        return 'bg-red-50 border-red-200 text-red-900'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900'
      default:
        return 'bg-green-50 border-green-200 text-green-900'
    }
  }

  const getRiskIcon = (status) => {
    switch (status) {
      case 'danger':
        return <AlertTriangle className="w-8 h-8 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-8 h-8 text-yellow-600" />
      default:
        return <CheckCircle className="w-8 h-8 text-green-600" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'danger':
        return 'RECALL ALERT'
      case 'warning':
        return 'Safety Notice'
      default:
        return 'Safe'
    }
  }

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <div className={`${getRiskColor(data.safetyStatus)} border rounded-xl p-6`}>
        <div className="flex items-start gap-4">
          {getRiskIcon(data.safetyStatus)}
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">{getStatusText(data.safetyStatus)}</h2>
            <p className="font-semibold text-lg">{data.itemName}</p>
            <p className="text-sm opacity-75 mt-1">Source: {data.source}</p>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      {data.aiAnalysis && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <AIAnalysis analysis={data.aiAnalysis} />
        </div>
      )}

      {/* Recall Details */}
      {data.recalls && data.recalls.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Recall Details
          </h3>
          <div className="space-y-4">
            {data.recalls.map((recall, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                {recall.title && (
                  <h4 className="font-semibold text-gray-900 mb-2">{recall.title}</h4>
                )}
                {recall.description && (
                  <p className="text-gray-700 text-sm mb-2">{recall.description}</p>
                )}
                {recall.reason && (
                  <p className="text-gray-700 text-sm mb-2">
                    <strong>Reason:</strong> {recall.reason}
                  </p>
                )}
                {recall.date && (
                  <p className="text-gray-600 text-sm">
                    <strong>Date:</strong> {new Date(recall.date).toLocaleDateString()}
                  </p>
                )}
                {recall.recallNumber && (
                  <p className="text-gray-600 text-sm">
                    <strong>Recall #:</strong> {recall.recallNumber}
                  </p>
                )}
                {recall.classification && (
                  <p className="text-gray-600 text-sm">
                    <strong>Class:</strong> {recall.classification}
                  </p>
                )}
                {recall.url && (
                  <a
                    href={recall.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm mt-2"
                  >
                    More Details <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info - only show useful non-redundant info */}
      {data.details && (() => {
        const usefulDetails = Object.entries(data.details).filter(([key]) => 
          key !== 'recallNumber' && key !== 'lastPublishDate'
        )
        
        if (usefulDetails.length === 0) return null
        
        return (
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Additional Information</h4>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {usefulDetails.map(([key, value]) => (
                <div key={key}>
                  <dt className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</dt>
                  <dd className="text-gray-900 font-medium">{value?.toLocaleString?.() || value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )
      })()}

      {/* New Scan Button */}
      <button
        onClick={onNewScan}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Scan Another Product
      </button>
    </div>
  )
}

function AIAnalysis({ analysis }) {
  const getRiskBadgeColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-gray-900">AI Safety Analysis</h3>
        {analysis.riskLevel && (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskBadgeColor(analysis.riskLevel)}`}>
            {analysis.riskLevel}
          </span>
        )}
      </div>

      {analysis.simpleSummary && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-gray-800">{analysis.simpleSummary}</p>
        </div>
      )}

      {analysis.action && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
          <p className="font-semibold text-amber-900 text-sm mb-1">Recommended Action:</p>
          <p className="text-gray-800">{analysis.action}</p>
        </div>
      )}

      {analysis.whoAtRisk && (
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
          <p className="font-semibold text-purple-900 text-sm mb-1">Who's At Risk:</p>
          <p className="text-gray-800">{analysis.whoAtRisk}</p>
        </div>
      )}
    </div>
  )
}
