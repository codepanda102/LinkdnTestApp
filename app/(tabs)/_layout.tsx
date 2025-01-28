import React from 'react';
import {Tabs} from 'expo-router';
import { AntDesign, Entypo, Ionicons } from '@expo/vector-icons';

export default function Layout(){
    return(
        <Tabs
        //  tabBarActiveTintColor
         screenOptions={{
            headerShown:false,
            tabBarActiveTintColor: "#008E97",
            tabBarInactiveTintColor: "gray",
            tabBarStyle:{
                height:70,
                paddingTop:10,
                paddingBottom:10
            },
            tabBarLabelStyle:{
                fontSize:13,
                paddingBottom:5
            },
            // tabBarIconStyle:{
            //     marginTop:2
            // }
         }}>
            <Tabs.Screen 
                name="home"
                options={{
                    tabBarLabel:"Home",
                    tabBarIcon:({focused, color})=> focused ? (
                        <Entypo name="home" size={24} color={color}/>
                    ):(
                        <AntDesign name="home" size={24} color={color}/>
                    )
                }}      
            />
            <Tabs.Screen
                name="network"
                options={{
                    tabBarLabel:"Network",
                    tabBarIcon:({focused, color})=> focused ? (
                        <Ionicons name="people" size={24} color={color}/>
                    ):(
                        <Ionicons name="people-outline" size={24} color={color}/>
                    )
                }}
            />
            <Tabs.Screen
                name="post"
                options={{
                    tabBarLabel:"Post",
                    tabBarIcon:({focused, color})=> focused ? (
                        <AntDesign name="plussquare" size={24} color={color}/>
                    ):(
                        <AntDesign name="plussquareo" size={24} color={color}/>
                    )
                }}
            />
        </Tabs>
    )
}