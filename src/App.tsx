import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import HomeScreen from './screens/HomeScreen';
import WorkoutsScreen from './screens/WorkoutsScreen';
import MealsScreen from './screens/MealsScreen';
import WeightScreen from './screens/WeightScreen';
import ProgressScreen from './screens/ProgressScreen';
import SettingsScreen from './screens/SettingsScreen';
import { SafeAreaView, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: '#5568fe',
            tabBarInactiveTintColor: '#8b96b2',
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopColor: '#e5e7eb',
              height: 70,
              paddingBottom: 8,
            },
            tabBarIcon: ({ color, size }) => {
              const icons: Record<string, string> = {
                Home: 'home',
                Workouts: 'fitness-center',
                Meals: 'restaurant-menu',
                Weight: 'monitor-weight',
                Progress: 'show-chart',
                Settings: 'settings',
              };
              return <MaterialIcons name={icons[route.name]} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Workouts" component={WorkoutsScreen} />
          <Tab.Screen name="Meals" component={MealsScreen} />
          <Tab.Screen name="Weight" component={WeightScreen} />
          <Tab.Screen name="Progress" component={ProgressScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});