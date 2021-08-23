import React, { Component, useState } from 'react';
import { StyleSheet, View, TextInput, Text, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

const ActiveGamesItem = ({ session, location, sessionType }) => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity style={styles.container} onPress={() => {
            navigation.push('SoloGame', {
                session: session
            })
        }}>
            <View style={styles.location}>
                <Text style={styles.text}>{location}</Text>
            </View>
            <View style={styles.sessionType}>
                <Text style={styles.text}>{sessionType}</Text>
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
    location: {
        display: 'flex'
    },
    sessionType: {
        display: 'flex'
    },
    text: {
        color: 'white',
        fontSize: 25,
        fontFamily: 'regular',
    }
})

export default ActiveGamesItem;