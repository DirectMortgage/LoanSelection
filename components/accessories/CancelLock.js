import React, { useContext, useRef} from "react";
import { View, Modal, StyleSheet } from "react-native";
import { Button, InputBox } from "./CommomComponents";
import CustomText from "./CustomText";
import { context } from "./CommonFunctions";
import ArrowSpinner from "./ArrowSpinner";
const CancelLock = ({
  prop,
  handleOnchangeDetails,
  LockDetails,
  handleCancelLock,
}) => {
  const btnRefCancelLock = useRef(null);
  const { contextDetails, setContextDetails } = useContext(context); //Get value from context
  const handleKeyDown = (event) => {
    if (event.keyCode === 32) {
      event.preventDefault(); // Prevent scrolling the page when space bar is pressed
      if (document.activeElement === btnRefCancelLock.current)
      btnRefCancelLock.current.click();
      }
    }
  
  return (
    <View style={styles.container} onKeyDown={handleKeyDown}>
      <Modal transparent={true} visible={LockDetails["cancelLockModal"]}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.header}>
              <CustomText
                bold={true}
                style={{ color: "#292b2c", fontSize: 16 }}
              >
                {`Cancel Lock - ${contextDetails["LoanId"]}`}
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
                  // height: 70,
                  backgroundColor: "#FFF",
                  borderColor: LockDetails["cancelLockReasonValidation"]
                    ? "red"
                    : "#c6c6c6",
                  borderWidth: 1,
                  padding: 10,
                }}
              >
                <InputBox
                  validate={false}
                  showBorder={false}
                  value={""}
                  onChangeText={(text) => {
                    handleOnchangeDetails(
                      "CancelLockReason",
                      text,
                      "CancelLock"
                    );
                  }}
                  style={[
                    {
                      textAlign: "start",
                      width: "100%",
                      height: 70,
                      fontWeight: 200,
                      fontSize: 11,
                      color: "#646464"
                    },
                  ]}
                  textAlignVertical="top"
                  multiline={true}
                />
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
                {LockDetails["cancellingLock"] && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <ArrowSpinner size={15} style={{ marginTop: 0 }} />
                    <CustomText style={{ fontSize: 10 }}>
                      Cancelling Lock...
                    </CustomText>
                  </View>
                )}
                <Button
                forwardedRef={btnRefCancelLock}
                  title={
                    <CustomText
                      bold={false}
                      style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                    >
                      {"Cancel Lock"}
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
                    handleCancelLock();
                  }}
                />
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
                      "cancelLockModal",
                      false,
                      "CancelLockModal"
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
    width: 300,
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
});

export default CancelLock;
