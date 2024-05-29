import React, { useContext, useEffect, useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
//import CustomText from "./accessories/CustomText";
import CustomText from "./CustomText";
import { context } from "./CommonFunctions";
import { Button } from "./CommomComponents";
const NotifyAlert = (prop) => {
  const { contextDetails, setContextDetails } = useContext(context); //Get value from context
  //console.log("Context from LockRate ==>", contextDetails);
  const { Msg, handleOpen, Component } = prop;
  const [open, setOpen] = useState(true);

  return (
    <View style={styles.container}>
      <Modal transparent={true} visible={open}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {Msg ? (
              <>
                <View style={styles["Row"]}>
                  <CustomText style={[styles["Label"]]}>{Msg}</CustomText>
                </View>
                <View style={{ paddingBottom: "5px" }}>
                  <Button
                    title={
                      <CustomText
                        bold={false}
                        style={{ fontSize: 13, color: "#fff" }}
                      >
                        {"Ok"}
                      </CustomText>
                    }
                    style={styles["btn"]}
                    disabled={true}
                    onPress={() => {
                      setOpen(!open);
                      handleOpen(false);
                    }}
                  />
                </View>
              </>
            ):<></>}
            <View>{Component}</View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 30,
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000087",
  },
  modalView: {
    backgroundColor: "white",
     maxWidth: 500,
    height: "auto",
    borderRadius: 5,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#e5e5e5",
    paddingVertical: 20,
    paddingHorizontal: 10,
    width: "100%",
  },

  footer: {
    borderTopWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#EFF3F8",
    flexDirection: "row",
    justifyContent: "end",
    padding: 20,
    width: "100%",
  },

  btn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignSelf: "flex-end",
    fontSize: 12,
    justifyContent: "center",
  },
  Row: {
    flexDirection: "row",
    marginBottom: 3,
    padding: "15px",
  },
  Label: {
    fontWeight: 650,
    fontSize: 13,
    textAlign: "center",
    color: "#5e5e5e",
  },
});

export default NotifyAlert;
