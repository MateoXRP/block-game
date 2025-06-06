// src/components/LoginScreen.jsx
export default function LoginScreen({ nameInput, setNameInput, onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-4">
      <h1 className="text-3xl font-bold">🧱 Block Game</h1>
      <input
        className="px-4 py-2 text-black rounded"
        placeholder="Enter your name"
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
      />
      <button
        className="px-4 py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300"
        onClick={onStart}
      >
        ▶️ Start Game
      </button>
    </div>
  );
}

