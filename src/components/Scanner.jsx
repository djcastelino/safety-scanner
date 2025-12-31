import { useState, useRef, useEffect } from 'react'
import Quagga from '@ericblade/quagga2'
import { Camera, X, Search, Loader2 } from 'lucide-react'

export default function Scanner({ onScan, loading }) {
  const [isScanning, setIsScanning] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [error, setError] = useState(null)
  const scannerRef = useRef(null)

  const startScanning = async () => {
    setError(null)
    try {
      await Quagga.init({
        inputStream: {
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            facingMode: "environment",
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 }
          }
        },
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "code_128_reader",
            "code_39_reader",
            "upc_reader",
            "upc_e_reader"
          ]
        },
        locate: true,
        locator: {
          patchSize: "medium",
          halfSample: true
        }
      }, (err) => {
        if (err) {
          console.error("Quagga init error:", err)
          setError("Camera access denied or not available")
          alert("Could not access camera. Please check permissions and try again, or enter barcode manually.")
          return
        }
        
        Quagga.start()
        setIsScanning(true)
      })

      Quagga.onDetected((result) => {
        if (result && result.codeResult && result.codeResult.code) {
          const code = result.codeResult.code
          console.log("Barcode detected:", code)
          stopScanning()
          onScan(code)
        }
      })

    } catch (err) {
      console.error("Camera error:", err)
      setError("Camera initialization failed")
      alert("Could not access camera. Please enter barcode manually.")
    }
  }

  const stopScanning = () => {
    if (isScanning) {
      Quagga.stop()
      setIsScanning(false)
    }
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
      if (isScanning) {
        Quagga.stop()
      }
    }
  }, [isScanning])

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
            <div ref={scannerRef} className="rounded-lg overflow-hidden bg-black relative" style={{ minHeight: '300px' }}>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm">
                Point camera at barcode
              </div>
            </div>
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
