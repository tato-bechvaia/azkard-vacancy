import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../store/AuthContext';
import { colors } from '../theme';
import { navigationRef } from './navigationRef';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import JobsScreen from '../screens/JobsScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SavedJobsScreen from '../screens/SavedJobsScreen';
import CompanyScreen from '../screens/CompanyScreen';
import CreateJobScreen from '../screens/CreateJobScreen';
import CVBoxesScreen from '../screens/CVBoxesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.surface.DEFAULT },
  animation: 'slide_from_right',
};

function HomeTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface[50],
          borderTopColor: colors.border.subtle,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.brand[500],
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Jobs') iconName = focused ? 'briefcase' : 'briefcase-outline';
          else if (route.name === 'CVBoxes') iconName = focused ? 'folder' : 'folder-outline';
          else if (route.name === 'Saved') iconName = focused ? 'bookmark' : 'bookmark-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Jobs" component={JobsScreen} options={{ tabBarLabel: 'ვაკანსიები' }} />
      <Tab.Screen name="CVBoxes" component={CVBoxesScreen} options={{ tabBarLabel: 'CV Boxes' }} />
      {user?.role === 'CANDIDATE' && (
        <Tab.Screen name="Saved" component={SavedJobsScreen} options={{ tabBarLabel: 'შენახული' }} />
      )}
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: user ? 'პროფილი' : 'შესვლა' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={screenOptions}>
        {/* Main tabs — always available (jobs are public) */}
        <Stack.Screen name="HomeTabs" component={HomeTabs} />

        {/* Auth screens */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Detail screens */}
        <Stack.Screen name="JobDetail" component={JobDetailScreen} />
        <Stack.Screen name="Company" component={CompanyScreen} />
        <Stack.Screen name="CreateJob" component={CreateJobScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
