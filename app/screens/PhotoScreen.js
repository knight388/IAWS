import React from 'react';
import {AppRegistry, Dimensions, ScrollView, StyleSheet, TouchableHighlight, Text, View, Image, TouchableOpacity, TextInput, AsyncStorage, ActivityIndicator } from 'react-native';

import { Content, ActionSheet } from 'native-base';

import axios from 'axios';

import  Header  from "../components/layout/header";

import Swiper from 'react-native-swiper';



import { Ionicons, MaterialIcons } from '@expo/vector-icons';


import Exponent, {
  Constants,
  registerRootComponent,
  ImagePicker
} from 'expo';

var BUTTONS = [
    'Choose Pictures from libary',
    'Use Camera',
    'Cancel'
];
var CANCEL_INDEX = 2;

width = Dimensions.get('window').width; //full width

export default class PhotoScreen extends React.Component {
  constructor(props){
    super(props);
    this.actionSheet = null;
    this.state = {
        isLoadingDeal: true,
        deal: {},
        dealId: props.route.params.dealId,
        swiperIsOpen: false,
        swiperIndex: 0,
        swiperPhotos: [],
        deleteMode: false,
        helperImage: false
    };
  }
  

   componentDidMount(){
        Expo.Font.loadAsync({
            Arial: require('../../assets/fonts/arial.ttf'),
        });
        this.loadData();
    }

    loadData(){
        axios.get(`https://go.iowawindandsolar.com/api/assessment/getlocaldealbyid?dealId=${this.state.dealId}`)
        .then((response) => {
            this.setState({
               deal: response.data.data,
               isLoadingDeal: false
           });
        })
        .catch(error => {
        })    
    }

    showOptions(array){
        if ( this.actionSheet !== null ) {
           this.actionSheet._root.showActionSheet(
            {
                options: BUTTONS,
                cancelButtonIndex: CANCEL_INDEX,
                title: 'Choose Your Image Action'
            },
            (buttonIndex) => {
                if(buttonIndex == 0){
                    this.handleLibary(array);
                }else if(buttonIndex == 1){
                    this.handleCamera(array);
                }
            });
        }
    }

    handleLibary(array){
        var deal = this.state.deal;
        let d = new Date();
        let newObject = {};
        ImagePicker.launchImageLibraryAsync({
            quality: 0.5
        })
        .then(data => {
             newObject = {
                url: data.uri,
                name: d.getTime(),
                phoneUpload: true
            };
            deal[array].push(newObject);
            this.setState({
                deal: deal
            });
        
            this.uploadImage(data.uri, array, newObject.name)
       });
    }

    handleCamera(array){
        var deal = this.state.deal;
        let d =  new Date();
        let newObject = {};
        ImagePicker.launchCameraAsync({
            quality: 0.5
        })
        .then(data => {
            if (!data.cancelled) {
                 this.handleCamera(array);
                newObject = {
                    url: data.uri,
                    name: d.getTime(),
                    phoneUpload: true
                };
                deal[array].push(newObject);
                this.setState({
                    deal: deal
                });
                this.uploadImage(data.uri, array, newObject.name)
            }
        });
    }

     updateDeal(deal, param, value){
        axios.post(`https://go.iowawindandsolar.com/api/assessment/updatedealoptions/${this.state.dealId}`, {
            param: param,
            assessment: deal,
            value: value
        })
        .then(data => {
        })
        .catch(error => {
        })
    }

     uploadImage(uri, array, name) {

        let deal_array = this.state.deal;
        let apiUrl = 'https://go.iowawindandsolar.com/api/upload';
        let uriParts = uri.split('.');
        let fileType = uriParts[uriParts.length - 1];


        let formData = new FormData();
        formData.append('file', {
            uri,
            name: name + "." + fileType,
            type: `image/${fileType}`,
        });

        let headers = {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
        }

        axios.post(apiUrl, formData, headers)
        .then(response => {
            let index = deal_array[array].findIndex(x => x.name == name)
            deal_array[array].splice(index, 1);


            let object = {
                name: response.data.name,
                url: response.data.src
            };
            deal_array[array].push(object);
            this.setState({
                deal: deal_array
            });

            this.updateDeal(this.state.deal, array, this.state.deal[array]);
   
        })
        .catch(error => {
          
        });
    }

    openSwiper(i, array){
        if(!this.state.deleteMode){
            this.setState({
                swiperIsOpen: true,
                swiperIndex: i,
                swiperPhotos: this.state.deal[array],
                helperImage: false
            });
        }else{
            this.deletePhoto(i, array);
        }
    }

    deletePhoto = (index, array) => {
        let deal = this.state.deal;
        deal[array].splice(index, 1);
        this.setState({
            deal
        }, () => {
            this.updateDeal(this.state.deal, array, this.state.deal[array]);
        });
    }

    closeSwiper(){
        this.setState({
            swiperIsOpen: false,
        });
    }

    _toggleDeleteMode = () => {
        this.setState({
            deleteMode: !this.state.deleteMode
        });
    }

    _showHelper = (helperImage) => {
        let array = [];
        array.push({
            url: helperImage
        });
        this.setState({
            swiperIsOpen: true,
            swiperIndex: 0,
            swiperPhotos: array,
            helperImage: true
        });
    }

    
  render() {
    const deal = this.state.deal;
    const loadingDeal = this.state.isLoadingDeal;
    const baseUrl = "https://go.iowawindandsolar.com/";
    const swiperPhotos = this.state.swiperPhotos
    const swiperIndex = this.state.swiperIndex
    const deleteMode = this.state.deleteMode;
    const helperImage = this.state.helperImage;

    if(this.state.swiperIsOpen){
        return (
            <Swiper activeDotColor='yellow' style={styles.wrapper} index={swiperIndex} showsButtons={false}>
                { swiperPhotos.map((photo, i) => {
                let url;
                if(photo.phoneUpload == true){
                    url = {uri: photo.url};
                }else if(helperImage){

                    var Images = {
                        Transformer: require("../../assets/images/Transformer.png"),
                        area_around_meter: require("../../assets/images/area_around_meter.png"),
                        array_site: require("../../assets/images/array_site.png"),
                        close_up_of_lugs: require("../../assets/images/close_up_of_lugs.png"),
                        close_up_of_meter_min: require("../../assets/images/close_up_of_meter-min.png"),
                        entire_box: require("../../assets/images/entire_box.png"),
                        main_breaker: require("../../assets/images/main_breaker.png"),
                        model: require("../../assets/images/model.png"),
                        service_entrance: require("../../assets/images/service_entrance.png"),
                        showing_entire_box: require("../../assets/images/showing_entire_box.png"),
                        top_of_pole: require("../../assets/images/top_of_pole.png"),
                        with_cover_off: require("../../assets/images/with_cover_off.png"),
                        with_cover_on: require("../../assets/images/with_cover_on.png"),
                    };
                     
                    url = Images[photo.url];

                }else{
                    url = {uri: baseUrl + photo.url};
                }
                
                return (
                    <TouchableHighlight onPress={this.closeSwiper.bind(this)}  key={i} style={styles.slide}>
                    <Image 
                    style={styles.sliderImage}
                    source={url}
                    />
                    </TouchableHighlight>
                    );
                }) }
            </Swiper>
        );
    }else{
        return (
        <View style={{ flex: 1 }}>
            <Header title="Photo Section" navigation={this.props.navigation} />
            {!loadingDeal ? (
            <ScrollView style={styles.mainContainer}>
                <View>
                    <Text style={styles.SectionTitle}>Photo Dump</Text>    
                    <View style={[styles.photoDump, {flex: 1}]}>
                        <ScrollView style={{ flex: 1, }}>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                { deal.photo_10_1.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity onLongPress={this._toggleDeleteMode.bind(this)}  onPress={this.openSwiper.bind(this, i, 'photo_10_1')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                    </TouchableOpacity>   
                                );
                                }) }
                                <TouchableHighlight>
                                    <View style={styles.uploadPhoto}><Text>
                                        <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                    </View>
                                </TouchableHighlight>
                            </View> 
                        </ScrollView>
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.SectionTitle}>Transformer <Text onPress={this._showHelper.bind(this, 'Transformer')} ><Ionicons name="ios-help-circle-outline" size={23} color="green" /></Text></Text>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.oneBox}>
                            <Text style={[styles.description, {width: 100000}]}>Area around transformer</Text>
                            { deal.photo_1_1.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity onLongPress={this._toggleDeleteMode.bind(this)} onPress={this.openSwiper.bind(this, i, 'photo_1_1')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                        { photo.phoneUpload ? (<Text style={styles.syncIcon}><MaterialIcons name="sync" size={15} color="white" /></Text>) : (null)}
                                        { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null }
                                    </TouchableOpacity>   
                                );
                            }) }
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_1_1')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                                
                            </TouchableOpacity>
                        </View>
                        <View style={styles.oneBox}>
                            <Text style={[styles.description, {width: 100000}]}>Close up of transformer</Text>
                            { deal.photo_1_2.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity onLongPress={this._toggleDeleteMode.bind(this)} onPress={this.openSwiper.bind(this, i, 'photo_1_2')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                        { photo.phoneUpload ? (<Text style={styles.syncIcon}><MaterialIcons name="sync" size={15} color="white" /></Text>) : (null)}
                                        { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null }
                                    </TouchableOpacity>   
                                );
                            })}
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_1_2')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                            </TouchableOpacity>
                        </View> 
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        <Text style={[styles.description, {width: 100000}]}>Clear picture of tranformer info plate (if transformer is on ground)</Text>
                        { deal.photo_1_3.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity onLongPress={this._toggleDeleteMode.bind(this)} onPress={this.openSwiper.bind(this, i, 'photo_1_3')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                    { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null }
                                    </TouchableOpacity>   
                                );
                            }) }
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_1_3')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                            </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.SectionTitle}>Meter(s)</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.oneBox}>
                        <Text style={[styles.description, {width: 100000}]}>Area around meter  <Text onPress={this._showHelper.bind(this, 'area_around_meter')} ><Ionicons name="ios-help-circle-outline" size={23} color="green" /></Text></Text>
                            { deal.photo_2_1.map((photo, i) => {
                            let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity onLongPress={this._toggleDeleteMode.bind(this)} onPress={this.openSwiper.bind(this, i, 'photo_2_1')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                   { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null } 
                                    </TouchableOpacity>   
                                );
                            }) }
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_2_1')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.oneBox}>
                            <Text style={[styles.description, {width: 100000}]}>Close-up of meter  <Text onPress={this._showHelper.bind(this, 'close_up_of_meter_min')} ><Ionicons name="ios-help-circle-outline" size={23} color="green" /></Text></Text>
                            { deal.photo_2_2.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity onLongPress={this._toggleDeleteMode.bind(this)} onPress={this.openSwiper.bind(this, i, 'photo_2_2')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                        { photo.phoneUpload ? (<Text style={styles.syncIcon}><MaterialIcons name="sync" size={15} color="white" /></Text>) : (null)}
                                        { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null }
                                    </TouchableOpacity>   
                                );
                            }) }
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_2_2')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                            </TouchableOpacity>
                        </View> 
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.oneBox}>
                            <Text style={[styles.description, {width: 100000}]}>If meter is on pole, top of pole <Text onPress={this._showHelper.bind(this, 'top_of_pole')} ><Ionicons name="ios-help-circle-outline" size={23} color="green" /></Text></Text>
                            { deal.photo_2_3.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity onLongPress={this._toggleDeleteMode.bind(this)} onPress={this.openSwiper.bind(this, i, 'photo_2_3')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                        { photo.phoneUpload ? (<Text style={styles.syncIcon}><MaterialIcons name="sync" size={15} color="white" /></Text>) : (null)}
                                        { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null }
                                    </TouchableOpacity>   
                                );
                            }) }
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_2_3')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.oneBox}>
                            <Text style={[styles.description, {width: 100000}]}>Line of site from meter to potential array site</Text>
                            { deal.photo_2_4.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity onLongPress={this._toggleDeleteMode.bind(this)} onPress={this.openSwiper.bind(this, i, 'photo_2_4')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                        { photo.phoneUpload ? (<Text style={styles.syncIcon}><MaterialIcons name="sync" size={15} color="white" /></Text>) : (null)}
                                        { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null }
                                    </TouchableOpacity>   
                                );
                            }) }
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_2_4')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                            </TouchableOpacity>
                        </View> 
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.SectionTitle}>Array Site <Text onPress={this._showHelper.bind(this, 'array_site')} ><Ionicons name="ios-help-circle-outline" size={23} color="green" /></Text></Text>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.oneBox}>
                            <Text style={[styles.description]}>Potential array site, including terrain around it</Text>
                            { deal.photo_3_1.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity onLongPress={this._toggleDeleteMode.bind(this)} onPress={this.openSwiper.bind(this, i, 'photo_3_1')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                        { photo.phoneUpload ? (<Text style={styles.syncIcon}><MaterialIcons name="sync" size={15} color="white" /></Text>) : (null)}
                                        { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null }
                                    </TouchableOpacity>   
                                );
                            }) }
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_3_1')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.oneBox}>
                            <Text style={[styles.description]}>Road to potential array site</Text>
                            { deal.photo_4_1.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity onLongPress={this._toggleDeleteMode.bind(this)} onPress={this.openSwiper.bind(this, i, 'photo_4_1')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                        { photo.phoneUpload ? (<Text style={styles.syncIcon}><MaterialIcons name="sync" size={15} color="white" /></Text>) : (null)}
                                        { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null }
                                    </TouchableOpacity>   
                                );
                            }) }
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_4_1')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                            </TouchableOpacity>
                        </View> 
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.SectionTitle}>Service Discount</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.oneBox}>
                            <Text style={[styles.description, {width: 100000}]}>With cover on <Text onPress={this._showHelper.bind(this, 'with_cover_on')} ><Ionicons name="ios-help-circle-outline" size={23} color="green" /></Text></Text>
                            { deal.photo_5_1.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity onLongPress={this._toggleDeleteMode.bind(this)} onPress={this.openSwiper.bind(this, i, 'photo_5_1')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                        { photo.phoneUpload ? (<Text style={styles.syncIcon}><MaterialIcons name="sync" size={15} color="white" /></Text>) : (null)}
                                        { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null }
                                    </TouchableOpacity>   
                                );
                            }) }
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_5_1')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.oneBox}>
                            <Text style={[styles.description, {width: 100000}]}>With cover off <Text onPress={this._showHelper.bind(this, 'with_cover_off')} ><Ionicons name="ios-help-circle-outline" size={23} color="green" /></Text></Text>
                            { deal.photo_5_2.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity onLongPress={this._toggleDeleteMode.bind(this)} onPress={this.openSwiper.bind(this, i, 'photo_5_2')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                        { photo.phoneUpload ? (<Text style={styles.syncIcon}><MaterialIcons name="sync" size={15} color="white" /></Text>) : (null)}
                                        { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null }
                                    </TouchableOpacity>   
                                );
                            }) }
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_5_2')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                            </TouchableOpacity>
                        </View> 
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.oneBox}>
                            <Text style={[styles.description]}>Close up of lugs (wire connections) <Text onPress={this._showHelper.bind(this, 'close_up_of_lugs')} ><Ionicons name="ios-help-circle-outline" size={23} color="green" /></Text></Text>
                            { deal.photo_5_3.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity onLongPress={this._toggleDeleteMode.bind(this)} onPress={this.openSwiper.bind(this, i, 'photo_5_3')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                        { photo.phoneUpload ? (<Text style={styles.syncIcon}><MaterialIcons name="sync" size={15} color="white" /></Text>) : (null)}
                                        { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null }
                                    </TouchableOpacity>   
                                );
                            }) }
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_5_3')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.oneBox}>
                            <Text style={[styles.description, {width: 100000}]}>Model # <Text onPress={this._showHelper.bind(this, 'model')} ><Ionicons name="ios-help-circle-outline" size={23} color="green" /></Text></Text>
                            { deal.photo_5_4.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity onLongPress={this._toggleDeleteMode.bind(this)} onPress={this.openSwiper.bind(this, i, 'photo_5_4')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                        { photo.phoneUpload ? (<Text style={styles.syncIcon}><MaterialIcons name="sync" size={15} color="white" /></Text>) : (null)}
                                        { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null }
                                    </TouchableOpacity>   
                                );
                            }) }
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_5_4')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                            </TouchableOpacity>
                        </View> 
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        <Text style={[styles.description]}>Service Entrance (Where the electricity enters the building) <Text onPress={this._showHelper.bind(this, 'service_entrance')} ><Ionicons name="ios-help-circle-outline" size={23} color="green" /></Text></Text>
                        { deal.photo_6_1.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity onLongPress={this._toggleDeleteMode.bind(this)} onPress={this.openSwiper.bind(this, i, 'photo_6_1')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                        { photo.phoneUpload ? (<Text style={styles.syncIcon}><MaterialIcons name="sync" size={15} color="white" /></Text>) : (null)}
                                        { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null }
                                    </TouchableOpacity>   
                                );
                            }) }
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_6_1')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                            </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.SectionTitle}>Breaker Box(es)</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.oneBox}>
                            <Text style={[styles.description, {width: 100000}]}>Area around box</Text>
                            { deal.photo_7_1.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity onLongPress={this._toggleDeleteMode.bind(this)} onPress={this.openSwiper.bind(this, i, 'photo_7_1')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                        { photo.phoneUpload ? (<Text style={styles.syncIcon}><MaterialIcons name="sync" size={15} color="white" /></Text>) : (null)}
                                        { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null }
                                    </TouchableOpacity>   
                                );
                            }) }
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_7_1')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.oneBox}>
                            <Text style={[styles.description, {width: 100000}]}>Open showing entire box</Text>
                            { deal.photo_7_2.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity onLongPress={this._toggleDeleteMode.bind(this)} onPress={this.openSwiper.bind(this, i, 'photo_7_2')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                        { photo.phoneUpload ? (<Text style={styles.syncIcon}><MaterialIcons name="sync" size={15} color="white" /></Text>) : (null)}
                                        { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null }
                                    </TouchableOpacity>   
                                );
                            }) }
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_7_2')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                            </TouchableOpacity>
                        </View> 
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.oneBox}>
                            <Text style={[styles.description, {width: 100000}]}>Close up of Main Breaker <Text onPress={this._showHelper.bind(this, 'main_breaker')} ><Ionicons name="ios-help-circle-outline" size={23} color="green" /></Text></Text>
                            { deal.photo_7_3.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity onLongPress={this._toggleDeleteMode.bind(this)} onPress={this.openSwiper.bind(this, i, 'photo_7_3')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                        { photo.phoneUpload ? (<Text style={styles.syncIcon}><MaterialIcons name="sync" size={15} color="white" /></Text>) : (null)}
                                        { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null }
                                    </TouchableOpacity>   
                                );
                            }) }
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_7_3')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.oneBox}>
                            <Text style={[styles.description, {width: 100000}]}>Cover removed, entire box <Text onPress={this._showHelper.bind(this, 'entire_box')} ><Ionicons name="ios-help-circle-outline" size={23} color="green" /></Text></Text>
                            { deal.photo_7_4.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity  onLongPress={this._toggleDeleteMode.bind(this)}   onPress={this.openSwiper.bind(this, i, 'photo_7_4')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                        { photo.phoneUpload ? (<Text style={styles.syncIcon}><MaterialIcons name="sync" size={15} color="white" /></Text>) : (null)}
                                        { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null }
                                    </TouchableOpacity>   
                                );
                            }) }
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_7_4')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                            </TouchableOpacity>
                        </View> 
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.SectionTitle}>Photos of roof specifics</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.oneBox}>
                            <Text style={[styles.description, {width: 100000}]}>Tilt angle/pitch of roof</Text>
                            { deal.photo_9_1.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity  onLongPress={this._toggleDeleteMode.bind(this)}  onPress={this.openSwiper.bind(this, i, 'photo_9_1')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                        { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null }
                                    </TouchableOpacity>   
                                );
                            }) }
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_9_1')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.oneBox}>
                            <Text style={[styles.description, {width: 100000}]}>Attic/roof supports</Text>
                            { deal.photo_9_2.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity  onLongPress={this._toggleDeleteMode.bind(this)}  onPress={this.openSwiper.bind(this, i, 'photo_9_2')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                        { photo.phoneUpload ? (<Text style={styles.syncIcon}><MaterialIcons name="sync" size={15} color="white" /></Text>) : (null)}
                                        { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null }
                                    </TouchableOpacity>   
                                );
                            }) }
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_9_2')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                            </TouchableOpacity>
                        </View> 
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap'}}>
                        <Text style={[styles.description, {width: 100000}]}>Metal profile</Text>
                        { deal.photo_9_3.map((photo, i) => {
                                let url;
                                if(photo.phoneUpload == true){
                                    url = photo.url;
                                }else{
                                    url = baseUrl + photo.url.replace('images/', 'images/thumbnail-');
                                }
                                return (
                                    <TouchableOpacity  onLongPress={this._toggleDeleteMode.bind(this)}  onPress={this.openSwiper.bind(this, i, 'photo_9_3')} key={i}>
                                        <Image 
                                        style={styles.photoImage}
                                        source={{uri: url}}
                                        />
                                        
                                        { deleteMode ? (<Text style={styles.deleteIcon}><MaterialIcons name="delete" size={30} color="white" /></Text>) : null }
                                    </TouchableOpacity>   
                                );
                            }) }
                            <TouchableOpacity onPress={this.showOptions.bind(this, 'photo_9_3')}>
                                <View style={styles.uploadPhoto}><Text>
                                    <Ionicons name="ios-camera-outline" size={30} color="white" /></Text>
                                </View>
                            </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            ) : (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator
                    color="green"
                    size="large"
                    style={styles.loading}
                    />
                <Text style={styles.loadingText}>Fetching deal please wait...</Text>
                </View>
            )}
            <ActionSheet ref={(c) => { this.actionSheet = c; }} />
        </View>
        );
    }
  }
}

const styles = StyleSheet.create({
    SectionTitle: {
        fontSize: 20,
        color: "#64B243",
        fontWeight: "bold",
        marginBottom: 3,
    },
    mainContainer: {
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 20,
        flex: 1
    },
    deleteIcon: {
         position: 'absolute', 
         textAlign: 'center', 
         color: 'red',
         marginLeft: 15,
         marginTop: 10 ,
         textShadowColor: 'black',
         textShadowOffset: {width: 3, height: 3},
         textShadowRadius: 5,
    },
    syncIcon: {
        position: 'absolute', 
        right: 0,
        backgroundColor: 'orange',
        width: 20,
        height: 20,
        textAlign: 'center',
        borderRadius: 10,
        paddingTop: 2 
    },
    photoDump: {
        borderWidth: 1,
        borderColor: 'green',
        height: 130,
        borderRadius: 7,
        marginBottom: 30,
        paddingLeft: 10,
        paddingTop: 10,
        paddingBottom: 10,
        paddingRight: 10,
        alignItems: "stretch"
    },
    oneBox: {
        flex: 0.5,
        flexWrap: 'wrap',
        flexDirection: 'row'
    },
    description: {
        fontSize: 12,
        color: "#5D5D5D",
        marginBottom: 10
    },
    section: {
        marginBottom: 30
    },
    photoImage :{
        width: 60, 
        height: 55,
        borderRadius: 7,
        marginRight: 10,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1
    },
    uploadPhoto: {
        width: 60, 
        height: 55,
        borderRadius: 7,
        marginRight: 10,
        marginBottom: 10,
        backgroundColor: '#FFCE31',
        justifyContent: 'center',
        alignItems: 'center'
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
    },
     wrapper: {
  },
  slide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  sliderImage: {
   flex: 1,
    width: null,
    height: null,
    resizeMode: 'contain'
  }
});


AppRegistry.registerComponent("PhotoScreen", () => PhotoScreen);
