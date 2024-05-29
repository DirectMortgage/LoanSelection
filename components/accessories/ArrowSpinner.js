import React, { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const ArrowSpinner = ({ color, size, style = {} }) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startSpinnerAnimation();
  }, []);

  const startSpinnerAnimation = () => {
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 800,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => startSpinnerAnimation());
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View
      style={[
        {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          marginTop: -5,
        },
        style,
      ]}
    >
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <FontAwesome
          name="rotate-right"
          size={size || 20}
          color={color || "#69aa46"} //#69aa46
        />
      </Animated.View>
    </View>
  );
};

export default ArrowSpinner;
