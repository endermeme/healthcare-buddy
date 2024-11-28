import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('main', () => App);

// For web compatibility
if (Platform.OS === 'web') {
  AppRegistry.runApplication('main', {
    rootTag: document.getElementById('root')
  });
}