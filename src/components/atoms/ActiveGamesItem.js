import React, { Component, useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { StyleSheet, View, TextInput, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as firebase from 'firebase';

const ActiveGamesItem = ({ session, playerCount }) => {
    const [destination, setDestination] = useState('');

    const navigation = useNavigation();

    const gameRef = firebase.database().ref(`game`);

    useEffect(() => {
        // Check whether the session is in 'Lobby' or 'Active' status
        const getSessionStage = gameRef.on('value', (snapshot) => {
            try {
                snapshot.forEach((child) => {
                    if (child.key === session) {
                        setDestination(child.val().status === 'lobby' ? 'Lobby' : 'Welcome');
                    }
                })
            } catch(err) {
                console.log(err);
            }
        })
    });
    
    return (
        <TouchableOpacity onPress={() => {
            navigation.push(destination, {
                session: session
            })
            console.log(destination);
        }}>
            <View style={styles.container}>
                <View style={styles.session}>
                    <Text style={styles.text}>{session}</Text>
                </View>
                <View style={styles.playerCount}>
                    <Text style={styles.text}>{playerCount}</Text>
                </View>
            </View>
        </TouchableOpacity>
        
    )
};

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        padding: 10,
        paddingBottom: 40,
        justifyContent: 'space-between'
    },
    session: {
        display: 'flex'
    },
    playerCount: {
        display: 'flex'
    },
    text: {
        color: 'white',
        fontSize: 25,
        fontFamily: 'regular',
    }
})

export default ActiveGamesItem;