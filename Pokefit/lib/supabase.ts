import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ktkrzbbiynzxuxqamhyh.supabase.co/";
const supabasePublishableKey = "sb_publishable_G8LbNE2wNZ_Oi-4weSAdUA_q1saxBy5";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
