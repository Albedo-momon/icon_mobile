import React from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ViewStyle,
  StatusBar,
} from 'react-native';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  safeArea?: boolean;
  backgroundColor?: string;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  safeArea = true,
  backgroundColor = '#ffffff',
  style,
  contentContainerStyle,
}) => {
  const screenStyle = [
    styles.container,
    { backgroundColor },
    style,
  ];

  const content = scrollable ? (
    <ScrollView
      style={screenStyle}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={screenStyle}>
      {children}
    </View>
  );

  if (safeArea) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
          {content}
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      {content}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});