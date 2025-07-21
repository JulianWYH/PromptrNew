"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      // Immediately redirect to the promptr game
      router.replace('/promptr');
    }
  }, [router, isClient]);

  // Return null since we're redirecting immediately
  return null;
}
