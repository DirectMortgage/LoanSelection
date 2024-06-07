import { useContext, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import CustomText from "./CustomText";
import MaterialCommunity from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Image } from "react-native-web";
import { Button } from "./CommomComponents";
import { Fragment } from "react";
import { fnOpenEditRightsPage,context } from "./CommonFunctions";

const DropDownButton = (props) => {
const { contextDetails, setContextDetails } = useContext(context); //Get value from context
  const { listOption, MenuPosition, children, Open, handleOpen } = props;

  return (
    <>
      <Modal visible={Open} transparent animationType="none">
        <TouchableOpacity
          activeOpacity={1}
          style={{ width: "100%", height: "100%" }}
          onPress={(event) => {
            if (event.target.tagName !== "INPUT") handleOpen();
          }}
        >
          <View
            style={[
              {
                backgroundColor: "#fff",
                position: "absolute",
                width: "auto",
                borderColor: "#d3dadf",
                borderWidth: 1,
                borderRadius: 2,
                boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
              },
              MenuPosition,
            ]}
          >
            {listOption.map((item, index) => (
              <Fragment key={index}>
                <View  style={[styles.menuOption]}>
                  {!item["SearchField"] && (
                    <View
                      style={{
                        paddingVertical: 10,
                        gap: 15,
                        paddingHorizontal: 20,
                        flexDirection: "row",
                        alignItems: "center",
                        display:item['visible']?'flex':'none'
                      }}
                    >
                      {/* {item["icon"] ? (
                        <Image
                          style={{
                            height: 18,
                            width: 18,
                          }}
                          resizeMode="contain"
                          source={require(`../../assets/${item["icon"]}.svg`)}
                        />
                      ) : (
                        <View
                          style={{
                            height: 18,
                            width: 18,
                          }}
                        ></View>
                      )} */}
                      <CustomText
                        key={index}
                        onPress={item["onPress"]}
                        style={{ fontSize: 12 }}
                      >
                        {item["Name"]}
                      </CustomText>
                    </View>
                  )}
                  {item["SearchField"] && (
                    <View
                      style={{
                        paddingVertical: 8,
                        gap: 15,
                        paddingHorizontal: 20,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      {/* <View
                        style={{
                          height: 18,
                          width: 18,
                        }}
                      ></View> */}
                      <CustomText>{item["Name"]}</CustomText>
                    </View>
                  )}
                  {item["isLast"] == true && (
                    <View
                      style={{
                        borderColor: "#c6c6c6",
                        marginHorizontal: 15,
                        marginVertical: 15,
                        marginBottom: 0,
                        borderBottomWidth: 1,
                      }}
                    ></View>
                  )}
                </View>
              </Fragment>
            ))}
            <View style={{ marginVertical: 18, alignSelf: "center" }}>
              <Button
                title={
                  <CustomText
                    style={{ color: "#FFFFF", fontSize: 11, fontWeight: 200 }}
                  >
                    Edit Rights: Allowed
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  styles["cardShadow"],
                  {
                    borderRadius: 3,
                    paddingVertical: 8,
                    paddingHorizontal: 15,
                    backgroundColor: "#88AB35",
                  },
                ]}
                onPress={() => {
                  fnOpenEditRightsPage(contextDetails['queryString']['SessionId'],contextDetails['LoanId'],contextDetails['OnloadProcess'] =='PQ'?'32':'18,12')
                }}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};
const styles = StyleSheet.create({
  menuOption: {
    fontSize: 11,
    borderBottomWidth: 0,
    borderColor: "#cccccc",
    color: "#333333",
  },
  cardShadow: {
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  btn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignSelf: "flex-end",
    fontSize: 12,
    justifyContent: "center",
  },
});

export default DropDownButton;
