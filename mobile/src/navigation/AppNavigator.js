import React, { createContext, useContext, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// 인증 스크린
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// 메인 스크린
import HomeScreen from '../screens/HomeScreen';
import QuoteRequestScreen from '../screens/QuoteRequestScreen';
import MyQuotesScreen from '../screens/MyQuotesScreen';
import QuoteDetailScreen from '../screens/QuoteDetailScreen';
import PaymentScreen from '../screens/PaymentScreen';
import MyPaymentsScreen from '../screens/MyPaymentsScreen';
import MyContractsScreen from '../screens/MyContractsScreen';
import ContractSignScreen from '../screens/ContractSignScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const login = (token, user) => {
    setUserToken(token);
    setUserInfo(user);
  };

  const logout = () => {
    setUserToken(null);
    setUserInfo(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

// Main Tab Navigator (인증 후)
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'QuoteRequest') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'MyQuotes') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'MyContracts') {
            iconName = focused ? 'document' : 'document-outline';
          } else if (route.name === 'MyPayments') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '홈' }} />
      <Tab.Screen
        name="QuoteRequest"
        component={QuoteRequestScreen}
        options={{ title: '견적요청' }}
      />
      <Tab.Screen name="MyQuotes" component={MyQuotesScreen} options={{ title: '내 견적' }} />
      <Tab.Screen name="MyContracts" component={MyContractsScreen} options={{ title: '계약서' }} />
      <Tab.Screen name="MyPayments" component={MyPaymentsScreen} options={{ title: '결제내역' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: '프로필' }} />
    </Tab.Navigator>
  );
};

// Auth Navigator (인증 전)
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { userToken } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {userToken === null ? (
        <Stack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="QuoteDetail"
            component={QuoteDetailScreen}
            options={{ title: '견적서 상세' }}
          />
          <Stack.Screen
            name="Payment"
            component={PaymentScreen}
            options={{ title: '결제' }}
          />
          <Stack.Screen
            name="ContractSign"
            component={ContractSignScreen}
            options={{ title: '계약서 서명' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;