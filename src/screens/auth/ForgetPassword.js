import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { supabase } from "../../lib//initSupabase";
import * as Linking from "expo-linking";


import {
  Layout,
  Text,
  TextInput,
  Button,
  useTheme,
  themeColor,
} from "react-native-rapi-ui";
import Colors from "../../consts/Colors";
import TabBarIcon from "../../components/utils/TabBarIcon";
import PrimaryButton from "../../components/utils/buttons/PrimaryButton";

export default function ({
  navigation,
}) {
  const { isDarkmode, setTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const resetPasswordURL = Linking.createURL("/ForgetPassword");

  async function forget() {
    setLoading(true);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetPasswordURL,
    });
    setLoading(false);
    if (!error) {
      alert("Email is verstuurd, check je inbox!");
    } else {
      alert(error.message);
    }
  }


  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
    <StatusBar  backgroundColor={Colors.secondaryGreen} style="light" />
      <Layout>
        <ScrollView
         style={{
          backgroundColor: Colors.black,
        }}
          contentContainerStyle={{
            flexGrow: 1,
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: Colors.secondaryGreen,
            }}
          >
           
          </View>
         
          <View style={{ position: 'absolute', top: 10, left: 20 }}>
             <TabBarIcon library="AntDesign" icon="arrowleft" size={32} style={{marginTop: 20}} 
              onPress={() => {
                navigation.goBack();   
              }}
            />
            </View>
          <View
            style={{
              flex: 3,
              paddingHorizontal: 20,
              paddingBottom: 20,
              backgroundColor: Colors.secondaryGreen,
            }}
          >
           
            
            <Text
              size="h3"
              fontWeight="bold"
              style={{
                alignSelf: "center",
                padding: 30,
                color: Colors.white,
              }}
            >
              Reset wachtwoord
            </Text>
            <Text style={{color: Colors.white}} size="h5">Email</Text>
            <TextInput
              containerStyle={{ marginTop: 15, marginBottom: 25}}
              placeholder="JohnDoe@hotmail.com"
              value={email}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={(text) => setEmail(text)}
            />
              
              <PrimaryButton
              label={loading ? "Laden" : "Verstuur email"}
              onPress={forget}
              isLoading={loading}
              isDisabled={loading}
            />

          
            
          </View>
        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
  );
}
