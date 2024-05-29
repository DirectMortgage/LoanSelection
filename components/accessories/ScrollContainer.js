import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StyleSheet,
} from "react-native";
import { web, android, ios } from "./Platform";

const ScrollContainer = (props) => {
  const { children, scrollToTop = false, setScrollToTop = () => {} } = props;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef(null);
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      }
    );
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);
  useEffect(() => {
    if (scrollToTop && !web) {
      setScrollToTop(false);
      if (scrollToTop === 999) {
        setTimeout(() => {
          scrollViewRef.current.scrollToEnd({ animated: true });
        }, 0);
      } else {
        try {
          scrollViewRef.current.scrollToOffset({ offset: 0, animated: true });
        } catch (error) {
          scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
        }
      }
    } else if (scrollToTop && web) {
      setScrollToTop(false);

      try {
        if (scrollToTop === 999) {
          setTimeout(() => {
            document.querySelector(
              'div[data-testid="scrollContainer"]'
            ).scrollTop = document.querySelector(
              'div[data-testid="scrollContainer"]'
            ).scrollHeight;
          }, 0);
        } else {
          document
            .querySelector('div[data-testid="scrollContainer"]')
            .scrollTo({
              top: 0,
              behavior: "smooth",
            });
        }
      } catch (error) {}
    }
  }, [props]);

  return (
    <>
      {ios ? (
        <>
          <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={30}
            keyboardShouldPersistTaps="handled"
          >
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets={true}
              alwaysBounceVertical={true}
              contentContainerStyle={[styles.scrollContent]}
            >
              {children}
            </ScrollView>
          </KeyboardAvoidingView>
        </>
      ) : (
        <>
          <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
            <KeyboardAvoidingView behavior={null} keyboardVerticalOffset={0}>
              <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={[styles.scrollContent]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                alwaysBounceVertical={true}
              >
                {children}
              </ScrollView>
            </KeyboardAvoidingView>
          </KeyboardAwareScrollView>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: android ? 90 : 0,
  },
});

export default ScrollContainer;
