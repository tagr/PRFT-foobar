import {useEffect} from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/InitSupabase';
import Layout from '@/components/Layout';
import CurrencySelector from '@/components/CurrencySelector';
import Favorite from '@/components/Favorite';

export default function IndexPage() {
  const router = useRouter();
  const user = supabase.auth.user();

  useEffect(() => {
    const currentPath = localStorage.getItem("prft-foobar.current-url");
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('go'); 

    if (query && query === "home") {
      localStorage.setItem("prft-foobar.current-url", location.pathname);
      return;
    }

    if (currentPath && location.pathname !== currentPath) {
      router.push(currentPath);
    }
  },[router, user]);

  return (
    <Layout
      title="PRFT-Foobar Next.js Hackathon - BTC Exchange Rates"
      metaDescription="by Andy Merhaut"
    >
      <div className="flex h-100 md:h-screen justify-center bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500 dark:from-gray-700 dark:via-black dark:to-gray-900">
        <div className="mx-8 py-8 h-full">
          <div className="flex flex-col justify-center items-center">
            <Image src="/images/btc.png" width={400} height={348} alt="Graphical depiction of Bitcoin" />
            <h1 className="font-extrabold text-6xl text-white mx-8">
              Get
              <span className="animate-pulse"> Bitcoin </span>
              exchange price
            </h1>
            <CurrencySelector selected="" />  
            <Favorite /> 
          </div> 
        </div>
      </div>
    </Layout>
  )
}