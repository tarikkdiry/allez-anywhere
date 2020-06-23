import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// EXPO
import * as Font from 'expo-font';
import { AppLoading } from 'expo';
import * as firebase from 'firebase';

// NAVIGATION
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// SCREENS
import LoginScreen from './src/screens/LoginScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import SelectScreen from './src/screens/SelectScreen';

const Stack = createStackNavigator();

var firebaseConfig = {
  apiKey: "AIzaSyDKocOqws6R-HNoXFGRck8n3eHSzNv8x7Q",
  authDomain: "travel-anywhere-14e79.firebaseapp.com",
  databaseURL: "https://travel-anywhere-14e79.firebaseio.com",
  projectId: "travel-anywhere-14e79",
  storageBucket: "travel-anywhere-14e79.appspot.com",
  messagingSenderId: "868985984808",
  appId: "1:868985984808:web:5fcba6f80c129a6218221d",
  measurementId: "G-2W2TTHYR6Q"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // FETCH FONTS
  const fetchFonts = () => {
    return Font.loadAsync({
      'bold': require('./assets/fonts/Montserrat/Montserrat-Bold.ttf'),
      'regular': require('./assets/fonts/Montserrat/Montserrat-Black.ttf'),
    });
  };

  if (!fontsLoaded) {
    return (
      <AppLoading 
        startAsync={fetchFonts}
        onFinish={() => setFontsLoaded(true)}
      />
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
      >
        <Stack.Screen 
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Welcome"
          component={WelcomeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Select"
          component={SelectScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#03658C',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
