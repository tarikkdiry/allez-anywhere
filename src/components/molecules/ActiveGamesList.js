import React, { Component, useState } from 'react';
import { StyleSheet, View, TextInput, Text, Image } from 'react-native';
import ActiveGamesItem from '../atoms/ActiveGamesItem';
import ActiveGamesItemSolo from '../atoms/ActiveGamesItemSolo';

const ActiveGamesList = ({ sessionListHost, sessionListPlayer, sessionListSolo, selection }) => {
    const isSingle = (count) => {
        return (count === 1) ? (count + ' traveler') : (count + ' travelers');
    };

    const Solo = () => {
        return (
            sessionListSolo.map((session, index) => {
                return (
                    <View key={index}>
                        <ActiveGamesItemSolo 
                            session={session.sessionId} // Session == Location for solo mode
                            location={session.location}
                            sessionType={session.sessionType}
                            // playerCount={session[1]}
                        />
                    </View>
                )
            })
        )
    };

    const Player = () => {
        return (
            sessionListPlayer.map((session, index) => {
                return (
                    <View key={index}>
                        <ActiveGamesItem 
                            session={session.sessionId}
                            // location={session.location}
                            playerCount={session.pName}
                        />
                    </View>
                )
            })
        )
    };

    const Host = () => {
        return (
            sessionListHost.map((session, index) => {
                return (
                    <View key={index}>
                        <ActiveGamesItem 
                            session={session.sessionId}
                            // location={session.location}
                            playerCount={isSingle(session.pCount)}
                        />
                    </View>
                )
            })
        )
    };

    return (
        // Query based on hosted games vs participant games
        <View style={styles.container}>
            {
                <Solo/>
            }
            {
                <Host />
            }
            {
                <Player />
            }
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})

export default ActiveGamesList;