import { useState } from "react";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  Animated,
} from "react-native";
import CustomText from "./CustomText";
import CustomTextInput from "./CustomTextInput";
import { web, android, ios } from "./Platform";
import Entypo from "react-native-vector-icons/Entypo";
import { LinearGradient } from "expo-linear-gradient";

const Separator = () => <View style={styles.separator} />;
const AccordionItem = ({
  children,
  title,
  isExpand = false,
  isAccordion = true,
  style = {},
}) => {
  const [expanded, setExpanded] = useState(isExpand);
  function toggleItem() {
    setExpanded(!expanded);
  }
  return (
    <View style={[styles.accordContainer, style]}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.accordHeader}
        onPress={isAccordion ? toggleItem : () => {}}
      >
        <CustomText
          style={[
            styles.accordTitle,
            { alignItems: "center", display: "flex" },
          ]}
          bold={true}
        >
          {isAccordion && (
            <Entypo
              name={expanded ? "chevron-down" : "chevron-right"}
              size={25}
              style={{ marginRight: 10 }}
            />
          )}

          {title}
        </CustomText>
      </TouchableOpacity>
      {expanded && (
        // <Animated.View>
        <View style={styles.accordBody}>{children}</View>
        // </Animated.View>
      )}
      <Separator />
    </View>
  );
};

const AccordionCustom = ({
  children,
  title,
  isExpand = false,
  isAccordion = true,
  overrideBG = false,
  style = {},
  forwardedRef
}) => {
  const [expanded, setExpanded] = useState(isExpand);
  function toggleItem() {
    setExpanded(!expanded);
  }
  return (
    <LinearGradient
      colors={overrideBG ? ["#fff"] : ["#f6f6f6", "#e8e8e8", "#F6F6F6"]}
      style={{ padding: overrideBG ? 0 : 4 }}
    >
      {/* <View style={[styles.accordContainerCustom, style]}> */}
      <TouchableOpacity
        ref={forwardedRef}
        activeOpacity={1}
        style={styles.accordHeaderCustom}
        onPress={isAccordion ? toggleItem : () => {}}
      >
        <CustomText
          style={[
            [styles.accordTitleCustom],
            // { paddingVertical: expanded ? 0 : 10 },
          ]}
        >
          {isAccordion && (
            <Entypo
              name={expanded ? "chevron-down" : "chevron-right"}
              size={25}
              style={{ marginRight: 4 }}
            />
          )}

          {title}
        </CustomText>
      </TouchableOpacity>
      {expanded && <View style={styles.accordBodyCustom}>{children}</View>}
      {/* </View> */}
    </LinearGradient>
  );
};
//======================================================

//======================================================
const Button = ({
  onPress,
  bold = true,
  title,
  style = {},
  textStyle = {},
  isDisable = false,
  forwardedRef,testID=""
}) => (
  <TouchableOpacity
  testID={testID}
  ref={forwardedRef}
    activeOpacity={1}
    onPress={!isDisable ? onPress : ""}
    style={[
      styles.buttonContainer,
      {
        borderRadius: 5,
        paddingVertical: 6,
        marginLeft: 8,
        backgroundColor: isDisable ? "#c1c0c0" : "#428bca",
        cursor: isDisable ? "not-allowed" : "pointer",
        justifyContent: 'center',
      },
      style,
    ]}
  >
    <CustomText
      style={{ ...{ color: "#fff", textAlign: "center",justifyContent:'center',display:'flex' }, ...textStyle }}
      bold={bold}
    >
      {title}
    </CustomText>
  </TouchableOpacity>
);
const DMCImage = () => {
  return (
    <View style={{}}>
      <Image
        style={{
          height: 50,
          width: 50,
        }}
        resizeMode="contain"
        source={require("../../assets/DW_Fav.png")}
      />
    </View>
  );
};
//======================================================
const InputBox = (props) => {
  const {
    label,
    onChangeText,
    value,
    type = "default",
    placeholder,
    ref,
    secureTextEntry,
    validate = false,
    border,
    onKeyPress = () => {},
    disabled = false,
    overrideDisableColor=false,
    width = "100%",
    style = {},
    showBorder = false,
    isAdditionalValidation=false
  } = props;
  if (type.includes("Zip")) {
    type = "numeric";
  }
  return (
    <View
      pointerEvents={disabled ? "none" : "auto"}
      style={[
        styles.inputBoxContainer,
        style,
        {
          width,
        },
      ]}
    >
      <CustomTextInput
        onChangeText={(text) => onChangeText(text)}
        secureTextEntry={secureTextEntry || false}
        value={value || ""}
        placeholder={placeholder || ""}
        keyboardType={type || "default"}
        style={[
          styles.inputBox,
          {
            borderColor:
            isAdditionalValidation || validate && ["", 0, null, undefined, "0","$0"].includes(value)
                ? "red"
                : "silver",
            borderWidth:
            isAdditionalValidation ||  validate && ["", 0, null, undefined, "0","$0"].includes(value)
                ? 2
                : showBorder
                ? 1
                : 0,
            backgroundColor: disabled&!overrideDisableColor
              ? "#c1c0c0"
              : showBorder
              ? "#fff"
              : "inherit",
          },
        ]}
        autoCapitalize={"none"}
        ref={ref || null}
        {...props}
        onKeyPress={onKeyPress}
      />
    </View>
  );
};

const InputBoxOrdinary = (props) => {
  const {
    label,
    onChangeText,
    value,
    type = "default",
    placeholder,
    ref,
    secureTextEntry,
    validate = false,
    border,
    onKeyPress = () => {},
    disabled = false,
    width = "100%",
    style = {},
    isValid = false,
    isBold = false,
    Margin,
    name
  } = props;
  if (type.includes("Zip")) {
    type = "numeric";
  }
  return (
    <View
      pointerEvents={disabled ? "none" : "auto"}
      style={[
        styles.inputBoxContainerOrdinary,
        style,
        {
          width,
          backgroundColor: disabled ? "#eae6e691" : "inherit",
          marginBottom: Margin ? 0 : 15,
          borderColor:
         ( validate && ["", 0, null, undefined, "0"].includes(value))
            ? "red":name == 'SSN' && value.replaceAll("-", "").length != 9?'red'
            :'silver'
        },
      ]}
    >
      <CustomText bold={true} style={styles.inputBoxLabelOrdinary}>
        {label || ""}
      </CustomText>
      <CustomTextInput
        onChangeText={(text) => onChangeText(text)}
        secureTextEntry={secureTextEntry || false}
        value={value || ""}
        placeholder={placeholder || ""}
        keyboardType={type || "default"}
        style={[
          styles.inputBoxOrdinary,
          {
            // borderColor: "silver",
            // borderWidth:
            //   validate && ["", 0, null, undefined, "0"].includes(value) ? 2 : 0,
            fontWeight: isBold ? 800 : "inherit",
          },
        ]}
        autoCapitalize={"none"}
        ref={ref || null}
        {...props}
        onKeyPress={onKeyPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  separator: {
    marginVertical: 12,
  },
  accordContainer: {
    paddingBottom: 4,
    borderWidth: 0,
  },
  accordContainerCustom: {
    paddingBottom: 4,
    borderWidth: 0,
    // backgroundColor: "inherit",
    shadowColor: "black",
    shadowOffset: { width: 7, height: 7 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    // padding: 10,
    borderRadius: 6,
    backgroundColor:
      "linear-gradient(rgb(246, 246, 246) 10%, rgb(232, 232, 232) 100%)",
  },
  accordHeader: {
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 4,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  accordHeaderCustom: {
    //padding: 8,
    // backgroundColor: "#f5f5f5",
    borderColor: "#ddd",
    // borderWidth: 1,
    // borderRadius: 4,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  accordTitle: {
    fontSize: 16,
  },
  accordTitleCustom: {
    fontWeight: 800,
    fontSize: 18,
    // lineHeight: "1.5",
    color: "#666666",
    alignItems: "center",
    display: "flex",
  },
  accordBody: {
    padding: 15,
    //paddingBottom: 0,
    borderColor: "#ddd",
    borderWidth: 1,
    borderTopWidth: 0,
    marginTop: -2,
    backgroundColor: "#fff",
  },
  accordBodyCustom: {
    padding: 4,
    borderColor: "#ddd",
    //borderWidth: 1,
    borderTopWidth: 0,
    backgroundColor: "inherit",
  },
  buttonContainer: {
    backgroundColor: "#428bca",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  inputBox: {
    ...{
      borderWidth: 0,
      // outlineWidth: 0,
      // borderRadius: 5,
      fontSize: web ? 12 : 16,
      // backgroundColor: "rgba(0,0,0,.04)",
      color: "#51575d",
      width: "100%",
      //padding: 5,
      // height: 34,
    },
    // ...(web && {
    //   ":focus": { "outline-width": 0, borderWidth: 0 },
    //   ":focus-visible": { "outline-width": 0, borderWidth: 0 },
    // }),
  },
  inputBoxOrdinary: {
    ...{
      borderWidth: 0,
      outlineWidth: 0,
      borderRadius: 5,
      fontSize: web ? 12 : 16,
      backgroundColor: "rgba(0,0,0,.04)",
      color: "#51575d",
      width: "100%",
      padding: 3,
      height: 31,
    },
    ...(web && {
      ":focus": { "outline-width": 0, borderWidth: 0 },
      ":focus-visible": { "outline-width": 0, borderWidth: 0 },
    }),
  },
  inputBoxLabel: {
    // display: "inline",
    position: "absolute",
    // backgroundColor: "#fff",
    top: -12,
    left: 3,
    fontSize: 14,
    // color: "gray",
    // paddingHorizontal: 3,
    flex: 1,
  },
  inputBoxLabelOrdinary: {
    display: "inline",
    position: "absolute",
    backgroundColor: "#fff",
    top: -12,
    left: 3,
    fontSize: 12,
    color: "gray",
    paddingHorizontal: 3,
    flex: 1,
  },
  inputBoxContainer: {
    flexDirection: "row",
    // borderColor: "silver",
    // borderWidth: 1,
    // borderRadius: 8,
    // padding: 8,
    height: 27,

    // marginBottom: 20,
    //minHeight: 50,
  },
  inputBoxContainerOrdinary: {
    flexDirection: "row",
    borderColor: "silver",
    borderWidth: 1,
    borderRadius: 8,
    padding: 6,
    height: 27,

    marginBottom: 15,
    minHeight: 43,
  },
});

export {
  AccordionItem,
  Separator,
  DMCImage,
  Button,
  InputBox,
  InputBoxOrdinary,
  AccordionCustom,
};
