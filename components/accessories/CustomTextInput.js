import { useEffect, useRef, useState } from "react";
import { Platform, TextInput } from "react-native";
import { ios, web } from "./Platform";

export default function CustomTextInput(props) {
  const {
    style,
    onChangeText,
    value,
    placeholder,
    keyboardType,
    autoCapitalize,
    secureTextEntry,
    border,
    onBlur = () => {},
    onKeyPress = () => {},
    onFocus = () => {},
    ref,
  } = props;

  const [InputStyle, setInputStyle] = useState(false);
  const [hoverStyle] = useState(
    Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.4)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    })
  );

  const [iValue, setIValue] = useState(value || "");

  useEffect(() => {
    setIValue(value);
  }, [value]);
  const textInputRef = useRef(null);

  return (
    <TextInput
    
      ref={textInputRef}
      {...props}
      style={[
        style,
        InputStyle && web && hoverStyle,
        {
          fontFamily: web
            ? `"Helvetica Neue",Helvetica,Arial,sans-serif`
            : "Regular",
        },
   
        web && {
          paddingLeft: 5,
          outline: "none",
        },
        props["multiline"] && { height: 70 },
      ]}
      onChangeText={(text) => {
        if (keyboardType == "numeric") {
          text = text.replace(/\D/g, "");
        }
        setIValue(text);
        onChangeText(text);
      }}
      value={iValue || ""}
      placeholder={placeholder || ""}
      keyboardType={keyboardType || "default"}
      autoCapitalize={autoCapitalize}
      secureTextEntry={secureTextEntry}
      placeholderTextColor="#999"
      onBlur={(e) => {
        // Keyboard.dismiss();
        onBlur(e);
        setInputStyle(false);
      }}
      // selection={{ start: 0, end: value?.length }}
      onFocus={(e) => {
        if (web) {
          // setTimeout(() => {
          //   e.target.select();
          //   try {
          //     if (e.target.value == "0.00" || e.target.value == "$0.00")
          //       e.target.value = "";
          //   } catch (e) {}
          // }, 100);
          setInputStyle(true);
        } else if (ios) {
          setTimeout(() => {
            textInputRef?.current?.setNativeProps({
              selection: {
                start: 0,
                end: value?.toString().replaceAll("$", "")?.length,
              },
            });
          }, 200);
        }

        onFocus(e);
      }}
      onKeyPress={onKeyPress}
    />
  );
}
