import { useState, useRef, useEffect } from 'react'
import { Camera, X, Search, Loader2, Upload } from 'lucide-react'
import jsQR from 'jsqr'

export default function Scanner({ onScan, loading }) {
  const [isScanning, setIsScanning] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const barcodeDetectorRef = useRef(null)
  const animationFrameRef = useRef(null)
  const fileInputRef = useRef(null)

  const startScanning = async () => {
    setError(null)
    setIsScanning(true)
    
    try {
      console.log("Requesting camera access...")
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      // Try using native Barcode Detection API if available
      if ('BarcodeDetector' in window) {
        console.log("Using native BarcodeDetector API")
        barcodeDetectorRef.current = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
        })
        detectBarcode()
      } else {
        console.log("BarcodeDetector not supported - manual scanning only")
        setError("Camera opened - native barcode detection not supported on this browser. Please use manual input.")
      }

    } catch (err) {
      console.error("Camera error:", err)
      setError("Camera access denied")
      setIsScanning(false)
      alert("Could not access camera: " + err.message + "\n\nPlease allow camera permissions or use manual input.")
    }
  }

  const detectBarcode = async () => {
    if (!barcodeDetectorRef.current || !videoRef.current || !isScanning) {
      return
    }

    try {
      const barcodes = await barcodeDetectorRef.current.detect(videoRef.current)
      
      if (barcodes.length > 0) {
        const code = barcodes[0].rawValue
        console.log("Barcode detected:", code)
        stopScanning()
        onScan(code)
        return
      }
    } catch (err) {
      console.error("Detection error:", err)
    }

    // Continue scanning
    animationFrameRef.current = requestAnimationFrame(detectBarcode)
  }

  const stopScanning = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
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

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        
        if (code) {
          console.log("Barcode found in image:", code.data)
          onScan(code.data)
        } else {
          alert("No barcode detected in image. Please try:\n- Better lighting\n- Clearer photo\n- Or manually type the barcode")
        }
      }
      img.src = event.target?.result
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    return () => {
      if (isScanning) {
        stopScanning()
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
          <div className="space-y-3">
            <button
              onClick={startScanning}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Camera className="w-6 h-6" />
              Open Camera Scanner
            </button>
            
            <div className="text-center text-gray-500 text-sm">or</div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-6 h-6" />
              Upload Barcode Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden bg-black relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto"
                style={{ maxHeight: '400px' }}
              />
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white text-sm px-4 py-2 rounded-full">
                Point camera at barcode
              </div>
            </div>
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                {error}
              </div>
            )}
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
