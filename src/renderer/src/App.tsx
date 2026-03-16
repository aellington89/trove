function App() {
  return (
    <div className="flex h-screen items-center justify-center bg-neutral-950">
      <div className="text-center">
        <h1
          className="text-5xl font-bold text-white"
          style={{ fontFamily: "'Syne', system-ui, sans-serif" }}
        >
          Trove
        </h1>
        <p className="mt-4 text-lg text-neutral-400">Your personal media library</p>
        <p className="mt-2 text-sm text-neutral-600">Platform: {window.trove.platform}</p>
      </div>
    </div>
  )
}

export default App
