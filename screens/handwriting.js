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
    //get only for the selected language
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
      currentLetter: letters[Math.floor(Math.random() * letters.length)],
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

            <Text style={{ flex: 1, flexDirection: 'row' }}>{this.state.currentLetter.alphabet}</Text>
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
                  UUIDGenerator.getRandomUUID().then((uuid) => {
                    this.canvas.save('png', 'handwriting', uuid + '.png', true, false, true, true);
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
                onSketchSaved={(result, path) => {
                  console.log('saved to ' + path);
                  this.canvas.clear();
                  this.setState((state, props) => {
                    return {
                      ...state,
                      currentLetter: state.letters[Math.floor(Math.random() * state.letters.length)],
                      loading: false
                    }
                  });
                  UUIDGenerator.getRandomUUID().then((uuid) => {
                    var storageRef = firebase
                      .storage()
                      .ref(uuid + '.png');
                    storageRef
                      .putFile(path)
                      .then(() => {
                        console.log('put file');
                        storageRef.getDownloadURL().then((url) => {
                          console.log('storageref');
                          var samplesRef = firebase.firestore().collection('samples');
                          samplesRef.add(
                            {
                              letter: this.state.currentLetter.key,
                              user_id: userContext.user.uid,
                              status: 'incomplete',
                              image: url
                            }
                          );
                        })
                          .catch((error) => {
                            console.log('Failed getDownloadURL ' + error);
                          })
                      })
                      .catch(() => {
                        console.log('Failed putFile');
                      });
                  })
                }}

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