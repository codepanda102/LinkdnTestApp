import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Stack} from 'expo-router';

const index=()=>{
    return(
        <View style={styles.container}>
            <Text>Post</Text>
        </View>
    )
}
const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'white'
    }
})
export default index;