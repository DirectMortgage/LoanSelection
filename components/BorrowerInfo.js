import React, { useContext, useEffect, useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Button, InputBoxOrdinary } from "./accessories/CommomComponents";
import CustomText from "./accessories/CustomText";
import { context } from "./accessories/CommonFunctions";
import Dropdown from "./accessories/DropDown";
import ArrowSpinner from "./accessories/ArrowSpinner";
const BorrowerInfo = (prop) => {
  const { contextDetails, setContextDetails } = useContext(context); //Get value from context
   console.log("Context from LockRate ==>", contextDetails);
  const { Open, handleLockConfirm, handleChange, handleTBD } = prop;
  let { action, BorInfo, LineId, modalFor } = Open;
  let { FirstName, LastName, SSN } =
    contextDetails["InputData"]["DataIn"][1]["BorrInfo"][0];
  let { SubjectAddress, SubjectCity, SubjectState, SubjectZip } =
    contextDetails["InputData"]["DataIn"][2]["PropertyInfo"][0];
  return (
    <View style={styles.container}>
      <Modal transparent={true} visible={BorInfo}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.header}>
              <CustomText
                bold={true}
                style={{ color: "#292b2c", fontSize: 16 }}
              >
                Please Confirm Borrower Information
              </CustomText>
            </View>
            <View style={styles.container}>
              {modalFor == "SSN" ? (
                <>
            <View style={{ marginBottom: 20 }}>
              <CustomText>
                {`Great, let's Lock your Rate. Before proceeding, please enter the Social Security Number. `}
              </CustomText>
            </View>
            {contextDetails['InputData']['DataIn'][1]['BorrInfo'].map((e,index)=>(

                <View style={{ gap: 20,marginBottom:10 }}>
                  <View>
                    <CustomText>{`Name: ${e['FirstName']} ${e['LastName']}`}</CustomText>
                  </View>
                  <View style={styles["InputWidth"]}>
                    <InputBoxOrdinary
                      label={"Social Security Number"}
                      name={"SSN"}
                      validate={(e['SSN'] || "")?.replaceAll("-", "").length != 9}
                      value={e['SSN'] || ""}
                      onChangeText={(text) => {
                        let obj = {
                          name: "SSN",
                          value: text,
                          index
                        };
                        handleChange("OnChange", 0, "OnChange", obj);
                      }}
                    ></InputBoxOrdinary>
                  </View>
                </View>
            ))}
                </>
              ) : (
                <View >
                  <View style={{ marginBottom: 20 }}>
                    <CustomText>
                      {`Great, let's ${
                        ["CreateAndLock"].includes(action) ? "Lock" : "Float"
                      } your Rate. Before proceeding, please enter the borrower's First and Last name. `}
                    </CustomText>
                  </View>
                  <View style={[styles["Row"], { gap: 10 }]}>
                    <View style={styles["InputWidth"]}>
                      <InputBoxOrdinary
                        label={"First Name"}
                        name={"FN"}
                        validate={FirstName == ""}
                        value={FirstName}
                        onChangeText={(text) => {
                          let obj = { name: "FirstName", value: text };
                          handleChange("OnChange", 0, "OnChange", obj);
                        }}
                      ></InputBoxOrdinary>
                    </View>
                    <View style={styles["InputWidth"]}>
                      <InputBoxOrdinary
                        label={"Last Name"}
                        name={"LN"}
                        validate={LastName == ""}
                        value={LastName}
                        onChangeText={(text) => {
                          let obj = { name: "LastName", value: text };
                          handleChange("OnChange", 0, "OnChange", obj);
                        }}
                      ></InputBoxOrdinary>
                    </View>
                  </View>
                  {["CreateAndLock"].includes(action) && (
                    <View>
                      <View style={{ marginBottom: 15, gap: 10 }}>
                        <CustomText>
                          We also need the Property address and Social Security
                          Number.
                        </CustomText>
                        <View style={{ flexDirection: "row" }}>
                          <CustomText>
                            This property address is To Be Determined
                          </CustomText>
                          {contextDetails["AddressValid"] == 0 && (
                            <Button
                              title={
                                <CustomText
                                  bold={false}
                                  style={{
                                    fontSize: 10,
                                    color: "#fff",
                                    fontWeight: 200,
                                  }}
                                >
                                  {contextDetails?.["TBD"] == 0
                                    ? "TBD = No"
                                    : "TBD = Yes"}
                                </CustomText>
                              }
                              style={{
                                paddingHorizontal: 5,
                                paddingVertical: 2,
                                alignSelf: "flex-end",
                                fontSize: 10,
                                // left: 30,
                                //bottom: 4,
                                backgroundColor:
                                  contextDetails["TBD"] == 0
                                    ? "#428bca"
                                    : "#d9534f",
                              }}
                              onPress={() => {
                                let value =
                                  contextDetails["TBD"] == 1 ? "0" : "1";
                                let obj = { name: "TBD", value: value };
                                handleTBD(value);
                                handleChange("OnChange", 0, "OnChange", obj);
                              }}
                            />
                          )}
                        </View>
                      </View>
                      <View style={[styles["Row"], { gap: 10 }]}>
                        <View style={styles["InputWidth"]}>
                          <InputBoxOrdinary
                            label={"Property Street Address"}
                            validate={
                              SubjectAddress == "" && contextDetails["TBD"] == 0
                            }
                            disabled={contextDetails["TBD"] == 1}
                            name={"PA"}
                            value={SubjectAddress == "0" ? "" : SubjectAddress}
                            onChangeText={(text) => {
                              let obj = {
                                name: "SubjectAddress",
                                value: text,
                              };
                              handleChange("OnChange", 0, "OnChange", obj);
                            }}
                          ></InputBoxOrdinary>
                        </View>
                        <View style={styles["InputWidth"]}>
                          <InputBoxOrdinary
                            label={"Zip"}
                            validate={
                              SubjectZip == "" || SubjectZip.length != 5
                            }
                            name={"Zip"}
                            value={SubjectZip}
                            onChangeText={(text) => {
                              let obj = {
                                name: "SubjectZip",
                                value: text,
                              };
                              handleChange("OnChange", 0, "OnChange", obj);
                            }}
                          ></InputBoxOrdinary>
                        </View>
                      </View>
                      <View style={[styles["Row"], { gap: 10 }]}>
                        <View style={styles["InputWidth"]}>
                          <InputBoxOrdinary
                            label={"City"}
                            name={"CT"}
                            validate={SubjectCity == ""}
                            value={SubjectCity}
                            onChangeText={(text) => {
                              let obj = {
                                name: "SubjectCity",
                                value: text,
                              };
                              handleChange("OnChange", 0, "OnChange", obj);
                            }}
                          ></InputBoxOrdinary>
                        </View>
                        <View style={styles["InputWidth"]}>
                          <Dropdown
                            KeyName={"TypeDesc"}
                            label={"State"}
                            validate={SubjectState == "0"}
                            options={contextDetails["StateOpt"] || []}
                            value={SubjectState}
                            onSelect={(text) => {
                              let obj = {
                                name: "SubjectState",
                                value: text["value"],
                              };
                              handleChange("OnChange", 0, "OnChange", obj);
                            }}
                          />
                        </View>
                      </View>
                      <View style={[styles["Row"], { gap: 10 }]}>
                        <View style={styles["InputWidth"]}>
                          <InputBoxOrdinary
                            label={"Social Security Number"}
                            name={"SSN"}
                            validate={(SSN || "")?.replace("-", "").length != 9}
                            value={SSN || ""}
                            onChangeText={(text) => {
                              let obj = {
                                name: "SSN",
                                value: text,
                              };
                              handleChange("OnChange", 0, "OnChange", obj);
                            }}
                          ></InputBoxOrdinary>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
            <View style={styles.footer}>
              <Button
                isDisabled={true}
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                  >
                    Cancel
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  {
                    borderColor: "#262626",
                    borderWidth: 2,
                    backgroundColor: "#595959",
                  },
                ]}
                onPress={() => {
                  handleChange("Close", 0, "Modal");
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {contextDetails["showSpinner"] && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <ArrowSpinner size={15} style={{ marginTop: 0 }} />
                    <CustomText style={{ fontSize: 10 }}>
                      {contextDetails["lockingProgress"]}
                    </CustomText>
                  </View>
                )}
                {contextDetails["stopSSNSave"] && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                    }}
                  ><CustomText style={{color:'red',fontSize:12}}>Please enter a Social Security Number...</CustomText></View>)}
                <Button
                  title={
                    <CustomText
                      bold={false}
                      style={{
                        fontSize: 13,
                        color: "white",
                        fontWeight: 200,
                      }}
                    >
                      Submit
                    </CustomText>
                  }
                  style={[
                    styles["btn"],
                    {
                      borderColor: "#428bca",
                      borderWidth: 2,
                      backgroundColor: "#428bca",
                    },
                  ]}
                  disabled={true}
                  onPress={() => {
                    handleLockConfirm(action, LineId);
                  }}
                />
              </View>
            </View>
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
    paddingBottom: 20,
    marginTop: 11,
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000087",
  },
  modalView: {
    backgroundColor: "white",
    width: 500,
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
    paddingHorizontal: 18,
    width: "100%",
  },

  footer: {
    borderTopWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#EFF3F8",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingLeft: 10,
    width: "100%",
  },

  btn: {
    paddingHorizontal: 10, //15,
    paddingVertical: 10,
    alignSelf: "flex-end",
    fontSize: 12,
    justifyContent: "center",
  },
  Row: {
    flexDirection: "row",
    marginBottom: 3,
  },
  Label: {
    fontWeight: 650,
    fontSize: 13,
  },
  InputWidth: {
    width: "49%",
  },
});

export default BorrowerInfo;
