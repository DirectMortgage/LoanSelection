import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Switch } from "react-native-switch";
import Ionicons from "react-native-vector-icons/Ionicons";
import { android, web } from "./Platform";

const SwatchOutlined = ({
  size = 15,
  value = true,
  disable = false,
  onChange = () => {},
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
      ]}
    >
      <View
        style={{
          borderWidth: 2,
          borderColor: "#fff",
          borderRadius: 15,
          padding: 2,
        }}
      >
        <Switch
          value={value}
          disabled={disable}
          onValueChange={() => {
            setIValue(!value);
            onChange(!value);
          }}
          activeText=""
          inActiveText=""
          
          barHeight={13}
          circleSize={13}
          switchLeftPx={5}
          switchRightPx={5}
          circleBorderActiveColor="#fff"
          backgroundActive={disable ? "#cecece" : "#508BC9"}
          backgroundInactive={disable ? "#cecece" : "#508BC9"}
          circleBorderInActiveColor="#fff"
        //   innerCircleStyle={{
        //     shadowColor: "#000",
        //     shadowOffset: { width: 0, height: 5 },
        //     shadowOpacity: 0.5,
        //     shadowRadius: 9,
        //   }}
          renderInsideCircle={() => (
            <View
              style={{
                height: 15,
                transform: [{ rotate: "270deg" }],
              }}
            ></View>
          )}
        />
      </View>
    </View>
  );
};

export default SwatchOutlined;
