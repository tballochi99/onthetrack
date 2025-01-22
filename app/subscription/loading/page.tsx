export default function Loading() {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Loading...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500 mx-auto"></div>
        </div>
      </div>
    );
  }