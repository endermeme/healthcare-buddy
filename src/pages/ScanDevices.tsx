import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const manager = new BleManager();

const ScanDevices = ({ navigation }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);

  const startScanning = () => {
    setIsScanning(true);
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        Alert.alert('Lỗi', 'Không thể quét thiết bị Bluetooth.');
        setIsScanning(false);
        return;
      }

      if (device?.name) {
        setDevices(prev => {
          if (!prev.find(d => d.id === device.id)) {
            return [...prev, device];
          }
          return prev;
        });
      }
    });

    // Dừng quét sau 5 giây
    setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
    }, 5000);
  };

  const connectToDevice = async (device) => {
    try {
      await manager.connectToDevice(device.id);
      navigation.navigate('Monitor');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối với thiết bị.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quét Thiết Bị</Text>
        <Text style={styles.subtitle}>Tìm kiếm các thiết bị cảm biến ở gần</Text>
      </View>

      <TouchableOpacity 
        style={[styles.button, isScanning && styles.buttonDisabled]}
        onPress={startScanning}
        disabled={isScanning}
      >
        <Text style={styles.buttonText}>
          {isScanning ? 'Đang quét...' : 'Bắt đầu quét'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={devices}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.deviceCard}
            onPress={() => connectToDevice(item)}
          >
            <View>
              <Text style={styles.deviceName}>{item.name}</Text>
              <Text style={styles.deviceInfo}>ESP32 Sensor</Text>
            </View>
            <TouchableOpacity style={styles.connectButton}>
              <Text style={styles.connectButtonText}>Kết nối</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    backgroundColor: '#9b87f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deviceCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceInfo: {
    fontSize: 14,
    color: '#666',
  },
  connectButton: {
    backgroundColor: '#9b87f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ScanDevices;