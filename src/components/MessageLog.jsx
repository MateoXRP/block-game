export default function MessageLog({ messages }) {
  return (
    <div className="w-full mt-4 max-h-24 overflow-y-auto text-sm text-center px-2">
      {[...messages].slice(-5).reverse().map((msg, i) => (
        <div key={i} className="text-yellow-300">
          {msg}
        </div>
      ))}
    </div>
  );
}

