'use client';

import GitHubGlobe from './components/GitHubGlobe';
import { useState, useEffect } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Add your data fetching logic here
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="w-screen h-screen overflow-hidden">
        <div>Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-screen h-screen overflow-hidden">
        <div>Error: {error.message}</div>
      </main>
    );
  }

  return (
    <main className="w-screen h-screen overflow-hidden">
      <GitHubGlobe />
    </main>
  );
}