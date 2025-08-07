import Button from "@/components/Button";
import ImageViewer from "@/components/ImageViewer";
import ModelDropdown from "@/components/ModelDropdown";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {LAMBDA_1_URL} from "@env";

const PlaceholderImage = require('@/assets/images/background-image.png');

export default function Index() {
const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);

const pickImageAsync = async() => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes : ['images'],
    allowsEditing: false,
    quality: 1,
  });
  if (!result.canceled){
    setSelectedImage(result.assets[0].uri);
    console.log(result);
  } else {
    alert('You did not select any image.');
  }
};

const router = useRouter();

const [selectedModel, setSelectedModel] = useState("General - v3");

const getMimeType = (uri: string): string => {
  if (uri.endsWith(".jpg") || uri.endsWith(".jpeg")) return "image/jpeg";
  if (uri.endsWith(".png")) return "image/png";
  if (uri.endsWith(".webp")) return "image/webp";
  return "image/jpeg"; // default fallback
};



const handleGenerate = async () => {
  if (!selectedImage){
    alert("Please Select an Image.");
    return;
  }

  const mimeType = getMimeType(selectedImage);

  try {
    // Step 1: Request a presigned URL
    const response = await fetch(LAMBDA_1_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        modelType: selectedModel,
        contentType: mimeType,
      })
    });

    const { uploadUrl, key, id } = await response.json();

    // Step 2: Upload the image using the presigned URL
    const imageBlob = await fetch(selectedImage).then(res => res.blob());

    await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": mimeType
      },
      body: imageBlob
    });

    // Step 3: Navigate to generated screen
    router.push({
      pathname: "./generated",
      params: {key, selectedImage},
      
    });

  } catch (error) {
    console.error("Error uploading image:", error);
    alert("Failed to upload image.");
  }
};





  return (
    <View style={styles.container}>
      <View style = {styles.imageContainer}>
        <ImageViewer imgSource = {PlaceholderImage} selectedImage={selectedImage}/>
      </View>
      <View style={styles.footerContainer}>
        <Button theme = 'primary' label= " Choose a photo" onPress={pickImageAsync}/>
        <ModelDropdown labels={[
              { label: "Real Life Image", value: "General - v3" },
              { label: "Animated Image", value: "Anime - anime6B" }
              ,]}
              onChange={(val) => setSelectedModel(val)}
              />
        <Button label = "Generate Image"  onPress={handleGenerate}/>
      </View>
    </View>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003153',
    alignItems: 'center',
    justifyContent: 'center'
  },
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    marginBottom: 0,
  },
});

