import React, { useContext, useEffect, useRef, useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Button } from "./accessories/CommomComponents";
import CustomText from "./accessories/CustomText";
import { context } from "./accessories/CommonFunctions";
import ArrowSpinner from "./accessories/ArrowSpinner";
const LockRate = (prop) => {
  const btnRefLock = useRef(null);
  const btnRefFloat = useRef(null);
  const { contextDetails, setContextDetails } = useContext(context); //Get value from context
  //console.log("Context from LockRate ==>", contextDetails);
  const { Open, handleLockRate, handleValidateAddress, handleTBD } = prop;
  let { obj, LockRate } = Open;
  const handleKeyDown = (event) => {
    if (event.keyCode === 32) {
      event.preventDefault(); // Prevent scrolling the page when space bar is pressed
      if (document.activeElement === btnRefFloat.current)
        btnRefFloat.current.click();
      else if (document.activeElement === btnRefLock.current) {
        btnRefLock.current.click();
      }
    }
  };
  return (
    <View style={styles.container}>
      <Modal transparent={true} visible={LockRate}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.header}>
              <CustomText
                bold={true}
                style={{ color: "#292b2c", fontSize: 16 }}
              >
                {contextDetails["LockingScenario"] || "Select Loan Program"}
              </CustomText>
            </View>

            <View style={styles.container}>
              {contextDetails["isPreQual"] != "-1" &&
                contextDetails["isPreQual"] != "-2" && (
                  <View style={[styles["Row"], { marginBottom: 10 }]}>
                    <CustomText style={[styles["Label"]]}>
                      {"Please confirm Your Information Below: "}
                    </CustomText>
                  </View>
                )}
              <View style={styles["Row"]}>
                <View>
                  <CustomText style={[styles["Label"]]}>
                    {"Loan Program: "}
                  </CustomText>
                </View>
                <CustomText>
                  {contextDetails["LockRateDetails"][obj]["Name"]}
                </CustomText>
              </View>

              <View style={styles["Row"]}>
                <View>
                  <CustomText style={[styles["Label"]]}>
                    {"Interest Rate: "}
                  </CustomText>
                </View>
                <CustomText>
                  {contextDetails["LockRateDetails"][obj]["IntRate"]}
                </CustomText>
              </View>

              <View style={styles["Row"]}>
                <CustomText style={[styles["Label"]]}>
                  {"Charge for rate chosen: "}
                </CustomText>
                <CustomText>
                  {contextDetails["LockRateDetails"][obj]["finalPoints"]} |{" "}
                  {contextDetails["LockRateDetails"][obj]["finalAmount"]}
                </CustomText>
              </View>
              <View style={styles["Row"]}>
                <CustomText style={[styles["Label"]]}>
                  {"Lock Expiration: "}
                </CustomText>
                <CustomText>
                  {contextDetails["LockRateDetails"][obj]["LockExpDate"]}
                </CustomText>
              </View>
              <View style={styles["Row"]}>
                <CustomText style={[styles["Label"]]}>
                  {"Lock Days: "}
                </CustomText>

                <CustomText>{`${contextDetails["LockRateDetails"][obj]["LockPeriods"]} Days`}</CustomText>
              </View>
              {contextDetails["ratesheetused"] && (
                <View style={[styles["Row"], { marginTop: 15 }]}>
                  <CustomText style={[styles["Label"]]}>
                    {"Rate Sheet Used: "}
                  </CustomText>

                  <CustomText>
                    {contextDetails["ratesheetused"] || ""}
                  </CustomText>
                </View>
              )}
              {/* {(contextDetails["isPreQual"] == "-1" ||
                contextDetails["isPreQual"] == "-2") && (
                <View style={{ gap: 5 }}>
                  <View style={[styles["Row"], { marginBottom: 5 }]}>
                    <CustomText style={[styles["Label"]]}>
                      {"Please confirm the borrowers name below: "}
                    </CustomText>
                  </View>
                  {contextDetails?.["BorrInfo"]?.map((e) => (
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <CustomText>{e["FirstName"]}</CustomText>
                      <CustomText>{e["LastName"]}</CustomText>
                    </View>
                  ))}
                </View>
              )} */}
            </View>
            <View onKeyDown={handleKeyDown} style={styles.footer}>
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
                  handleLockRate("", "Modal");
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
                {contextDetails["AllowLock"] ? (
                  <Button
                    title={
                      <CustomText
                        bold={false}
                        style={{ fontSize: 13, color: "#fff", fontWeight: 200 }}
                      >
                        {contextDetails["isPreQual"] != "-1" &&
                        contextDetails["isPreQual"] != "-2"
                          ? "Lock Rate"
                          : "Create Loan and Lock Rate"}
                      </CustomText>
                    }
                    style={[
                      styles["btn"],
                      { borderColor: "#428bca", borderWidth: 2 },
                    ]}
                    disabled={true}
                    onPress={() => {
                      let action =
                        contextDetails["isPreQual"] != "-1" &&
                        contextDetails["isPreQual"] != "-2"
                          ? "SelectAndLock"
                          : "CreateAndLock";
                      handleLockRate(obj, action, "Confirm", obj);
                    }}
                  />
                ) : (
                  <View
                    style={{
                      // width: "90%",
                      //  flexDirection: "row",
                      gap: 5,
                    }}
                  >
                    <CustomText
                      style={{ color: "red", fontSize: 11, width: 200 }}
                    >
                      {contextDetails["ErrorMsg"]}
                    </CustomText>
                    <View
                      style={{
                        // width: "90%",
                        flexDirection: "row",
                      }}
                    >
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
                            paddingVertical: 4,
                            alignSelf: "flex-end",
                            fontSize: 10,
                            // left: 30,
                            // bottom: 4,
                            backgroundColor:
                              contextDetails["TBD"] == 0
                                ? "#428bca"
                                : "#d9534f",
                          }}
                          onPress={() => {
                            let value = contextDetails["TBD"] == 1 ? "0" : "1";
                            handleTBD(value);
                          }}
                        />
                      )}
                      {contextDetails["PQLoanId"] != contextDetails["LoanId"] &&
                        contextDetails["AddressValid"] == 0 && (
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
                                {contextDetails["AddressValid"] == 0
                                  ? "Validate"
                                  : "Validated"}
                              </CustomText>
                            }
                            style={{
                              paddingHorizontal: 5,
                              paddingVertical: 4,
                              alignSelf: "flex-end",
                              fontSize: 10,
                              // left: 30,
                              // bottom: 4,
                              backgroundColor:
                                contextDetails["AddressValid"] == 0
                                  ? "#f0ad4e"
                                  : "#428bca",
                            }}
                            onPress={() => {
                              let value = contextDetails["AddressValid"];
                              handleValidateAddress(value);
                            }}
                          />
                        )}
                    </View>
                  </View>
                )}
                {contextDetails["showSelectOnlyButton"] &&
                  !contextDetails["ChangeRate"] && (
                    <Button
                      forwardedRef={btnRefFloat}
                      title={
                        <CustomText
                          bold={false}
                          style={{
                            fontSize: 13,
                            color: "#428bca",
                            fontWeight: 200,
                          }}
                        >
                          {contextDetails["isPreQual"] != "-1" &&
                          contextDetails["isPreQual"] != "-2"
                            ? `Float Rate`
                            : `Create Loan and Float Rate`}
                        </CustomText>
                      }
                      style={[
                        styles["btn"],
                        {
                          borderColor: "#428bca",
                          borderWidth: 2,
                          backgroundColor: "white",
                        },
                      ]}
                      disabled={true}
                      onPress={() => {
                        let action =
                          contextDetails["isPreQual"] != "-1" &&
                          contextDetails["isPreQual"] != "-2"
                            ? "Select"
                            : "CreateAndSelect";
                        handleLockRate(obj, action, "Confirm", obj);
                      }}
                    />
                  )}
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
});

export default LockRate;
