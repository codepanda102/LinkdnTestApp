import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';

interface UserProfileProps{
    item:{
        _id:string,
        name:string,
        profileImage:string
    }
}

const UserProfile:React.FC<UserProfileProps>=({ item })=>{
    return(
        <View>
            <View>
                <Image
                    style={{
                        width:90,
                        height:90,
                        borderRadius:45,
                        resizeMode:'cover'
                    }} 
                    source={{uri: item?.profileImage}}/>
                    <Text>{item?.name}</Text>
            </View>
        </View>
    );
}
export default UserProfile;