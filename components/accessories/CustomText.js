import { Text } from "react-native";

import { web } from "./Platform";

export default function CustomText(props) {
  let {
    children,
    style = {},
    bold=false,
    onPress,
    italic,
    PlayFair,
    rockWell,
    fontName = "",
  } = props;
  // try {
  //   if (!style["color"]) style["color"] = "#3b3c41";
  // } catch (error) {
  //   style = (style || []).reduce((result, obj) => {
  //     return { ...result, ...obj };
  //   }, {});
  //   if (!style["color"]) style["color"] = "#3b3c41";
  // }
  let fontFamily = "OpenSansRegular",
    webStyle = {};
  if (bold) fontFamily = "OpenSansBold";
  if (italic) fontFamily = "OpenSansItalic";
  if (bold && italic) fontFamily = "OpenBoldItalic";
  if (PlayFair) fontFamily = "PlayFair";
  if (rockWell) fontFamily = "Rockwell-Bold";
  if (fontName) fontFamily = fontName;

  if (web) {
    fontFamily = `"Helvetica Neue",Inter,Helvetica,Arial,sans-serif`; 
   // fontFamily =`"segoe ui", Inter, Tahoma, Geneva, Verdana, sans-serif`
    fontFamily.replace("Inter", fontFamily);
    if (bold) webStyle["fontWeight"] = "bold";
    if (italic) webStyle["fontStyle"] = "italic";
    if (PlayFair) {
      fontFamily = "'Open Sans'";
      webStyle["fontSize"] = style["fontSize"] || "14px";
    }
    if (rockWell) fontFamily = "'Rockwell'";
    if (fontName.toLowerCase().includes("roboto")) fontFamily = "'Roboto'";
  }

  bold = bold ? bold : false;

  return (
    <Text
      {...props}
      style={[style, webStyle, { fontFamily: fontFamily }]}
      onPress={onPress || null}
    >
      {children}
    </Text>
  );
}
