import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import BackArrow from '../../assets/back_arrow.png';
import { TouchableOpacity } from 'react-native-gesture-handler';
import firebase from 'firebase';

// API
import { login, signup, signout } from '../api/CardsApi';

const WelcomeScreen = ({ route, navigation }) => {
    const { userName } = route.params;

    const [userEmail, setUserEmail] = useState(firebase.auth().currentUser.email);

    onSignedOut = () => {
        console.log('Signed out!');
        navigation.popToTop(); // REFACTOR 
    }

    return (
        <View style={styles.container}>
            <View style={styles.top}>
                <TouchableOpacity 
                    activeOpacity={0.1}
                    underlayColor="#DDDDDD"
                    style={styles.arrow}
                    onPress={() => {
                        signout(onSignedOut)
                    }}>
                <Image 
                    source={BackArrow}
                    style={styles.arrow}
                />
            </TouchableOpacity>
                <Text style={styles.text}>Allez  Anywhere</Text> 
            </View>
            <View style={styles.bottom}>
                <View style={styles.buttons}> 
                    <Button 
                        title="Create Game"
                        style={styles.button}
                        color="white"
                        onPress={() => {
                            navigation.push('CreateGame', {
                                userEmail: userEmail
                            })
                        }}
                    />
                    <Button 
                        title="Join Game"
                        style={styles.button}
                        color="white"
                        onPress={() => {
                            navigation.push('JoinGame', {

                            })
                        }}
                    />
                    <Button 
                        title="Active Adventures"
                        style={styles.button}
                        color="white"
                        onPress={() => {
                            navigation.push('ActiveGames', {
                                userEmail: userEmail
                            })
                        }}
                    />
                    <Button 
                        title="New Solo Adventure"
                        style={styles.button}
                        color="white"
                        onPress={() => {
                            navigation.push('SoloLocationSelect', {
                                userEmail: userEmail
                            })
                        }}
                    />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#D95A2B',
        padding: 20
    },
    top: {
        flex: 2,
    },
    bottom: {
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: 'red'
    },
    text: {
        display: 'flex',
        fontSize: 40, 
        color: 'white', 
        fontFamily: 'regular',
        marginTop: '20%',
        padding: 20,
    },
    arrow: {
        height: 50,
        width: 50,
        tintColor: 'white',
        marginTop: '20%'
    },
    buttons: {
        // flex: 1,
        // alignItems: 'center',
        // justifyContent: 'center',
    },
    button: {
        
    }
});

export default WelcomeScreen;