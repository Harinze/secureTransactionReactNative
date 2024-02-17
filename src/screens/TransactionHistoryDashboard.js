import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Toast } from 'react-native-toastify';

export default function TransactionHistoryDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [userBalance, setUserBalance] = useState(0);
  const [cancelTimeout, setCancelTimeout] = useState(null);

  useEffect(() => {
    fetchUserBalance();
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filter]);

  const fetchUserBalance = async () => {
    try {
      const storedBalance = await AsyncStorage.getItem('userBalance');
      if (storedBalance) {
        setUserBalance(parseFloat(storedBalance));
      }
    } catch (error) {
      console.error('Error fetching user balance:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const storedTransactions = await AsyncStorage.getItem('transactions');
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const applyFilters = () => {
    let filtered = transactions;
    if (filter !== 'all') {
      filtered = transactions.filter(transaction => transaction.type === filter);
    }
    setFilteredTransactions(filtered);
  };

  const renderItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <Text>Date: {item.date}</Text>
      <Text>Amount: {item.amount}</Text>
      <Text>Type: {item.type}</Text>
    </View>
  );

  const handleAddFunds = async () => {
    const amountToAdd = 100;
    const newTransaction = {
      id: uuidv4(),
      date: new Date().toISOString(),
      amount: amountToAdd,
      type: 'Deposit',
    };

    try {
      await saveTransaction(newTransaction);
      const updatedBalance = userBalance + amountToAdd;
      setUserBalance(updatedBalance);
      setTransactions([...transactions, newTransaction]);
      Toast.show(
        <SuccessToast transaction={newTransaction} onClose={() => Toast.hide()} />,
        {
          position: 'top',
          autoClose: 3000,
          hideOnPress: true,
          closeButton: false,
          containerStyle: styles.toastContainer,
          textStyle: styles.toastText,
          closeButtonStyle: styles.closeButton,
          closeTextStyle: styles.closeButtonText,
        }
      );
    } catch (error) {
      console.error('Error adding funds:', error);
      Toast.error('Error adding funds', {
        position: 'top',
        autoClose: 3000,
        hideOnPress: true,
        closeButton: false,
        containerStyle: styles.toastContainer,
        textStyle: styles.toastText,
      });
    }
  };

  const handleTransferFunds = async () => {
    const amountToTransfer = 50;
    if (userBalance >= amountToTransfer) {
      const newTransaction = {
        id: uuidv4(),
        date: new Date().toISOString(),
        amount: amountToTransfer,
        type: 'Withdrawal',
      };

      try {
        await saveTransaction(newTransaction);
        const updatedBalance = userBalance - amountToTransfer;
        setUserBalance(updatedBalance);
        setTransactions([...transactions, newTransaction]);
        Toast.show(
          <SuccessToast transaction={newTransaction} onClose={() => Toast.hide()} />,
          {
            position: 'top',
            autoClose: 3000,
            hideOnPress: true,
            closeButton: false,
            containerStyle: styles.toastContainer,
            textStyle: styles.toastText,
            closeButtonStyle: styles.closeButton,
            closeTextStyle: styles.closeButtonText,
          }
        );
      } catch (error) {
        console.error('Error transferring funds:', error);
        Toast.error('Error transferring funds', {
          position: 'top',
          autoClose: 3000,
          hideOnPress: true,
          closeButton: false,
          containerStyle: styles.toastContainer,
          textStyle: styles.toastText,
        });
      }
    } else {
      console.error('Insufficient balance');
      Toast.error('Insufficient balance', {
        position: 'top',
        autoClose: 3000,
        hideOnPress: true,
        closeButton: false,
        containerStyle: styles.toastContainer,
        textStyle: styles.toastText,
      });
    }
  };

  const handleCancelTransaction = () => {
    try {
      if (transactions.length > 0) {
        const lastTransactionId = transactions[transactions.length - 1].id;
        const transactionIndex = transactions.findIndex(transaction => transaction.id === lastTransactionId);
        if (transactionIndex !== -1) {
          const updatedTransactions = [...transactions.slice(0, transactionIndex)];
          setTransactions(updatedTransactions);
        }
      }

      clearTimeout(cancelTimeout);
      setCancelTimeout(null);
    } catch (error) {
      console.error('Error canceling transaction:', error);
    }
  };

  const saveTransaction = async (transaction) => {
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

  return (
    <View style={styles.container}>
      <View style={styles.filterButtons}>
        <Button title="All" onPress={() => setFilter('all')} />
        <Button title="Deposit" onPress={() => setFilter('Deposit')} />
        <Button title="Withdrawal" onPress={() => setFilter('Withdrawal')} />
      </View>
      <FlatList
        data={filteredTransactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddFunds}>
        <Text style={styles.addButtonText}>Add Funds</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.addButton} onPress={handleTransferFunds}>
        <Text style={styles.addButtonText}>Transfer Funds</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={handleCancelTransaction}>
        <Text style={styles.cancelButtonText}>Cancel Transaction</Text>
      </TouchableOpacity>
      <Text style={styles.balanceText}>Balance: {userBalance}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  transactionItem: {
    backgroundColor: 'lightgreen',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: 'green',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  cancelButton: {
    backgroundColor: 'red',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  balanceText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 18,
  },
  toastContainer: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  toastText: {
    color: 'white',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: 'gray',
    padding: 5,
    borderRadius: 5,
    position: 'absolute',
    top: 5,
    right: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 14,
  },
});

const SuccessToast = ({ transaction, onClose }) => {
  return (
    <View>
      <Text style={styles.toastText}>Funds transferred successfully</Text>
      <Text style={styles.toastText}>Date: {transaction.date}</Text>
      <Text style={styles.toastText}>Amount: {transaction.amount}</Text>
      <Text style={styles.toastText}>Type: {transaction.type}</Text>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};
