import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Text,
  Button,
  FlatList,
} from 'react-native';

import { createBottomTabNavigator } from 'react-navigation';
import SideMenu from 'react-native-side-menu';
import Handwriting from './handwriting';
import Profile from './profile';
import Languages from './languages';

// export default class Home extends Component {
//   render() {
//     const menu = <View style={{backgroundColor: 'blue', flexDirection: 'row', flex: 1}}><Text>Hello</Text></View>;

//     const BottomTabNavigator = createBottomTabNavigator({
//       Languages: { screen: Languages },
//       Home: { screen: Handwriting },
//       Profile: {screen: Profile},
//     });

    // return (
    //   <SideMenu menu={menu} isOpen={false}>
    //     <BottomTabNavigator/>
    //   </SideMenu>
    // )
//   }
// }

export default createBottomTabNavigator({
  Languages: { screen: Languages },
  Home: { screen: Handwriting },
  Profile: {screen: Profile},
});


  //  Settings: {screen: props => <SettingsScreen {...props} userId="abhi" />},