import React, { useContext, useEffect, useState } from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  Button,
  InputBox,
  InputBoxOrdinary,
} from "./accessories/CommomComponents";
import CustomText from "./accessories/CustomText";
import {
  cleanValue,
  fnRoundUpValue,
  formatCurrency,
  context,
} from "./accessories/CommonFunctions";

const PITI = (prop) => {
  const { contextDetails, setContextDetails } = useContext(context); //Get value from context

  const { Open, handleViewPITI, handleSavePITI } = prop;
  const [details, setDetails] = useState({});
  const { PITI, Result, LineId, LPA_CommonData } = Open;

  const handlePITIDetails = (obj, event) => {
    let { name, value, Total } = obj;
    let Addon = value;
    if (event != "Blur") Addon = 0.0;
    Total =
      parseFloat(cleanValue(details["Total"] || "")) +
      parseFloat(cleanValue(Addon || ""));
    setDetails({ ...details, [name]: value, Total: formatCurrency(Total) });
  };
  const handleGetTotalPITI = () => {
    let iDetails = { ...details };
    delete iDetails["LineId"];
    delete iDetails["Total"];
    let Total = Object.values(iDetails).reduce(
      (total, current) =>
        parseFloat(cleanValue(total)) + parseFloat(cleanValue(current)),
      0
    );
    return formatCurrency(fnRoundUpValue(Total, 2));
  };

  useEffect(() => {
    if (Object.keys(Result).length > 0) {
      let Total =
        parseFloat(cleanValue(Result["Payment"])) +
        parseFloat(Result["PropFin"] || 0) +
        parseFloat(Result["PropHazard"] || 0) +
        parseFloat(Result["PropRETaxes"] || 0) +
        parseFloat(Result["PropMI"] || 0) +
        parseFloat(Result["PropHOA"] || 0) +
        parseFloat(Result["PropOther"] || 0);
      setDetails({
        LineId: LineId,
        Payment: formatCurrency(Result["Payment"]),
        PropFin: formatCurrency(Result["PropFin"]),
        PropHazard: formatCurrency(Result["PropHazard"]),
        PropRETaxes: formatCurrency(Result["PropRETaxes"]),
        PropMI: formatCurrency(Result["PropMI"]),
        PropHOA: formatCurrency(Result["PropHOA"]),
        PropOther: formatCurrency(Result["PropOther"]),
        Total: formatCurrency(Total.toFixed(2)),
      });
    }
  }, []);
  return (
    <View style={styles.container}>
      <Modal transparent={true} visible={PITI}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.header}>
              <CustomText
                bold={true}
                style={{ color: "#292b2c", fontSize: 16 }}
              >
                View PITI
              </CustomText>
              
            </View>

            <View style={styles.container}>
              <InputBoxOrdinary
                label={"Principal & Interest"}
                name={"Interest"}
                disabled={true}
                value={details["Payment"]}
                //style={styles['input']}
              ></InputBoxOrdinary>
              <InputBoxOrdinary
                label={"Other Financing"}
                name={"Financing"}
                disabled={true}
                value={details["PropFin"]}
              ></InputBoxOrdinary>
              <InputBoxOrdinary
                label={"Hazard Insurance"}
                name={"Insurance"}
                isValid={false}
                value={details["PropHazard"]}
                onChangeText={(text) =>
                  handlePITIDetails({
                    name: "PropHazard",
                    value: text,
                  })
                }
                onBlur={() => {
                  let formattedValue = formatCurrency(details["PropHazard"]);
                  handlePITIDetails(
                    {
                      name: "PropHazard",
                      value: formattedValue,
                    },
                    "Blur"
                  );
                }}
                onFocus={(event) => {
                  setTimeout(() => {
                    event.target.select();
                  }, 100);
                  let val = cleanValue(details["PropHazard"] || ""),
                    text = val == 0 ? "" : val?.toString()?.replaceAll("$", "");
                  handlePITIDetails({
                    name: "PropHazard",
                    value: text,
                  });
                }}
              ></InputBoxOrdinary>
              <InputBoxOrdinary
                label={"Property Tax"}
                name={"Tax"}
                isValid={false}
                value={details["PropRETaxes"]}
                onChangeText={(text) =>
                  handlePITIDetails({
                    name: "PropRETaxes",
                    value: text,
                  })
                }
                onBlur={() => {
                  let formattedValue = formatCurrency(details["PropRETaxes"]);
                  handlePITIDetails(
                    {
                      name: "PropRETaxes",
                      value: formattedValue,
                    },
                    "Blur"
                  );
                }}
                onFocus={(event) => {
                  setTimeout(() => {
                    event.target.select();
                  }, 100);
                  let val = cleanValue(details["PropRETaxes"] || ""),
                    text = val == 0 ? "" : val?.toString()?.replaceAll("$", "");
                  handlePITIDetails({
                    name: "PropRETaxes",
                    value: text,
                  });
                }}
              ></InputBoxOrdinary>
              <View style ={{flexDirection:'row',flexWrap:'wrap-reverse'}}>

              <InputBoxOrdinary
                label={"Mortgage Insurance"}
                name={"Insurance"}
                disabled={true}
                value={details["PropMI"]}
                width={'67%'}
              ></InputBoxOrdinary>
              <Button
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 10, color: "#fff", fontWeight: 200 }}
                  >
                    {"MI Quote"}
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  {
                    paddingVertical: 10,
                    borderWidth: 2,
                    borderColor: "#428bca",
                    marginTop:4
                  },
                ]}
                onPress={() => {
                  let url = `../../../BorrowerApplication/Presentation/Webforms/MIQuotes.aspx?SessionId=${contextDetails["queryString"]["SessionId"]}&LoanId=${contextDetails["LoanId"]}`;
                  window.open(
                    url,
                    "MIQuotes",
                    "width=1200,height=900,resizable=1,scrollbars=1"
                  );
                }}
              />
              </View>
              <InputBoxOrdinary
                label={"HOA Dues"}
                name={"HOA"}
                isValid={false}
                value={details["PropHOA"]}
                onChangeText={(text) =>
                  handlePITIDetails({
                    name: "PropHOA",
                    value: text,
                  })
                }
                onBlur={() => {
                  let formattedValue = formatCurrency(details["PropHOA"]);
                  handlePITIDetails(
                    {
                      name: "PropHOA",
                      value: formattedValue,
                    },
                    "Blur"
                  );
                }}
                onFocus={(event) => {
                  setTimeout(() => {
                    event.target.select();
                  }, 100);
                  let val = cleanValue(details["PropHOA"] || ""),
                    text = val == 0 ? "" : val?.toString()?.replaceAll("$", "");
                  handlePITIDetails({
                    name: "PropHOA",
                    value: text,
                  });
                }}
              ></InputBoxOrdinary>
              <InputBoxOrdinary
                label={"Other"}
                name={"Other"}
                isValid={false}
                value={details["PropOther"]}
                onChangeText={(text) =>
                  handlePITIDetails({
                    name: "PropOther",
                    value: text,
                  })
                }
                onBlur={() => {
                  let formattedValue = formatCurrency(details["PropOther"]);
                  handlePITIDetails(
                    {
                      name: "PropOther",
                      value: formattedValue,
                    },
                    "Blur"
                  );
                }}
                onFocus={(event) => {
                  setTimeout(() => {
                    event.target.select();
                  }, 100);
                  let val = cleanValue(details["PropOther"] || ""),
                    text = val == 0 ? "" : val?.toString()?.replaceAll("$", "");
                  handlePITIDetails({
                    name: "PropOther",
                    value: text,
                  });
                }}
              ></InputBoxOrdinary>
              <View style={{ marginTop: 20 }}>
                <InputBoxOrdinary
                  label={"PITI Total"}
                  name={"Total"}
                  disabled={true}
                  isBold={true}
                  value={handleGetTotalPITI()}
                ></InputBoxOrdinary>
              </View>
            </View>
            <View style={styles.footer}>
              <Button
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                  >
                    Save
                  </CustomText>
                }
                style={styles["btn"]}
                disabled={true}
                onPress={() => {
                  handleSavePITI(details);
                }}
              />
              <Button
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                  >
                    Cancel
                  </CustomText>
                }
                style={styles["btn"]}
                disabled={true}
                onPress={() => {
                  handleViewPITI(false, "");
                }}
              />
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
    gap: 10,
    alignItems: "center",
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
  input: {
    marginBottom: 15,
  },
});

export default PITI;
