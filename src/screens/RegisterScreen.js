import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState(null); // Store image URI

  // Request permission for accessing the camera roll
  const requestCameraRollPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library to upload an image.');
    }
  };

  // Handle image selection
  const pickImage = async () => {
    await requestCameraRollPermission();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword || !address || !image) {
      Alert.alert('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match.');
      return;
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Check if the directory exists, create it if not
    const directory = FileSystem.documentDirectory + 'images/';
    try {
      await FileSystem.getInfoAsync(directory);
    } catch (error) {
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    }

    // Generate UUID for user ID
    const userId = uuidv4();

    // Define user object
    const user = {
      id: userId,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      address,
      accountNumber: Math.floor(100000 + Math.random() * 900000),
    };

    try {
      // Save image to directory
      const filename = directory + `${userId}.jpg`;
      await FileSystem.copyAsync({ from: image, to: filename });

      // Save user data to JSON file
      const fileContent = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + 'data.json');
      const existingData = fileContent ? JSON.parse(fileContent) : [];
      const newData = [...existingData, { ...user, image: filename }];
      await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + 'data.json', JSON.stringify(newData));

      // Show success message
      Alert.alert('Registration successful!');
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Registration failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
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
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      <Button title="Select Image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      <Button title="Register" onPress={handleRegister} />
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
