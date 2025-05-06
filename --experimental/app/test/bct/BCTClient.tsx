'use client';

export default function BCTClient() {
  const getDownload = async () => {
    try {
      const response = await fetch('/api/getDownload');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.success) {
        console.log('Download info:', result.data);
      } else {
        console.error('Error:', result.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <input 
          type="text"
          placeholder="Enter package name"
          className="rounded-md border-2 border-gray-300 p-2"
        />
        <button 
          onClick={getDownload} 
          type="button" 
          className="rounded-md bg-pink-600 p-4 text-xl font-bold text-white hover:bg-pink-700 transition-colors"
        >
          Go
        </button>
      </div>
    </div>
  );
} 