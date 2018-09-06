import SketchCanvas from '@terrylinla/react-native-sketch-canvas';
import React, { Component } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import firebase from 'react-native-firebase';
import UUIDGenerator from 'react-native-uuid-generator';
import { UserContext } from '../user_context';


export default class Handwriting extends Component {
  constructor() {
    super();
    this.ref = firebase.firestore().collection('letters');

    this.state = {
      loading: true,
      letters: [],
    }
  }

  componentDidMount() {
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate)

  }

  componentWillUnmount() {
    this.unsubscribe();

  }

  onCollectionUpdate = (querySnapshot) => {
    const letters = [];

    querySnapshot.forEach((doc) => {
      const { alphabet, language } = doc.data();

      letters.push({
        key: doc.id,
        doc, // DocumentSnapshot
        alphabet,
        language,
      });
    });

    this.setState({
      letters,
      loading: false,
    });
  }


  render() {
    if (this.state.loading) {
      return (
        <ActivityIndicator
          animating={true}
          style={styles.indicator}
          size="large"
        />
      );
    }

    return (
      <UserContext.Consumer>
        {userContext =>
          <View style={styles.container}>

            <Text style={{ flex: 1, flexDirection: 'row' }}>{this.state.letters[0].alphabet}</Text>
            {/* <FlatList
            data={this.state.todos}
            renderItem={({ item }) => <Text>{item.language}</Text>}
          /> */}
            <View style={{ flexDirection: 'row' }}>
              <Button
                onPress={() => {
                  this.canvas.clear();
                }}
                title="Clear"
              />
              <Button
                onPress={() => {
                  this.canvas.undo();
                }}
                title="Undo"
              />
              <Button
                onPress={() => {
                  // save(imageType, transparent, folder, filename, includeImage, includeText, cropToImageSize) {
                  UUIDGenerator.getRandomUUID().then((uuid) => {
                    this.canvas.save('png', 'handwriting', uuid+'.png', true, false, true, true);
                    var storageRef = firebase
                      .storage()
                      .ref('/'+uuid+'.png');
                    storageRef
                      .putFile(
                        Environment.DIRECTORY_DOCUMENTS+'/'+uuid+'.png'
                      )
                      .then(() => {
                        storageRef.getDownloadURL().then((url) => {
                          var samplesRef = firebase.firestore().collection('samples');
                          samplesRef.add(
                            {
                              letter: this.state.letters[0].key,
                              user_id: userContext.user.uid,
                              status: 'incomplete',
                              image: url
                            }
                          )
                        })
                      })
                      .catch(() => console.log('Failed putFile'));
                  });
                }}
                title="Save"
              />
            </View>
            <View style={{ flex: 2, flexDirection: 'row' }}>
              <SketchCanvas
                ref={ref => this.canvas = ref}
                containerStyle={{ backgroundColor: 'transparent', flex: 1 }}
                canvasStyle={{ backgroundColor: 'transparent', flex: 1 }}
                defaultStrokeIndex={0}
                defaultStrokeWidth={5}
              />
            </View>

          </View>
        }
      </UserContext.Consumer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5FCFF',
  },
  strokeColorButton: {
    marginHorizontal: 2.5, marginVertical: 8, width: 30, height: 30, borderRadius: 15,
  },
  strokeWidthButton: {
    marginHorizontal: 2.5, marginVertical: 8, width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#39579A'
  },
  functionButton: {
    marginHorizontal: 2.5, marginVertical: 8, height: 30, width: 60,
    backgroundColor: '#39579A', justifyContent: 'center', alignItems: 'center', borderRadius: 5,
  }
});