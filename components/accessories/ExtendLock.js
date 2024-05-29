import React, { Fragment, useContext, useState } from "react";
import { View, Modal, StyleSheet, RootTagContext } from "react-native";
import { Button, InputBox, InputBoxOrdinary } from "./CommomComponents";
import CustomText from "./CustomText";
import { context } from "./CommonFunctions";
import ArrowSpinner from "./ArrowSpinner";
import RadioButtonGroup, { RadioButtonItem } from "expo-radio-button";
import { web } from "./Platform";
const ExtendLock = ({
  handleOnchangeDetails,
  LockDetails,
  options,
  handleExtendLock,
}) => {
  const { contextDetails, setContextDetails } = useContext(context); //Get value from context
  const [ExtendOptions, setExtendOptions] = useState(options || []);
  const headers = ["Select", "Extension Days", "Price", "Expiration Date"];

  return (
    <View style={styles.container}>
      <Modal transparent={true} visible={LockDetails["transferLockModal"]}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.header}>
              <CustomText
                bold={true}
                style={{ color: "#292b2c", fontSize: 16 }}
              >
                {`Extend Lock Rate for Loan # ${contextDetails["LoanId"]}`}
              </CustomText>
            </View>
            <View
              style={{
                width: "100%",
                paddingHorizontal: 10,
                paddingVertical: 10,
              }}
            >
              <View
                style={[
                  styles.tableRow,
                  {
                    backgroundColor: "#307ecc",
                    paddingVertical: 10,
                    borderBottomWidth: 0,
                  },
                ]}
              >
                {headers.map((header, index) => {
                  return (
                    <Fragment key={index}>
                      <CustomText
                        bold={false}
                        style={[
                          styles.cellOne,
                          styles.MidText,
                          {
                            fontSize: web ? 12 : 12,
                            textAlign: "center",
                            color: "#fff",
                          },
                          index == 0 && {
                            width: 50,
                          },
                        ]}
                      >
                        {header}
                      </CustomText>
                    </Fragment>
                  );
                })}
              </View>
              <View>
                {ExtendOptions?.map((rowDetails, index) => {
                  return (
                    <View
                      key={index}
                      style={[
                        styles.tableRow,
                        index % 2 == 0 && { backgroundColor: "#f3f3f3" },
                      ]}
                    >
                      <CustomText
                        bold={true}
                        style={[
                          styles.cellOne,
                          {
                            fontSize: web ? 12 : 12,
                            textAlign: "center",
                            width: 50,
                            opacity:
                              contextDetails["extensionUsed"] == 1 &&
                              rowDetails["TypeOption"] == 1
                                ? 0.3
                                : 1,
                          },
                        ]}
                      >
                        <RadioButtonGroup
                          selected={ExtendOptions[index]["isSelected"] || null}
                          onSelected={(value) => {
                            if (
                              (
                                contextDetails["ExtensionUsed"] == 1 &&
                                  rowDetails["TypeOption"] == 1 &&
                                LockDetails?.viewwholesaleintrate != 1
                              )
                            ) {
                              return
                            }
                              setExtendOptions((prevExtendDetails) => {
                                prevExtendDetails.forEach(
                                  (item) => (item["isSelected"] = false)
                                );
                                prevExtendDetails[index]["isSelected"] = true;
                                return [...prevExtendDetails];
                              });
                          }}
                          radioBackground="#2860b7"
                          size={18}
                        >
                          <RadioButtonItem
                            value={ExtendOptions[index]["isSelected"] || true}
                            label=""
                          />
                        </RadioButtonGroup>
                      </CustomText>
                      <CustomText
                        bold={true}
                        style={[
                          styles.cellOne,
                          {
                            fontSize: web ? 12 : 12,
                            textAlign: "center",
                          },
                        ]}
                      >
                        {rowDetails["TypeDesc"]}
                      </CustomText>
                      <CustomText
                        bold={true}
                        style={[
                          styles.cellOne,
                          {
                            fontSize: web ? 12 : 12,
                            textAlign: "center",
                          },
                        ]}
                      >
                        {parseFloat(rowDetails["OtherLookUp"] || 0.0).toFixed(
                          4
                        )}
                      </CustomText>
                      <CustomText
                        bold={true}
                        style={[
                          styles.cellOne,
                          {
                            fontSize: web ? 12 : 12,
                            textAlign: "center",
                          },
                        ]}
                      >
                        {rowDetails["Expiration"]}
                      </CustomText>
                    </View>
                  );
                })}
              </View>
            </View>
            <View
              style={{
                width: "100%",
                paddingHorizontal: 10,
                paddingVertical: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
              >
                {/* {LockDetails["transferringLock"] && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <ArrowSpinner size={15} style={{ marginTop: 0 }} />
                    <CustomText style={{ fontSize: 10 }}>
                      Transferring Lock...
                    </CustomText>
                  </View>
                )} */}
                {/* {LockDetails["TLConfirmation"] && ( */}
                <Button
                  title={
                    <CustomText
                      bold={false}
                      style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                    >
                      {"Save"}
                    </CustomText>
                  }
                  style={[
                    styles["btn"],
                    {
                      borderColor: "#0d6ac5",
                      borderWidth: 2,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                    },
                  ]}
                  disabled={true}
                  onPress={() => {
                    let value = ExtendOptions.filter(
                      (e) => e.isSelected == true
                    );
                    handleExtendLock(value);
                  }}
                />
                {/* )} */}
                <Button
                  isDisabled={true}
                  title={
                    <CustomText
                      bold={false}
                      style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                    >
                      Close
                    </CustomText>
                  }
                  style={[
                    styles["btn"],
                    {
                      borderColor: "#262626",
                      borderWidth: 2,
                      backgroundColor: "#595959",
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                    },
                  ]}
                  onPress={() => {
                    // setModalComponent({ ...modalComponent, visible: false });
                    // setLockDetails({ ...LockDetails, CancelLockReason: "" });
                    handleOnchangeDetails(
                      "extendLockModal",
                      false,
                      "extendLockModal"
                    );
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
    paddingVertical: 15,
    paddingHorizontal: 10,
    width: "100%",
  },
  btn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignSelf: "flex-end",
    fontSize: 12,
    justifyContent: "center",
  },
  cardShadow: {
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  MidText: {
    fontSize: 13,
    textAlign: "start",
    lineHeight: "1.15rem",
    color: "#646464",
    fontWeight: 400,
  },
  oddBG: {
    flexDirection: "row",
    backgroundColor: "#f4f4f4",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomColor: "#c6c6c6",
    borderBottomWidth: 1,
  },
  cellOne: {
    fontSize: web ? 11 : 10,
    width: web ? 150 : 80,
    color: "#646464",
    lineHeight: 15,
    marginRight: 15,
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
});

export default ExtendLock;
