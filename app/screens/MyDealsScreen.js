import React from 'react';

import {AppRegistry, View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator} from "react-native";

import  Header  from "../components/layout/header"

import axios from 'axios';


import InfiniteScrollView from 'react-native-infinite-scroll-view';

import { Ionicons } from '@expo/vector-icons';





export default class MyDealsScreen extends React.Component {
    constructor(){
        super();
        this.state = {
            loadingDeals: true,
            page: 1,
            isLoading: false,
        };
    }
    componentDidMount(){
        this.loadData();
    }

    _keyExtractor = (item, index) => index;

    closeViewer(){
        this.setState({
            shown:false,
            curIndex:0
        })
    }

    loadData(){
        // axios.get("https://go.iowawindandsolar.com/mobile-login/api/assessment/getpaginateddeals?limit=14&ownerId=426252&page=1&queryString=")
        axios.get(`https://go.iowawindandsolar.com/api/assessment/getpaginateddeals?limit=14&ownerId=426252&page=${this.state.page}&queryString=`)
        .then((response) => {
           this.setState({
               data: response.data.data,
               loadingDeals: false
           });
        })
        .catch(error => {
            console.log(error)
        })    
    }

    _loadMoreData = () => {
        if(!this.state.isLoading){
            let page = this.state.page + 1;
            this.setState({ isLoading: true });
            let array = this.state.data;
            axios.get(`https://go.iowawindandsolar.com/api/assessment/getpaginateddeals?limit=14&ownerId=426252&page=${page}&queryString=`)
            .then((response) => {
                this.setState({
                    data: [...this.state.data, ...response.data.data],
                    page: page,
                    isLoading: false
                });
            })
            .catch(error => {
                console.log(error)
                this.setState({ isLoading: false });
            })    
        }
    }
    openDeal(id){
-       this.props.navigator.push('photoscreen', {dealId: id});
    }

    checkIndexIsEven (n) {
        return n % 2 == 0;
    }
    _renderItem({item, index}){
        // let index = sectionID;
        return(
            <TouchableOpacity style={[styles.container, { backgroundColor: this.checkIndexIsEven(index) ? "white" : "#F5F5F5"}]} onPress={this.openDeal.bind(this, item.data.id)}>
                <View style={styles.row}>
                    <Text>{ item.data.name }</Text> 
                </View>
            </TouchableOpacity>     
        );
    }
    _renderFooter = () => {
        if(this.state.isLoading){
            return (
                <View
                style={{ paddingTop: 5,paddingBottom: 5}}>
                    <ActivityIndicator color="green" animating size="small" />
                </View>
            );
        }else{
            return null;
        }
    }
    
    render(){
        const loadingDeals = this.state.loadingDeals;
        return(
            <View  style={{ flex : 1 }}>
                <Header navigation={this.props.navigation} title="My Deals" />
                {!loadingDeals ? (
                    <FlatList
                    ListFooterComponent={this._renderFooter}
                    data={this.state.data}
                    style={{flex: 1}}
                    renderItem={this._renderItem.bind(this)}
                    keyExtractor={this._keyExtractor}
                    onEndReached={this._loadMoreData.bind(this)}
                    onEndReachedThreshold={5}
                     />
                ) : (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator
                        color="green"
                        size="large"
                        style={styles.loading}
                        />
                        <Text style={styles.loadingText}>Fetching deals, please wait...</Text>
                    </View>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', 
    },
    row: {
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 10,
        paddingBottom: 10,
        flex: 1
    },
    icon: {
        paddingTop: 10,
        paddingBottom: 10,
        flex: 0.2
    },
    loading: {
        marginTop: 180,
        marginBottom: 20
    },
    loadingText: {
        fontSize: 16
    },
    loaderContainer: {
        // display: flex;
        justifyContent: "center",
        alignItems: "center"
    }
});

AppRegistry.registerComponent("MyDealsScreen", () => MyDealsScreen);
