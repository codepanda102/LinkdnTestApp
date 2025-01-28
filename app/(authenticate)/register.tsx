import React, { useState } from 'react';
import {View, Text, StyleSheet, Image, KeyboardAvoidingView, TextInput, Pressable, Alert, TouchableOpacity} from 'react-native';
import { MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';


const register=()=>{
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [image, setImage] = useState("");

    const router = useRouter();
    const API_URL = 'http://172.21.96.1:5000';
    // const API_URL = 'http://10.0.2.2:5000';
    // const API_URL = 'http://192.168.100.244:5000';

    // input validation:
    const validateInputs =()=>{
        if (!name.trim()){
            Alert.alert('Error', 'Name is required');
            return false;
        }
        if (!email.trim()){
            Alert.alert('Error', 'Email is required');
            return false;
        }

        if (!/\S+@\S+\.\S+/.test(email)){
            Alert.alert('Error', 'Please enter a valid email address')
            return false;
        }

        if (!password.trim() || password.length < 6){
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return false;
        }
        // make sure to return true if validation pass..
        return true;
    }


    // configure axios defaults..
    axios.defaults.baseURL = API_URL;
    axios.defaults.headers.post['Content-Type'] = 'application/json';

    const handleRegister=async()=>{
        
        try{
            // input validation
            if (!validateInputs()) return;

            // log the request
            console.log('Sending registration request:', {
                name,
                email,
                password,
                profileImage: image
            });
    
            // create a user..
            const response = await axios.post('/register', {
                name,
                email,
                password,
                profileImage: image
            })
    
            // verify the response..
            console.log('Registration response:', response.data);

            // successfully response..
            if (response.data){
                Alert.alert(
                    "Sign Up Successful",
                    "Registration successful! Please check your email for verification"
                )
                setName("");
                setEmail("");
                setPassword("");
                setImage("");
                //..
                router.replace('/(authenticate)/login');
            }
        } catch(error: any){
            console.log('Registration error', error);
            if (error.response?.status === 4000 && error.response?.data?.message?.includes('already exists')){
                Alert.alert('Registration Failed', 'This email is already registered! Please try loggin instead.', [
                    {
                        text: "Login",
                        onPress:()=> router.replace('/(authenticate)/login')
                    },
                    {
                        text:'Try Again',
                        style:'cancel'
                    }
                ]);
                console.log('Registration Failed, Email already registered! Login instead');
            } else {
                console.log('Registration Failed', error.response?.data?.message);
                Alert.alert('Registration Failed', error.response?.data?.message || "An error occured during registration");
                setName("");
                setEmail("");
                setPassword("");
                setImage("");
            }
        }   
    }

    return(
        <View style={styles.container}>
            <View style={{
                alignItems:'center'
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
                    {/* name */}
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
                        value={name}
                        placeholder='Enter your name'
                        style={{
                            color:'gray',
                            marginVertical:3,
                            width:300,
                            fontSize: name ? 18 : 18
                        }}
                        onChangeText={(text)=>setName(text)}
                        />
                    </View>
                    {/* email */}
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
                        value={email}
                        placeholder='Enter email address'
                        style={{
                            color:'gray',
                            marginVertical:3,
                            width:300,
                            fontSize: email ? 18 : 18
                        }}
                        autoCapitalize='none'
                        autoCorrect={false}
                        onChangeText={(text)=>setEmail(text)}
                        />
                    </View>
                    {/* password */}
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
                        placeholder='Enter Password'
                        style={{
                            color:'gray',
                            marginVertical:3,
                            width:300,
                            fontSize: password ? 18 : 18
                        }}
                        secureTextEntry={true}
                        autoCapitalize='none'
                        autoCorrect={false}
                        onChangeText={(text)=>setPassword(text)}
                        />
                    </View>
                    {/* profile image */}
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
                        value={image}
                        placeholder='Enter Image Link'
                        style={{
                            color:'gray',
                            marginVertical:3,
                            width:300,
                            fontSize: image ? 18 : 18
                        }}
                        autoCapitalize='none'
                        autoCorrect={false}
                        onChangeText={(text)=>setImage(text)}
                        />
                    </View>
                </View>
                <View style={{
                    alignItems:'center',
                    marginTop:50,
                }}>
                    <TouchableOpacity style={{
                        width:200,
                        padding:15,
                        backgroundColor:'#0072b1'
                    }}
                     onPress={handleRegister}
                     activeOpacity={.7}
                    >
                        <Text style={{
                            textAlign:'center',
                            color:'#fff',
                            fontSize:18
                        }}>Register</Text>
                    </TouchableOpacity>
                    <Pressable style={{marginTop:10}} onPress={()=> router.replace('/(authenticate)/login')}>
                        <Text style={{fontSize:17}}>Already have an account? Sign In</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </View>
    )
}
export default register;

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#fff'
    }
})