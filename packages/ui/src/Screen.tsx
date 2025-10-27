import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  safeArea?: boolean;
  backgroundColor?: string;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  showScrollIndicator?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  safeArea = true,
  backgroundColor = '#ffffff',
  style,
  contentContainerStyle,
  showScrollIndicator = false,
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
      showsVerticalScrollIndicator={showScrollIndicator}
      keyboardDismissMode="none"
      keyboardShouldPersistTaps="always"
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
        <SafeAreaView edges={["top"]} style={[styles.safeArea, { backgroundColor }]}> 
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