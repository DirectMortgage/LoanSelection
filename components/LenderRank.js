import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import CustomText from "./accessories/CustomText";
import { CheckBox } from "react-native-web";
const LenderRank = ({ Open, handleLenderRank }) => {
  const [DisplayLender, setDisplayLender] = useState({});
  const translateY = useSharedValue(-300);

  const openModal = () => {
    setModalVisible(true);
    translateY.value = withTiming(0, { duration: 300, easing: Easing.linear });
  };

  const closeModal = () => {
    translateY.value = withTiming(-300, {
      duration: 300,
      easing: Easing.linear,
    });
    runOnJS(setModalVisible)(false);
  };
  const renderTableHeader = () => {
    return (
      <View style={styles.row}>
        <CustomText style={[styles.cell, styles.headerCell1]}>
          Lenders
        </CustomText>
        <CustomText style={[styles.cell, styles.headerCell2]}>Rank</CustomText>
        <CustomText style={[styles.cell, styles.headerCell3]}>
          Difference
        </CustomText>
        <CustomText style={[styles.cell, styles.headerCell4]}>
          Display
        </CustomText>
      </View>
    );
  };
  const renderTableRow = (item) => {
    return (
      <View style={styles.row} key={item.id}>
        <CustomText style={styles.cell_1}>{item.LenderName}</CustomText>
        <CustomText style={styles.cell_2}>{item.Rank}</CustomText>
        <CustomText style={styles.cell_3}>{item.Difference}</CustomText>
        <View style={styles.cell_4}>
          <CheckBox
            value={Open[item.LineId] != true}
            onValueChange={() => handleLenderRank(true, item, "CheckBox")}
            onCheckColor={"blue"}
            color={Open[item.LineId] != true ? '#0075ff' : undefined}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={openModal}>
        <CustomText style={styles.openButton}>
          Lender Rank - Price and Fees
        </CustomText>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={true}
        //    onRequestClose={closeModal}
      >
        <Animated.View
          style={[
            styles.centeredView,
            //{ transform: [{ translateY: translateY }] },
          ]}
        >
          <View style={styles.modalView}>
            <View style={[styles.modal_header]}>
              <CustomText style={styles.modalText}>Lender Rank - Price and Fees</CustomText>
              <TouchableOpacity onPress={closeModal}>
                <FontAwesome
                  name="close"
                  size={22}
                  color="#2665A3"
                  style={{ marginTop: 2 }}
                  onPress={() => {
                    handleLenderRank(false, "", "CheckBox");
                  }}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.tableContainer}>
              {renderTableHeader()}
              {Open["Result"]?.map((item) => renderTableRow(item))}
            </View>
            <View
              style={{
                backgroundColor: "#EFF3F8",
                height: "auto",
                borderTopWidth: 1,
                alignContent: "center",
                alignItems: "flex-end",
                borderColor: "#DDDDDD",
              }}
            >
              <TouchableOpacity
                style={{
                  width: 60,
                  borderRadius: 5,
                  paddingVertical: 8,
                  paddingHorizontal: 30,
                  backgroundColor: "#428BCA",
                  justifyContent: "flex-end",
                  alignContent: "flex-end",
                  alignItems: "center",
                  marginVertical: 5,
                  marginRight: 5,
                }}
              >
                <Text
                  style={{ color: "white", fontWeight: "400" }}
                  onPress={() => {
                    handleLenderRank(false, "", "CheckBox");
                  }}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  openButton: {
    backgroundColor: "abbac3",
    width: 57,
    height: 18,
    color: "#428bca",
    fontSize: 12,
    fontWeight: 400,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "white",

    width: 450,
    height: "auto",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 9,
  },
  modal_header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 9,
    backgroundColor: "#307ECC",
    color: "white",
    alignItems:'center'
  },
  modalText: {
    fontSize: 16,
    color: "white",
    fontWeight: 500,
  },
  tableContainer: {
    flexDirection: "column",
    marginTop: 10,
    marginLeft: 48,
    marginBottom: 35,
    width: 350,
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    width: 350,
    borderColor: "#ddd",
  },
  cell: {
    flex: 1,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  cell_1: {
    flex: 1,
    fontSize: 11,
    borderColor: "#DDDDDD",
    textAlign: "center",

    padding: 8,
    borderTopWidth: 1,
    minWidth: 150,
  },
  cell_2: {
    flex: 1,
    fontSize: 11,
    borderColor: "#DDDDDD",
    padding: 5,
    textAlign: "center",
    borderLeftWidth: 1,
    borderTopWidth: 1,
    minWidth: 40,
    alignContent:'center'
  },

  cell_3: {
    flex: 1,
    fontSize: 11,
    borderColor: "#DDDDDD",
    textAlign: "center",
    alignContent:'center',

    padding: 8,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    minWidth: 78,
  },
  cell_4: {
    borderColor: "#DDDDDD",
    justifyContent: "center",
    alignItems: "center",
    borderLeftWidth: 1,
    borderTopWidth: 1,
    minWidth: 68,
  },

  headerCell1: {
    padding: 8,
    fontSize: 12,
    fontWeight: "bold",
    minWidth: 150,
    backgroundColor: "#F5F5F5",
    color: "#rgb(112, 112, 112)",
    borderColor: "#DDDDDD",
  },
  headerCell2: {
    padding: 8,
    fontSize: 12,
    fontWeight: "bold",
    minWidth: 40,
    backgroundColor: "#F5F5F5",
    color: "#rgb(112, 112, 112)",
    borderLeftWidth: 1,
    borderColor: "#DDDDDD",
  },
  headerCell3: {
    padding: 8,
    fontSize: 12,
    fontWeight: "bold",
    minWidth: 78,
    backgroundColor: "#F5F5F5",
    color: "#rgb(112, 112, 112)",
    borderLeftWidth: 1,
    borderColor: "#DDDDDD",
  },
  headerCell4: {
    padding: 8,
    fontSize: 12,
    fontWeight: "bold",
    minWidth: 68,
    backgroundColor: "#F5F5F5",
    color: "#rgb(112, 112, 112)",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#DDDDDD",
  },
  checkbox_size: {
    width: 13,
    height: 13,
  },
});

export default LenderRank;
