import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const index=()=>{
    return(
        <View style={styles.container}>
            <Text>Home</Text>
        </View>
    );
}
export default index;

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#fff'
    }
})