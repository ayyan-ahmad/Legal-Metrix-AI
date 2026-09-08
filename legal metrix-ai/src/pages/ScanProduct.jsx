import { useState } from 'react';
import API from '../api/axios';

function ScanProduct() {
  const [productName, setProductName] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Jab user file select kare, usse state mein save karo AUR
  // ek local preview URL bana lo taaki upload se pehle hi dikh jaye
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // browser ke andar hi temporary preview URL
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!image) {
      setError('Please select an image');
      return;
    }

    setLoading(true);

    // FormData - ye ek special object hai jo file + text ek saath
    // bhejne ke liye use hota hai (JSON se file nahi ja sakti)
    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('image', image);

    try {
      const response = await API.post('/inspections', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data.inspection);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Scan Product</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <div>
          <label>Product Name</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label>Product Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} required />
        </div>

        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{ width: '200px', marginTop: '10px', display: 'block' }}
          />
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
          {loading ? 'Analyzing... (this may take a few seconds)' : 'Analyze Product'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '15px' }}>
          <h3>
            Result:{' '}
            <span
              style={{
                color:
                  result.status === 'pass'
                    ? 'green'
                    : result.status === 'fail'
                    ? 'red'
                    : 'orange',
              }}
            >
              {result.status.toUpperCase()}
            </span>
          </h3>
          <p>Compliance Score: {result.complianceScore}%</p>

          <h4>Extracted Data:</h4>
          <pre>{JSON.stringify(result.extractedData, null, 2)}</pre>

          <h4>Violations:</h4>
          {result.violations.length === 0 ? (
            <p>No violations found ✅</p>
          ) : (
            <ul>
              {result.violations.map((v, i) => (
                <li key={i} style={{ color: 'red' }}>
                  ❌ {v.message} (severity: {v.severity})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default ScanProduct;