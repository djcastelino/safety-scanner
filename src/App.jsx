import { useState } from 'react'
import Scanner from './components/Scanner'
import Results from './components/Results'
import History from './components/History'
import { Shield, History as HistoryIcon } from 'lucide-react'

function App() {
  const [view, setView] = useState('scanner')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  const handleScan = async (barcode) => {
    setLoading(true)
    try {
      const response = await fetch('https://workflowly.online/webhook/safety-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode, user_id: 'user_' + Date.now() })
      })
      
      const data = await response.json()
      setResults(data)
      
      const historyItem = {
        barcode,
        timestamp: new Date().toISOString(),
        result: data
      }
      setHistory(prev => [historyItem, ...prev.slice(0, 9)])
      
      setView('results')
    } catch (error) {
      console.error('Scan error:', error)
      setResults({ error: 'Failed to check safety. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleNewScan = () => {
    setResults(null)
    setView('scanner')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">SafeScan</h1>
          </div>
          <button
            onClick={() => setView(view === 'history' ? 'scanner' : 'history')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <HistoryIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {view === 'scanner' && (
          <Scanner onScan={handleScan} loading={loading} />
        )}
        
        {view === 'results' && results && (
          <Results data={results} onNewScan={handleNewScan} />
        )}
        
        {view === 'history' && (
          <History items={history} onSelectItem={(item) => {
            setResults(item.result)
            setView('results')
          }} />
        )}
      </main>
    </div>
  )
}

export default App
