import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveTransaction = async (transaction) => {
  try {
    const existingTransactions = await AsyncStorage.getItem('transactions');
    const updatedTransactions = existingTransactions
      ? [...JSON.parse(existingTransactions), transaction]
      : [transaction];
    await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  } catch (error) {
    console.error('Error saving transaction:', error);
  }
};
