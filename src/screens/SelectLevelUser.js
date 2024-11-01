import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Alert, ScrollView } from 'react-native';
import { Layout } from "react-native-rapi-ui";
import { supabase } from '../lib/initSupabase'; // Ensure correct path
import { AuthContext } from '../provider/AuthProvider'; // Context to access user session
import Colors from '../consts/Colors';
import Logo from '../components/utils/icons/Logo';
import PrimaryButton from '../components/utils/buttons/PrimaryButton';
import LevelIcon1 from '../components/utils/icons/LevelIcon1';
import LevelIcon2 from '../components/utils/icons/LevelIcon2';
import LevelIcon3 from '../components/utils/icons/LevelIcon3';
import useStore from '../helpers/firstLogin';
import useStatusBar from '../helpers/useStatusBar';

const SelectLevelUser = ({ navigation }) => {
    useStatusBar(Colors.secondaryGreen, 'light-content');
    const { session } = useContext(AuthContext);
    const userId = session?.user.id;
    const [selectedLevel, setSelectedLevel] = useState(null);
    const setFirstLogin = useStore(state => state.setFirstLogin);

    useEffect(() => {
        const fetchUserLevel = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('level')
                    .eq('id', userId)
                    .single();
                if (error) {
                    console.error('Error fetching user level:', error.message);
                } else {
                    setSelectedLevel(data.level);
                }
            } catch (error) {
                console.error('Error fetching user level:', error.message);
            }
        };
        fetchUserLevel();
    }, [userId]);

    const handleLevelSelect = (level) => {
        console.log('Level selected:', level);
        setSelectedLevel(level);
    };

    const handleUpdateLevel = async () => {
        if (!selectedLevel) return Alert.alert('Selecteer een doel');
        try {
            await supabase
                .from('profiles')
                .update({ level: selectedLevel, first_login: false })
                .eq('id', userId);

            setFirstLogin(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update level');
        }
        console.log('Level updated:', selectedLevel);
        navigation.navigate('Profile');
    };

    return (
        <Layout>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
            >
                <View style={styles.logoContainer}>
                    
                </View>
                <View style={styles.wrapper}>
                    <Text style={styles.header}>Selecteer je doel</Text>
                    <TouchableOpacity
                        style={[styles.levelItem, selectedLevel === 'beginner' && { borderColor: Colors.primaryGreen, borderWidth: 4 }]}
                        onPress={() => handleLevelSelect('beginner')}
                    >
                        <View style={styles.levelIcon}>
                            <LevelIcon1 />
                        </View>
                        <View style={styles.levelContent}>
                            <Text style={styles.levelTitle}>Basis</Text>
                            <Text style={styles.levelText}>Beweeg elke dag 15 à 30 minuten</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.levelItem, selectedLevel === 'medium' && { borderColor: Colors.primaryGreen, borderWidth: 4 }]}
                        onPress={() => handleLevelSelect('medium')}
                    >
                        <View style={styles.levelIcon}>
                            <LevelIcon2 />
                        </View>
                        <View style={styles.levelContent}>
                            <Text style={styles.levelTitle}>Uitdagend</Text>
                            <Text style={styles.levelText}>Beweeg elke dag 30 à 60 minuten</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.levelItem, selectedLevel === 'hard' && { borderColor: Colors.primaryGreen, borderWidth: 4 }]}
                        onPress={() => handleLevelSelect('hard')}
                    >
                        <View style={styles.levelIcon}>
                            <LevelIcon3 />
                        </View>
                        <View style={styles.levelContent}>
                            <Text style={styles.levelTitle}>Gevorderd</Text>
                            <Text style={styles.levelText}>Beweeg elke dag +60 minuten</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.button}>
                    <PrimaryButton onPress={handleUpdateLevel} label={'Ga verder'} disabled={!selectedLevel} />
                </View>
            </ScrollView>
        </Layout>
    );
};

export default SelectLevelUser;

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.secondaryGreen,
        flex: 1,
        paddingHorizontal: 20,
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'space-between',
    },
    levelItem: {
        flexDirection: 'row',
        padding: 15,
        marginVertical: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 9,
        borderWidth: 1,
        borderColor: '#ddd',
        height: 150,
    },
    levelTitle: {
        fontSize: 33,
        color: Colors.secondaryGreen,
        marginTop: 5,
    },
    levelText: {
        fontSize: 18,
        color: Colors.secondaryGreen,
        width: 150,
        marginTop: 5,
    },
    header: {
        fontSize: 24,
        color: '#15EDA3',
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center'
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 15,
    },
    wrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    button: {
        marginBottom: 40,
    },
});
