import IconButton from '@/components/IconButton';
import * as FileSystem from 'expo-file-system';
import { Image } from "expo-image";
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import EnhancedImageViewing from "react-native-image-viewing";
import {LAMBDA_3_URL} from "@env";

export default function GeneratedScreen() {
  const [isVisible, setVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  const router = useRouter();
  const params = useLocalSearchParams();

  const selectedImage = typeof params.selectedImage === 'string' ? params.selectedImage : '';
  const key = typeof params.key === 'string' ? params.key : '';

  const openSlideshow = (index: number) => {
    setCurrentImage(index);
    setVisible(true);
  };

  const handleRefresh = () => {
    router.push("/");
  };

  const handleSave = async () => {
  try {
    const uriToSaveRaw = currentImage === 0 ? selectedImage : outputUrl;

    if (typeof uriToSaveRaw !== "string") {
      alert("No image to save.");
      return;
    }

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access media library is required!');
      return;
    }

    // Check if URI is local or remote
    if (uriToSaveRaw.startsWith("file://")) {
      // Local file — just save directly
      await MediaLibrary.saveToLibraryAsync(uriToSaveRaw);
      alert('Image saved to your library!');
    } else if (uriToSaveRaw.startsWith("http://") || uriToSaveRaw.startsWith("https://")) {
      // Remote file — download then save
      const fileName = uriToSaveRaw.split("/").pop() || "image.jpg";
      const localPath = `${FileSystem.documentDirectory}${fileName}`;

      const downloadResumable = FileSystem.createDownloadResumable(uriToSaveRaw, localPath);
      await downloadResumable.downloadAsync();

      await MediaLibrary.saveToLibraryAsync(localPath);
      alert('Image saved to your library!');
    } else {
      alert("Unsupported URI scheme.");
    }
  } catch (error) {
    console.error("Failed to save image", error);
    alert("Failed to save image.");
  }
};

  useEffect(() => {
    if (!key) return;

    let attempts = 0;
    const maxAttempts = 45; // 30s
    const interval = 2000;

    const pollForOutputUrl = async () => {
      try {
        const res = await fetch(LAMBDA_3_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ requestID: key })
        });

        const data = await res.json();

        if (res.ok && data.output_url) {
          setOutputUrl(data.output_url);
          setIsPolling(false);
          console.log("Output URL ready:", data.output_url);
          return;
        }

        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(pollForOutputUrl, interval);
        } else {
          setIsPolling(false);
          Alert.alert("Timeout", "Image processing took too long.");
        }
      } catch (err) {
        setIsPolling(false);
        console.error("Error polling for output_url:", err);
        Alert.alert("Error", "Failed to get processed image.");
      }
    };

    pollForOutputUrl();
  }, [key]);

  const images = [
    { uri: selectedImage },
    ...(outputUrl ? [{ uri: outputUrl }] : []),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={() => openSlideshow(0)} style={styles.imageWrapper}>
          <Image source={{ uri: selectedImage }} style={styles.image} contentFit="cover" />
        </TouchableOpacity>

        {outputUrl ? (
          <TouchableOpacity onPress={() => openSlideshow(1)} style={styles.imageWrapper}>
            <Image source={{ uri: outputUrl }} style={styles.image} contentFit="cover" />
          </TouchableOpacity>
        ) : isPolling && (
          <TouchableOpacity style={styles.imageWrapper}>
            <View style={styles.image}>
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.loadingText}>Processing Image...</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footerContainer}>
        <View style={styles.footerRow}>
          <IconButton icon="refresh" label="reset" onPress={handleRefresh} />
          <IconButton icon="save" label="save" onPress={handleSave} />
        </View>
      </View>

      {isVisible && (
  <EnhancedImageViewing
        images={images}
        imageIndex={currentImage}
        visible={isVisible}
        onRequestClose={() => setVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />
    )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003153',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
  },
  imageContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    marginVertical: 10,
  },
  image: {
    width: 300,
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1c1c1c',
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  footerContainer: {
    paddingBottom: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
});
