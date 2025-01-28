import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Button, TouchableOpacity, Pressable, FlatList, Image, ActivityIndicator, Dimensions } from 'react-native';
import { atob } from 'core-js/stable';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { router } from 'expo-router';
import { AntDesign, Entypo } from '@expo/vector-icons';
// import UserProfile from '@/components/UserProfile';

interface User {
    _id: string,
    name: string,
    profileImage: string,
}

const Index = () => {

    const [userId, setUserId] = useState<string | null>(null);
    const [user, setUser] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const API_URL = `http://172.21.96.1:5000`;
    axios.defaults.baseURL = API_URL;
    axios.defaults.headers.get['Content-Type'] = 'application/json'

    // manually decode token function:
    const decodeJWT = (token: string) => {
        try {
            if (!token || token.split('.').length !== 3) {
                throw new Error('Invalid token format');
            }
            // split the token into its parts (header, payload, signature)
            const [, payload] = token.split('.');
            // decode the BaseUrl-encoded payload
            const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
            // const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
            return decodedPayload;
        } catch (error) {
            console.log('Invalid token format', error);
            return null;
        }
    }

    // fetch user..
    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                // get the token
                const token = await AsyncStorage.getItem("authToken");
                console.log('Token', token);
                if (!token) {
                    setError('token not found!');
                    return;
                }
                // const decodedToken = jwtDecode<{userId: string, exp: number}>(token);
                // const decodedToken = decodeJWT(token);
                const decodedToken = jwtDecode<{ userId: string, exp: number }>(token);
                console.log('Decoded Token:', decodedToken);
                if (!decodedToken) {
                    setError('Invalid Token');
                    return;
                }
                // check if token is expired
                const currentTime = Math.floor(Date.now() / 1000);
                // const expiryTime = decodedToken.exp;
                if (decodedToken.exp && currentTime > decodedToken.exp) {
                    setError('Token has expired!');
                    console.log('Token has expired!');
                    // return;
                }

                // add a null check for the token
                // if (token){
                //     // decode the token..
                //     const userId = decodedToken.userId;
                //     setUserId(userId);
                // } else {
                //     console.log('Token not found');
                // }
                if (decodedToken && decodedToken.userId) {
                    setUserId(decodedToken.userId);
                    console.log('User Id set to: ', decodedToken.userId);
                }
            } catch (error) {
                console.log('Error processing token:', error);
                setError('Error processing token!');
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);
    // testing..
    console.log('User ID:', userId);


    const fetchUserProfile = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            // get user id:
            const response = await axios.get(`/profile/${userId}`);
            // get user data..
            const userProfile = response.data.user;
            console.log('user profile requested data', userProfile);

            if (!userProfile) {
                console.log('failed fetching user profile');
            }
            if (userProfile) {
                console.log('Successful fetching user profile');
                setUser(userProfile);
            }
        } catch (error) {
            console.log('Error! fetching user profile', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // log fetching user profile..
    console.log('User Profile:', user);

    // fetching user profile:
    useEffect(() => {
        if (userId) {
            fetchUserProfile();
        }
    }, [userId, fetchUserProfile]);


    const fetchUsers = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const response = await axios.get<{ users: User[]}>(`/users/${userId}`);
            console.log('users:', response.data);
            if (!response.data) {
                console.log('Failed fetching users');
            }
            if (response.data) {
                const users = response.data;
                console.log('Users', users);
                setUsers(response.data.users);
            }
        } catch (error) {
            console.log('Error fetching users', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // fetch connected users..
    useEffect(() => {
        if (userId) {
            fetchUsers();
        } else {
            console.log('User ID not available yet');
        }
    }, [userId, fetchUsers]);

    console.log('fetched user connections: ', users);

    useEffect(()=>{
        console.log('Fetched users updated:', users);
        console.log('Users state:', JSON.stringify(users, null, 2));
    },[users])

    const logoutUser = async () => {
        try {
            await AsyncStorage.removeItem("authToken");
            setUserId("");
            console.log('User logged out');
            Alert.alert('User logged out successful');
            router.replace('/(authenticate)/login');
        } catch (error) {
            console.log('Logout error', error);
            Alert.alert('Error', 'Error logging out!');
        }
    }

    const handleLogout = () => {
        logoutUser();
    }

    interface UserProfileProps {
        item: {
            _id: string,
            name: string,
            profileImage: string
        }
    }

    if (loading) {
        return (
            <View style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <ActivityIndicator size='large' color='#FFC72C' />
            </View>
        )
    }

    return (
        <ScrollView style={styles.container}>
            <Pressable style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 10,
                justifyContent: 'space-between',
                marginVertical: 10,
            }}>
                <Text style={{
                    fontSize: 16,
                    fontWeight: '600'
                }}>Manage My Network</Text>
                <AntDesign name="arrowright" size={24} color="black" />
            </Pressable>
            {/* Divider */}
            <View
                style={{
                    borderColor: '#f0f0f0',
                    borderWidth: 3,
                    marginVertical: 10,
                }}
            />
            <Pressable style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 10,
                justifyContent: 'space-between',
                marginVertical: 10,
            }}>
                <Text style={{
                    fontSize: 16,
                    fontWeight: '600'
                }}>Invitations (0)</Text>
                <AntDesign name="arrowright" size={24} color="black" />
            </Pressable>
            {/* Divider */}
            <View
                style={{
                    borderColor: '#f0f0f0',
                    borderWidth: 3,
                    marginVertical: 10,
                }}
            />
            <View>
            </View>
            {/* Banner */}
            <View style={{ gap:5, marginBottom:8, paddingHorizontal: 15, backgroundColor:'orange', paddingVertical:20 }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <Text style={{
                        fontSize:16,
                        fontWeight: 'bold',
                        color:'#fff'
                    }}>Grow your network faster</Text>
                    <View style={{
                        height:25,
                        width:25,
                        justifyContent:'center',
                        alignItems:'center',
                        borderRadius:40,
                        backgroundColor:'#fff'
                    }}>
                        <Entypo name="cross" size={20} color="black" />
                    </View>
                </View>
                <Text style={{
                    color:"gray",
                    fontWeight:'600'
                }}>Find and contact the right people. Plus see who's viewed your profile</Text>
                <TouchableOpacity style={{
                    backgroundColor: "#FFC72C",
                    width: 140,
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    borderRadius: 25,
                    marginTop: 8,
                }}>
                    <Text style={{
                        textAlign: 'center',
                        color: "white",
                        fontWeight: '600'
                    }}>Try Premium</Text>
                </TouchableOpacity>
            </View>
            {/* show all of the request connections */}
            {/* render users */}
            {
                loading ? <ActivityIndicator size={"large"} color="blue"/> : <FlatList
                data={users}
                extraData={users} // Force re-render when data changes
                scrollEnabled={false}
                columnWrapperStyle={{
                    justifyContent: 'space-between'
                }}
                numColumns={2}
                keyExtractor={(item, index) => item._id || index.toString()}
                // renderItem={({item})=> <UserProfile item={item} key={item._id}/>}
                renderItem={({ item }) => <UserProfile item={item} key={item._id} />}
                ListEmptyComponent={
                    <View style={{
                        flex:1,
                        marginVertical:20,
                        backgroundColor:'black',
                        justifyContent:'center',
                        alignItems:'center'
                    }}>
                        <Text style={{
                            color:'#fff'
                        }}>No users Available!</Text>
                    </View>
                }
            /> 
            }
        </ScrollView>
    );
}

const UserProfile = ({ item }: { item: User }) => {
    // Checking for Extra Spaces:
    // clean Image URLs before rendering
    const cleanImageUrl = item.profileImage?.trim();
    return (
        <View style={{
            flex: 1,
            width:Dimensions.get('window').width - 80 / 2,
            height:Dimensions.get('window').height / 4,
            backgroundColor: "#fff",
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: 16,
            marginVertical:10,
            padding: 15,
            borderRadius: 10,
            borderWidth:1,
            borderColor:'gray'
        }}>
            <View style={{
                justifyContent:'center',
                alignItems:'center',
            }}>
            <Image
                style={{
                    width:80,
                    height:80,
                    borderRadius:40,
                    marginBottom:10,
                    backgroundColor:'#f2f2f2'
                }}
                source={cleanImageUrl ? { uri: cleanImageUrl } : {uri: 'https://img.freepik.com/free-photo/close-up-skin-pores-face-care-routine_23-2149383448.jpg'}}
            />  
            </View>
            <View style={{
                marginTop:10,
            }}>
                <Text style={{textAlign:'center', fontSize:15, fontWeight:'600'}}>{item?.name}</Text>
                <Text style={{
                    textAlign:'center',
                    fontSize:14,
                    fontWeight:'400'
                }}>Engineer Graduate | Linkedin Member</Text>
            </View>
            <TouchableOpacity style={{
                marginLeft:'auto',
                marginRight:'auto',
                borderColor:'#0072b1',
                borderWidth:1,
                borderRadius:25,
                marginTop:8,
                paddingHorizontal:14,
                paddingVertical:3
            }} onPress={()=>{}}>
                <Text style={{fontWeight:'600', color:'#0072b1'}}>Connect</Text>
            </TouchableOpacity>
        </View>
    )
}

//..
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    }
});
//...
export default Index;