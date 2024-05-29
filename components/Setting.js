import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  CheckBox,
  Image,
  Picker,
} from "react-native";
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Swatch from "./accessories/Swatch";
// import RotatingIcon from "./RotatingIcon";
// import DraggableFlatList from "react-native-draggable-flatlist";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import Dropdown from "./accessories/DropDown";

import XMLParser from "react-xml-parser";
import CustomText from "./accessories/CustomText";
import { Button } from "./accessories/CommomComponents";
import { context, handleAPI } from "./accessories/CommonFunctions";
// import Dev from "./accessories/Dev";

const Setting = ({ isOpen, handleSaveSetting }) => {
  const { contextDetails, setContextDetails } = useContext(context); //Get value from context

  const [data, setData] = useState({
    Rows: [],
    DisplayAll: 1,
    FeesInclude: 1,
    RateOrder: 2,
  });
  useEffect(() => {
    async function PageLoad() {
      let { EmpNum, EmpType, LO } = contextDetails;
      let Result = await GetDetails(EmpNum, EmpType, "", 0, 0, LO);
      let RateOrder = await GetSortOrder(EmpNum);
      Result = JSON.parse(Result)["Table"][0];
      //  XML =
      let FeesInclude = Result["UWFeesIncluded"];
      let Json = JSON.parse(Result["PreferenceJSON"])["DataOut"];
      let DisplayAll = Json[0]["RootObjects"][0]["DisplayAll"];
      let Rows = Json[1]["SortInfo"];
      // for (let index = 0; index < XML["children"].length; index++) {
      //   Rows.push(XML["children"][index]["attributes"]);
      // }
      setData({
        Rows: Rows,
        DisplayAll: DisplayAll,
        FeesInclude: FeesInclude == 0 ? 2 : FeesInclude == 2 ? 1 : FeesInclude,
        RateOrder: JSON.parse(RateOrder)["Table"][0]["Column1"] ,
      });
    }
    PageLoad();
  }, [isOpen]);
  const GetDetails = async (EmpNum, UserType, inputxml, Flag, UWFees, LOId) => {
    let obj = { EmpNum, UserType, inputxml, Flag, UWFees, LOId };
    let response = await handleAPI({
      name: "UserCustomOrder",
      params: obj,
    }).then((response) => {
      // response = JSON.parse(response);
      return response;
    });
    return response;
  };
  const GetCompanySelection = async (CompNum) => {
    let obj = { CompNum };
    let response = await handleAPI({
      name: "GetCompanySelection",
      params: obj,
    }).then((response) => {
      // response = JSON.parse(response);
      return response;
    });
    return response;
  };
  const GetSortOrder = async (UserId) => {
    let obj = { UserId };
    let response = await handleAPI({
      name: "GetSortOrder",
      params: obj,
    }).then((response) => {
      // response = JSON.parse(response);
      return response;
    });
    return response;
  };
  const UpdateSortOrder = (UserId, SortOrder) => {
    let obj = { UserId, SortOrder };
    handleAPI({
      name: "UpdateSortOrder",
      params: obj,
    }).then((response) => {
      // response = JSON.parse(response);
      return response;
    });
  };
  const handleOnchange = (index, name, value) => {
    setData((prevData) => {
      const newData = { ...prevData };
      if (["DisplayAll", "FeesInclude", "RateOrder"].includes(name)) {
        newData[name] = value;
      } else {
        newData["Rows"] = newData["Rows"].map((row, rowIndex) => {
          if (rowIndex === index) {
            return {
              ...row,
              [name]: value,
            };
          }
          return row;
        });
      }
      return newData;
    });
  };
  const handlSave = () => {
    let json = {
      DataIn: [
        { RootObjects: [{ DisplayAll: data["DisplayAll"] }] },
        { SortInfo: data["Rows"] },
      ],
    };

    let { EmpNum, EmpType, LO } = contextDetails;
    let Result = GetDetails(
      EmpNum,
      EmpType,
      JSON.stringify(json),
      1,
      data["FeesInclude"],
      LO
    );
    UpdateSortOrder(EmpNum, data["RateOrder"]);
    handleSaveSetting("Save");

    //handleSaveSetting("Save", obj);
  };
  const handleReset = () => {
    setData((prevData) => {
      const newData = { ...prevData };

      newData["Rows"] = newData["Rows"].map((row, rowIndex) => {
        return {
          ...row,
          Include: 1,
          OrderBy: 1,
        };
        return row;
      });
      return newData;
    });
  };
  const handleDrop = (droppedItem) => {
    setData((prevData) => {
      const newData = { ...prevData };
      var updatedList = [...newData["Rows"]];
      const reorderedItem = updatedList.splice(droppedItem.source.index, 1);
      updatedList.splice(droppedItem.destination.index, 0, reorderedItem[0]);

      newData["Rows"] = updatedList;
      return newData;
    });
  };
  let Fees = [
    { value: "0", label: "Select" },
    { value: "1", label: "Fees In" }, // dbvalue = 1
    { value: "2", label: "Fees Out" }, // dbvalue = 0
  ];
  let SortRateBy = [
    { value: "0", label: "Select" },
    { value: "1", label: "Lowest Rate" },
    { value: "2", label: "Highest Rate" },
  ];
  return (
    <View style={styles.container}>
      <Modal transparent={true} visible={isOpen}>
        <Animated.View
          style={[
            styles.centeredView,
            // { transform: [{ translateY: translateY }] },
          ]}
        >
          <View style={styles.modalView}>
            <View style={[styles.modal_header, styles.header]}>
              <CustomText style={styles.modalText}>
                Settings for Lock Rate
              </CustomText>
              <TouchableOpacity
                onPress={() => {
                  handleSaveSetting("Modal");
                }}
              >
                <FontAwesome
                  name="close"
                  size={24}
                  color="#ddd"
                  style={{ marginTop: 2 }}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <CustomText style={styles.tableHeaderText1}>Include</CustomText>
                <CustomText style={styles.tableHeaderText2}>
                  Description
                </CustomText>
                <View style={{ flexDirection: "row", marginRight: 20 }}>
                  <CustomText style={styles.tableHeaderText3}>
                    Ascending
                  </CustomText>
                  <FontAwesome name="caret-up" size={24} color="white" />
                </View>
              </View>
              <DragDropContext onDragEnd={handleDrop}>
                <Droppable droppableId="list-container">
                  {(provided) => (
                    <View
                      // className="drag-condiner"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{ minHeight: 165 }}
                    >
                      {data["Rows"].length == 0 && (
                        <View style={styles["container"]}>
                          <CustomText>Loading...</CustomText>
                        </View>
                      )}
                      {data["Rows"]?.map((row, index) => (
                        <Draggable
                          key={row["OrderId"]}
                          draggableId={row["OrderId"]}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className="drag-child"
                              ref={provided.innerRef}
                              {...provided.dragHandleProps}
                              {...provided.draggableProps}
                            >
                              <View key={index} style={styles.row}>
                                <CheckBox
                                  style={styles.checkbox_size}
                                  value={row["Include"] == 1}
                                  onValueChange={(val) => {
                                    handleOnchange(
                                      index,
                                      "Include",
                                      val ? 1 : 0
                                    );
                                  }}
                                  color={
                                    row["Include"] == 1 ? "#0075ff" : undefined
                                  }
                                />
                                <View style={styles.description}>
                                  <FontAwesome
                                    name="bars"
                                    size={16}
                                    color="#333333"
                                  />
                                  <CustomText style={styles.cell1}>
                                    {row["SortBy"]}
                                  </CustomText>
                                </View>
                                <View style={styles.rotatingIconContainer}>
                                  <FontAwesome
                                    name={`caret-${
                                      row["OrderBy"] == 1 ? "down" : "up"
                                    }`}
                                    size={24}
                                    color="#5e9cd3"
                                    onPress={() =>
                                      handleOnchange(
                                        index,
                                        "OrderBy",
                                        row["OrderBy"] == 1 ? 0 : 1
                                      )
                                    }
                                  />
                                </View>
                              </View>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </View>
                  )}
                </Droppable>
              </DragDropContext>

              <View style={[styles.settingsContainer,{marginVertical:20}]}>
                <CustomText style={styles.settingText}>
                  Always Display All Loan Products
                </CustomText>
                <View>
                  <Swatch
                    size={15}
                    value={data["DisplayAll"] == 1 ? true : false}
                    onChange={(val) => {
                      handleOnchange(0, "DisplayAll", val ? 1 : 0);
                    }}
                  />
                </View>
              </View>
              <View style={{ width: 300, marginLeft: 13, marginTop: 15 }}>
                <Dropdown
                  isValid={true}
                  label={"Underwriting Fees Included Default view"}
                  options={Fees || []}
                  value={data["FeesInclude"]}
                  onSelect={(text) => {
                    handleOnchange(0, "FeesInclude", text["value"]);
                  }}
                />
              </View>

              <View style={{ width: 300, marginLeft: 13 }}>
                <Dropdown
                  isValid={true}
                  label={"Sort Rates by"}
                  options={SortRateBy || []}
                  value={data["RateOrder"]}
                  onSelect={(text) => {
                    handleOnchange(0, "RateOrder", text["value"]);
                  }}
                />
              </View>
              <View style={styles.buttonContainer}>
                <Button
                  title={
                    <CustomText
                      style={{ color: "#FFFFF", fontSize: 11, fontWeight: 200 }}
                    >
                      Save & Reload Grids
                    </CustomText>
                  }
                  style={[
                    styles["btn"],
                    {
                      borderRadius: 3,
                      marginLeft: 12,
                      paddingVertical: 8,
                      paddingHorizontal: 8,
                    },
                  ]}
                  onPress={() => {
                    handlSave();
                  }}
                />

                <Button
                  title={
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 7,
                        alignItems: "center",
                      }}
                    >
                      <FontAwesome name="refresh" size={16} color="white" />
                      <CustomText
                        style={{
                          color: "#FFFFF",
                          fontSize: 11,
                          fontWeight: 200,
                        }}
                      >
                        Reset to Default
                      </CustomText>
                    </View>
                  }
                  style={[
                    styles["btn"],
                    {
                      borderRadius: 3,
                      marginLeft: 12,
                      paddingVertical: 8,
                      paddingHorizontal: 8,
                    },
                  ]}
                  onPress={() => {
                    handleReset();
                  }}
                />
              </View>
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
    backgroundColor: "#00000087",
  },
  modalView: {
    backgroundColor: "white",
    // borderWidth: 1,
    // borderColor: "848484",
    borderRadius: 5,
    width: 478,
    height: 580,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 9,
  },
  modal_header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "rgba(13, 106, 197, 0.8)",
    color: "white",
    borderBottomWidth: 1,
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
    borderBottomColor: "#eeeeee",
    alignItems: "baseline",
  },
  modalText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  headingText: {
    backgroundColor: "428bca",
    color: "white",
    padding: 10,
    fontWeight: 500,
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#307ecc",
    paddingVertical: 6,
  },
  tableHeaderText1: {
    color: "white",
    padding: 4,
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 20,
  },
  tableHeaderText2: {
    color: "white",
    padding: 4,
    fontSize: 13,
    fontWeight: "700",
  },
  tableHeaderText3: {
    color: "white",
    padding: 4,
    fontSize: 13,
    fontWeight: "700",
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    fontSize: 12,
    marginLeft: 10,
    padding: 2,
  },
  cell1: {
    marginLeft: 10,
    alignContent: "center",
    fontSize: 12,
    flex: 1,
    padding: 1,
  },
  checkbox_size: {
    marginLeft: 30,
    width: 13,
    height: 13,
    color: "red",
  },
  description: { flexDirection: "row", alignItems: "center", marginLeft: 70 },

  dropdown: { marginLeft: 20, marginTop: 20 },
  dropdown2: { marginLeft: 20, marginTop: 5 },
  picker: {
    width: 254,
    fontSize: 12,
    padding: 2,
    borderWidth: 3,
    borderColor: "#848484",
  },
  settingsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    marginLeft: 50,
  },
  settingText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#848484",
    marginLeft: 20,
  },
  settingLabel: {
    backgroundColor: "#848484",
    width: 254,
    color: "white",
    fontWeight: "bold",
    paddingLeft: 5,
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 50,
    //marginTop: 30,
  },
  saveButton: {
    backgroundColor: "#428bca",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: "white",
    fontSize: 14,
  },
  resetButton: {
    flexDirection: "row",
    backgroundColor: "#428bca",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: "white",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    marginLeft: 2,
  },
  resetIcon: {
    width: 16,
    height: 16,
  },
  rotatingIconContainer: {
    marginLeft: "auto",
    marginRight: 60,
  },

  btn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignSelf: "flex-end",
    fontSize: 12,
    justifyContent: "center",
  },
});

export default Setting;
