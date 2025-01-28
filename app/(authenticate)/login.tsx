import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, Image, KeyboardAvoidingView, TextInput, Pressable, Alert} from 'react-native';
import { MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const login=()=>{
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();
    const API_URL = 'http://172.21.96.1:5000';
    // const API_URL = 'http://10.0.2.2:5000';

    // this checks if the user is logged in, by looking for an authentication token in AsyncStorage.
    // it will keep making the user logged-in if they are already loggedin-in..
    // Therefore once opening the app, the app will directly take you to the homescreen instead of 
    // login or signup screen, thus when the user is already logged-in to the app..
    useEffect(()=>{
        const checkLoginStatus=async()=>{
            try{
                const token = await AsyncStorage.getItem("authToken")
                console.log('Retrieved Token', token);

                if (token){
                    const decodedToken = jwtDecode<{exp: number}>(token);
                    const currentTime = Math.floor(Date.now() / 1000);
                    
                    if (decodedToken.exp && currentTime < decodedToken.exp){
                        router.replace('/(tabs)/home');
                    } else {
                        console.log('Token has expired!');
                        // Optionally clear the token..
                        await AsyncStorage.removeItem("authToken"); 
                    }
                }
            }catch(error){
                console.log(error);
            }
        }
        checkLoginStatus();
    },[])

    const validateInputs=()=>{
        if (!email.trim()){
            Alert.alert('Error', 'Email is required');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)){
            Alert.alert('Error', 'Please enter a valid email address');
            return false;
        }
        if (!password.trim() || password.length < 8){
            Alert.alert('Error', 'Password must be at least not less than 8 characters');
            return false;
        }
        return true;
    }

    axios.defaults.baseURL = API_URL;
    axios.defaults.headers.post['Content-Type']='application/json';

    const handleLogin=async()=>{
        try{
            if (!validateInputs()) return;

            console.log('Sending a login request', {
                email,
                password
            });

            const response = await axios.post('/login', {
                email,
                password
            })

            console.log('Login response:', response.data);

            if (response.status === 200 && response.data){
                console.log('User logged in successfully', response);
                Alert.alert('Login Successful', 'User logged in successfully');
                setEmail("");
                setPassword("");
                const { token } = response.data;
                await AsyncStorage.setItem("authToken", token);
                router.replace('/(tabs)/home');
            }
            
        }catch(error: any){
            console.log('Login failed', {
                success:false,
                message:'Error login in',
                error: error.response?.data || error.message
            });
            setEmail("");
            setPassword("");
            Alert.alert('Error', 'Failed to login user', error.response?.data?.message);
        }
    }

    return(
        <View style={styles.container}>
            <View style={{
                alignItems:'center',
            }}>
                <Image
                    style={{width:150, height:100, resizeMode:'contain'}}
                    source={{uri:'https://www.freepnglogos.com/uploads/linkedin-logo-transparent-png-25.png'}}
                />
                
            </View>
            <KeyboardAvoidingView>  
                <View style={{alignItems:'center'}}>
                    <Text style={{
                        fontSize:20,
                        fontWeight:'bold',
                        // marginTop:12,
                        color:'#041E42'
                    }}>Login to your Account!</Text>
                </View>
                <View style={{marginTop:70}}>
                    <View style={{
                        flexDirection:'row',
                        alignItems:'center',
                        paddingVertical:5,
                        gap:5,
                        borderRadius:5,
                        marginTop:30,
                        backgroundColor:'#E0E0E0'
                    }}>
                    <MaterialIcons style={{marginLeft:8}} name="mail" size={24} color={'gray'}/>
                    <TextInput
                        value={email}
                        placeholder='Enter email address'
                        style={{
                            color:'gray',
                            marginVertical:3,
                            width:300,
                            fontSize: email ? 18 : 18
                        }}
                        onChangeText={(text)=>setEmail(text)}
                        />
                    </View>
                    <View style={{
                        flexDirection:'row',
                        alignItems:'center',
                        paddingVertical:5,
                        gap:5,
                        borderRadius:5,
                        marginTop:30,
                        backgroundColor:'#E0E0E0'
                    }}>
                    <AntDesign style={{marginLeft:8}} name="lock" size={24} color={'gray'}/>
                    <TextInput
                        value={password}
                        placeholder='Enter password'
                        style={{
                            color:'gray',
                            marginVertical:3,
                            width:300,
                            fontSize: email ? 18 : 18
                        }}
                        secureTextEntry={true}
                        autoCapitalize='none'
                        autoCorrect={false}
                        onChangeText={(text)=>setPassword(text)}
                        />
                    </View>
                </View>
                <View style={{
                    alignItems:'center',
                    marginTop:50,
                }}>
                    <Pressable style={{
                        width:200,
                        padding:15,
                        backgroundColor:'#0072b1'
                    }} onPress={handleLogin}>
                        <Text style={{
                            textAlign:'center',
                            color:'#fff',
                            fontSize:18
                        }}>Login</Text>
                    </Pressable>
                    <Pressable style={{marginTop:10}} onPress={()=> router.replace('/(authenticate)/register')}>
                        <Text style={{fontSize:17}}>Don't have an account? Sign Up</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </View>
    )
}
export default login;

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#fff'
    }
})