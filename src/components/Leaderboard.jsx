// src/components/Leaderboard.jsx
import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';

export default function Leaderboard() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const ref = collection(db, 'block_leaderboard');
      const q = query(ref, orderBy('bestRun', 'desc'), limit(10));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => doc.data());
      setEntries(data);
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="mt-6 w-full text-center">
      <h3 className="text-xl font-bold text-yellow-300 mb-2">🏆 Leaderboard – Best Runs</h3>
      <div className="text-sm space-y-1 px-2">
        <div className="flex justify-between font-bold text-white border-b border-yellow-500 pb-1 mb-2">
          <span>Name</span>
          <span>Best / Total</span>
        </div>
        {entries.map((entry, i) => (
          <div key={i} className="flex justify-between">
            <span>{i + 1}. {entry.name}</span>
            <span>{entry.bestRun} / {entry.totalBlocks}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

