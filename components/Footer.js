import { StyleSheet, View } from "react-native";
import CustomText from "./accessories/CustomText";
import { Button } from "./accessories/CommomComponents";
import DropDownButton from "./accessories/DropDownButton";
import { useContext, useRef, useState } from "react";
import { web, android, ios } from "./accessories/Platform";
import { context, handleAPI } from "./accessories/CommonFunctions";

const Footer = () => {
  const { contextDetails, setContextDetails } = useContext(context); //Get value from context

  const [isMenuOpen, setMenuOpen] = useState({ bottom: false, top: false });
  const [bottomMenuPosition, setBottomMenuPosition] = useState({
    top: 0,
    left: 0,
    opacity: 0,
  });
  const topMenuUseref = useRef();
  const handleRightNavOpen = () => {
    topMenuUseref.current.measure((_fx, _fy, _w, h, _px, py) => {
      setBottomMenuPosition({
        top: py + (web ? -440 : 50),
        left: _px + (web ? 10 : -195),
        opacity: 1,
      });
    });
  };
  const handleMenu = () => {
    setMenuOpen({ ...isMenuOpen, top: !isMenuOpen["top"] });
  };
  const handleSave= ()=>{
    let obj = {
      LoanID: contextDetails["LoanId"],
      SaveJson: JSON.stringify(contextDetails["InputData"] || ""),
    };
   handleAPI({
    name: "LoanBoardingSave",
    params: obj,
  }).then((response) => {
    setContextDetails((prevContext) => {
      return {
        ...prevContext,
        enableFooterSave: false,
      };
    });
  });
}
  // const menuOption = [
  //   {
  //     Name: "FNM 3.2 File",
  //     onPress: () => {
  //       // handleLogOut_();
  //       handleMenu();
  //     },
  //     icon: "file-upload",
  //     from: "Material",
  //     size: 18,
  //   },
  //   {
  //     Name: "Use Last Run",
  //     onPress: () => {
  //       handleMenu();
  //     },
  //     icon: "keyboard-backspace",
  //     from: "Material",
  //     size: 18,
  //   },
  //   {
  //     Name: "Start With a Fresh Run",
  //     onPress: () => {
  //       handleMenu();
  //     },
  //     icon: "file",
  //     from: "FontAwesome",
  //     size: 16,
  //   },
  //   {
  //     Name: "Search for a Loan or Loan Prospect",
  //     onPress: () => {
  //       handleMenu();
  //     },
  //     icon: "search",
  //     from: "FontAwesome",
  //     size: 16,
  //   },
  //   {
  //     Name: "Get Title Pricing",
  //     onPress: () => {
  //       handleMenu();
  //     },
  //     icon: "attach-money",
  //     from: "MaterialIcons",
  //     size: 20,
  //   },
  //   {
  //     Name: "Initial Fee Worksheet",
  //     onPress: () => {
  //       handleMenu();
  //     },
  //   },
  //   {
  //     Name: "Settings",
  //     onPress: () => {
  //       handleMenu();
  //     },
  //     icon: "settings",
  //     from: "MaterialIcons",
  //     size: 18,
  //   },
  //   {
  //     Name: "Save window size and position",
  //     onPress: () => {
  //       handleMenu();
  //     },
  //   },
  //   {
  //     Name: "Rate Lock Form - Old",
  //     onPress: () => {
  //       handleMenu();
  //     },
  //   },
  //   {
  //     Name: "Rate Locks & Scenarios - Old",
  //     onPress: () => {
  //       handleMenu();
  //     },
  //   },
  // ];
  const menuOption = [
    {
      Name: "FNM 3.2 File",
      onPress: () => {
        setContextDetails((prevContext) => {
          return {
            ...prevContext,
            currentProcess: "FNMImport",
          };
        });
        handleMenu();
      },
      icon: "FNM",
      from: "Material",
      size: 18,
    },
    {
      Name: "Use Last Run",
      onPress: () => {
        handleUseLastRun();
        handleMenu();
        setContextDetails((prevContext) => {
          return {
            ...prevContext,
            UseLastRunInfo: true,
          };
        });
      },
      icon: "UseLastRun",
      from: "Ionicons",
      size: 18,
    },
    {
      Name: "Start With a Fresh Run",
      onPress: () => {
        handleStartWithFreshRun();
        handleMenu();
      },
      icon: "FreshRun",
      from: "FontAwesome",
      size: 16,
    },

    {
      Name: (
        <View>
          <CustomText
            style={{
              fontSize: 12,
              //marginLeft: 10,
              marginBottom: isMenuOpen["Prospect"] ? 17 : 0,
              fontWeight: 200,
            }}
            onPress={() => {
              handleMenuSearch("Prospect");
            }}
          >
            Search for a Loan or Loan Prospect
          </CustomText>
          {isMenuOpen["Prospect"] && (
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <View style={{ width: "83%" }}>
                <InputBoxOrdinary
                  label={"Search Criteria"}
                  name={"Prospect"}
                  disabled={false}
                  onChangeText={(e) => {
                    handleMenuSearch("Input", "ProspectInfo", e);
                  }}
                  Margin={true}
                ></InputBoxOrdinary>
              </View>
              {/* <FontAwesome
                style={{ top: 15, right: 24 }}
                size={16}
                color={"black"}
                name={"search"}
                onPress={() => {
                  handleMenuSearch("Search", "ProspectInfo");
                }}
              /> */}
              <View>
                <Button
                  title={
                    <CustomText
                      style={{ color: "#FFFFF", fontSize: 11, fontWeight: 200 }}
                    >
                      Go
                    </CustomText>
                  }
                  style={{
                    padding: 11,
                    fontSize: 10,

                    backgroundColor: "#428bca",
                  }}
                  onPress={() => {
                    handleMenuSearch("Search", "ProspectInfo");
                  }}
                ></Button>
              </View>
            </View>
          )}
        </View>
      ),
      onPress: () => {
        // handleMenuSearch("Prospect");
      },
      icon: "Search",
      from: "FontAwesome",
      size: 16,
      SearchField: true,
    },

    {
      Name: (
        <View>
          <CustomText
            style={{
              fontSize: 12,
              // marginLeft: 10,
              marginBottom: isMenuOpen["CreateNewScenario"] ? 17 : 0,
            }}
            onPress={() => {
              handleMenuSearch("CreateNewScenario");
            }}
          >
            Create New Scenario from Existing Loan
          </CustomText>
          {isMenuOpen["CreateNewScenario"] && (
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <View style={{ width: "83%" }}>
                <InputBoxOrdinary
                  label={"Search Criteria"}
                  name={"CreateNewScenario"}
                  disabled={false}
                  onChangeText={(e) => {
                    handleMenuSearch("Input", "CreateNewScenarioInfo", e);
                  }}
                  Margin={true}
                ></InputBoxOrdinary>
              </View>

              <View>
                <Button
                  title={
                    <CustomText
                      style={{ color: "#FFFFF", fontSize: 11, fontWeight: 200 }}
                    >
                      Go
                    </CustomText>
                  }
                  style={{
                    padding: 11,
                    fontSize: 10,

                    backgroundColor: "#428bca",
                  }}
                  onPress={() => {
                    handleMenuSearch("Search", "CreateNewScenarioInfo");
                  }}
                ></Button>
              </View>
            </View>
          )}
        </View>
      ),
      onPress: () => {
        // handleMenuSearch("Prospect");
      },
      icon: "CreateNewScenerio",
      from: "MaterialIcons",
      size: 16,
      SearchField: true,
    },
    {
      Name: "Get Title Pricing",
      onPress: () => {
        handleGetTitlePricing();
        handleMenu();
      },
      icon: "TitlePricing",
      from: "MaterialIcons",
      size: 20,
    },
    {
      Name: "Initial Fee Worksheet",
      onPress: () => {
        handleFeeWorkSheet();
        handleMenu();
      },
    },
    {
      Name: "Settings",
      onPress: () => {
        handleMenu();
        handleSetting("Modal");
      },
      icon: "Settings",
      from: "MaterialIcons",
      size: 18,
    },
    {
      Name: "Save window size and position",
      onPress: () => {
        handleMenu();
      },
    },
    {
      Name: "Loan Selection - Old",
      onPress: () => {
        let url = `../../../BorrowerApplication/Presentation/Webforms/LoanProduct_Selection_Lock.aspx?SessionID=${contextDetails['SessionId']}&OnloadProcess=PQ&HideNav=1&RemHeadFootr=0&FNM=undefined`
      window.open(url, "PQ", "width=1200,height=900,resizable=1,scrollbars=1");

        handleMenu();
      },
    },
  ];
  return (
    <View style={[styles.footerBackground, { color: "white" }]}>
      <View
        style={[
          styles.footerMenu,
          { color: "white", justifyContent: "center" },
        ]}
        ref={topMenuUseref}
      >
        <Button
          title={
            <CustomText
              bold={false}
              style={{ fontSize: 13, color: "#fff", fontWeight: 200 }}
            >
              Menu
            </CustomText>
          }
          style={[styles["btn"], { borderRadius: 0 }]}
          onPress={() => {
            handleMenu();
            handleRightNavOpen();
          }}
        />
        <DropDownButton
          listOption={menuOption}
          Open={isMenuOpen["top"]}
          MenuPosition={bottomMenuPosition}
          handleOpen={handleMenu}
        />
      </View>
      <View style={[styles.footerSave, { color: "white" }]}>
        <Button
        isDisable={!contextDetails['enableFooterSave']}
        title={
          <CustomText
            style={{
              color: "#FFFFF",
              fontSize: 11,
              fontWeight: 200,
            }}
          >
            Save
          </CustomText>
        }
        style={[
          styles["btn"],
          styles["cardShadow"],
          {
            borderRadius: 3,
            paddingVertical: 6,
            paddingHorizontal: 15,
            borderWidth: 2,
            borderColor: !contextDetails['enableFooterSave']
              ? "#c1c0c0"
              : "#0d6ac5",
          },
        ]}
          onPress={() => {
          handleSave()
          }}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  footerSave: {
    // fontSize: 40,
    textAlign: "center",
    justifyContent: "center",
    width: "50%",
  },
  btn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignSelf: "flex-end",
    fontSize: 12,
    justifyContent: "center",
  },
  footerBackground: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    height: 59,
    width: "100%",
    // alignItems: "center",
    // justifyContent: "center",
     bottom: 0,
    position:'fixed'
  },
  cardShadow: {
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
});
export default Footer;
