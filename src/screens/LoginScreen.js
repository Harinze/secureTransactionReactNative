import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      // Read user data from data.json
      const fileContent = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + 'data.json');
      const userData = fileContent ? JSON.parse(fileContent) : [];

      // Find user by email and password
      const user = userData.find((user) => user.email === email && user.password === password);

      if (user) {
        // Navigate to the dashboard upon successful login
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Invalid email or password.');
      }
    } catch (error) {
      console.error('Error reading data:', error);
      Alert.alert('Login failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '80%',
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});
