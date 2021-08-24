import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import BackArrow from '../../assets/back_arrow.png';
import { TouchableOpacity } from 'react-native-gesture-handler';
import _ from 'lodash';
import * as firebase from 'firebase';
import LoadingScreen from '../components/organisms/LoadingScreen';
import PlayerList from '../components/molecules/PlayerList';

const LobbyScreen = ({ route, navigation }) => {
    const { session, hostName, playerName, playerKey } = route.params;

    const [currentHost, setCurrentHost] = useState(hostName);
    const [currentPlayer, setCurrentPlayer] = useState(playerName);
    const [players, setPlayers] = useState([['', '']]);
    const [everyoneReady, setEveryoneReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [readyCount, setReadyCount] = useState(0); // Excluding Host

    useEffect(() => {
        setCurrentPlayer(playerName);
        const playerRef = firebase.database().ref(`players/${session}`);
        const waitingRef = firebase.database().ref(`game/${session}/waiting`);
        const readyRef = firebase.database().ref(`game/${session}/ready`);
        const gameRef = firebase.database().ref(`game/${session}`);

        // Update count of ready players
        const readyPlayers = readyRef.on('value', (snapshot) => {
            setReadyCount(snapshot.numChildren());
        });

        const updatePlayerCount = playerRef.on('value', (snapshot) => {
            if (snapshot.numChildren() !== players.length && snapshot.exists()) {
                try {
                    gameRef.update({
                        playerCount: snapshot.numChildren()
                    })
                } catch (err) {
                    console.log('Unable to update playerCount...');
                }
            } else {
                return;
            }
        })

        // Grab number of players to determine if game can be started or not
        const listenForPlayers = playerRef.on('value', (snapshot) => { 
            const fetchedPlayers = [];
            
            snapshot.forEach((childSnapshot) => {
                fetchedPlayers.push({
                    id: childSnapshot.val().playerEmail, 
                    value: childSnapshot.val().playerName
                });
            });

            // Updates the players state whenever a new player joins
            if (JSON.stringify(fetchedPlayers) != JSON.stringify(players)) {
                setPlayers(fetchedPlayers);
            }     

            // Check to see if all players are ready to begin the game
            (players.length - 1 == readyCount && readyCount > 0) ? setEveryoneReady(true) : setEveryoneReady(false);
        });

        // If the host leaves, the game is ended for everyone
        const listenForGame = gameRef.on('value', (snapshot) => {
            if (!snapshot.exists()) {
                setGameOver(true);
                navigation.navigate('Welcome'); // Refactor to show modal indicating the game session has been ended
            }
        });

        return () => {
            readyRef.off('value', readyPlayers);
            playerRef.off('value', listenForPlayers);
            gameRef.off('value', listenForGame)
        }
    });

    const leaveGame = async () => {
        if (currentPlayer == currentHost) {
            setIsLoading(true);
            try {
                await deleteGame(session)
            } catch (err) {
                console.log("Can't delete game: " + err);
            }
            setIsLoading(false);
            navigation.navigate('Welcome')   
        } else {
            removeFromWaiting();
            removeFromReady();
            removeFromPlayers();
        }
    };

    // Remove player from 'waiting' and add them to 'ready'
    const readyUp = async () => {
        let waitingPlayers = await firebase.database().ref(`game/${session}/waiting`).once('value');
        if (waitingPlayers !== null) {
            let waitingPlayersObj = waitingPlayers.val();
            const waitingIDs = Object.keys(waitingPlayersObj) || null;
            waitingIDs.forEach((ID) => {
                if (waitingPlayersObj[ID] == playerName) {
                    firebase.database().ref(`game/${session}/ready/${ID}`).set(playerName);
                    try {
                        firebase.database().ref(`game/${session}/waiting/${ID}`).remove();
                    } catch(err) {
                        console.log(`Can't ready up: ${err}`);
                    }
                };
            });
            console.log(`${playerName} is ready!`);
        }
    };

    // ================================================HELPERS================================================

    const removeFromWaiting = async () => {
        let waitingPlayers = await firebase.database().ref(`game/${session}/waiting`).once('value');
        if (waitingPlayers !== null) {
            let waitingPlayersObj = waitingPlayers.val() || null;
            const waitingIDs = Object.keys(waitingPlayersObj) || null;
            waitingIDs.forEach((ID) => {
                if (waitingPlayersObj[ID] == playerName) {
                    try {
                        firebase.database().ref(`game/${session}/waiting/${ID}`).remove();
                    } catch(err) {
                        console.log(`Can't leave the game: ${err}`);
                    }
                } 
            });
        }
    };

    const removeFromReady = async () => {
        let readyPlayers = await firebase.database().ref(`game/${session}/ready`).once('value');
        if (readyPlayers !== null) {
            let readyPlayersObj = readyPlayers.val();
            const readyIDs = Object.keys(readyPlayersObj);
            readyIDs.forEach((ID) => {
                if (readyPlayersObj[ID] == playerName) {
                    try {
                        firebase.database().ref(`game/${session}/ready/${ID}`).remove();
                    } catch(err) {
                        console.log(`Can't leave the game: ${err}`);
                    }
                } 
            });
        }
    }

    const removeFromPlayers = async () => {
        let activePlayers = await firebase.database().ref(`players/${session}`).once('value');
        let activePlayersObj = activePlayers.val();
        const activeIDs = Object.keys(activePlayersObj) || null;

        activeIDs.forEach((ID) => {
            if (ID == playerKey) {
                try {
                    firebase.database().ref(`players/${session}/${ID}`).remove()
                    .then(
                        console.log(`Player: ${playerName} has left!`)
                    )
                } catch(err) {
                    console.log(`Can't leave the game: ${err}`);
                }                    
            };
            navigation.navigate('Welcome');
        });
    };

    // Delete game from all root children
    const deleteGame = (gameCode) => {
        firebase.database().ref('game/' + gameCode).remove();
        firebase.database().ref('players/' + gameCode).remove();
        console.log(`Session ${session} has ended!`);
    };


    // Print out states for debug purposes
    const seeStates = () => {
        console.log("------------------STATES------------------");
        console.log("Session: " + session);
        console.log("Current Host: " + currentHost);
        console.log("Current player: " + currentPlayer);
        console.log("Players: " + players);
        console.log("Everyone ready: " + everyoneReady);
        console.log("------------------------------------------");
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
                            leaveGame()
                        }}>
                        <Image source={BackArrow} style={styles.arrow} />
                    </TouchableOpacity>
                    <Text style={styles.text}>{"Session:"}</Text> 
                    <Text style={styles.session}>{session}</Text> 
                    <View style={styles.playerList}>
                        <PlayerList 
                            players={players}
                        />
                    </View>
                </View>
                <View style={styles.bottom}> 
                    {
                        (currentHost !== currentPlayer) ? (
                            <View style={styles.button}> 
                                <Button 
                                    title="READY"
                                    color="white"
                                    // disabled={(isEveryoneReady) ? true : false}
                                    onPress={() => {
                                        readyUp();
                                    }}
                                />
                            </View>
                            ) : (
                                <Button 
                                    title={(everyoneReady) ? 'START' : 'Waiting for players to ready up...'}
                                    color="white"
                                    disabled={(everyoneReady) ? false : true}
                                    onPress={() => {
                                        navigation.navigate('Game', {
                                            session: session
                                        })
                                    }}
                                />
                            )
                    }
                </View>
            </View>
        ) : (
            <LoadingScreen 
                text={(currentHost == currentPlayer) ? "Ending game..." : "Leaving game..."}
            />
        )
        }
        </>
    )

    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#F2913D',
        padding: 20
    },
    top: {
        flex: 3,
    },
    bottom: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        fontSize: 40, 
        color: 'white', 
        fontFamily: 'regular',
        marginTop: '20%',
        paddingLeft: 20
    },
    session: {
        fontSize: 60, 
        color: '#D95A2B', 
        fontFamily: 'regular',
        paddingLeft: 20
    },
    arrow: {
        height: 50,
        width: 50,
        tintColor: 'white',
        marginTop: '20%'
    },
    playerList: {
        flex: 2,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '50%',
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 20,
        height: 50,
    },
});

export default LobbyScreen;