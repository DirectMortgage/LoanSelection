import React, { useContext } from "react";
import { View, Modal, StyleSheet } from "react-native";
import { Button, InputBox, InputBoxOrdinary } from "./CommomComponents";
import CustomText from "./CustomText";
import { context } from "./CommonFunctions";
import ArrowSpinner from "./ArrowSpinner";
const TransferLock = ({
  handleOnchangeDetails,
  LockDetails,
  handleGetTransferInfo,
  handleTransferLock,
}) => {
  const { contextDetails, setContextDetails } = useContext(context); //Get value from context

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
                {`Transfer Lock `}
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
                style={{
                  flexDirection: "row",
                  alignItems: "baseline",
                  marginVertical: 10,
                }}
              >
                <View style={{ width: 300 }}>
                  <InputBoxOrdinary
                    label={"Source Loan/Lock to Transfer From"}
                    name={"TransferLock"}
                    disabled={false}
                    onChangeText={(text) => {
                      handleOnchangeDetails(
                        "transferLoanId",
                        text,
                        "TransferLock"
                      );
                    }}
                  ></InputBoxOrdinary>
                </View>
                <View>
                  <Button
                    title={
                      <CustomText
                        bold={false}
                        style={{
                          color: "#FFFFF",
                          fontSize: 11,
                          fontWeight: 200,
                        }}
                      >
                        Go
                      </CustomText>
                    }
                    style={[
                      styles["btn"],
                      styles["cardShadow"],
                      {
                        borderRadius: 3,
                        paddingVertical: 6,
                        paddingHorizontal: 8,
                        borderWidth: 2,
                        borderColor: "#0d6ac5",
                      },
                    ]}
                    onPress={() => {
                      handleGetTransferInfo();
                    }}
                  />
                </View>
              </View>
              {LockDetails["TLError"] && (
                <View>
                  <CustomText bold={true} style={{ marginBottom: 15 }}>
                    Transfer Lock validation failed due to following reason(s):
                  </CustomText>
                  <View
                    style={{
                      padding: 10,
                      gap: 5,
                      backgroundColor: "#f2dede",
                      alignItems: "flex-start",
                    }}
                  >
                    {LockDetails["TLErrorReason"]}
                  </View>
                </View>
              )}
              {LockDetails["TLConfirmation"] && <>{LockDetails["TLDetails"]}</>}

              {LockDetails["ErrorAfterTL"] && (
                <View
                  style={{
                    padding: 10,
                    gap: 5,
                    backgroundColor: "#f2dede",
                    alignItems: "flex-start",
                  }}
                >
                  {LockDetails["TLErrorReasonAfterTL"]}
                </View>
              )}
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
                {LockDetails["transferringLock"] && (
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
                )}
                {LockDetails["TLConfirmation"] && (
                  <Button
                    title={
                      <CustomText
                        bold={false}
                        style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                      >
                        {"Transfer Lock"}
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
                      handleTransferLock();
                    }}
                  />
                )}
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
                      "transferLockModal",
                      false,
                      "TransferLock"
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
});

export default TransferLock;
