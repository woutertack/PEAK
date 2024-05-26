import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/initSupabase';
import { Session } from '@supabase/supabase-js';


const AuthContext = createContext({});


const AuthProvider = (props) => {
	const [session, setSession] = useState(null);
	const [user, setUser] = useState(null);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session)
			setUser(session ? true : false);
		})

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session)
			setUser(session ? true : false);
		})

		

		

		return () => subscription.unsubscribe()
	}, [user])

	return (
		<AuthContext.Provider
			value={{ 
				session,
				user,
			
			}}
		>
			{props.children}
		</AuthContext.Provider>
	);
};

export { AuthContext, AuthProvider };

