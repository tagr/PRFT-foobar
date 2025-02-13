import { useState, useEffect, SetStateAction } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { supabase } from '@/lib/InitSupabase';
import CurrencySelector from '@/components/CurrencySelector';
import { HeartIcon } from '@heroicons/react/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/outline';
const currencies = require('@/data/currency.json');

const fetcher = async (url: RequestInfo) => fetch(url).then((res) => res.json());

export default function Forex() {

  const router = useRouter();
  const {cur} = router.query;
  const [currency, setCurrency] = useState('');
  const user = supabase.auth.user();
  const [isFavorite, setFavorite] = useState(false);
  const [id, setId] = useState('');
  const [errorText, setError] = useState('');
  const [successText, setSuccessText] = useState('');
  const { data, error } = useSWR(cur ? `https://api.coinbase.com/v2/prices/BTC-${cur}/buy` : null, fetcher, {refreshInterval: 60000});

  const amount = cur && data?.data.amount;
  const currencyName = cur && currencies.data.filter((c: { id: string | string[]; }) => c.id === cur)[0]?.name;

  useEffect(() => {
    if (!user) return;
    fetchPrefs();
  },[cur, currency, user]);

  const fetchPrefs = async () => {

    if (!user) return;
    if (!cur && !currency) return;

    let { data: prefs, error } = await supabase
      .from('preference')
      .select('id')
      .eq('user', user?.id)
      .eq('currency', cur || currency)
    if (error) {
      setError(error.message)
    }
    else {
      if (prefs?.length) {
        setId(prefs[0].id);
        setFavorite(true);
      }
      else {
        setId('');
        setFavorite(false);
      }
    }
  } 
  
  const updatePrefs = async () => {

    if (isFavorite) {
      const { data, error } = await supabase
        .from('preference')
        .delete()
        .match({ id: id });

      if (error) {
        setError(error.message);
      }
      else {
        setId("");
        setFavorite(false);
        setSuccessText("Updated preferences");
      }
    }
    if (id.length === 0) {
      const { data, error } = await supabase
        .from('preference')
        .insert({ user: user?.id, currency: cur || currency });
      if (error) {
        setError(error.message);
      }
      else {
        if (data && data.length > 0) {
          setId(data[0].id);
        }
        setFavorite(true);
        setSuccessText("Updated preferences");
      }
    }
  }


  return (
    <div className="md:mx-8 py-8 flex flex-col justify-center items-center">
      <h1 className="font-extrabold text-5xl md:text-6xl text-white md:mx-8 dark:text-purple-800">
        1 BTC = 
        <span className="animate-pulse"> {amount && Number(amount).toLocaleString(undefined, {minimumFractionDigits: 2})} </span>
        {cur}
      </h1>
      <h2 className="font-bold text-2xl text-white dark:text-blue-600 leading-tight">Bitcoin - {currencyName} price</h2>
  
      <CurrencySelector selected={cur} onChange={(e: { target: { value: SetStateAction<string>; }; }) => setCurrency(e.target.value) } />

      <button 
        className="flex justify-center font-bold text-gray-800 dark:text-white text-xl bg-gradient-to-tr from-white to-gray-300 dark:from-blue-600 dark:to-purple-900 px-4 py-4 rounded"
        onClick={async () => { 
          if (!user) {
            router.push('/auth');
            return;
          }
          await updatePrefs(); 
        }}
      >
        {
          isFavorite  
            ? <HeartIcon className="inline text-red-400 dark:text-white h-6 w-6 mr-2" />
            : <HeartIconOutline className="inline text-red-400 dark:text-white h-6 w-6 mr-2" />
        }
        {
          isFavorite  
            ? <span>In Favorites</span>
            : <span>Add to Favorites</span>
        }       
      </button>

    </div>
  )
}
