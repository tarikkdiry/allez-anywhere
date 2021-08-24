import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, Text, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import LoadingScreen from '../components/organisms/LoadingScreen';
import * as firebase from 'firebase';
import BackArrow from '../../assets/back_arrow.png';
import Home from '../../assets/home.png';

//TESTING
import ActiveGamesItem from '../components/atoms/ActiveGamesItem';
import ActiveGamesMenu from '../components/organisms/ActiveGamesMenu';
import ActiveGamesList from '../components/molecules/ActiveGamesList';

const ActiveGames = ({ route, navigation }) => {
    const { userEmail } = route.params;

    const [isLoading, setIsLoading] = useState(true);
    const [playerCount, setPlayerCount] = useState('');
    const [sessionDetailsHosting, setSessionDetailsHosting] = useState([]);
    const [sessionDetailsPlayer, setSessionDetailsPlayer] = useState([]);
    const [sessionDetailsSolo, setSessionDetailsSolo] = useState([]);
    const [sessionType, setSessionType] = useState('Active');

    // Firebase refs
    const gameRef = firebase.database().ref(`game`);
    const playerRef = firebase.database().ref(`players`);
    const soloRef = firebase.database().ref(`solo`);

    useEffect(() => {
        // console.log(sessionDetailsPlayer);

        const getActiveHostedGames = gameRef.on('value', (snapshot) => {
            try {
                let hostedSessions = [];
                snapshot.forEach((child) => {
                    if (child.val().hostEmail === userEmail) {
                        let sessionId = child.key;
                        let pCount = child.val().playerCount;
                        hostedSessions.push({
                            sessionId: sessionId, 
                            pCount: pCount
                        });
                    }
                });

                // Ensure the state is only updated once and only when there is an update
                if (JSON.stringify(sessionDetailsHosting) !== JSON.stringify(hostedSessions)) {
                    setSessionDetailsHosting(hostedSessions);
                    setIsLoading(false);
                }
            } catch (err) {
                console.log(err);
            }
            setIsLoading(false);
        });

        // TODO
        // Refactor to something more efficient
        const getActivePlayerGames = playerRef.on('value', (snapshot) => {
            try {
                let playerSessions = [];
                snapshot.forEach((child) => {
                    child.forEach((baby) => {
                        let sessionId = child.key;
                        let pVal = baby.val();
                        // Passing name as count for now
                        // MUST REFACTOR
                        // MIGHT HAVE TO BE [sessionId, pName, country/destination/whatever]
                        let pName = "as: " + baby.val().playerName;
                        if (pVal.playerEmail === userEmail && pVal.role === 'Player') {
                            playerSessions.push({
                                sessionId: sessionId, 
                                pName: pName,
                            });
                        }
                    })
                });
                
                // Ensure the state is only updated once and only when there is an update
                if (JSON.stringify(sessionDetailsPlayer) !== JSON.stringify(playerSessions)) {
                    setSessionDetailsPlayer(playerSessions);
                }
            } catch(err) {
                console.log(err);
            }
            setIsLoading(false);
        });

        const getActiveSoloGames = soloRef.on('value', (snapshot) => {
            try {
                let soloSessions = [];
                snapshot.forEach((child) => {
                    let sessionId = child.key;
                    let location = child.val().location;
                    if (child.val().hostEmail === userEmail) {
                        // soloSessions.push([child.val().location, 'Solo']);
                        soloSessions.push({
                            sessionId: sessionId,
                            location: location,
                            sessionType: 'Solo'
                        });
                    }
                });

                if (JSON.stringify(sessionDetailsSolo) !== JSON.stringify(soloSessions)) {
                    setSessionDetailsSolo(soloSessions);
                }
            } catch(err) {
                console.log(err);
            }
            setIsLoading(false);
        });

        return () => {
            gameRef.off('value', getActiveHostedGames);
            playerRef.off('value', getActivePlayerGames);
            soloRef.off('value', getActiveSoloGames);
        }
    });

    // Switch render based on user selection for games hosting vs participating in
    const switchModeHandler = (status) => {
        setSessionType(status);
    };

    return (
        <>
            {!isLoading ? (
                <View style={styles.container}>
                    <View style={styles.top}>
                        <TouchableOpacity 
                            activeOpacity={0.1}
                            underlayColor="#DDDDDD"
                            style={styles.arrow}
                            onPress={() => {
                                navigation.pop()
                            }}>
                        <Image 
                            source={BackArrow}
                            style={styles.arrow}
                        />
                        </TouchableOpacity>
                        {/* <TouchableOpacity 
                            activeOpacity={0.1}
                            underlayColor="#DDDDDD"
                            style={styles.home}
                            onPress={() => {
                                navigation.pop()
                            }}>
                        <Image 
                            source={Home}
                            style={styles.arrow}
                        />
                        </TouchableOpacity> */}
                        <Text style={styles.title}>Active Games</Text> 
                    </View>
                    <View style={styles.bottom}>
                        {/* <View style={styles.menu}> */}
                            {/* <TouchableOpacity onPress={() => switchModeHandler('Active')}>
                                <Text style={sessionType === 'Active' ? styles.activeText : styles.text}>Active</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => switchModeHandler('Solo')}>
                                <Text style={sessionType === 'Solo' ? styles.activeText : styles.text}>Solo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => switchModeHandler('Hosting')}>
                                <Text style={sessionType === 'Hosting' ? styles.activeText : styles.text}>Hosting</Text>
                            </TouchableOpacity> */}
                        {/* </View> */}
                        <ActiveGamesList 
                            selection={sessionType} 
                            sessionListHost={sessionDetailsHosting} 
                            sessionListPlayer={sessionDetailsPlayer} 
                            sessionListSolo={sessionDetailsSolo}
                        />
                    </View>
                </View> ) : (
                    <LoadingScreen 
                        text="Loading..."
                    />
                )
            }
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#023859',
        padding: 20
    },
    top: {
        flex: 2,
    },
    bottom: {
        flex: 3,
        flexDirection: 'column',
        paddingHorizontal: '5%'
    },
    menu: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        color: 'white', 
        fontFamily: 'regular',
        borderBottomColor: 'white',
        paddingBottom: 50,
    },
    title: {
        fontSize: 40, 
        color: 'white', 
        fontFamily: 'regular',
        marginTop: '20%',
        padding: 20
    },
    text: {
        color: 'gray',
        fontSize: 25,
        fontFamily: 'regular',
    },
    activeText: {
        // color: '#F28D77',
        color: '#F28D77',
        fontSize: 25,
        fontFamily: 'regular',
    },
    arrow: {
        height: 50,
        width: 50,
        tintColor: 'white',
        marginTop: '20%'
    },
    home: {
        height: 50,
        width: 50,
        tintColor: 'white',
        marginTop: '20%'
    },
    userInput: {
        display: 'flex',
        flex: 1,
        justifyContent: 'flex-start'
    },
    input: {
        height: 60,
        borderColor: 'white',
        borderBottomWidth: 0.2,
        color: 'white',
        marginVertical: 15,
        fontSize: 30,
        fontFamily: 'regular',
    },
    continue: {
        display: 'flex',
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: '10%'
    },
    button: {
        width: '50%',
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 20
    }
});

export default ActiveGames;