export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b shadow-md">
        <div className="text-2xl font-bold">Tiksliukai.lt</div>
        <div className="space-x-4">
          <button className="px-4 py-2 border rounded">Log In</button>
          <button className="px-4 py-2 border rounded">Sign In</button>
        </div>
      </header>
      
      {/* Main */}
      <main className="flex flex-1 justify-center items-center">
        <div className="grid grid-cols-3 gap-6">
          <button className="px-6 py-4 bg-blue-100 border rounded">A</button>
          <button className="px-6 py-4 bg-blue-100 border rounded">B</button>
          <button className="px-6 py-4 bg-blue-100 border rounded">C</button>
          <button className="px-6 py-4 bg-blue-100 border rounded">D</button>
          <button className="px-6 py-4 bg-blue-100 border rounded">E</button>
          <button className="px-6 py-4 bg-blue-100 border rounded">F</button>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="text-center py-4 border-t text-sm text-gray-500">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
