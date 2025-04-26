import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import TodolistScreen from './todolist';
import { View, Switch, Text, StyleSheet } from 'react-native';

const Drawer = createDrawerNavigator();

export default function DashboardDrawer({ isDarkMode, toggleTheme }) {
  function CustomDrawerContent(props) {
    return (
      <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, justifyContent: 'space-between' }}>
        <View>
          {/* This renders all your drawer screens, including Todo List */}
          <DrawerItemList {...props} />
        </View>
        {/* Theme toggle at bottom */}
        <View style={styles.themeToggleContainer}>
          <Text style={[styles.themeToggleText, { color: isDarkMode ? '#fff' : '#000' }]}>
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </Text>
          <Switch value={isDarkMode} onValueChange={toggleTheme} />
        </View>
      </DrawerContentScrollView>
    );
  }

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: isDarkMode ? '#121212' : '#fff' },
        headerTintColor: isDarkMode ? '#fff' : '#000',
        drawerStyle: { backgroundColor: isDarkMode ? '#23234b' : '#f0f0f0', width: 240 },
        drawerActiveTintColor: '#6C63FF',
        drawerInactiveTintColor: isDarkMode ? '#fff' : '#000',
      }}
    >
      <Drawer.Screen
        name="Home"
        component={TodolistScreen}
        options={{
          title: 'Todo List',
          drawerItemStyle: {
            borderRadius: 12,
            marginHorizontal: 1,
            marginVertical: 5,
          },
        }}
      />
      {/* Add more screens here if needed */}
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#888',
  },
  themeToggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
