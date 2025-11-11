import React, { useState } from 'react';
import { generatePresentationFromTopic } from './services/geminiService';
import { createPresentation } from './services/pptService';
import LoadingSpinner from './components/LoadingSpinner';

// Helper component for image upload section
const ImageUploader: React.FC<{
  label: string;
  image: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
  isLoading: boolean;
}> = ({ label, image, onImageChange, onImageRemove, isLoading }) => (
  <div className="space-y-2">
    <label className="text-md font-semibold text-gray-300">{label}</label>
    {image ? (
      <div className="flex items-center space-x-4">
        <img src={image} alt="Pratinjau Latar" className="w-32 h-20 object-cover rounded-md border border-gray-600" />
        <button
          onClick={onImageRemove}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md text-sm transition duration-300"
        >
          Hapus
        </button>
      </div>
    ) : (
      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={onImageChange}
        disabled={isLoading}
        aria-label={label}
        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
      />
    )}
  </div>
);

function App() {
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState<number>(3);
  const [fileCount, setFileCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [contentImage, setContentImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'content') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'cover') {
          setCoverImage(base64String);
        } else {
          setContentImage(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateClick = async () => {
    if (!topic.trim()) {
      setError('Silakan masukkan topik presentasi.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
       for (let i = 0; i < fileCount; i++) {
        const progressText = fileCount > 1 ? ` (${i + 1} dari ${fileCount})` : '';
        setLoadingMessage(`AI sedang merancang slide Anda${progressText}, harap tunggu...`);
        const presentationData = await generatePresentationFromTopic(topic, slideCount);
        createPresentation(presentationData, coverImage, contentImage);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl p-8 space-y-6">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-blue-400">Pembuat Presentasi AI</h1>
          <p className="text-lg text-gray-400 mt-2">
            Ubah topik apa pun menjadi presentasi PowerPoint yang siap disajikan dalam hitungan detik.
          </p>
        </header>

        <main>
          <div className="flex flex-col space-y-4">
            <label htmlFor="topic-input" className="text-lg font-semibold">
              1. Masukkan Topik Presentasi Anda:
            </label>
            <input
              id="topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: 'Sejarah Kecerdasan Buatan'"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col space-y-4 mt-6">
            <label htmlFor="slide-count-select" className="text-lg font-semibold">
              2. Pilih Jumlah Slide per Presentasi:
            </label>
            <select
              id="slide-count-select"
              value={slideCount}
              onChange={(e) => setSlideCount(Number(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          
           <div className="flex flex-col space-y-4 mt-6">
            <label htmlFor="file-count-select" className="text-lg font-semibold">
              3. Pilih Jumlah File Presentasi:
            </label>
            <select
              id="file-count-select"
              value={fileCount}
              onChange={(e) => setFileCount(Number(e.target.value))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div className="mt-6 p-4 border border-gray-700 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">4. Kustomisasi Desain (Opsional)</h2>
            <div className="space-y-4">
              <ImageUploader
                label="Unggah Latar Belakang Sampul:"
                image={coverImage}
                onImageChange={(e) => handleFileChange(e, 'cover')}
                onImageRemove={() => setCoverImage(null)}
                isLoading={isLoading}
              />
              <ImageUploader
                label="Unggah Latar Belakang Isi Slide:"
                image={contentImage}
                onImageChange={(e) => handleFileChange(e, 'content')}
                onImageRemove={() => setContentImage(null)}
                isLoading={isLoading}
              />
            </div>
          </div>


          <div className="mt-6">
            <button
              onClick={handleGenerateClick}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Membuat Presentasi...' : 'Buat & Unduh Presentasi'}
            </button>
          </div>
        </main>

        {isLoading && (
          <div className="mt-6">
            <LoadingSpinner message={loadingMessage} />
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-900 border border-red-700 rounded-md text-red-300">
            <p className="font-bold">Terjadi Kesalahan</p>
            <p>{error}</p>
          </div>
        )}
      </div>
       <footer className="text-center text-gray-500 mt-8">
        <p>Didukung oleh Gemini API</p>
      </footer>
    </div>
  );
}

export default App;
