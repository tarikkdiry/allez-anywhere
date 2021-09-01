import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, Image, TextInput, Modal } from 'react-native';
import BackArrow from '../../assets/back_arrow.png';
import LoadingScreen from '../components/organisms/LoadingScreen';
import * as firebase from 'firebase';
import { TouchableOpacity } from 'react-native-gesture-handler';

const CreateGameScreen = ({ route, navigation }) => {
    const { userId, userEmail } = route.params;

    const [hostName, setHostName] = useState(''); // Potentially use login data
    const [hostEmail, setHostEmail] = useState(firebase.auth().currentUser.email);
    const [location, setLocation] = useState('');
    const [gameCode, setGameCode] = useState('') // Four Character code
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const placeholderColor = "#808080"; // or #949494

    const createGame = (session, name) => {
        let newGameCode = generateGameCode(session);
        // Determine if the new game exists, if not => proceed
        doesGameExist(session) ? createGameHelper(newGameCode, name) : createGameHelper(session, name);
    };

    const createGameHelper = async (session, name) => {
        if (name.length < 1) {
            console.log('You must enter a name!');
            setIsModalVisible(true);
            setError('You must enter a name!');
            return;
        }

        setIsLoading(true);
        try {
            // Create new game session under 'game/'
            await firebase.database().ref(`game/${session}`).set({
                host: name,
                hostEmail: userEmail,
                playerCount: 1,
                status: 'lobby',
                location: location,
                timestamp: Date.now(),
                waiting: [],
                ready: [],
                currentPlayer: name
            });
            
            console.log('Game session created!');

            // Push UID and Name for host to /players and /game/session
            await firebase.database().ref(`players/${session}`).push({
                playerId: userId,
                playerName: hostName,
                playerEmail: hostEmail,
                role: 'Host'
            })

            // Push {uid, name} to players/session
            .then(
                // Move on to lobby page
                navigation.navigate('Lobby', {
                    session: session,
                    hostName: hostName,
                    playerName: name
                }),
                console.log(`${name} is on their way to the lobby!`)
            )
            setGameCode(session);
        } catch (err) {
            console.log("Sorry! Can't create game... -> " + err.message);
            setIsLoading(false);
            deleteGame(session);
        }
    }
    
    // Check if game session exists and is active
    const doesGameExist = (session) => {
        firebase.database().ref('game/' + session).once('value', snapshot => {
            if (snapshot.exists()) {
                return true;
            } else {
                return false;
            }
        })
    };

    // Generate random 4 character code for game session creation
    const generateGameCode = () => {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let len = characters.length;

        for (let i = 0; i < 4; i++) {
            result += characters.charAt(Math.floor(Math.random() * len));
        }

        return result;
    };

    // TODO: Relocate to shared functions
    const deleteGame = (gameCode) => {
        firebase.database().ref('game/' + gameCode).remove();
        firebase.database().ref('players/' + gameCode).remove();
    };

    return (
        <>
        {!isLoading ? (
            <View style={styles.container}>
                {/* <Modal 
                    animationType={"fade"}
                    transparent={false}
                    visible={isModalVisible}
                    onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                        setIsModalVisible(!isModalVisible);
                    }}
                    style={styles.modal}
                >
                    <Text style={styles.modalText}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                        Maecenas eget tempus augue, a convallis velit.
                    </Text>

                    <Button 
                        title="Got it"
                        color="black"
                        onPress={() => {
                            setIsModalVisible(!isModalVisible);
                        }}
                    />
                </Modal> */}
                <View style={styles.top}>
                    <TouchableOpacity 
                        activeOpacity={0.1}
                        underlayColor="#DDDDDD"
                        style={styles.arrow}
                        onPress={() => {
                            navigation.pop();
                        }}>
                    <Image 
                        source={BackArrow}
                        style={styles.arrow}
                    />
                    </TouchableOpacity>
                    <Text style={styles.text}>Create Game</Text> 
                </View>
                <View style={styles.bottom}>
                    <View style={styles.userInput}>
                        <TextInput 
                            style={styles.input} 
                            onChangeText={name => setHostName(name.toUpperCase())} 
                            value={hostName}
                            placeholder="Name"
                            placeholderTextColor={placeholderColor}
                            maxLength={8}
                        />
                        <TextInput 
                            style={styles.input} 
                            onChangeText={location => setLocation(location.toUpperCase())} 
                            value={location}
                            placeholder="Where are we?"
                            placeholderTextColor={placeholderColor}
                            maxLength={7}
                        />
                    </View>
                    
                    <View style={styles.continue}>
                        <View style={styles.button}> 
                            <Button 
                                title="Continue"
                                color="white"
                                onPress={() => {
                                    createGame(generateGameCode(), hostName.toUpperCase());
                                }}
                            />
                        </View>
                    </View>
                </View>
            </View>
            ) : (
                <LoadingScreen 
                    text="Loading..."
                />
            )
        }
        </>
    )
};

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#023859',
        padding: 20
    },
    // modal: {
    //     height: 500,
    //     backgroundColor: '#023859'
    // },
    // modalText: {
    //     color:
    // },
    top: {
        flex: 2,
    },
    bottom: {
        flex: 3,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    text: {
        fontSize: 40, 
        color: 'white', 
        fontFamily: 'regular',
        marginTop: '20%',
        padding: 20
    },
    arrow: {
        height: 50,
        width: 50,
        tintColor: 'white',
        marginTop: '20%'
    },
    userInput: {
        display: 'flex',
        flex: 1,
        justifyContent: 'flex-start',
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
        borderRadius: 20,
    }
});

export default CreateGameScreen;