import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Alert,
  StyleSheet,
} from "react-native";
import { supabase } from "../../lib/initSupabase";
import { Layout, Text, TextInput, useTheme } from "react-native-rapi-ui";
import Colors from "../../consts/Colors";
import TabBarIcon from "../../components/utils/TabBarIcon";
import PrimaryButton from "../../components/utils/buttons/PrimaryButton";

export default function Register({ navigation }) {
  const { isDarkmode } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) {
        throw error;
      }

      navigation.navigate("Login");

    } catch (error) {
      console.error("Error signing up:", error);
      setError(error.message);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.secondaryGreen} style="light" />
      <Layout>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <TabBarIcon
              library="AntDesign"
              icon="arrowleft"
              size={32}
              style={{ marginTop: 20 }}
              onPress={() => {
                navigation.goBack();
              }}
            />
            <Text fontWeight="bold" size="h3" style={styles.headerText}>
              Maak een account
            </Text>
            <Text style={styles.labelText}>Voornaam</Text>
            <TextInput
              containerStyle={{ marginTop: 5 }}
              placeholder="Enter your first name"
              value={firstName}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              onChangeText={(text) => setFirstName(text)}
            />
            <Text style={styles.labelText}>Achternaam</Text>
            <TextInput
              containerStyle={{ marginTop: 5 }}
              placeholder="Enter your last name"
              value={lastName}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              onChangeText={(text) => setLastName(text)}
            />
            <Text style={styles.labelText}>Email</Text>
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
            <Text style={styles.labelText}>Wachtwoord</Text>
            <TextInput
              containerStyle={{ marginTop: 5, marginBottom: 20 }}
              placeholder="Enter your password"
              value={password}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              secureTextEntry={true}
              onChangeText={(text) => setPassword(text)}
            />
            <PrimaryButton
              label={loading ? "Loading" : "Registreer"}
              onPress={handleSignUp}
              isLoading={loading}
              isDisabled={loading}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.loginPrompt}>
              <Text size="sm" style={{ color: Colors.white }}>
                Al een account?
              </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Login");
                }}
              >
                <Text size="sm" fontWeight="bold" style={styles.loginText}>
                  Login hier
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 3,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: Colors.secondaryGreen,
  },
  headerText: {
    padding: 0,
    paddingTop: 40,
    paddingBottom: 10,
    color: Colors.white,
  },
  labelText: {
    color: Colors.white,
    marginTop: 20,
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
  loginPrompt: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
    justifyContent: "center",
  },
  loginText: {
    marginLeft: 5,
    color: Colors.white,
  },
});
