// import { Buffer } from 'buffer';
// global.Buffer = Buffer;
import { Redirect } from 'expo-router';
import React from 'react';
// import 'react-native-get-random-values';

export default function Index() {
    return <Redirect href="/(authenticate)/login" />;
}