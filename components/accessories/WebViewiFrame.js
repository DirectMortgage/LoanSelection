import React from "react";
import { WebView } from "react-native-webview";
import { web, android, ios } from "./Platform";

const iFrame = (prop) => {
  let { url } = prop;

  if (web) {
    // url = url
    //   .replace("https://www.directcorp.com/", "../../../")
    //   .replace("https://www.solutioncenter.biz/", "../../../")
    //   .replace("http://www.solutioncenter.biz/", "../../../");
  } else {
    url = url.replace("../../../", REDIRECT_URL);
  }

  if (web) {
    return (
      <iframe
      javaScriptEnabled={true}
        src={url}
        style={{ width: '100%',height:470, border: "none" }}
      />
    );
  }
  return (
    <>
      <WebView
        javaScriptEnabled={true}
        source={{ uri: url }}
        style={{
          flex: 1,
        }}
      />
    </>
  );
};

export default iFrame;
