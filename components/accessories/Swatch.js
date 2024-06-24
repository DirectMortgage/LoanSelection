import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Switch } from "react-native-switch";
import Ionicons from "react-native-vector-icons/Ionicons";
import { android, web } from "./Platform";

const Swatch = ({
  size = 15,
  value = true,
  disable = false,
  onChange = () => {},
  style={}
}) => {
  const [iValue, setIValue] = useState(value);
  useEffect(() => {
    setIValue(value);
  }, [value]);
  return (
    <View
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          
        },
          web ? { cursor: disable ? "not-allowed" : "pointer" } : {},
          style,
      ]}
    >
      <Switch
        value={value}
        disabled={disable}
        onValueChange={() => {
          setIValue(!value);
          onChange(!value);
        }}
        activeText="YES"
        inActiveText="NO"
        activeTextStyle={{
          color: "white",
          fontWeight: "bold",
          fontSize: size - 3 || 15,
          fontFamily: "OpenSansBold",
        }}
        inactiveTextStyle={{
          color: "white",
          fontWeight: "bold",
          fontSize: size - 3 || 15,
          fontFamily: "OpenSansBold",
        }}
        barHeight={size ? size + 8 : 23}
        circleSize={size ? size + 10 : 23}
        switchLeftPx={3}
        switchRightPx={3}
        circleBorderActiveColor="#8AB2C9"
        backgroundActive={disable ? "#cecece" : "#8AB2C9"}
        backgroundInactive={disable ? "#cecece" : "#c1c0c0"}
        circleBorderInActiveColor="#8AB2C9"
        innerCircleStyle={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.5,
          shadowRadius: 9,
        }}
        renderInsideCircle={() => (
          <View
            style={{
              height: size || 15,
              transform: [{ rotate: "270deg" }],
            }}
          >
            <Ionicons
              name="menu"
              size={size || 15}
              color={iValue ? "#8AB2C9" : "#777"}
            />
          </View>
        )}
      />
    </View>
  );
};

export default Swatch;
