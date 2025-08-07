import { Image } from "expo-image";
import { useState } from "react";
import {
    Dimensions,
    ImageSourcePropType,
    ImageURISource,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import EnhancedImageViewing from "react-native-image-viewing";

type Props = {
  imgSource: ImageSourcePropType; // can be number, object, or array
  selectedImage?: string;
};

export default function ImageViewer({ imgSource, selectedImage }: Props) {
  const [fullscreen, setFullscreen] = useState(false);

  // Type guard to check if the source is ImageURISource
  const isImageURISource = (
  source: ImageSourcePropType
): source is ImageURISource & { uri: string } => {
  return (
    typeof source === "object" &&
    source !== null &&
    !Array.isArray(source) &&
    typeof source.uri === "string" &&
    source.uri.length > 0
  );
};


  // Normalize input into array of supported types for EnhancedImageViewing
  const normalizeImages = (
    source: ImageSourcePropType
  ): (number | { uri: string })[] => {
    if (Array.isArray(source)) {
      return source
        .map((item) => {
          if (typeof item === "number") return item;
          if (isImageURISource(item)) return { uri: item.uri };
          return null;
        })
        .filter(Boolean) as (number | { uri: string })[];
    } else {
      if (typeof source === "number") return [source];
      if (isImageURISource(source)) return [{ uri: source.uri }];
      return [];
    }
  };

  const imagesArray: (number | { uri: string })[] = selectedImage
    ? [{ uri: selectedImage }]
    : normalizeImages(imgSource);

  return (
    <>
      <TouchableOpacity onPress={() => setFullscreen(true)}>
        <Image source={selectedImage ? { uri: selectedImage } : imgSource} style={styles.image} />

      </TouchableOpacity>

      <EnhancedImageViewing
        images={imagesArray}
        imageIndex={0}
        visible={fullscreen}
        onRequestClose={() => setFullscreen(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />
    </>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
  fullscreenImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
