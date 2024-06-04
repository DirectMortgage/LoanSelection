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

    let queryString = queryStringToObject();
    let EmpNum = await handleGetSessionData(queryString["SessionId"], "empnum");
    let iLoanId = await handleGetEmpPreQualLoan(EmpNum);
    let LoanId = queryString["LoanId"] || iLoanId;
    let isLocked = await IsLockedLoan(LoanId);
    if (isLocked == 1) {
      setHeaderInfo({
        name: `${LoanId} - Interest Rate Lock Confirmation`,
        icon: false,
      });
    }
    let wholeSaleRights = await handleWholeSaleRights(EmpNum);
    setContextDetails((prevContext) => {
      return {
        ...prevContext,
        ...queryString,
        queryString,
        IsLocked: isLocked,
        LoanId,
        EmpNum,
        wholeSaleRights :wholeSaleRights||0,
        isLoadedInsideiFrame:
          window.parent.location.href != window.location.href,
        isPublicRunScenario:
          window.parent.location.href.indexOf("runscenario") != -1,
      };
    });
  };
  const handleLock = (obj) => {
    SetStatus({ ...Status, ...obj });
  };

  return (
    <View style={{ width: "100%", alignItems: "center", flex: 1 }}>
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
        Status["ChangeLoanProgram"] ? (
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
          <View style={{ flex: 1, backgroundColor: "#dddddd", width: "100%" }}>
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
