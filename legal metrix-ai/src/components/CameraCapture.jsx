import { useRef, useState, useEffect } from 'react';
import { Camera, Aperture, X } from 'lucide-react';

function CameraCapture({ onImagesChange, maxImages = 5, resetKey = 0 }) {
    const videoRef = useRef(null); // live camera feed dikhane ke liye
    const canvasRef = useRef(null); // photo "khींchne" ke liye invisible canvas
    const streamRef = useRef(null); // camera stream ko baad mein band karne ke liye

    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [capturedImages, setCapturedImages] = useState([]); // {file, preview} objects
    const [error, setError] = useState('');

    // Reset captured photos when resetKey changes (e.g. when adding product to queue)
    useEffect(() => {
        setCapturedImages([]);
    }, [resetKey]);

    // Camera ko khol ke video element se jodna
    const openCamera = async () => {
        setError('');
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API is not supported by your browser or requires HTTPS / localhost.');
            }
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' } },
            });
            streamRef.current = stream;
            setIsCameraOpen(true);
        } catch (err) {
            console.error('Camera error:', err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Camera permission was denied. Please allow camera access in your browser settings.');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError('No camera device found on your device.');
            } else {
                setError(err.message || 'Camera access denied or not available. Please allow camera permission.');
            }
        }
    };

    // Video stream set node when videoRef is mounted
    useEffect(() => {
        if (isCameraOpen && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [isCameraOpen]);

    // Camera band karna - jab kaam ho jaye, resources free karne ke liye zaroori
    const closeCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    // Component unmount hone pe (page se hatne pe) camera automatically band ho jaye
    useEffect(() => {
        return () => closeCamera();
    }, []);

    // Live video ke current frame ko "photo" mein convert karna
    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Canvas ka size video ke actual resolution jitna set karo (quality maintain karne ke liye)
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Canvas ko ek image file (blob) mein convert karo
        canvas.toBlob((blob) => {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            const preview = URL.createObjectURL(blob);

            setCapturedImages((prev) => {
                // Agar maxImages === 1 hai, to naye photo se purana photo replace karo (1 photo per product limit)
                const updated = maxImages === 1 ? [{ file, preview }] : [...prev, { file, preview }].slice(0, maxImages);
                if (onImagesChange) {
                    onImagesChange(
                        updated.map((img) => img.file),
                        updated.map((img) => img.preview)
                    );
                }
                return updated;
            });
        }, 'image/jpeg', 0.9); // 0.9 = 90% quality, achhi balance hai size aur clarity ka
    };

    // Ek specific photo ko list se hataana (agar galat khींch gayi ho)
    const removeImage = (index) => {
        setCapturedImages((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            if (onImagesChange) {
                onImagesChange(
                    updated.map((img) => img.file),
                    updated.map((img) => img.preview)
                );
            }
            return updated;
        });
    };

    return (
        <div>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!isCameraOpen ? (
                <button
                    type="button"
                    onClick={openCamera}
                    style={{
                        padding: '11px 18px', backgroundColor: '#0F6E56', color: 'white', border: 'none', borderRadius: '10px',
                        fontWeight: 700, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                    }}
                >
                    <Camera size={16} /> Open Camera
                </button>
            ) : (
                <div>
                    {/* Live camera preview */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{ width: '100%', maxWidth: '400px', borderRadius: '12px', backgroundColor: '#000' }}
                    />

                    <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={capturePhoto}
                            style={{
                                padding: '11px 18px', backgroundColor: '#0F6E56', color: 'white', border: 'none', borderRadius: '10px',
                                fontWeight: 700, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                            }}
                        >
                            <Aperture size={16} /> Capture Photo ({capturedImages.length}/{maxImages})
                        </button>

                        <button
                            type="button"
                            onClick={closeCamera}
                            style={{
                                padding: '11px 18px', backgroundColor: '#5B6478', color: 'white', border: 'none', borderRadius: '10px',
                                fontWeight: 700, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                            }}
                        >
                            <X size={16} /> Close Camera
                        </button>
                    </div>
                </div>
            )}

            {/* Hidden canvas - user ko kabhi nahi dikhega, sirf photo "khींchne" ke liye use hota hai */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Captured photos ki thumbnail list */}
            {capturedImages.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                    {capturedImages.map((img, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                            <img
                                src={img.preview}
                                alt={`capture-${i}`}
                                style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(i)}
                                style={{
                                    position: 'absolute', top: '-6px', right: '-6px',
                                    width: '22px', height: '22px', borderRadius: '50%',
                                    backgroundColor: '#A32D2D', color: 'white', border: 'none', cursor: 'pointer',
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CameraCapture;