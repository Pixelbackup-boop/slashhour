import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';

interface ImageCarouselProps {
  images: Array<{ url: string }>;
  height?: number;
  width?: number;
  borderRadius?: number;
  showPagination?: boolean;
  fallbackImage?: any;
}

export default function ImageCarousel({
  images,
  height,
  width,
  borderRadius = 0,
  showPagination = true,
  fallbackImage,
}: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(width || 0);
  const [containerHeight, setContainerHeight] = useState(height || 0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Handle container layout to get actual dimensions
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width: layoutWidth, height: layoutHeight } = event.nativeEvent.layout;
    if (!width) {
      setContainerWidth(layoutWidth);
    }
    if (!height) {
      setContainerHeight(layoutHeight);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const imageWidth = width || containerWidth;
    const index = Math.round(scrollPosition / imageWidth);
    setActiveIndex(index);
  };

  // If no images and no fallback, return null
  if ((!images || images.length === 0) && !fallbackImage) {
    return null;
  }

  // Calculate actual dimensions to use
  const actualWidth = width || containerWidth;
  const actualHeight = height || containerHeight;

  // Determine container style
  const containerStyle = width && height
    ? { width, height }
    : { width: width || '100%', height: height || '100%' };

  // If only one image or no images but has fallback
  if (images.length <= 1) {
    const imageSource = images.length === 1 ? { uri: images[0].url } : fallbackImage;
    return (
      <View
        style={[styles.container, containerStyle]}
        onLayout={handleLayout}
      >
        <Image
          source={imageSource}
          style={[styles.image, { width: '100%', height: '100%', borderRadius }]}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Multiple images - show carousel
  return (
    <View
      style={[styles.container, containerStyle]}
      onLayout={handleLayout}
    >
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {images.map((image, index) => (
          <Image
            key={`${image.url}-${index}`}
            source={{ uri: image.url }}
            style={[styles.image, { width: actualWidth, height: actualHeight, borderRadius }]}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      {showPagination && images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  image: {
    backgroundColor: COLORS.white,
  },
  pagination: {
    position: 'absolute',
    bottom: SPACING.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  paginationDotActive: {
    backgroundColor: COLORS.white,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
});
