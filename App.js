import React, { useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import DashboardDrawer from './screens/DashboardDrawer';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
      <DashboardDrawer isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
    </NavigationContainer>
  );
}
