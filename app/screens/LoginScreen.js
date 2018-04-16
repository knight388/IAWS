import React from 'react';
import {AppRegistry, StyleSheet, Text, View, Image, TouchableHighlight, TextInput, AsyncStorage, ActivityIndicator } from 'react-native';

import axios from 'axios';

import Expo from 'expo';


export default class LoginScreen extends React.Component {
  constructor(){
    super();
    this.state = {
      email: "",
      password: "",
      loading: false,
    };
  }

  componentDidMount(){
    if(!this.props.route.params.logout){
      this.checkIfLoggedIn();
    }else{
      AsyncStorage.removeItem('user');
    }
  }


  checkIfLoggedIn = () => {
    this.toggleLoader();
    AsyncStorage.getItem('user')
    .then(result => {
      if(result){
        this.props.navigator.push('mydeals');
      }else{
        this.toggleLoader();
      }
    })
    .catch(error => {
      this.toggleLoader();
    });
  }

  handleLogin(){
    this._signInWithGoogleAsync();
    // let email = this.state.email;
    // let password = this.state.password;

    // var user = {
    //   email: email,
    //   password: password
    // };

    // if(email !== "" && password !== ""){
    //   this.toggleLoader();
    //   axios.post("https://go.iowawindandsolar.com/mobile-login", user)
    //   .then((response) => {
    //     AsyncStorage.setItem('user', JSON.stringify(response.data))
    //     .then(data => {
    //       this.props.navigator.push('mydeals');
    //     })  
    //   })
    //   .catch((error) => {
    //     this.toggleLoader();
    //   });
    // }
  }
  


  toggleLoader(){
    this.setState({
      loading: !this.state.loading
    });
  }

  googleLogin(email, id){
    this.toggleLoader();
    axios.post("https://go.iowawindandsolar.com/mobile-login-google", {
      email,
      id
    })
    .then(data => {
      let userData = data.data;
      AsyncStorage.setItem('user', JSON.stringify(userData));
      this.props.navigator.push('mydeals');
    });
  }

  _signInWithGoogleAsync = () => {
    Expo.Google.logInAsync({
      androidClientId: "344556566236-q901c4jloi98kqtp7om68937rp4pbneb.apps.googleusercontent.com",
      iosClientId: "344556566236-q901c4jloi98kqtp7om68937rp4pbneb.apps.googleusercontent.com",
    })
    .then(result => {
      if(result.type === "success"){
        this.googleLogin(result.user.email, result.user.id);
      } 
    })
  }


  render() {
    const isLoading = this.state.loading;
    return (
      <View style={styles.container}>
          <Image
              style={styles.logo}
              source={require("../../assets/images/logo.png")}
          />
        {!isLoading ? (
          <View>
            {/*<TextInput
              style={styles.textInput} 
              keyboardType={"email-address"}
              onChangeText={(email) => this.setState({email})}
              value={this.state.email}
            />
            <TextInput 
              style={styles.textInput} 
              secureTextEntry={true}
              onChangeText={(password) => this.setState({password})}
            />*/}
            <TouchableHighlight  style={styles.button} onPress={this.handleLogin.bind(this)} underlayColor={"#5ec7ed"}>
                <Text style={styles.buttonText}>Google Login</Text>
            </TouchableHighlight>
            </View>
          ) : (
            <View>
              <Text style={styles.LoggingText}>Logging in and turning up the sun</Text>
               <ActivityIndicator
                  color="green"
                  size="large"
                />
            </View>
         )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    width: 230,
    height: 70,
    marginTop: 200,
    marginBottom: 20
  },
  button: {
    width: 215,
    height: 30,
    backgroundColor: '#00AFEE',
    marginTop: 20,
    borderRadius: 7,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: "700",
    lineHeight: 24,
  },
  textInput: {
    color: "#5D5D5D",
    height: 35,
    padding: 5,
    fontSize: 16,
    width: 215
  },
  LoggingText: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 15
  }
});


AppRegistry.registerComponent("LoginScreen", () => LoginScreen);
