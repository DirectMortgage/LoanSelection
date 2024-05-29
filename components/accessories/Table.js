import { StyleSheet, View } from "react-native";
import CustomText from "./CustomText";
import GridDropDown from "./GridDropDown";
import MultiSelect from "./MultiSelect";
import { InputBox } from "./CommomComponents";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import Icon from "react-native-vector-icons/Ionicons"; //FontAwesome
import {
  cleanValue,
  context,
  formatCurrency,
  formatPercentage,
} from "./CommonFunctions";
import { useContext, useState } from "react";
import ArrowSpinner from "./ArrowSpinner";

const TableNew = (props) => {
  const { contextDetails, setContextDetails } = useContext(context); //Get value from context
  const [ActiveTab, setActiveTab] = useState({});
  const [isShowToolTip, setIsShowToolTip] = useState(false);
  const {
    tableDetails,
    borrowerDetails = [],
    onchange,
    searchDetails,
    isVA,
  } = props;
  let tableDetails_ = tableDetails;
  if (tableDetails_ && tableDetails_[0]["columnName"] == "Loan Information")
    tableDetails_ = tableDetails_.filter(
      (e) =>
        (e["columnName"] != "Purchase Price" &&
          searchDetails["Loan Purpose"] != 1) ||
        (e["columnName"] != "" && searchDetails["Loan Purpose"] == 1)
    );
  else if (
    tableDetails_ &&
    tableDetails_[0]["columnName"] == "Product Type, Borrower & Location"
  )
    tableDetails_ = tableDetails_.filter(
      (e) =>
        (e["columnName"] != "Rent Ratio" && searchDetails["Occupancy"] != 3) ||
        (e["columnName"] != "" && searchDetails["Occupancy"] == 3)
    );
  if (borrowerDetails.length == 0) {
    tableDetails_ = tableDetails_?.filter((e) => e["columnName"] != "Borrower");
  }
  // tableDetails_ = undefined
  const [Column, setColumn] = useState({
    RateSection: !isVA && searchDetails["ddlRateMethod"] == "1",
    LoanPurpose: !(!isVA && searchDetails["Loan Purpose"] == "1"),
    Occupancy: !(!isVA && searchDetails["Occupancy"] == "3"),
    VA: false,
  });
  let MandatoryFields = [
    "FICO Score",
    "Occupancy",
    "Property Type",
    "Zip",
    "Loan Purpose",
    "Purchase Price",
    "Appraised Value",
    "Loan Amount 1st",
    "Lien Position",
    "Lender Fees In Rate",
  ];

  return (
    <>
      {isVA ? ( // VA Military
        <View style={[styles.table, { minHeight: "auto", width: "50%" }]}>
          <View style={[styles.header]}>
            <CustomText style={[styles.headerText]}>
              {"Borrower Name"}
            </CustomText>
            <CustomText style={[styles.headerText]}>{"VA Status"}</CustomText>
            <CustomText style={[styles.headerText]}> </CustomText>
          </View>
          {tableDetails_.map((VARow, index) => {
            return (
              <View key={index}>
                {VARow?.map((row, iIndex) => {
                  let isEven = iIndex % 2 === 0;

                  return (
                    // VA Military
                    VARow[0]["VA"] != 8 ||
                      (VARow[0]["VA"] == 8 && row["hint"] != "VAM") ? (
                      <View
                        key={iIndex}
                        style={[
                          styles.body,
                          {
                            borderBottomWidth:
                              row["VAStatus"].indexOf("Exempt") !== -1 ? 1 : 0,
                            borderColor: "#00000",
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.bodyText,
                            {
                              backgroundColor: isEven ? "#deebf7" : "#fff",
                              width: "33.333%",
                            },
                          ]}
                        >
                          <CustomText
                            style={{ fontSize: 12, color: "#6c757d" }}
                          >
                            {row["BorName"]}
                          </CustomText>
                        </View>
                        <View
                          style={[
                            styles.bodyText,
                            {
                              backgroundColor: isEven ? "#deebf7" : "#fff",
                              width: "33.333%",
                            },
                          ]}
                        >
                          <CustomText
                            style={{ fontSize: 12, color: "#6c757d" }}
                          >
                            {row["VAStatus"]}
                          </CustomText>
                        </View>
                        <View
                          style={[
                            styles.bodyText,
                            {
                              backgroundColor: isEven ? "#deebf7" : "#fff",
                              width: "33.333%",
                              paddingVertical: 0,
                            },
                          ]}
                        >
                          <GridDropDown
                            isValid={false}
                            label={""}
                            options={row["VADropdown"]}
                            value={tableDetails[index][iIndex]["VA"] || ""}
                            onSelect={(text) => {
                              onchange({
                                name: "VA",
                                value: text,
                                iIndex,
                                index,
                              });
                              // setColumn({
                              //   ...Column,
                              //   VA: text["label"] !== "None",
                              // });
                              setColumn((prevColumn) => {
                                return {
                                  ...prevColumn,
                                  VA: {
                                    ...prevColumn.VA,
                                    [index]: text["label"] !== "None",
                                  },
                                };
                              });
                            }}
                          />
                        </View>
                      </View>
                    ) : null
                  );
                })}
              </View>
            );
          })}
        </View>
      ) : (
        // Borrower and Other fields
        <View
          style={[styles.table, { borderRightWidth: !tableDetails_ ? 1 : 0 }]}
        >
          {
            tableDetails_?.length > 0 &&
            contextDetails["showPageSpinner"] === false ? (
              <>
                {tableDetails_?.map((row, index) => {
                  let isEven = index % 2 === 0;

                  return (
                    //
                    <View key={index}>
                      {row["columnName"] === "Borrower" ? ( // Borrower details
                        <>
                          {borrowerDetails?.map((Bor, iIndex) => {
                            let colorIndex = 0;
                            //if (iIndex != 0) colorIndex = 0;
                            return (
                              <View key={iIndex}>
                                {Bor?.map((Borr, jIndex) => {
                                  // colorIndex = colorIndex + jIndex;
                                  return (
                                    <View
                                      key={jIndex}
                                      style={[
                                        styles.body,
                                        Borr["columnName"] === "Email" && {
                                          borderBottomWidth: 1,
                                          borderColor: "black",
                                        },
                                      ]}
                                    >
                                      <CustomText
                                        style={[
                                          styles.bodyText,
                                          {
                                            backgroundColor:
                                              (jIndex + iIndex) % 2 === 0
                                                ? "#deebf7"
                                                : "#fff",
                                          },
                                        ]}
                                      >
                                        {Borr["columnName"]}
                                        {Borr["columnName"] === "First Name" &&
                                          contextDetails["OnloadProcess"] ==
                                            "PQ" &&
                                          iIndex != 0 && (
                                            <FontAwesomeIcon
                                              style={styles.icon}
                                              size={12}
                                              color="red"
                                              name="close"
                                              onPress={() => {
                                                row["iconOnPress"](
                                                  "Remove",
                                                  iIndex
                                                );
                                              }}
                                            />
                                            //row['icon']
                                          )}
                                      </CustomText>
                                      <View
                                        style={[
                                          styles.bodyText,
                                          {
                                            backgroundColor:
                                              (jIndex + iIndex) % 2 === 0
                                                ? "#deebf7"
                                                : "#fff",
                                          },
                                          {
                                            paddingVertical: 0,
                                            paddingHorizontal: 0,
                                            borderRightWidth: 1,
                                            borderWidth: ActiveTab[
                                              `${Borr["columnName"]}-${iIndex}`
                                            ]
                                              ? 1
                                              : 0,
                                            borderRightStyle: ActiveTab[
                                              `${Borr["columnName"]}-${iIndex}`
                                            ]
                                              ? "solid"
                                              : "dotted",
                                            borderRightColor: ActiveTab[
                                              `${Borr["columnName"]}-${iIndex}`
                                            ]
                                              ? "#000"
                                              : "#5e9cd3",
                                          },
                                        ]}
                                        onFocus={() => {
                                          setActiveTab({
                                            [`${Borr["columnName"]}-${iIndex}`]: true,
                                          });
                                        }}
                                        onBlur={() => {
                                          setActiveTab({
                                            [`${Borr["columnName"]}-${iIndex}`]: false,
                                          });
                                        }}
                                      >
                                        <InputBox
                                          keyboardType={
                                            Borr["columnName"] == "FICO Score"
                                              ? "numeric"
                                              : null
                                          }
                                          maxLength={
                                            Borr["columnName"] == "FICO Score"
                                              ? 3
                                              : null
                                          }
                                          disabled={
                                            contextDetails["OnloadProcess"] !=
                                              "PQ" &&
                                            (Borr["columnName"] !==
                                              "FICO Score" ||
                                              contextDetails["CRIDs"][iIndex] ==
                                                1)
                                          }
                                          overrideDisableColor={
                                            contextDetails["OnloadProcess"] !=
                                            "PQ"
                                          }
                                          validate={
                                            Borr["columnName"] == "FICO Score"
                                          }
                                          value={Borr[Borr["columnName"]] || ""}
                                          onChangeText={(text) => {
                                            onchange({
                                              name: Borr["columnName"],
                                              value: text,
                                              index: iIndex,
                                              iIndex: jIndex,
                                              action: "Borrower",
                                            });
                                          }}
                                          // value={}
                                        />
                                      </View>
                                    </View>
                                  );
                                })}
                              </View>
                            );
                          })}
                        </>
                      ) : row["columnType"] === "dropDown" ? ( // Desired Rate
                        <>
                          <View
                            key={index}
                            style={[
                              styles.body,
                              {
                                backgroundColor: isEven ? "#deebf7" : "#fff",
                              },
                            ]}
                          >
                            <View
                              style={[
                                {
                                  ...styles.bodyText,
                                  ...{
                                    backgroundColor: isEven
                                      ? "#deebf7"
                                      : "#fff",
                                    paddingVertical: 0,
                                    paddingHorizontal: 6,
                                    borderWidth: ActiveTab["ddlRateMethod"]
                                      ? 1
                                      : 0,
                                    borderRightStyle: ActiveTab["ddlRateMethod"]
                                      ? "solid"
                                      : "dotted",
                                    borderRightColor: ActiveTab["ddlRateMethod"]
                                      ? "#000"
                                      : "#5e9cd3",
                                  },
                                },
                              ]}
                              onFocus={() => {
                                setActiveTab({ ddlRateMethod: true });
                              }}
                              onBlur={() => {
                                setActiveTab({ ddlRateMethod: false });
                              }}
                            >
                              <GridDropDown
                                style={{ color: "#6c757d" }}
                                isValid={false}
                                label={""}
                                options={row["columnOption"]}
                                value={searchDetails["ddlRateMethod"] || ""}
                                onSelect={(text) => {
                                  // onchange({ name: "Desired Rate", value: text });
                                  onchange({
                                    name: "ddlRateMethod",
                                    value: text,
                                  });

                                  // setColumn({
                                  //   ...Column,
                                  //   RateSection: text["label"] === "Rate Formula",
                                  // });
                                }}
                                onBlur={() => {
                                  let formattedValue = formatPercentage(
                                    searchDetails["ddlRateMethod"],
                                    2
                                  );
                                  onchange({
                                    name: "ddlRateMethod",
                                    value: formattedValue,
                                  });
                                }}
                              />
                            </View>
                            <View
                              style={[
                                {
                                  ...styles.bodyText,
                                  ...{
                                    backgroundColor: isEven
                                      ? "#deebf7"
                                      : "#fff",
                                  },
                                  ...{
                                    paddingVertical: 0,
                                    paddingHorizontal: ["dropDown"].includes(
                                      row["type"]
                                    )
                                      ? 4
                                      : 8,
                                    borderWidth: ActiveTab[row["columnName"]]
                                      ? 1
                                      : 0,
                                    borderRightStyle: ActiveTab[
                                      row["columnName"]
                                    ]
                                      ? "solid"
                                      : "dotted",
                                    borderRightColor: ActiveTab[
                                      row["columnName"]
                                    ]
                                      ? "#000"
                                      : "#5e9cd3",
                                  },
                                },
                              ]}
                              onFocus={() => {
                                setActiveTab({ [row["columnName"]]: true });
                              }}
                              onBlur={() => {
                                setActiveTab({ [row["columnName"]]: false });
                              }}
                            >
                              {searchDetails["ddlRateMethod"] == 1 ? (
                                <InputBox
                                  onChangeText={(text) =>
                                    onchange({
                                      name: row["columnName"],
                                      value: text,
                                    })
                                  }
                                  value={searchDetails[
                                    row["columnName"]
                                  ]?.toString()}
                                  onBlur={() => {
                                    if (
                                      ["Currency", "Percentage"].includes(
                                        row["dataType"]
                                      )
                                    ) {
                                      let formattedValue =
                                        row["dataType"] === "Currency"
                                          ? formatCurrency(
                                              searchDetails[row["columnName"]]
                                            )
                                          : row["dataType"] === "Percentage"
                                          ? searchDetails[row["columnName"]]
                                            ? formatPercentage(
                                                searchDetails[
                                                  row["columnName"]
                                                ],
                                                4
                                              ) //`${searchDetails[row["columnName"]]}%`
                                            : ""
                                          : "0.00";

                                      onchange({
                                        name: row["columnName"],
                                        value: formattedValue,
                                      });
                                    }
                                  }}
                                  onFocus={() => {
                                    let val = cleanValue(
                                        searchDetails[row["columnName"]] || ""
                                      ),
                                      text =
                                        val == 0
                                          ? ""
                                          : val
                                              ?.toString()
                                              ?.replaceAll("%", "");
                                    onchange({
                                      name: row["columnName"],
                                      value: text,
                                    });
                                  }}
                                />
                              ) : (
                                <></>
                              )}
                            </View>
                          </View>
                        </>
                      ) : (
                        // Other Fields
                        <>
                          {!(
                            (row["hint"] === "RateFormula" &&
                              // !Column["RateSection"] &&
                              searchDetails["ddlRateMethod"] == 1) ||
                            // (row["hint"] == "Loan Purpose" &&
                            //   !Column["LoanPurpose"]) ||
                            (borrowerDetails?.length &&
                              row["columnName"] === "FICO Score")
                          ) ? (
                            <View
                              key={index}
                              style={[
                                row["type"] === "header"
                                  ? styles.header
                                  : styles.body,
                              ]}
                            >
                              <CustomText
                                style={[
                                  row["type"] === "header"
                                    ? styles.headerText
                                    : {
                                        ...styles.bodyText,
                                        ...{
                                          backgroundColor: isEven
                                            ? "#deebf7"
                                            : "#fff",
                                        },
                                      },
                                ]}
                              >
                                {row["hint"] == "Property Address" ? (
                                  <View style={{ flex: 3 }}>
                                    <CustomText
                                      style={{ fontSize: 12, color: "#6c757d" }}
                                    >
                                      Property Address
                                    </CustomText>
                                    <View
                                      style={{
                                        width: "50%",
                                        flexDirection: "row",
                                      }}
                                    >
                                      {/* {contextDetails["AddressValid"] == 0 && (
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
                                              {searchDetails["TBD"] == 0
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
                                            bottom: 4,
                                            backgroundColor:
                                              searchDetails["TBD"] == 0
                                                ? "#428bca"
                                                : "#d9534f",
                                          }}
                                          onPress={() => {
                                            let obj = {
                                              name: "TBD",
                                              value:
                                                searchDetails["TBD"] == 1
                                                  ? "0"
                                                  : "1",
                                            };
                                            onchange(obj);
                                          }}
                                        />
                                      )} */}
                                      {/* {contextDetails["PQLoanId"] !=
                                        contextDetails["LoanId"] && (
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
                                              {contextDetails["AddressValid"] ==
                                              0
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
                                            bottom: 4,
                                            backgroundColor:
                                              contextDetails["AddressValid"] ==
                                              0
                                                ? "#f0ad4e"
                                                : "#428bca",
                                          }}
                                          onPress={() => {
                                            let obj = {
                                              name: "ValidateAddress",
                                              value:
                                                contextDetails["AddressValid"],
                                            };
                                            onchange(obj);
                                          }}
                                        />
                                      )} */}
                                    </View>
                                  </View>
                                ) : row["columnName"] ==
                                  "Lender Fees In Rate" ? (
                                  <>
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        gap: 2,
                                        padding: 0,
                                      }}
                                    >
                                      <CustomText>
                                        Lender Fees In Rate
                                      </CustomText>
                                      {isShowToolTip ? (
                                        <View style={[styles.tooltip]}>
                                          <CustomText
                                            bold={true}
                                            style={{ marginBottom: 15 }}
                                          >
                                            Lender Fees Definition:
                                          </CustomText>
                                          <CustomText bold={true}>
                                            Fees In:
                                          </CustomText>
                                          <CustomText
                                            style={{ marginBottom: 10 }}
                                          >
                                            Underwriter Fees are Included in the
                                            Rate
                                          </CustomText>
                                          <CustomText bold={true}>
                                            Fees Out:
                                          </CustomText>
                                          <CustomText>
                                            Underwriter Fees are Not Included in
                                            the Rate
                                          </CustomText>
                                        </View>
                                      ) : (
                                        <></>
                                      )}

                                      <Icon
                                        name="information-circle"
                                        size={16}
                                        color="#6d6d6d"
                                        onPress={() => {}}
                                        onMouseEnter={() => {
                                          setIsShowToolTip(true);
                                        }}
                                        onMouseLeave={() => {
                                          setIsShowToolTip(false);
                                        }}
                                      />
                                    </View>
                                  </>
                                ) : (
                                  row["columnName"]
                                )}
                              </CustomText>

                              <View
                                testID="gridFields"
                                style={[
                                  row["type"] === "header"
                                    ? styles.headerText
                                    : {
                                        ...styles.bodyText,
                                        ...{
                                          backgroundColor: isEven
                                            ? "#deebf7"
                                            : "#fff",
                                        },
                                        ...{
                                          paddingVertical: 0,
                                          paddingHorizontal: 0,
                                          zIndex: -9,
                                          borderWidth: ActiveTab[
                                            row["columnName"]
                                          ]
                                            ? 1
                                            : 0,
                                          borderRightStyle: ActiveTab[
                                            row["columnName"]
                                          ]
                                            ? "solid"
                                            : "dotted",
                                          borderRightColor: ActiveTab[
                                            row["columnName"]
                                          ]
                                            ? "#000"
                                            : "#5e9cd3",
                                        },
                                      },
                                ]}
                                onFocus={() => {
                                  setActiveTab({ [row["columnName"]]: true });
                                }}
                                onBlur={() => {
                                  setActiveTab({ [row["columnName"]]: false });
                                }}
                              >
                                {row["type"] === "input" ? (
                                  <InputBox
                                    keyboardType={
                                      row["columnName"] == "FICO Score"
                                        ? "numeric"
                                        : null
                                    }
                                    maxLength={
                                      row["columnName"] == "FICO Score"
                                        ? 3
                                        : null
                                    }
                                    disabled={
                                      contextDetails["OnloadProcess"] != "PQ" &&
                                      row["columnName"] === "Rent Ratio"
                                    }
                                    overrideDisableColor={
                                      contextDetails["OnloadProcess"] != "PQ"
                                    }
                                    validate={
                                      MandatoryFields.includes(
                                        typeof row["columnName"] === "object"
                                          ? row["hint"]
                                          : row["columnName"]
                                      ) &&
                                      [
                                        "$0",
                                        "",
                                        0,
                                        null,
                                        undefined,
                                        "0",
                                      ].includes(
                                        searchDetails[row["columnName"]]
                                      )
                                    }
                                    onChangeText={(text) => {
                                      onchange({
                                        name: row["columnName"],
                                        value: text,
                                      });
                                    }}
                                    value={searchDetails[
                                      row["columnName"]
                                    ]?.toString()}
                                    onBlur={() => {
                                      let formattedValue =
                                        row["dataType"] === "Currency"
                                          ? formatCurrency(
                                              searchDetails[row["columnName"]]
                                            )
                                          : row["dataType"] === "Percentage"
                                          ? row["columnName"] ===
                                            "Rate Charge% | (Rebate%)"
                                            ? `${
                                                searchDetails[row["columnName"]]
                                              }%`
                                            : row["columnName"] === "CLTV"
                                            ? formatPercentage(
                                                searchDetails[
                                                  row["columnName"]
                                                ],
                                                2
                                              )
                                            : formatPercentage(
                                                searchDetails[row["columnName"]]
                                              )
                                          : searchDetails[row["columnName"]];
                                      if (
                                        row["columnName"] == "Purchase Price"
                                      ) {
                                        if (
                                          searchDetails["Appraised Value"] ==
                                            0 ||
                                          searchDetails["Appraised Value"] ==
                                            "$0"
                                        ) {
                                          onchange({
                                            name: "Appraised Value",
                                            value: formattedValue,
                                          });
                                        } else if (
                                          row["columnName"] == "Purchase Price"
                                        ) {
                                          onchange({
                                            name: "Purchase Price",
                                            value: formatCurrency(
                                              searchDetails[row["columnName"]],
                                              0
                                            ),
                                            action: "formatted",
                                          });
                                        }
                                      } else if (
                                        [
                                          "CLTV",
                                          "LTV",
                                          "Loan Amount 1st",
                                          "Loan Amount 2nd",
                                          "Appraised Value",
                                        ].includes(row["columnName"])
                                      ) {
                                        if (
                                          ["CLTV", "LTV"].includes(
                                            row["columnName"]
                                          )
                                        )
                                          onchange({
                                            name: row["columnName"],
                                            value: formatPercentage(
                                              searchDetails[row["columnName"]],
                                              2
                                            ),
                                            action: "formatted",
                                          });
                                        else
                                          onchange({
                                            name: row["columnName"],
                                            value: formatCurrency(
                                              searchDetails[row["columnName"]],
                                              0
                                            ),
                                            action: "formatted",
                                          });
                                      } else {
                                        onchange({
                                          name: row["columnName"],
                                          value: formattedValue,
                                        });
                                      }

                                      setActiveTab({
                                        [row["columnName"]]: false,
                                      });
                                    }}
                                    onFocus={(event) => {
                                      if (row["columnName"] != "Loan Program") {
                                        let val = cleanValue(
                                            searchDetails[row["columnName"]] ||
                                              ""
                                          ),
                                          text =
                                            val == 0
                                              ? ""
                                              : val
                                                  ?.toString()
                                                  ?.replaceAll("$", "");
                                        onchange({
                                          name: row["columnName"],
                                          value: text,
                                        });
                                      }
                                      setTimeout(() => {
                                        event.target.select();
                                      }, 50);
                                      // setActiveTab({[row["columnName"]]:true})
                                    }}
                                  />
                                ) : row["type"] === "dropDown" ? (
                                  <GridDropDown
                                    isValid={
                                      MandatoryFields.includes(
                                        row["columnName"]
                                      ) &&
                                      ["", 0, null, undefined, "0"].includes(
                                        searchDetails[row["columnName"]]
                                      )
                                    }
                                    label={""}
                                    name={row["columnName"]}
                                    options={row["Option"]}
                                    value={
                                      searchDetails[row["columnName"]] || ""
                                    }
                                    onSelect={(text) => {
                                      onchange({
                                        name: row["columnName"],
                                        value: text,
                                      });
                                      setColumn({
                                        ...Column,
                                        LoanPurpose:
                                          text["label"] === "Purchase",
                                      });
                                    }}
                                  />
                                ) : row["type"] === "multiSelect" ? (
                                  <MultiSelect
                                    label={""}
                                    name={row["columnName"]}
                                    options={row["Option"]}
                                    isValid={false}
                                    value={
                                      searchDetails[row["columnName"]] || ""
                                    }
                                    onSelect={(item_) => {
                                      onchange({
                                        name: row["columnName"],
                                        value: item_,
                                      });
                                    }}
                                    onFocus={() => {
                                      setActiveTab({
                                        [row["columnName"]]: true,
                                      });
                                    }}
                                    onBlur={() => {
                                      setActiveTab({
                                        [row["columnName"]]: false,
                                      });
                                    }}
                                  />
                                ) : (
                                  row["type"] === "header" && row["columnValue"]
                                )}
                              </View>
                            </View>
                          ) : (
                            <></>
                          )}
                        </>
                      )}
                    </View>
                  );
                })}
              </>
            ) : (
              //{(!tableDetails_ ||contextDetails['showPageSpinner'])&& (
              <View style={{ flex: 1 }}>
                <ArrowSpinner />
              </View>
            )
            // )}
          }
        </View>
      )}
    </>
  );
};
const styles = StyleSheet.create({
  table: {
    //width: 700,
    borderWidth: 1,
    borderColor: "#5e9cd3",
    borderStyle: "dotted",
    //borderRightWidth: 0,
    minHeight: 250,
  },
  header: {
    backgroundColor: "#5e9cd3",
    flexDirection: "row",
  },
  headerText: {
    color: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    width: "50%",
    borderRightWidth: 1,
    borderRightColor: "#fff",
    borderRightStyle: "dotted",
    fontSize: 12,
  },
  body: {
    flexDirection: "row",
  },
  bodyText: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    width: "50%",
    borderRightWidth: 1,
    borderRightColor: "#5e9cd3",
    borderRightStyle: "dotted",
    color: "#6c757d",
    fontSize: 12,
    height: "auto", //28,
  },
  icon: {
    right: 20,
    position: "absolute",
  },
  tooltip: {
    backgroundColor: "#dddddd",
    padding: 10,
    borderRadius: 5,
    position: "absolute",
    bottom: -3,
    left: 130,
    width: 195,
    zIndex: 9999,
  },
});

export default TableNew;
