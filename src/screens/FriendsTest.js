import React, { useState, useEffect, useContext } from 'react';
import { View, FlatList, StyleSheet, ScrollView, KeyboardAvoidingView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Layout, Text, Button } from 'react-native-rapi-ui';
import { StatusBar } from 'expo-status-bar';
import TabBarIcon from "../components/utils/TabBarIcon";
import Colors from '../consts/Colors';
import PrimaryButton from '../components/utils/buttons/PrimaryButton';
import SecondaryButton from '../components/utils/buttons/SecondaryButton';
import Avatar from '../components/Avatar';
import TertiaryButton from '../components/utils/buttons/TertiaryButton';
import AddFriend from '../components/utils/icons/AddFriend';
import { AuthContext } from '../provider/AuthProvider';
import { supabase } from '../lib/initSupabase'; // Adjust the path according to your project structure


const Friends = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { session } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryModal, setSearchQueryModal] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (session) {
      getAllUsers();
      // getFriends();
      getIncomingRequests();
    }
  }, [session]);

  const getAllUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.log(error.message);
    } else {
      setUsers(data ?? []);
      
    }
  };

  // TO DO
  const filteredFriends = searchQuery.length > 0
    ? users.filter(user =>
        user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

    const filteredUsers = searchQueryModal.length > 0
    ? users.filter(user =>
        user.first_name.toLowerCase().includes(searchQueryModal.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchQueryModal.toLowerCase())
      )
    : users;



  const getIncomingRequests = async () => {
    // Implement logic to fetch incoming friend requests from the database
    // For now, use dummy data
    setIncomingRequests([
      {
        id: 1,
        first_name: 'Wouter',
        last_name: 'Tack',
        avatar_url: '1715979997164.jpeg',
      },
    ]);
  };

  const handleSearch = () => {
    const results = users.filter(user =>
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
  };

  const handleAddFriend = (id) => {
    // Logic to add friend
    Alert.alert('Friend added!');
    setModalVisible(false);
    // Clear search results and query
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleAccept = (id) => {
    // Logic to accept friend request
    Alert.alert('Friend request accepted!');
    setIncomingRequests((prev) => prev.filter((request) => request.id !== id));
  };

  const handleDecline = (id) => {
    // Logic to decline friend request
    Alert.alert('Friend request declined!');
    setIncomingRequests((prev) => prev.filter((request) => request.id !== id));
  };

  const renderFriendItem = ({ item }) => (
    <View style={[styles.friendRequest, { marginBottom: 15 }]}>
      <View style={styles.avatar} pointerEvents='none'>

        <Avatar url={item.avatar_url} size={70} />
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{`${item.first_name} ${item.last_name}`}</Text>
        <View style={styles.buttonProfile}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile', { friendId: item.id })} style={styles.buttonAccept}>
            <Text style={styles.buttonAcceptText}>Ga naar profiel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderSearchResultItem = ({ item }) => (
    <View key={item.id} style={styles.friendRequestModal}>
      <View style={styles.avatarModal}>
        <Avatar url={item.avatar_url} size={70} />
      </View>
      <View style={styles.friendInfoModal}>
        <Text style={styles.friendNameModal}>{`${item.first_name} ${item.last_name}`}</Text>
        <View style={styles.buttonProfileModal}>
          <TouchableOpacity onPress={() => handleAddFriend(item.id)} style={styles.buttonAcceptModal}>
            <Text style={styles.buttonAcceptTextModal}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.secondaryGreen} style="light" />
      <Layout style={{ flex: 1 }}>
        <View style={[styles.container, styles.contentContainer]} >
          <View style={styles.header}>
            <TabBarIcon
              library="AntDesign"
              icon="arrowleft"
              size={38}
              style={styles.icon}
              onPress={() => navigation.navigate('Home')}
            />
            <Text style={styles.headerText}>Vrienden</Text>
            <View style={styles.profileIcon}>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <AddFriend />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inkomende vriendschapsverzoek(en)</Text>
            {incomingRequests.map((request) => (
              <View key={request.id} style={styles.friendRequest}>
                <View style={styles.avatar}>
                  <Avatar url={request.avatar_url} size={70} />
                </View>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{`${request.first_name} ${request.last_name}`}</Text>
                  <View style={styles.buttonsContainer}>
                    <TouchableOpacity onPress={() => handleAccept(request.id)} style={styles.buttonAccept}>
                      <Text style={styles.buttonAcceptText}>Accepteren</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDecline(request.id)} style={styles.buttonDecline}>
                      <Text style={styles.buttonDeclineText}>Weigeren</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jouw vrienden ({filteredUsers.length})</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Zoek een vriend..."
                placeholderTextColor={Colors.gray}
                onChangeText={text => setSearchQuery(text)}
                value={searchQuery}
              />
              <TouchableOpacity style={styles.searchButton} >
                <TabBarIcon
                  library="AntDesign"
                  icon="search1"
                  size={24}
                  color={Colors.white}
                  style={styles.searchIcon}
                />
              </TouchableOpacity>
            </View>
            <FlatList
              data={filteredFriends}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderFriendItem}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
            
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(!modalVisible)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Voeg een vriend toe</Text>
              <View style={styles.searchContainerModal}>
                <TextInput
                  style={[styles.searchInput, styles.searchInputModal]}
                  placeholder="Zoek een vriend..."
                  placeholderTextColor={Colors.gray}
                  onChangeText={text => setSearchQueryModal(text)}
                  value={searchQueryModal}
                />
                <TouchableOpacity style={[styles.searchButton, styles.searchButtonModal]} onPress={handleSearch}>
                  <TabBarIcon
                    library="AntDesign"
                    icon="search1"
                    size={24}
                    color={Colors.white}
                    style={styles.searchIcon}
                  />
                </TouchableOpacity>
              </View>
              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderSearchResultItem}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
              <TouchableOpacity
                style={[styles.buttonClose, styles.buttonAccept]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.buttonAcceptText}>Sluit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Layout>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondaryGreen,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100, // Make room for the button
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  profileIcon: {
    marginLeft: 'auto',
  },
  section: {
    marginVertical: 10,
    marginTop: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  friendRequest: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGreen,
    padding: 10,
    borderRadius: 10,
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginRight: 15,
    marginLeft: 5,
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'center',
  },
  friendName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '50%',
    marginTop: 10,
    marginBottom: 10,
    gap: 8,
  },
  buttonAccept: {
    backgroundColor: Colors.white,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonAcceptText: {
    color: Colors.secondaryGreen,
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonDecline: {
    backgroundColor: Colors.darkGreen,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDeclineText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    
  },
  searchInput: {
    flex: 1,
    color: '#000',
    padding: 12,
    paddingLeft: 20,
    marginLeft: 10,

  },
  searchContainerModal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.darkGreen,
    
  },
  searchButton: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    color: '#fff',
    backgroundColor: Colors.darkGreen,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  searchIcon: {
    color: Colors.white,
  },
  buttonProfile: {
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalView: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.secondaryGreen,
    marginBottom: 20,
  },
  searchContainerModal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
  },
  searchInputModal: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.darkGreen,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 12,
    paddingLeft: 20,
    
  },
  searchButtonModal: {
    padding: 10,
    backgroundColor: Colors.darkGreen,
    borderWidth: 1,
    borderColor: Colors.darkGreen,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  
  searchResults: {
    width: '100%',
  },
  buttonClose: {
    marginTop: 0,
  },


  friendRequestModal: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGreen,
    padding: 20,
    borderRadius: 10,
    width: '100%',
    minHeight: 100,
    minWidth: 285,
    marginBottom: 20,
  },
  avatarModal: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginRight: 15,

  },
  friendInfoModal: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'center',
  },
  friendNameModal: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainerModal: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
    gap: 8,
  },
  buttonAcceptModal: {
    backgroundColor: Colors.white,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '50%',
  },
  buttonAcceptTextModal: {
    color: Colors.secondaryGreen,
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonProfileModal: {
    marginTop: 10,
  },
});

export default Friends;
