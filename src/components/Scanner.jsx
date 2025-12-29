import { useState, useRef, useEffect } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, X, Search, Loader2 } from 'lucide-react'

export default function Scanner({ onScan, loading }) {
  const [isScanning, setIsScanning] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const scannerRef = useRef(null)
  const html5QrCodeRef = useRef(null)

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader")
      html5QrCodeRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          stopScanning()
          onScan(decodedText)
        }
      )
      
      setIsScanning(true)
    } catch (err) {
      console.error("Camera error:", err)
      alert("Could not access camera. Please enter barcode manually.")
    }
  }

  const stopScanning = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(err => console.error(err))
      html5QrCodeRef.current = null
    }
    setIsScanning(false)
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualInput.trim()) {
      onScan(manualInput.trim())
      setManualInput('')
    }
  }

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(err => console.error(err))
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Scanner Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Scan Product Barcode
        </h2>
        
        {/* Camera Scanner */}
        {!isScanning && !loading && (
          <button
            onClick={startScanning}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Camera className="w-6 h-6" />
            Open Camera Scanner
          </button>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div id="qr-reader" ref={scannerRef} className="rounded-lg overflow-hidden"></div>
            <button
              onClick={stopScanning}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <X className="w-5 h-5" />
              Stop Scanner
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Checking safety...</span>
          </div>
        )}
      </div>

      {/* Manual Input */}
      {!isScanning && !loading && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Or Enter Manually
          </h3>
          <form onSubmit={handleManualSubmit} className="flex gap-3">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Enter barcode or product name..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!manualInput.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-6 rounded-xl flex items-center gap-2 transition-colors"
            >
              <Search className="w-5 h-5" />
              Check
            </button>
          </form>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm text-blue-900">
          <strong>Tip:</strong> You can scan barcodes, enter product names, or drug NDC codes (e.g., 0378-6150)
        </p>
      </div>
    </div>
  )
}
