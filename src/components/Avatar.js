import { useState, useEffect } from 'react'
import { supabase } from '../lib/initSupabase'
import { StyleSheet, View, Alert, Image, Button, TouchableOpacity } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import TabBarIcon from './utils/TabBarIcon'



export default function Avatar({ url, size, onUpload }) {
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const avatarSize = { height: size, width: size }

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path)

      if (error) {
        throw error
      }

      const fr = new FileReader()
      fr.readAsDataURL(data)
      fr.onload = () => {
        setAvatarUrl(fr.result )
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error downloading image: ', error.message)
      }
    }
  }

  

  return (
    <View>
      {avatarUrl ? (
       
        <Image
          source={{ uri: avatarUrl }}
          accessibilityLabel="Avatar"
          style={[avatarSize, styles.avatar, styles.image]}
        />
      ) : (

          <TabBarIcon
          library="FontAwesome"
          icon="user-circle"
          size={size}
          style={styles.avatar}
        />

    
      )}
     
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 100,
    overflow: 'hidden',
    maxWidth: '100%',
    marginBottom: 7,
  },
  image: {
    objectFit: 'cover',
    paddingTop: 0,
  },
  noImage: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgb(200, 200, 200)',
    borderRadius: 5,
  },
})