import { AppState } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'


// const apiUrl = process.env.EXPO_PUBLIC_API_URL;
// const apiKey = process.env.EXPO_PUBLIC_API_KEY;

export const supabase = createClient('https://efopnkxuzwafypfszrnv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmb3Bua3h1endhZnlwZnN6cm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU5NTc1MDUsImV4cCI6MjAzMTUzMzUwNX0.eU-1ujhGQozZMOBdpm0q_NAbawwRDBopOHYI0kTNi5Q',{
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})