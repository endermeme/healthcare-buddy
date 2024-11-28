import { View, Pressable } from 'react-native';
import { Home, MessageSquare, History, User } from 'lucide-react';
import { useNavigation, useRoute } from '@react-navigation/native';

export const BottomNav = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const handlePress = (routeName: string) => {
    navigation.navigate(routeName);
  };

  return (
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
      backgroundColor: 'white',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 8,
    }}>
      <Pressable 
        onPress={() => handlePress('Home')}
        style={({ pressed }) => ({
          padding: 8,
          backgroundColor: pressed ? '#f3f4f6' : 'transparent',
          borderRadius: 8,
        })}
      >
        <Home style={{ 
          height: 20, 
          width: 20,
          color: route.name === 'Home' ? '#000' : '#6b7280'
        }} />
      </Pressable>
      
      <Pressable 
        onPress={() => handlePress('Chat')}
        style={({ pressed }) => ({
          padding: 8,
          backgroundColor: pressed ? '#f3f4f6' : 'transparent',
          borderRadius: 8,
        })}
      >
        <MessageSquare style={{ 
          height: 20, 
          width: 20,
          color: route.name === 'Chat' ? '#000' : '#6b7280'
        }} />
      </Pressable>
      
      <Pressable 
        onPress={() => handlePress('History')}
        style={({ pressed }) => ({
          padding: 8,
          backgroundColor: pressed ? '#f3f4f6' : 'transparent',
          borderRadius: 8,
        })}
      >
        <History style={{ 
          height: 20, 
          width: 20,
          color: route.name === 'History' ? '#000' : '#6b7280'
        }} />
      </Pressable>
      
      <Pressable 
        onPress={() => handlePress('Profile')}
        style={({ pressed }) => ({
          padding: 8,
          backgroundColor: pressed ? '#f3f4f6' : 'transparent',
          borderRadius: 8,
        })}
      >
        <User style={{ 
          height: 20, 
          width: 20,
          color: route.name === 'Profile' ? '#000' : '#6b7280'
        }} />
      </Pressable>
    </View>
  );
};