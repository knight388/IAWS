import React from 'react';
import { StyleSheet, Text, View, AsyncStorage } from 'react-native';

import LoginScreen from "./app/screens/LoginScreen"
import MyDealsScreen from "./app/screens/MyDealsScreen"
import PhotoScreen from "./app/screens/PhotoScreen"

import {
  createRouter,
  NavigationProvider,
  StackNavigation,
  DrawerNavigation,
  Navigator,
  DrawerNavigationItem
} from '@expo/ex-navigation';

import Exponent, {
  Constants,
} from 'expo';


const Router = createRouter(() => ({
  login: () => LoginScreen,
  mydeals: () => MyDealsScreen,
  photoscreen: () => PhotoScreen,
}));

export default class App extends React.Component {
  
  _renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MENU</Text>
      </View>
    );
  };
 
  _renderTitle(text, index) {
    return (
      <Text style={[styles.titleText, { color: index == 1 ? "red" : "#FFCE31"}]}>
        {text}
      </Text>
    );
  };

  _handleLogout = () => {
    AsyncStorage.removeItem('user');
  }
  
  render() {
    return (
      <NavigationProvider router={Router}>
        <DrawerNavigation
        id='main'
        initialItem='login'
        drawerWidth={300}
        renderHeader={this._renderHeader}
        >
        <DrawerNavigationItem
            id='login'
            style={{display: 'none'}}
          >
            <StackNavigation
              id='login'
              style={{ display: 'none' }}
              initialRoute={'login'}
            />
          </DrawerNavigationItem>
        
          <DrawerNavigationItem
            id='mydeals'
            renderTitle={this._renderTitle.bind(this, 'MY DEALS', 0)}
          >
            <StackNavigation
              id='mydeals'
              initialRoute={'mydeals'}
            />
          </DrawerNavigationItem>

          <DrawerNavigationItem
            id='logout'
            renderTitle={this._renderTitle.bind(this, 'LOG OUT', 1)}
          >
            <StackNavigation
              id='logout'
              initialRoute={Router.getRoute('login', { logout: true })}
            />
          </DrawerNavigationItem>
        </DrawerNavigation>
      </NavigationProvider>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    height: 50,
    marginTop: Constants.statusBarHeight,
    backgroundColor: '#FFCE31',
    paddingTop: 10,
  },

  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    paddingLeft: 15,
  },

  titleText: {
    fontWeight: 'bold',
    color: '#FFCE31',
    fontSize: 20,
  },
 
});