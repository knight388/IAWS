import React from 'react';

import {AppRegistry, View, Text, StyleSheet, Image, TouchableOpacity} from "react-native";

import { EvilIcons } from '@expo/vector-icons';

import Exponent, {
  Constants,
} from 'expo';



export default class Header extends React.Component {

    render(){
        const navigator = this.props.navigation.getNavigator('main');
        return(
        <View style={styles.header}>
            <TouchableOpacity onPress={() => { navigator.toggleDrawer() }}><View style={styles.menuButton}><Text><EvilIcons name="navicon" size={45} color="white" /></Text></View></TouchableOpacity>
            <View style={{backgroundColor: 'white', flex: 0.5}}><Text style={styles.headerTitle}>{ this.props.title.toUpperCase() }</Text></View>
            <View style={{backgroundColor: 'white', flex: 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>          
                <Image
                style={styles.logo}
                source={require("../../../assets/images/logo.png")}
                />
            </View>
        </View>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        
        flexDirection: 'row', 
        height: 50, 
        borderBottomWidth: 1, 
        borderColor: '#dedede',
        marginTop: Constants.statusBarHeight
    },
    headerTitle: {
        color: '#FFCE31',
        fontSize: 18,
        paddingLeft: 10,
        overflow: 'hidden',
        fontWeight: "bold",
        lineHeight: 38
    },
    logo: {
        width: 100,
        height: 30,
    },
    menuButton: {
        backgroundColor: '#FFCE31', 
        width: 60,
        height: 50,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: 'black',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 1,
        shadowRadius: 5,
        elevation: 1,
    },

});


AppRegistry.registerComponent("Header", () => Header);
