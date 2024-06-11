import React, { useEffect, useState } from "react";
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
  formatCurrency,
  formatPercentage,
} from "./accessories/CommonFunctions";
import { Image } from "react-native-web";
const AdjustmentDetailsNew = ({ Open, handleAdjustmentDetails }) => {
  const [Tab, setTab] = useState({ Adjustment: true });

  const { Result } = Open;
  let { Rate, LockDay, RateSheetName, WorstRateSheetName } =
    Result[0]["RootObjects"][0];
  console.log("Adjustment ==> ", Result);
  let { Addons, LenderComp, Total, selectedRate } =
    Result?.[2]?.["ProfitMargin"] || {};
  const fnToggle = (name) => {
    setTab({ [name]: true });
  };
  return (
    <View style={styles.container}>
      <Modal transparent={true} visible={true}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* <View style={styles.header}>
              <CustomText style={{ color: "#fff", fontSize: 16 }}>
                Adjustments Details
              </CustomText>
              <Icon
                name="close"
                size={18}
                color="#dedbdb7a"
                onPress={() => {
                  handleAdjustmentDetails(false, "");
                }}
              />
            </View> */}

            <View style={styles.container}>
              {/* <View style={{ flexDirection: "row" }}>
                <CustomText style={{ fontSize: 12, color: "#333333" }}>
                  Rate Sheet ID:
                </CustomText>
                <CustomText style={{ fontSize: 12, color: "#333333" }}>
                  {" "}
                  {RateSheetName}
                </CustomText>
              </View> */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginLeft: 125,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    margin: 10,
                    gap: 40,
                    justifyContent: "center",
                  }}
                >
                  <TouchableOpacity
                    autoFocus={"No"}
                    onPress={() => {
                      fnToggle("Profit");
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        borderBottomWidth: Tab["Profit"] ? 2 : 0,
                        borderBottomColor: "#424242",
                        paddingHorizontal: 8,
                        paddingBottom: 4,
                        cursor: "pointer",
                      }}
                    >
                      <CustomText
                        bold={true}
                        style={{ fontSize: 12, color: "#333333" }}
                      >
                        {"Profit Margins"}
                      </CustomText>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    tabIndex={-1}
                    onPress={() => {
                      fnToggle("Adjustment");
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        borderBottomWidth: Tab["Adjustment"] ? 2 : 0,
                        borderBottomColor: "#424242",
                        paddingHorizontal: 8,
                        paddingBottom: 4,
                        cursor: "pointer",
                      }}
                    >
                      <CustomText
                        bold={true}
                        style={{ fontSize: 12, color: "#333333" }}
                      >
                        {"Adjustment Details"}
                      </CustomText>
                    </View>
                  </TouchableOpacity>
                </View>

                <Image
                  style={{
                    height: 13,
                    width: 13,
                    top: 13,
                  }}
                  resizeMode="contain"
                  source={require(`../assets/close.svg`)}
                  onClick={() => {
                    handleAdjustmentDetails(false, "");
                  }}
                />
              </View>
              {Tab["Adjustment"] ? (
                <View>
                  <View style={[styles["Table"], { borderBottomWidth: 2,borderBottomColor:'#999999' }]}>
                    <View
                      style={{
                        flexDirection: "row",
                        flex: 5,
                        backgroundColor: "#508BC9",
                      }}
                    >
                      <CustomText
                        style={[
                          styles["headerLabel"],
                          {
                            flex: 2,
                          },
                        ]}
                      >
                        Adjustments
                      </CustomText>

                      <CustomText
                        style={[
                          styles["headerLabel"],
                          {
                            flex: 1,
                            paddingHorizontal: 0,
                          },
                        ]}
                      >
                        {"Rate"}
                      </CustomText>
                      <CustomText
                        style={[
                          styles["headerLabel"],
                          {
                            flex: 1,
                            paddingHorizontal: 0,
                          },
                        ]}
                      >
                        {"Points"}
                      </CustomText>
                      <CustomText
                        style={[
                          styles["headerLabel"],
                          {
                            flex: 1,
                            paddingHorizontal: 0,
                          },
                        ]}
                      >
                        {"Cost"}
                      </CustomText>
                    </View>
                    <View
                      style={{
                        gap: 3,
                      }}
                    >
                      <View
                        style={{
                          flex: 5,
                          flexDirection: "row",
                          borderTopWidth: 1,
                          borderTopColor: "#dddddd",
                          backgroundColor: "#fff",
                          backgroundColor: "#F2F2F2",
                        }}
                      >
                        <View
                          style={{
                            flex: 2,
                            paddingLeft: 15,
                          }}
                        >
                          <CustomText
                            style={{
                              fontSize: 12,
                              paddingVertical: 6,
                              color: "#000000",
                            }}
                            bold={true}
                          >
                            {"Base Rate & Price"}
                          </CustomText>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            // borderRightWidth: 1,
                            // borderColor: "#dddddd",
                            paddingLeft: 15,
                          }}
                        >
                          <CustomText
                            style={{
                              fontSize: 12,
                              paddingVertical: 6,
                              color: "#000000",
                            }}
                            bold={true}
                          >
                            {selectedRate["IntRate"]}
                          </CustomText>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            paddingLeft: 15,
                          }}
                        >
                          <CustomText
                            style={{
                              fontSize: 12,
                              paddingVertical: 6,
                              color: selectedRate["BasePoints"]
                                .toString()
                                .includes("(")
                                ? "#2E862C"
                                : "#C14242",
                            }}
                          >
                            {selectedRate["BasePoints"]}
                          </CustomText>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            paddingLeft: 15,
                          }}
                        >
                          <CustomText
                            style={{
                              fontSize: 12,
                              paddingVertical: 6,
                              color: selectedRate["BaseAmt"]
                                .toString()
                                .includes("-")
                                ? "#2E862C"
                                : "#C14242",
                            }}
                          >
                            {selectedRate["BaseAmt"].includes("-")
                              ? formatCurrency(selectedRate["BaseAmt"], 1)
                              : selectedRate["BaseAmt"]}
                          </CustomText>
                        </View>
                      </View>
                    </View>
                    {Addons?.map((e, i) => (
                      <View
                        style={{
                          gap: 3,
                        }}
                      >
                        <View
                          style={{
                            flex: 4,
                            flexDirection: "row",
                            borderTopWidth: 1,
                            borderTopColor: "#999999",
                            backgroundColor: "#fff",
                          }}
                        >
                          <View
                            style={{
                              flex: 2,
                              // borderRightWidth: 1,
                              // borderColor: "#dddddd",
                              paddingLeft: 15,
                            }}
                          >
                            <CustomText
                              style={{
                                fontSize: 12,
                                paddingVertical: 6,
                                color: "#428BCA",
                                textDecoration: "underline",
                                cursor:'pointer'
                              }}
                            >
                              {e["Descript"]
                                .replace("[rab]", "")
                                .replace("[rae]", "")}
                            </CustomText>
                          </View>
                          <View
                            style={{
                              flex: 1,
                              // borderRightWidth: 1,
                              // borderColor: "#dddddd",
                              paddingLeft: 15,
                            }}
                          >
                            <CustomText
                              style={{
                                fontSize: 12,
                                paddingVertical: 6,
                                color: "#000000",
                              }}
                            >
                              {e["Rate"]}
                            </CustomText>
                          </View>
                          <View
                            style={{
                              flex: 1,
                              // borderRightWidth: 1,
                              // borderColor: "#dddddd",
                              paddingLeft: 15,
                            }}
                          >
                            <CustomText
                              style={{
                                fontSize: 12,
                                paddingVertical: 6,
                                color: e["Disc"].toString().includes("(")
                                  ? "#2E862C"
                                  : "#C14242",
                              }}
                            >
                              {e["Disc"]}
                            </CustomText>
                          </View>
                          <View
                            style={{
                              flex: 1,
                              // borderRightWidth: 1,
                              // borderColor: "#dddddd",
                              paddingLeft: 15,
                            }}
                          >
                            <CustomText
                              style={{
                                fontSize: 12,
                                paddingVertical: 6,
                                color: e["AddonAmount"].includes("(")
                                  ? "#2E862C"
                                  : "#C14242",
                              }}
                            >
                              {e["AddonAmount"]}
                            </CustomText>
                          </View>
                        </View>
                      </View>
                    ))}
                    <View
                      style={{
                        gap: 3,
                      }}
                    >
                      <View
                        style={{
                          flex: 5,
                          flexDirection: "row",
                          borderTopWidth: 2,
                          borderTopColor: "#999999",
                          backgroundColor: "#fff",
                          backgroundColor: "#DEEAF1",
                        }}
                      >
                        <View
                          style={{
                            flex: 2,
                            paddingLeft: 15,
                          }}
                        >
                          <CustomText
                            style={{
                              fontSize: 12,
                              paddingVertical: 6,
                              color: "#000",
                            }}
                            bold={true}
                          >
                            {"Selected Rate & Price"}
                          </CustomText>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            // borderRightWidth: 1,
                            // borderColor: "#dddddd",
                            paddingLeft: 15,
                          }}
                        >
                          <CustomText
                            style={{
                              fontSize: 12,
                              paddingVertical: 6,
                              color: "#000000",
                            }}
                            bold={true}
                          >
                            {Total["FinalPrice"]["finalRate"]}
                          </CustomText>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            paddingLeft: 15,
                          }}
                        >
                          <CustomText
                            style={{
                              fontSize: 12,
                              paddingVertical: 6,
                              color: Total["FinalPrice"]["finalPoints"]
                                .toString()
                                .includes("(")
                                ? "#2E862C"
                                : "#C14242",
                            }}
                          >
                            {Total["FinalPrice"]["finalPoints"]}
                          </CustomText>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            paddingLeft: 15,
                          }}
                        >
                          <CustomText
                            style={{
                              fontSize: 12,
                              paddingVertical: 6,
                              color: Total["FinalPrice"]["finalPoints"]
                                .toString()
                                .includes("(")
                                ? "#2E862C"
                                : "#C14242",
                            }}
                          >
                            {Total["FinalPrice"]["finalPoints"]}
                          </CustomText>
                        </View>
                      </View>
                    </View>
                    <View
                      style={{
                        gap: 3,
                      }}
                    >
                      <View
                        style={{
                          flex: 5,
                          flexDirection: "row",
                          borderTopWidth: 1,
                          borderTopColor: "#999999",
                          backgroundColor: "#fff",
                          backgroundColor: "#fff",
                        }}
                      >
                        <View
                          style={{
                            flex: 2,
                            paddingLeft: 15,
                          }}
                        >
                          <CustomText
                            style={{
                              fontSize: 12,
                              paddingVertical: 6,
                              color: "#000",
                            }}
                            bold={true}
                          >
                            {"Lender Comp"}
                          </CustomText>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            // borderRightWidth: 1,
                            // borderColor: "#dddddd",
                            paddingLeft: 15,
                          }}
                        >
                          <CustomText
                            style={{
                              fontSize: 12,
                              paddingVertical: 6,
                              color: "#000000",
                            }}
                          >
                            {""}
                          </CustomText>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            paddingLeft: 15,
                          }}
                        >
                          <CustomText
                            style={{
                              fontSize: 12,
                              paddingVertical: 6,
                            }}
                            bold={true}
                          >
                            {formatPercentage(
                              LenderComp["LenderCompPoint"],
                              3
                            ) || "0.00%"}
                          </CustomText>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            paddingLeft: 15,
                          }}
                        >
                          <CustomText
                            style={{
                              fontSize: 12,
                              paddingVertical: 6,
                            }}
                            bold={true}
                          >
                            {formatCurrency(LenderComp["LenderCompAmt"]) ||
                              "$0.00"}
                          </CustomText>
                        </View>
                      </View>
                    </View>
                    <View
                      style={{
                        gap: 3,
                      }}
                    >
                      <View
                        style={{
                          flex: 5,
                          flexDirection: "row",
                          borderTopWidth: 1,
                          borderTopColor: "#999999",
                          backgroundColor: "#fff",
                          backgroundColor: "#fff",
                        }}
                      >
                        <View
                          style={{
                            flex: 2,
                            paddingLeft: 15,
                          }}
                        >
                          <CustomText
                            style={{
                              fontSize: 12,
                              paddingVertical: 6,
                              color: "#000",
                            }}
                            bold={true}
                          >
                            {"Final Rate & Price"}
                          </CustomText>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            // borderRightWidth: 1,
                            // borderColor: "#dddddd",
                            paddingLeft: 15,
                          }}
                        >
                          <CustomText
                            style={{
                              fontSize: 12,
                              paddingVertical: 6,
                              color: "#000000",
                            }}
                            bold={true}
                          >
                            {Total["FinalPrice"]["finalRate"]}
                          </CustomText>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            paddingLeft: 15,
                          }}
                        >
                          <CustomText
                            style={{
                              fontSize: 12,
                              paddingVertical: 6,
                              color: Total["FinalPrice"]["LenderCompPoint"]
                                .toString()
                                .includes("(")
                                ? "#2E862C"
                                : "#C14242",
                            }}
                          >
                            {Total["FinalPrice"]["LenderCompPoint"]}
                          </CustomText>
                        </View>
                        <View
                          style={{
                            flex: 1,
                            paddingLeft: 15,
                          }}
                        >
                          <CustomText
                            style={{
                              fontSize: 12,
                              paddingVertical: 6,
                              color: Total["FinalPrice"]["LenderCompAmt"]
                                .toString()
                                .includes("(")
                                ? "#2E862C"
                                : "#C14242",
                            }}
                          >
                            {Total["FinalPrice"]["LenderCompAmt"]}
                          </CustomText>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ) : (
                <View>
                  {WorstRateSheetName != undefined ? (
                    <View style={styles["Table"]}>
                      <View
                        style={{
                          flexDirection: "row",
                          flex: 4,
                          backgroundColor: "#508BC9",
                          // paddingVertical: 3,
                        }}
                      >
                        <CustomText
                          style={{
                            flex: 3,
                            flexDirection: "row",
                            textAlign: "left",
                            fontSize: 14,
                            borderRightWidth: 2,
                            borderColor: "#32CD32",
                            color: "#fff",
                            paddingVertical: 10,
                            paddingLeft: 15,
                          }}
                        >
                          Description
                        </CustomText>
                        <CustomText
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            textAlign: "center",
                            fontSize: 14,
                            borderRightWidth: 2,
                            borderTopWidth: 2,
                            borderColor: "#32CD32",
                            color: "#fff",
                            paddingLeft: 11,
                            paddingVertical: 10,
                          }}
                        >
                          {RateSheetName}
                        </CustomText>
                        <CustomText
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            textAlign: "center",
                            fontSize: 14,
                            color: "#fff",
                            marginLeft: 10,
                            paddingVertical: 10,
                          }}
                        >
                          {WorstRateSheetName}
                        </CustomText>
                      </View>
                      {Result[1]["BasePriceInfo"].map((e, i) => (
                        <View
                          style={{
                            gap: 3,
                          }}
                        >
                          <View
                            style={{
                              flex: 4,
                              flexDirection: "row",
                              borderTopWidth: 1,
                              borderTopColor: "#dddddd",
                              backgroundColor:
                                e["ItemDesc"].indexOf("Final Base") != -1 ||
                                e["ItemDesc"].indexOf("Final Price") != -1
                                  ? "#DEEAF1"
                                  : "inherit",
                            }}
                          >
                            <View
                              style={{
                                flex: 3,
                                // borderRightWidth: 1,
                                // borderColor: "#dddddd",
                                paddingLeft: 15,
                              }}
                            >
                              <CustomText
                                style={{
                                  fontSize: 12,
                                  paddingVertical: 6,
                                  color: "#000000",
                                }}
                                bold={
                                  e["ItemDesc"].indexOf("Final Base") != -1 ||
                                  e["ItemDesc"].indexOf("Final Price") != -1
                                }
                              >
                                {e["ItemDesc"]}
                              </CustomText>
                            </View>
                            <View
                              style={{
                                flex: 1,
                                borderRightWidth: 2,
                                borderLeftWidth: 2,
                                borderColor: "#32CD32",
                                paddingRight: 10,
                                borderBottomWidth:
                                  e["ItemDesc"].indexOf("Final Price") != -1
                                    ? 2
                                    : 0,
                              }}
                            >
                              <CustomText
                                style={{
                                  flex: 1,
                                  fontSize: 12,
                                  color: "#000000",
                                  textAlign: "center",
                                  marginTop: 6,
                                }}
                                bold={
                                  e["ItemDesc"].indexOf("Final Base") != -1 ||
                                  e["ItemDesc"].indexOf("Final Price") != -1
                                }
                              >
                                {e["PointsValueOne"]}
                              </CustomText>
                            </View>
                            <View
                              style={{
                                flex: 1,
                                paddingLeft: 10,
                                backgroundColor:
                                  e["PointsValueOne"] != e["PointsValueTwo"] &&
                                  !(
                                    e["ItemDesc"].indexOf("Final Base") != -1 ||
                                    e["ItemDesc"].indexOf("Final Price") != -1
                                  )
                                    ? "yellow"
                                    : "inherit",
                              }}
                            >
                              <CustomText
                                style={{
                                  fontSize: 11,
                                  paddingRight: 10,
                                  color: "#333333",
                                  textAlign: "right",
                                  marginTop: 4,
                                }}
                                bold={
                                  e["ItemDesc"].indexOf("Final Base") != -1 ||
                                  e["ItemDesc"].indexOf("Final Price") != -1
                                }
                              >
                                {e["PointsValueTwo"]}
                              </CustomText>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles["Table"]}>
                      <View
                        style={{
                          flexDirection: "row",
                          flex: 6,
                          backgroundColor: "#508BC9",
                        }}
                      >
                        <CustomText
                          style={[
                            styles["headerLabel"],
                            {
                              flex: 5,
                            },
                          ]}
                        >
                          Description
                        </CustomText>

                        <CustomText
                          style={[
                            styles["headerLabel"],
                            {
                              flex: 1,
                              paddingHorizontal: 0,
                              //paddingLeft:0,
                            },
                          ]}
                        >
                          {"Points"}
                        </CustomText>
                      </View>
                      {Result[1]["BasePriceInfo"].map((e, i) => (
                        <View
                          style={{
                            gap: 3,
                          }}
                        >
                          <View
                            style={[
                              styles["contentWrapper"],
                              {
                                backgroundColor:
                                  e["ItemDesc"].indexOf("Final Base") != -1 ||
                                  e["ItemDesc"].indexOf("Final Price") != -1
                                    ? "#DEEAF1"
                                    : "inherit",
                              },
                            ]}
                          >
                            <View
                              style={{
                                flex: 5,
                                paddingLeft: 15,
                              }}
                            >
                              <CustomText
                                style={{
                                  fontSize: 12,
                                  paddingVertical: 5,
                                  color: "#000000",
                                }}
                                bold={
                                  e["ItemDesc"].indexOf("Final Base") != -1 ||
                                  e["ItemDesc"].indexOf("Final Price") != -1
                                }
                              >
                                {e["ItemDesc"]}
                              </CustomText>
                            </View>

                            <View
                              style={{
                                flex: 1,
                              }}
                            >
                              <CustomText
                                style={{
                                  fontSize: 12,
                                  color: "#000000",
                                  textAlign: "left",
                                  paddingVertical: 0,
                                }}
                                bold={
                                  e["ItemDesc"].indexOf("Final Base") != -1 ||
                                  e["ItemDesc"].indexOf("Final Price") != -1
                                }
                              >
                                {e["PointsValue"]}
                              </CustomText>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
            {/* <View style={styles.footer}>
              <Button
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                  >
                    Ok
                  </CustomText>
                }
                style={styles["btn"]}
                disabled={true}
                onPress={() => {
                  handleAdjustmentDetails(false, "");
                }}
              />
            </View> */}
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
    marginTop: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000087",
  },
  modalView: {
    backgroundColor: "white",
    width: 600,
    height: "auto",
    borderRadius: 5,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#e5e5e5",
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: "100%",
    backgroundColor: "#307ecc",
  },

  footer: {
    borderTopWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#EFF3F8",
    flexDirection: "row",
    justifyContent: "end",
    padding: 5,
    width: "100%",
  },

  btn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignSelf: "flex-end",
    fontSize: 12,
    justifyContent: "center",
  },

  Table: {
    marginTop: 10,
    marginBottom: 40,
    borderBottomWidth: 1,
    borderColor: "#dddddd",
  },
  headerLabel: {
    flexDirection: "row",
    textAlign: "left",
    fontSize: 14,
    color: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 15,
  },
  contentWrapper: {
    flex: 6,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
  },
});

export default AdjustmentDetailsNew;
