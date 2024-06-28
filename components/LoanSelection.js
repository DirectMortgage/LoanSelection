import { useContext, useEffect, useState } from "react";
import Header from "./Header";
import SearchCriteria from "./SearchCriteria";
import LoanProducts from "./LoanProducts";
import Footer from "./Footer";
import { View } from "react-native-web";
import CustomText from "./accessories/CustomText";
import {
  IsLockedLoan,
  context,
  handleAPI,
  handleGetEmpPreQualLoan,
  handleGetSessionData,
  handleMOSearchFlow,
  handleWholeSaleRights,
  queryStringToObject,
} from "./accessories/CommonFunctions";
import LockConfirmation from "./LockConfirmation";
import ArrowSpinner from "./accessories/ArrowSpinner";

const LoanSelection = (props) => {
  const { contextDetails, setContextDetails } = useContext(context); //Get value from context
  const [Products, setLoanProducts] = useState({});
  const [Status, SetStatus] = useState({
    Searching: false,
    LoanLocked: false,
    ChangeRate: false,
    FloatDown: false,
    ChangeProgram: false,
    ReLock: false,
  });
  const [searchDetails, setSearchDetails] = useState({});
  const [headerInfo, setHeaderInfo] = useState({
    name: "Rate Lock and Loan Selection Form",
    icon: true,
  });
  useEffect(() => {
    PageLoad();
  }, []);
  const PageLoad = async () => {
    try {
      let htmlLoader = parent.window.document.getElementsByClassName("loader");
      if (htmlLoader.length > 0) {
        htmlLoader[0].style.display = "none";
      }
    } catch (error) {
      console.log("Error while hiding production spinner!!");
    }
    let queryString = {},
      EmpNum = 0,
      iLoanId = 0,
      LoanId = 0,
      MOSearchFlow = 0,
      isLocked = 0,
      wholeSaleRights = 0;
    queryString = queryStringToObject();
    EmpNum = await handleGetSessionData(queryString["SessionId"], "empnum");
    if (EmpNum != "Output" && EmpNum.length != 0) {
      iLoanId = await handleGetEmpPreQualLoan(EmpNum);
      MOSearchFlow = await handleMOSearchFlow(0, iLoanId, "Get");
      //if (EmpNum == "Output" || EmpNum.length == 0) MOSearchFlow = "[]";
      LoanId = queryString["LoanId"] || iLoanId;
      isLocked = await IsLockedLoan(LoanId);
      if (isLocked == 1) {
        setHeaderInfo({
          name: `${LoanId} - Interest Rate Lock Confirmation`,
          icon: false,
        });
      }
      wholeSaleRights = await handleWholeSaleRights(EmpNum);
    }
    setContextDetails((prevContext) => {
      return {
        ...prevContext,
        ...queryString,
        queryString,
        IsLocked: isLocked,
        LoanId,
        EmpNum,
        MOSearchFlow:
          JSON.parse(MOSearchFlow || "{}")["Table"]?.[0]?.[
            "Run_Pricing_IN_MO"
          ] || false,
        wholeSaleRights: wholeSaleRights || 0,
        isLoadedInsideiFrame:
          window.parent.location.href != window.location.href,
        isPublicRunScenario:
          window.parent.location.href.indexOf("runscenario") != -1,
          showPageSpinner: window.parent.location.href.indexOf("runscenario") == -1
      };
    });
  };
  const handleLock = (obj) => {
    SetStatus({ ...Status, ...obj });
  };

  return (
    <View
      style={{ width: "100%", alignItems: "center" }}
      testID={"viewWrapper"}
    >
      {/* <Header name={headerInfo["name"]} icon={headerInfo["icon"]} /> */}
      {(contextDetails["IsLocked"] == 1 || Status["LoanLocked"]) &&
      !Status["ChangeRate"] &&
      !Status["FloatDown"] &&
      !Status["ChangeLoanProgram"] &&
      (contextDetails["isLoadedInsideiFrame"] ||
        contextDetails["standalone"] == 1 ||
        __DEV__) ? (
        <View style={{ width: "100%" }}>
          <LockConfirmation handleLock={handleLock} />
        </View>
      ) : contextDetails["IsLocked"] == 0 ||
        Status["ChangeRate"] ||
        Status["FloatDown"] ||
        Status["ChangeLoanProgram"] ||
        (contextDetails["isPublicRunScenario"] &&
          contextDetails["IsLocked"] != 1) ? (
        <>
          <SearchCriteria
            handleLoanProducts={setLoanProducts}
            handleStatus={handleLock}
            handleSearch={setSearchDetails}
            Status={Status}
          />
          {Products["DataOut"] !== undefined && !Status["Searching"] && (
            <View style={{ marginBottom: 10, width: "100%" }}>
              <LoanProducts
                Data={Products}
                SearchInfo={contextDetails["InputData"] || []}
                handleLock={handleLock}
                handleLoanProducts={setLoanProducts}
              />
            </View>
          )}
        </>
      ) : (
        <>
          <View
            style={{
              height: "90vh",
              backgroundColor: "#dddddd",
              width: "100%",
            }}
          >
            <ArrowSpinner size={50} />
          </View>
        </>
      )}
      {/* {(contextDetails["IsLocked"] == 0 ||
        contextDetails["ChangeRate"] ||
        contextDetails["FloatDown"]) &&
      contextDetails["RemHeadFootr"] == 0 ? ( */}
      <>
        <View
          style={{
            backgroundColor: "#307ecc",
            width: "100%",
            padding: 8,
            paddingLeft: 21,
            zIndex: -1,
            marginBottom: 60,
          }}
        >
          <CustomText style={{ color: "white" }}>Page Bottom</CustomText>
        </View>
        {/* {contextDetails["IsLocked"] == 0 &&
            contextDetails["RemHeadFootr"] == 0 && <Footer />} */}
      </>
      {/* // ) : (
      //   <></>
      // )} */}
    </View>
  );
};

export default LoanSelection;
