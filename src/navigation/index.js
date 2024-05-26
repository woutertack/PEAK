import React, {useContext, useEffect, useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Main from './MainStack';
import Auth from './AuthStack';
import Loading from '../screens/utils/Loading';
import SelectLevel from '../screens/SelectLevel';
import useStore from '../helpers/firstLogin';
import { AuthContext } from '../provider/AuthProvider';
import { supabase } from '../lib/initSupabase';

const AppNavigation = () => {
    const firstLogin = useStore(state => state.firstLogin);
    const { user, session } = useContext(AuthContext);

    useEffect(() => {
        const fetchFirstLogin = async () => {
            if (session) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('first_login')
                    .eq('id', session?.user.id)
                    .single();

                if (error) {
                    console.error('Error fetching first_login:', error);
                } else {
                    useStore.setState({ firstLogin: data.first_login });
                }
            }
        };

        fetchFirstLogin();
    }, [session, firstLogin]);



    if (!session || !user ) {
        return <Auth />;
    }

    if (session == null) {
        return <Loading />;
    }

    if (firstLogin) {
        return <NavigationContainer>
         <SelectLevel />
        </NavigationContainer>;
    }

    return <Main />;
};

export default AppNavigation;
