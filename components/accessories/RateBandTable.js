import { StyleSheet, View } from "react-native";
import { Button } from "./CommomComponents";
import CustomText from "./CustomText";
import Dropdown from "./DropDown";
import {
  cleanValue,
  fnRoundUpValue,
  formatCurrency,
  formatDate,
  formatPercentage,
  handleAddons,
  context,
  fnSortBy,
} from "./CommonFunctions";
import Icon from "react-native-vector-icons/Ionicons"; //FontAwesome
import { useContext, useEffect, useState } from "react";

const RateBandTable = (props) => {
  // console.log(
  //   "===================================Rate Band Grid=========================="
  // );
  const {
    ActiveRate,
    RateBandClick,
    RawRateBand,
    LineId,
    LineIds,
    LnProgActiveId,
    CommonId,
    LockPeriodChange,
    RankByChange,
    AdjustmentDetails,
    LenderRank,
    CheckBoxVal,
    handleLockRate,
    handleRunAUS,
    handleProgramGuidelines,
  } = props;
  const {
    RateBandsRows,
    Addons,
    LockPeriod,
    RootObjects,
    LenderFees,
    LenderComp,
  } = RawRateBand;
  //console.log("Rate Band Component ====>>", props);
  const { contextDetails, setContextDetails } = useContext(context); //Get value from context

  const [Total, setTotal] = useState({});
  const [RateBandDetails, setRateBandDetails] = useState({
    LockPeriodID: ActiveRate?.[LineId]?.["LockPeriodID"], //["LockPeriodID"],
    RankBy: 2,
  });
  let RankBy = [
    { label: "Price Only", value: "1" },
    { label: "Price and Fees", value: "2" },
  ];
  useEffect(() => {
    let column_ = {
      LineId: LineId,
      IntRate: formatPercentage(ActiveRate["Row"]["IntRate"]),
      LnProgActiveId: ActiveRate["Row"]["LnProgActiveId"],
    };
    fnAddons(column_, "No APR");
  }, []);
  let LockPeriodOptions = [];
  LockPeriod?.[LineId]?.forEach((item, index) => {
    let option = {
      label: item.LockPeriods,
      value: item.LockPeriodID,
    };
    LockPeriodOptions.push(option);
  });
  const fnAddons = (active, action) => {
    let obj = {};
    //let lineIds=Row['Row']['LineIds'].split(',')
    let Index = 0;
    for (let i = 0; i < LineIds.length; i++) {
      let Row = RawRateBand["RateBandsRows"][LineIds[i]].filter((e, i) => {
        if (e["IntRate"] == active["IntRate"]) {
          Index = i;
          return e;
        }
      });
      let { Name, LockExpDate } = RootObjects[LineIds[i]];
      let column_ = {
        Row: Row[0],
        LineId: active["LineId"],
        parallelLineId: LineIds[i], //active["LineId"], //LineIds[i],
        CommonId: CommonId,
        Index: Index,
        LockPeriodID: RateBandDetails["LockPeriodID"],
        LnProgActiveId: Row[0]?.["LnProgActiveId"] || "",
        RateSheetName: Row[0]?.["RateSheetName"] || "",
        activeLNPId: active?.["LnProgActiveId"] || "",
        Name,
        LockExpDate,
      };

      let Result = handleAddons(column_, Addons[LineIds[i]]);
      //if (LineIds[i] == Row["LineId"])
      RateBandClick(Result, "", action);
      let Clean_finalPoints = 0,
        Clean_finalAmount = 0;
      let { LenderCompPoint, LenderCompAmt } = LenderComp[LineIds[i]];
      if (Result) {
        if (Result["FinalVal"]["finalPoints"].indexOf("(") != -1) {
          Clean_finalPoints = cleanValue(Result["FinalVal"]["finalPoints"], 2);
          Clean_finalPoints = parseFloat(Clean_finalPoints) * -1;
          //LenderCompPoint = parseFloat(LenderCompPoint) + Clean_finalPoints;
        } else {
          Clean_finalPoints = cleanValue(Result["FinalVal"]["finalPoints"], 2);
          Clean_finalPoints = parseFloat(Clean_finalPoints);
          //LenderCompPoint = parseFloat(LenderCompPoint) + Clean_finalPoints;
        }

        if (Result["FinalVal"]["finalAmount"].indexOf("(") != -1) {
          Clean_finalAmount = cleanValue(Result["FinalVal"]["finalAmount"], 2);
          Clean_finalAmount = parseFloat(Clean_finalAmount) * -1;
        } else {
          Clean_finalAmount = cleanValue(Result["FinalVal"]["finalAmount"], 2);
          Clean_finalAmount = parseFloat(Clean_finalAmount);
        }
      }
      LenderCompPoint = parseFloat(LenderCompPoint) + Clean_finalPoints;
      LenderCompAmt = parseFloat(LenderCompAmt) + Clean_finalAmount;
      LenderCompAmt = LenderCompAmt.toFixed(2);

      if (LenderCompPoint > 0) {
        {
          LenderCompPoint = formatPercentage(LenderCompPoint, 3);
        }
      } else {
        LenderCompPoint = LenderCompPoint.toString().replace("-", "");
        LenderCompPoint = `(${parseFloat(LenderCompPoint).toFixed(3)}%)`;
      }

      if (LenderCompAmt > 0) {
        LenderCompAmt = formatCurrency(LenderCompAmt);
      } else LenderCompAmt = formatCurrency(LenderCompAmt, 1);

      // ======================== Lender fee ===================
      // let {Points,Fees} = LenderFees[LineIds[i]][0]
      obj[LineIds[i]] = {
        FinalPrice: {
          finalPoints: (Result && Result["FinalVal"]["finalPoints"]) || "0.00%",
          finalAmount: (Result && Result["FinalVal"]["finalAmount"]) || "$0.00",
          finalRate: formatPercentage(
            (Result && Result["FinalVal"]["finalRate"]) || 0
          ),
          LenderCompPoint: LenderCompPoint,
          LenderCompAmt: LenderCompAmt,
        },
      };
    }

    setTotal(obj);
  };
  const handleLockPeriodChange = (obj) => {
    let { value } = obj;
    setRateBandDetails({ ...RateBandDetails, LockPeriodID: value });
    LockPeriodChange(value, LineId, LineIds, CommonId, LnProgActiveId);
  };
  const handleRankByChange = (obj) => {
    let { value } = obj;
    setRateBandDetails({ ...RateBandDetails, RankBy: value });
    let obj_ = {
      CommonId,
      LockPeriodID: RateBandDetails["LockPeriodID"],
      Rank: value,
      LineId,
      LineIds,
    };
    RankByChange(obj_);
  };
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          backgroundColor: "#F2F2F2",
          marginVertical: 1,
          marginHorizontal: 9,
        }}
      >
        <View style={{ flexDirection: "row", gap: 7 }}>
          <CustomText bold={true} style={styles["dropdown_Label"]}>
            Lock Days
          </CustomText>
          <View>
            <Dropdown
              isValid={false}
              isMap={true}
              label={""}
              options={LockPeriodOptions}
              value={RateBandDetails["LockPeriodID"] || ""}
              onSelect={(text) => {
                handleLockPeriodChange(text);
              }}
            />
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 7 }}>
          <CustomText bold={true} style={styles["dropdown_Label"]}>
            Rank By
          </CustomText>
          <View>
            <Dropdown
              //isValid={true}
              label={""}
              options={RankBy}
              value={RateBandDetails["RankBy"] || ""}
              onSelect={(text) => {
                handleRankByChange(text);
              }}
            />
          </View>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          marginLeft: 5,
          maxWidth: "100%",
          overflow: "scroll",
        }}
      >
        {LineIds.map((e) => (
          <View
            style={[
              styles.wrapper,
              { display: CheckBoxVal[e] ? "none" : "flex" },
            ]}
            key={e}
          >
            <View
              style={{
                borderWidth: 1,
                backgroundColor: "#F2F2F2",
                borderColor: "#428BCA",
              }}
            >
              <View
                style={[
                  styles["SpaceAround"],
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    paddingVertical: 5,
                    marginRight: 3,
                    borderColor: "#dddddd",
                  },
                ]}
              >
                <CustomText
                  bold={true}
                  style={{ fontSize: 12, color: "#848484" }}
                >
                  {RootObjects[e]["LenderLnProgName"]} {/*Name */}
                </CustomText>
                {RateBandsRows[e].length != 0 && (
                  <View style={{ flexDirection: "row" }}>
                    <Button
                      title={
                        <CustomText
                          style={{
                            fontSize: 12,
                            color: "white",
                            fontWeight: 200,
                          }}
                        >
                          Run AUS
                        </CustomText>
                      }
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        marginLeft: 0,
                        borderRadius: 10,
                        backgroundColor: "#abbac3",
                      }}
                      onPress={() => {
                        handleRunAUS();
                      }}
                    />
                    <Button
                      title={
                        <CustomText
                          style={{
                            fontSize: 12,
                            color: "white",
                            fontWeight: 200,
                          }}
                          onPress={() => {
                            let obj = {
                              RootObjects: RootObjects[e],
                              Rate: ActiveRate[e],
                            };
                            handleProgramGuidelines(obj);
                          }}
                        >
                          Guidelines
                        </CustomText>
                      }
                      style={{
                        paddingHorizontal: 7,
                        paddingVertical: 3,
                        marginLeft: 4,
                        backgroundColor: "#abbac3",
                      }}
                      onPress={() => {
                        //handleAddBorrower("Add");
                      }}
                    />
                  </View>
                )}
              </View>
              {LineIds.length > 1 && (
                <View
                  style={[
                    styles["SpaceAround"],
                    {
                      alignItems: "center",
                      borderBottomWidth: 1,
                      borderColor: "#428BCA",
                      alignItems: "baseline",
                    },
                  ]}
                >
                  <>
                    <CustomText
                      style={{
                        fontSize: 12,
                        color: "white",
                        backgroundColor:
                          RootObjects[e]["Accept"] == 1 ? "#468847" : "#d15b47",
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 6,
                        marginBottom: 5,
                        marginRight: 3,
                      }}
                    >
                      {RootObjects[e]["Accept"] == 1
                        ? "Accept"
                        : `Refer Reasons: ${RootObjects[e]["Reason"]}`}
                    </CustomText>
                    {RootObjects[e]["ProgWarnMsg"].length > 5 && (
                      <CustomText
                        style={{
                          fontSize: 12,
                          color: "white",
                          backgroundColor: "#f89406",
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 6,
                          marginBottom: 5,
                          marginRight: 3,
                        }}
                      >
                        {RootObjects[e]["ProgWarnMsg"]}
                      </CustomText>
                    )}
                  </>
                </View>
              )}
              <View
                style={[
                  styles.heading,
                  styles["SpaceAround"],
                  { flex: 6, paddingVertical: 5 },
                ]}
              >
                <CustomText bold={true} style={[styles.heading, { flex: 2 }]}>
                  Interest Rate
                </CustomText>
                <CustomText bold={true} style={[styles.heading, { flex: 1 }]}>
                  Base Points
                </CustomText>
                <CustomText bold={true} style={[styles.heading, { flex: 1 }]}>
                  Base Price
                </CustomText>
                <CustomText
                  bold={true}
                  style={[styles.heading, { flex: 1, textAlign: "center" }]}
                >
                  Rank
                </CustomText>
                <CustomText
                  bold={true}
                  style={[styles.heading, { flex: 1, textAlign: "center" }]}
                >
                  Difference
                </CustomText>
              </View>
              <View
                style={[styles["SpaceAround"], { flexDirection: "column" }]}
              >
                {fnSortBy(RateBandsRows[e],'IntRate')?.map((column, index) => {
                  return (
                    <View
                      key={index}
                      style={{
                        flexDirection: "row",
                        borderBottomWidth: 1,
                        borderColor: "#D1D1D1",
                        backgroundColor:
                        ActiveRate?.[CommonId]?.["IntRate"] ===
                            column["IntRate"] && column['IsDummy'] ? '#ffdede':
                          ActiveRate[CommonId] &&
                          ActiveRate?.[CommonId]?.["IntRate"] ===
                            column["IntRate"] &&
                          ActiveRate?.[CommonId]?.["LnProgActiveId"] ==
                            column?.["LnProgActiveId"]
                            ? // &&
                              // ActiveRate?.[CommonId]?.["LineId"] ==e
                              "#ADFE2F"
                            : ActiveRate?.[CommonId]?.["IntRate"] ===
                                column["IntRate"] &&
                              ActiveRate?.[CommonId]?.["IntRate"] !=
                                column["LnProgActiveId"]
                            ? "yellow"
                            : "inherit",
                        paddingVertical: 1,
                        flex: 5,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        let column_ = {
                          IntRate: column["IntRate"],
                          LineId: column["LineId"], //e
                          LnProgActiveId: column["LnProgActiveId"],
                          RateSheetName: column["RateSheetName"],
                        };
                        fnAddons(column_);
                      }}
                    >
                      <CustomText
                        style={{
                          fontSize: 12,
                          color: "#848484",
                          flex: 2,
                        }}
                      >
                        {column["IntRate"] || ""}
                      </CustomText>
                      <View style={{ flex: 1, flexDirection: "row" }}>
                        <View style={{ flexDirection: "row" }}>
                          <CustomText style={[styles["txt_Label"]]}>
                            {column['IsDummy'] ? '-' :column["BasePoints"] || ""}
                          </CustomText>
                          {ActiveRate?.[CommonId]?.["IntRate"] ==
                            column["IntRate"] &&
                            (contextDetails["wholeSaleRights"] != 0 && !column["IsDummy"]) && (
                              <Icon
                                name="information-circle"
                                size={16}
                                color="#6d6d6d"
                                onPress={() => {
                                  let column_ = {
                                    Row: column,
                                    LineId: column["LineId"],
                                    CommonId: CommonId,
                                    Index: index,
                                    LockPeriodID:
                                    ActiveRate?.[LineId]?.["LockPeriodID"],
                                  };
                                  AdjustmentDetails(true, column_);
                                }}
                              />
                            )}
                        </View>
                      </View>
                      <CustomText style={styles["txt_Label"]}>
                        {column["BaseAmt"].indexOf("-") != -1
                          ? `(${column["BaseAmt"].replace("-", "")})`
                          : column['IsDummy'] ? '-' :column["BaseAmt"] || "-"}
                      </CustomText>
                      <View
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          justifyContent: "center",
                        }}
                      >
                        <View style={{ flexDirection: "row" }}>
                          <CustomText style={[styles["txt_Label"]]}>
                            {column['IsDummy'] ? '-' : column["Rank"] || "Ranking..."}
                          </CustomText>

                          <Icon
                            style={{
                              visibility:
                                ActiveRate?.[CommonId]?.["IntRate"] ==
                                column["IntRate"] && !column["IsDummy"]
                                  ? "visible"
                                  : "hidden",
                            }}
                            name="information-circle"
                            size={16}
                            color="#6d6d6d"
                            onPress={() => {
                              let column_ = {
                                Row: RateBandsRows,
                                Rate: column["IntRate"],
                                LineIds: LineIds,
                                RootObjects: RootObjects,
                              };
                              LenderRank(true, column_);
                            }}
                          />
                        </View>
                      </View>

                      <CustomText
                        style={[
                          styles["txt_Label"],
                          {
                            textAlign: "center",
                          },
                        ]}
                      >
                        {column["Difference"] || "Ranking..."}
                      </CustomText>
                    </View>
                  );
                })}
                {RateBandsRows[e].length == 0 && (
                  <View style={{ marginVertical: 10 }}>
                    <View
                      style={{
                        backgroundColor: "#f89406",
                        padding: 13,
                        borderRadius: 6,
                        margin: "auto",
                      }}
                    >
                      <CustomText style={{ fontSize: 12, color: "white" }}>
                        There are no qualifying rates for this scenario.
                      </CustomText>
                      <CustomText style={{ fontSize: 12, color: "white" }}>
                        Suggestion: See Refer Reasons.
                      </CustomText>
                    </View>
                  </View>
                )}
              </View>
            </View>
            <View
              style={[
                styles["SpaceAround"],
                {
                  borderBottomWidth: 1,
                  borderRightWidth: 1,
                  borderLeftWidth: 1,

                  borderColor: "#428BCA",
                  flex: 5,
                },
              ]}
            >
              <View style={styles.heading}>
                <CustomText bold={true} style={[styles.header, { flex: 2 }]}>
                  Adjustments
                </CustomText>
                <CustomText bold={true} style={[styles.header, { flex: 1 }]}>
                  Rate
                </CustomText>
                <CustomText bold={true} style={[styles.header, { flex: 1 }]}>
                  Points
                </CustomText>
                <CustomText bold={true} style={[styles.header, { flex: 2 }]}>
                  Amount
                </CustomText>
              </View>
              <View style={[styles.heading, { backgroundColor: "#00000000" }]}>
                <CustomText bold={true} style={[styles.header, { flex: 2 }]}>
                  Base Rate & Price
                </CustomText>
                <CustomText bold={true} style={[styles.header, { flex: 1 }]}>
                  {ActiveRate[e] && ActiveRate[CommonId]["IntRate"]}{" "}
                  {/* Binding the rate from common */}
                </CustomText>
                <CustomText
                  bold={true}
                  style={[
                    styles.header,
                    {
                      flex: 1,
                      color:
                        ActiveRate[e] &&
                        ActiveRate[e]["BasePoints"].includes("(")
                          ? "green"
                          : "red",
                    },
                  ]}
                >
                  {ActiveRate[e] && ActiveRate[e]["BasePoints"]}
                </CustomText>
                <CustomText
                  bold={true}
                  style={[
                    styles.header,
                    {
                      flex: 2,
                      color:
                        ActiveRate[e] && ActiveRate[e]["BaseAmt"].includes("-")
                          ? "green"
                          : "red",
                    },
                  ]}
                >
                  {ActiveRate[e] &&
                    (ActiveRate[e]["BaseAmt"].includes("-")
                      ? formatCurrency(ActiveRate[e]["BaseAmt"], 1)
                      : ActiveRate[e]["BaseAmt"])}
                </CustomText>
              </View>
              <View style={[{ flexDirection: "column" }]}>
                {Addons[e]?.map((column, index) => {
                  return (
                    <>
                      {column["AdjustmentJSON"].length == 0 ||
                      parseFloat(cleanValue(column["Disc"])) != 0 ? (
                        <View key={index} style={styles.data}>
                          {parseInt(column["CondLink"]) > 0 &&
                          (contextDetails["LnProgRights"] & 16) === 16 ? (
                            <CustomText
                              style={{
                                textDecoration: "underline",
                                fontSize: 12,
                                fontWeight: 400,
                                color: "#428BCA",
                                flex: 2,
                              }}
                              onPress={() => {
                                fnOpenConditionLink(
                                  contextDetails["LoanId"],
                                  e,
                                  column["CondLink"],
                                  RootObjects[e]["LnProgId"]
                                );
                              }}
                            >
                              {column["Descript"]
                                .replace("[rab]", "")
                                .replace("[rae]", "")
                                .substr(0, 20) || ""}
                            </CustomText>
                          ) : (
                            <CustomText
                              style={{
                                fontSize: 12,
                                fontWeight: 400,
                                color: "#848484",
                                flex: 2,
                                //paddingLeft: 2,
                              }}
                            >
                              {column["Descript"]
                                .replace("[rab]", "")
                                .replace("[rae]", "")
                                .substr(0, 20) || ""}
                            </CustomText>
                          )}
                          <CustomText
                            //  key={cIndex}
                            style={{
                              fontSize: 12,
                              fontWeight: 400,
                              color: "#848484",
                              flex: 1,
                              //paddingLeft: 2,
                            }}
                          >
                            {column["Rate"] || ""}
                          </CustomText>
                          <CustomText
                            //  key={cIndex}
                            style={{
                              fontSize: 12,
                              fontWeight: 400,
                              color: column["Disc"].toString().includes("(")
                                ? "green"
                                : "red",
                              //"#848484",
                              flex: 1,
                              //  paddingLeft: 2,
                            }}
                          >
                            {/* {column["Disc"].includes("-")
                          ? `(${column["Disc"]
                              .replace("-", "")
                              .replace("%", "")})%`
                          : column["Disc"] || ""} */}
                            {column["Disc"]}
                          </CustomText>
                          <CustomText
                            //  key={cIndex}
                            style={{
                              fontSize: 12,
                              fontWeight: 400,
                              color: column["AddonAmount"].includes("(")
                                ? "green"
                                : "red",
                              //"#848484",
                              flex: 2,
                              // paddingLeft: 2,
                            }}
                          >
                            {/* {column["AddonAmount"].includes("-")
                          ? formatCurrency(column["AddonAmount"], 1)
                          : column["AddonAmount"] || ""} */}
                            {column["AddonAmount"]}
                          </CustomText>
                        </View>
                      ) : (
                        <></>
                      )}
                    </>
                  );
                })}
              </View>
            </View>
            <View
              style={{
                borderWidth: 2,
                borderTopWidth: 1,
                borderColor: "#428BCA",
              }}
            >
              <View style={[styles.heading, styles["SpaceAround"]]}>
                <CustomText
                  bold={true}
                  style={[
                    styles.header,
                    {
                      flex: 2,
                    },
                  ]}
                >
                  Selected Rate & Price
                </CustomText>
                <CustomText
                  bold={true}
                  style={[
                    styles.header,
                    {
                      flex: 1,
                    },
                  ]}
                >
                  Rate
                </CustomText>
                <CustomText
                  bold={true}
                  style={[
                    styles.header,
                    {
                      flex: 1,
                    },
                  ]}
                >
                  Points
                </CustomText>
                <CustomText
                  bold={true}
                  style={[
                    styles.header,
                    {
                      flex: 2,
                    },
                  ]}
                >
                  Amount
                </CustomText>
              </View>
              <View style={{ flexDirection: "column" }}>
                <View style={[styles.data, styles["SpaceAround"]]}>
                  <CustomText
                    style={[
                      {
                        color: "#000",
                        backgroundColor: "#F2F2F2",
                        flex: 2,
                      },
                      styles.txtFontSize,
                    ]}
                  >
                    {""}
                  </CustomText>
                  <CustomText
                    style={[
                      {
                        backgroundColor: "F2F2F2",
                        flex: 1,
                      },
                      styles.txtFontSize,
                    ]}
                  >
                    {Total[e] && Total[e]["FinalPrice"]["finalRate"]}
                  </CustomText>
                  <CustomText
                    style={[
                      {
                        color:
                          Total[e] &&
                          Total[e]["FinalPrice"]["finalPoints"].includes("(")
                            ? "green"
                            : "red",
                        backgroundColor: "F2F2F2",
                        flex: 1,
                      },
                      styles.txtFontSize,
                    ]}
                  >
                    {/* {Total[e] &&
                      (Total[e]["FinalPrice"]["finalPoints"].includes("-")
                        ? `(${Total[e]["FinalPrice"]["finalPoints"]
                            .replace("-", "")
                            .replace("%", "")})%`
                        : Total[e]["FinalPrice"]["finalPoints"])} */}
                    {Total[e] && Total[e]["FinalPrice"]["finalPoints"]}
                  </CustomText>
                  <CustomText
                    style={[
                      {
                        color:
                          Total[e] &&
                          Total[e]["FinalPrice"]["finalAmount"].includes("(")
                            ? "green"
                            : "red",
                        backgroundColor: "F2F2F2",
                        flex: 2,
                      },
                      styles.txtFontSize,
                    ]}
                  >
                    {Total[e] && Total[e]["FinalPrice"]["finalAmount"]}
                  </CustomText>
                </View>
              </View>

              <View style={{ flexDirection: "column" }}>
                <View style={[styles.data, styles["SpaceAround"]]}>
                  <CustomText
                    style={[
                      {
                        color: "#000",
                        backgroundColor: "#F2F2F2",
                        flex: 2,
                      },
                      styles.txtFontSize,
                    ]}
                  >
                    {"Lender Comp"}
                  </CustomText>
                  <CustomText
                    style={[
                      {
                        flex: 1,
                      },
                      styles.txtFontSize,
                    ]}
                  >
                    {""}
                  </CustomText>
                  <CustomText
                    style={[
                      {
                        backgroundColor: "#F2F2F2",
                        flex: 1,
                      },
                      styles.txtFontSize,
                    ]}
                  >
                    {formatPercentage(LenderComp[e]["LenderCompPoint"], 3) ||
                      "0.00%"}
                  </CustomText>
                  <CustomText
                    style={[
                      {
                        backgroundColor: "#F2F2F2",
                        flex: 2,
                      },
                      styles.txtFontSize,
                    ]}
                  >
                    {formatCurrency(LenderComp[e]["LenderCompAmt"]) || "$0.00"}
                  </CustomText>
                </View>
              </View>

              <View style={{ flexDirection: "column" }}>
                <View style={[styles.data, styles["SpaceAround"]]}>
                  <CustomText
                    style={[
                      {
                        color: "#000",
                        backgroundColor: "#F2F2F2",
                        flex: 2,
                      },
                      styles.txtFontSize,
                    ]}
                  >
                    {"Final Rate & Price"}
                  </CustomText>
                  <CustomText
                    style={[
                      {
                        backgroundColor: "F2F2F2",
                        flex: 1,
                      },
                      styles.txtFontSize,
                    ]}
                  >
                    {Total[e] && Total[e]["FinalPrice"]["finalRate"]}
                  </CustomText>
                  <CustomText
                    style={[
                      {
                        color:
                          Total[e] &&
                          Total[e]["FinalPrice"]["LenderCompPoint"].includes(
                            "("
                          )
                            ? "green"
                            : "red",
                        backgroundColor: "#F2F2F2",
                        flex: 1,
                      },
                      styles.txtFontSize,
                    ]}
                  >
                    {/* {Total[e] &&
                      (Total[e]["FinalPrice"]["finalPoints"].includes("-")
                        ? `(${Total[e]["FinalPrice"]["finalPoints"]
                            .replace("-", "")
                            .replace("%", "")})%`
                        : Total[e]["FinalPrice"]["finalPoints"])} */}

                    {Total[e] && Total[e]["FinalPrice"]["LenderCompPoint"]}
                  </CustomText>
                  <CustomText
                    style={[
                      {
                        color:
                          Total[e] &&
                          Total[e]["FinalPrice"]["LenderCompAmt"].includes("(")
                            ? "green"
                            : "red",
                        backgroundColor: "#2F2F2",
                        flex: 2,
                      },
                      styles.txtFontSize,
                    ]}
                  >
                    {
                      Total[e] && Total[e]["FinalPrice"]["LenderCompAmt"]
                      // .indexOf("-")
                      //   ? formatCurrency(
                      //       Total[e]["FinalPrice"]["Clean_finalAmount"] +
                      //         parseFloat(LenderComp[e]["LenderCompPoint"]),
                      //       1
                      //     )
                      //   : formatCurrency(
                      //       Total[e]["FinalPrice"]["Clean_finalAmount"] +
                      //         parseFloat(LenderComp[e]["LenderCompPoint"])
                      //     )
                    }
                  </CustomText>
                </View>
              </View>
              <View
                style={[
                  styles["int_choose"],
                  { flex: 5, flexDirection: "row" },
                ]}
              >
                <View style={{ flex: 2 }}></View>
                <CustomText
                  bold={true}
                  style={[
                    styles["header"],
                    {
                      flex: 4,
                      color:
                        Total[e] &&
                        Total[e]["FinalPrice"]["finalAmount"].includes("(")
                          ? "green"
                          : "red",
                    },
                  ]}
                >
                  {`${
                    Total[e] &&
                    Total[e]["FinalPrice"]["finalAmount"].includes("(")
                      ? "Credit"
                      : "Charge"
                  } for Interest Rate Chosen`}
                </CustomText>
              </View>
              {LenderFees &&
                Object.keys(LenderFees).length > 0 &&
                false && ( // Remove the false
                  <View
                    style={{
                      //   borderWidth: 2,
                      borderTopWidth: 2,
                      borderColor: "#428BCA",
                    }}
                  >
                    <View style={[styles.heading, styles["SpaceAround"]]}>
                      <CustomText
                        bold={true}
                        style={[
                          styles.header,
                          {
                            flex: 2,
                          },
                        ]}
                      >
                        Lender Fees
                      </CustomText>
                      <CustomText
                        bold={true}
                        style={[
                          styles.header,
                          {
                            flex: 1,
                          },
                        ]}
                      >
                        {""}
                      </CustomText>
                      <CustomText
                        bold={true}
                        style={[
                          styles.header,
                          {
                            flex: 1,
                          },
                        ]}
                      >
                        Points
                      </CustomText>
                      <CustomText
                        bold={true}
                        style={[
                          styles.header,
                          {
                            flex: 2,
                          },
                        ]}
                      >
                        Fees
                      </CustomText>
                    </View>
                    <>
                      <View style={{ flexDirection: "column" }}>
                        {LenderFees[e]?.map((lender, i) => (
                          <View
                            style={[styles.data, styles["SpaceAround"]]}
                            key={i}
                          >
                            <CustomText
                              style={[
                                {
                                  color: "#848484",
                                  backgroundColor: "#F2F2F2",
                                  flex: 2,
                                  fontSize: 12,
                                },
                              ]}
                            >
                              {lender["FeeDesc"] || ""}
                            </CustomText>
                            <CustomText
                              style={[
                                {
                                  backgroundColor: "F2F2F2",
                                  flex: 1,
                                },
                                styles.txtFontSize,
                              ]}
                            >
                              {""}
                            </CustomText>
                            <CustomText
                              style={[
                                {
                                  color: "#848484",
                                  backgroundColor: "F2F2F2",
                                  flex: 1,
                                  fontSize: 12,
                                },
                              ]}
                            >
                              {/* {lender["Points"] || ""} */}
                              {formatPercentage(lender["Points"] || "")}
                            </CustomText>
                            <CustomText
                              style={[
                                {
                                  color: "#848484",
                                  backgroundColor: "F2F2F2",
                                  flex: 2,
                                  fontSize: 12,
                                },
                              ]}
                            >
                              {/* {lender["Fees"] || ""} */}
                              {formatCurrency(lender["Fees"] || "")}
                            </CustomText>
                          </View>
                        ))}
                      </View>
                    </>
                    <View style={[styles.heading, styles["SpaceAround"]]}>
                      <CustomText
                        bold={true}
                        style={[
                          styles.header,
                          {
                            flex: 3,
                          },
                        ]}
                      >
                        {"Final Rate & Price (with Fees)"}
                      </CustomText>

                      <CustomText
                        bold={true}
                        style={[
                          styles.header,
                          {
                            flex: 1,
                          },
                        ]}
                      >
                        {Total[e] &&
                          LenderFees[e][0] &&
                          formatPercentage(
                            parseFloat(LenderFees[e][0]["Points"]) +
                              parseFloat(Total[e]["FinalPrice"]["finalPoints"]),
                            3
                          )}
                      </CustomText>
                      <CustomText
                        bold={true}
                        style={[
                          styles.header,
                          {
                            flex: 2,
                          },
                        ]}
                      >
                        {Total[e] &&
                          LenderFees[e][0] &&
                          formatCurrency(
                            parseFloat(LenderFees[e][0]["Fees"]) +
                              parseFloat(
                                Total[e]["FinalPrice"]["finalAmount"]
                                  .replaceAll("$", "")
                                  .replaceAll("%", "")
                                  .replaceAll("(", "-")
                                  .replaceAll(")", "")
                                  .replaceAll(",", "")
                              )
                          )}
                      </CustomText>
                    </View>
                  </View>
                )}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <CustomText
                  //  bold={true}
                  style={[
                    styles["SpaceAround"],
                    {
                      fontSize: 12,
                      backgroundColor: "F2F2F2",
                      paddingVertical: 3,
                    },
                  ]}
                >
                  {`Lock Expiration: ${formatDate(
                    new Date(RootObjects[e]["LockExpDate"])
                  )}`}
                </CustomText>
                {RateBandsRows[e].length != 0 && !ActiveRate?.[e]?.['IsDummy']||0? (
                  <Button
                    title={
                      <CustomText
                        style={{
                          fontSize: 12,
                          color: "white",
                          fontWeight: 200,
                        }}
                      >
                        Lock | Float Rate
                      </CustomText>
                    }
                    style={{
                      padding: 7,
                      paddingVertical: 7,
                      marginRight: 4,
                      marginVertical: 5,
                    }}
                    onPress={() => {
                      handleLockRate(CommonId, "Modal", "Confirm", e); //ActiveRate?.[CommonId]?.['LineId'] || LineId
                    }}
                  />
                ):(null)}
              </View>
            </View>
          </View>
        ))}
      </View>
    </>
  );
};

export default RateBandTable;
const styles = StyleSheet.create({
  wrapper: {
    minWidth: 450,
    maxWidth: 450,
    height: "auto",
    //backgroundColor: "#fff",
    marginHorizontal: 5,
    marginVertical: 5,
  },
  header: {
    fontSize: 12,
    flexDirection: "row",
    padding: 2,
    borderColor: "#428BCA",
  },
  heading: {
    backgroundColor: "#e5e2e2", //"#f3f3f3",
    flexDirection: "row",
    //borderBottomWidth: 1,
    // borderColor: "#F2F2F2",
    fontSize: 12,
    alignItems: "center",
  },
  data: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBlockColor: "#D1D1D1",
    backgroundColor: "#F2F2F2",
    marginHorizontal: 2,
    marginVertical: 2,
    cursor: "pointer",
  },
  int_choose: {
    color: "red",
    fontSize: 12,
    borderBottomWidth: 2,
    borderColor: "#D1D1D1",
  },
  txtFontSize: { fontSize: 12, fontWeight: 600 },
  dropdown_Label: {
    paddingLeft: 2,
    paddingVertical: 10,
    textAlign: "left",
    fontSize: 13,
    backgroundColor: "#F2F2F2",
    color: "#848484",
  },
  txt_Label: {
    fontSize: 12,
    color: "#848484",
    flex: 1,
  },
  SpaceAround: {
    paddingLeft: 5,
  },
});
