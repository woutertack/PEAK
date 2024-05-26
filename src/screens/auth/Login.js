import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import TabBarIcon from "../../components/utils/TabBarIcon";
import PrimaryButton from "../../components/utils/buttons/PrimaryButton";
import { supabase } from "../../lib/initSupabase";
import { Alert, StyleSheet } from 'react-native'

import {
  Layout,
  Text,
  TextInput,
  Button,
  useTheme,
  themeColor,
} from "react-native-rapi-ui";
import Colors from "../../consts/Colors";

export default function Login({ navigation }) {
  const { isDarkmode, setTheme } = useTheme();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }



  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <StatusBar  backgroundColor={Colors.secondaryGreen} style="light" />
      <Layout>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
        >
          <View
            style={{
              flex: 3,
              paddingHorizontal: 20,
              paddingBottom: 20,
              backgroundColor: Colors.secondaryGreen,
            }}
          >  
            <TabBarIcon library="AntDesign" icon="arrowleft" size={32} style={{marginTop: 20}} 
              onPress={() => {
                navigation.goBack();   
              }}
            />
            <Text
              fontWeight="medium"
              size="h3"
              style={{
                
                padding: 0,
                paddingVertical: 10,
                paddingTop: 40,
                
                color: Colors.white,
              }}
            >
              Login
            </Text>
            
            <Text style={{marginTop: 20, color: Colors.white}} size="h5">Email</Text>
            <TextInput
              containerStyle={{ marginTop: 5 }}
              placeholder="Enter your email"
              value={email}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={(text) => setEmail(text)}
            />

            <Text style={{ marginTop: 20, color: Colors.white }} size="h5">Wachtwoord</Text>
            <TextInput
              containerStyle={{ marginTop: 5, marginBottom: 40}}
              placeholder="Enter your password"
              value={password}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              secureTextEntry={true}
              onChangeText={(text) => setPassword(text)}
            />
           
            <PrimaryButton
              label={loading ? "Loading" : "Login"}
              onPress={() => {
                signInWithEmail();
              }}
              isLoading={loading}
              isDisabled={loading}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 0,
                justifyContent: "center",
              }}
            >
              <Text size="sm" style={{color: Colors.white}}>Al een account?</Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Register");
                }}
              >
                <Text
                  size="sm"
                  fontWeight="bold"
                  style={{
                    marginLeft: 5,
                    color: Colors.white
                  }}
                >
                  Registreer hier
                </Text>
              </TouchableOpacity>
            </View>
            
          </View>
        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
);
}
