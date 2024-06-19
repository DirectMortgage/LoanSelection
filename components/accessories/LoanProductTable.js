import { StyleSheet, View, Dimensions } from "react-native";
import CustomText from "./CustomText";
import RateBandTable from "./RateBandTable";
import { Button } from "./CommomComponents";
import XMLParser from "react-xml-parser";
import { useContext, useEffect, useRef, useState } from "react";
import PITI from "../PITI";
import {
  cleanValue,
  formatCurrency,
  handleAPI,
  context,
  IsPreQualLoan,
  formatAmount,
  fnGetIndex,
  handleConstructXML,
  handleAPI_,
  handleSelectQuote,
  handleGetUpdatedPaymentSection,
} from "./CommonFunctions";
import AdjustmentDetails from "../AdjustmentDetails";
import LenderRank from "../LenderRank";
import Swatch from "./Swatch";
import LockRate from "../LockRate";
import NotifyAlert from "./NotifyAlert";
import WebViewiFrame from "./WebViewiFrame";
import BorrowerInfo from "../BorrowerInfo";
import { Fragment } from "react";
import { Image } from "react-native-web";
import { Modal } from "react-native-web";
import AddressValidation from "./AddressValidation";
import AdjustmentDetailsNew from "../AdjustmentDetailsNew";
import SwatchOutlined from "./SwatchOutlined";
const LoanProductTable = (props) => {
  const {
    LoanProducts,
    ProductClick,
    VisibleRateBand,
    RateBandClick,
    ActiveRate,
    RawRateBand,
    LockPeriodChange,
    RankByChange,
    PaymentDetails,
    handleProductInfo,
    handleLenderComp,
    LenderComp,
    LoanID,
    handleRunAUS,
    handleLock,
    handleLoanProducts,
    handleReset,
  } = props;
  let GloLoanId = 0,
    GloCustId = 0;
  //console.log("loan Product ==> ", LoanProducts);
  const { contextDetails, setContextDetails } = useContext(context); //Get value from context

  const [Open, setOpen] = useState({
    PITI: false,
    LockRate: false,
    BorInfo: false,
  });

  const [PaymentInfo, setPayment] = useState([]);
  const myViewRef = useRef(null);
  const btnRefFloatClose = useRef(null);
  const btnRefFloatProceed = useRef(null);

  useEffect(() => {
    const handleUpdateSize = () => {
      const isMobileWeb = Dimensions.get("window").width <= 650;
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          isMobileWeb,
        };
      });
    };
    window.addEventListener("resize", handleUpdateSize);
    return () => window.removeEventListener("resize", handleUpdateSize);
  }, []);
  const handleKeyDown = (event) => {
    if (event.keyCode === 32) {
      event.preventDefault(); // Prevent scrolling the page when space bar is pressed
      if (document.activeElement === btnRefFloatProceed.current)
        btnRefFloatProceed.current.click();
      else if (document.activeElement === btnRefFloatProceed.current) {
        btnRefFloatProceed.current.click();
      }
    }
  };
  const handleLayout = () => {
    if (Object.keys(RawRateBand).length == 0)
      myViewRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const handleViewPITI = async (type, obj) => {
    let IsMIProcessing = 0;
    let { LPA_CommonData, LineId } = obj;
    if (obj != "") {
      let Product = LoanProducts.filter(
        (e) => e["LineId"] == LineId && e["Id"] != -1
      );
      Payment = Product[0]["PaymentWithoutAddons"];

      if (ActiveRate?.[LPA_CommonData] || false)
        LineId = ActiveRate[LPA_CommonData]["LineId"];
      let Row = PaymentDetails.filter((e) => e["LineId"] == LineId);
      let {
        PropFin,
        PropHOA,
        PropHazard,
        PropMI,
        PropOtherI,
        Total,
        PropOther,
        PropRETaxes,
        Payment,
      } = Row[0];
      if (
        Object.keys(ActiveRate).length > 1 &&
        ActiveRate[LPA_CommonData] != undefined
      ) {
        let { IntRate } = ActiveRate[LPA_CommonData];
        let { RateBandsRows } = RawRateBand[LPA_CommonData];
        let RateBand = RateBandsRows[LineId]?.filter(
          (e) => e["IntRate"] == IntRate
        );
        Payment = RateBand[0]["MonthlyPayment"];
      }
      let { Run } = Product[0];
      let response = await handleGetUpdatedPaymentSection(Run, LineId);
      let UpdatedPaymentSectionObj = {};
      try {
        UpdatedPaymentSectionObj =
          JSON.parse(
            JSON.parse(response)?.["Table"]?.[0]?.["PaymentJson"] || "[]"
          )?.["PaymentDetails"]?.[0] || {};
        PropMI = UpdatedPaymentSectionObj["PropMI"] || "0";
        IsMIProcessing = UpdatedPaymentSectionObj["IsMIProcessing"] || "0";
      } catch (error) {
        console.error("Error in handleGetUpdatedPaymentSection =>", error);
      }
      let Result = {
        Payment,
        PropFin,
        PropHOA,
        PropHazard,
        PropMI,
        PropOtherI,
        Total,
        PropOther,
        PropRETaxes,
        IsMIProcessing,
      };
      setOpen({ ...Open, PITI: type, Result: Result, LineId, LPA_CommonData });
    } else {
      setOpen({ ...Open, PITI: type }); // false
    }

    //console.log("PaymentDetails ==>", PaymentInfo);
  };
  const handleSavePITI = (result) => {
    let obj = {
      LineId: result["LineId"],
      LoanId: LoanID,
      HazIns: cleanValue(result["PropHazard"]),
      RETax: cleanValue(result["PropRETaxes"]),
      HOADues: cleanValue(result["PropHOA"]),
      Other: cleanValue(result["PropOther"]),
      TotalPITI: cleanValue(result["Total"]),
    };

    let val = {
      PropHOA: cleanValue(result["PropHOA"]),
      PropHazard: cleanValue(result["PropHazard"]),
      PropOther: cleanValue(result["PropOther"]),
      PropRETaxes: cleanValue(result["PropRETaxes"]),
      PropMI: cleanValue(result["PropMI"]),
      PropFin: cleanValue(result["PropFin"]),
    };
    handleProductInfo(val, "PaymentDetails");

    handleAPI({
      name: "SavePaymentDetails",
      params: obj,
    }).then((response) => {
      // console.log("SavePaymentDetails successful !!!");
      setOpen({ ...Open, PITI: false });
    });
  };
  const handleAdjustmentDetails = (type, result) => {
    //console.log("handleAdjustmentDetails ====>", result);
    if (result == "") {
      setOpen({ ...Open, Adjustments: false });
      return;
    }
    let { LineId, LockPeriodID, CommonId, Total, LenderComp } = result;
    let changeRateXML = "",
      Addons = [],
      selectedRate = {},
      ProfitMargin = {};
    try {
      Addons = RawRateBand[CommonId]?.["Addons"]?.[LineId] || [];
      selectedRate = ActiveRate[ActiveRate?.[CommonId]?.["LineId"]] || {};
      ProfitMargin = { Addons, selectedRate, Total, LenderComp };
    } catch (error) {
      console.error("Error in handleAdjustmentDetails ==>", error);
    }
    if (contextDetails["ChangeRate"] || contextDetails["FloatDown"]) {
      if (!contextDetails["changeRateXML"]) {
        changeRateXML = handleConstructXML(contextDetails["ChangeRateJson"]);
        setContextDetails((prevContext) => {
          return {
            ...prevContext,
            changeRateXML: changeRateXML,
          };
        });
      } else {
        changeRateXML = contextDetails["changeRateXML"];
      }
    }

    let obj = {
      LineId,
      IntRate: result["Row"]["IntRateID"],
      LockPeriod: LockPeriodID,
      ChangeRateXML: changeRateXML,
    };
    handleAPI_({
      name: "GetAdjustmentDetails_",
      params: obj,
    }).then((response) => {
      response = JSON.parse(response)["DataOut"];
      // console.log("GetAdjustmentDetails ===>", response);

      response[0]["RootObjects"][0]["Rate"] = result["Row"]["IntRate"];
      response[0]["RootObjects"][0]["LockDay"] =
        result["Row"]["LockPeriodDays"];

      response.push({ ProfitMargin: ProfitMargin || [] });

      setOpen({ ...Open, Adjustments: true, Result: response });
    });
  };
  const handleLenderRank = (type, result, event) => {
    if (event != "CheckBox") {
      let Ids = result["LineIds"];
      let rows = [];
      let Rate = result["Rate"];
      for (let index = 0; index < Ids.length; index++) {
        let Row = result["Row"][Ids[index]].filter((e) => e["IntRate"] == Rate);
        Row[0]["LineId"] = Ids[index];
        Row[0]["LineIds"] = Ids;
        Row[0]["LenderName"] =
          result["RootObjects"][Ids[index]]["LenderLnProgName"];
        rows.push(Row[0]);
      }
      setOpen({ ...Open, LenderRank: type, Result: rows });
    } else {
      // let Restricted = false,
      //   count = 0;
      // for (let index = 0; index < Ids.length; index++) {
      //   if (!Open[Ids[index]]) {
      //     count++;
      //   }
      // }
      // if (count != 0)
      setOpen({
        ...Open,
        [result["LineId"]]: !Open[result["LineId"]],
        LenderRank: type,
      });
    }
    // console.log("handleLenderRank ===>", rows);
  };
  const handleLockRate = async (obj, action, requestFrom, LineId_) => {
    let SelectFlag = 0,
      // LineId = LineId_ || typeof(obj) == 'object' ? obj['LineId'] :obj,
      LineId = LineId_,
      IsSearchedLoan = 0,
      LockRateDetails = {};

    if (requestFrom == "Parent") {
      let {
        Name,
        LenderLnProgName,
        LockDays,
        LockPeriodDesc,
        LockPeriodID,
        InterestRate,
        iInterestRate, // with addons rate
        FinalAmt,
        FinalPoint,
        IntRateID,
        RateSheetId,
        BasePoints,
        BaseAmount,
      } = obj;

      if (contextDetails["ChangeRate"] || contextDetails["ChangeLoanProgram"]) {
        RateSheetId = contextDetails["RateSheetId"];
      }
      // if (!obj["LPA_CommonData"])
      //   LineId =
      //     contextDetails["ActiveLineId"]?.[obj["LPA_CommonData"]]?.["Id"];
      //  ActiveRate[obj["LPA_CommonData"]]["LineId"];
      // else LineId = contextDetails["ActiveLineId"]?.[obj]?.["Id"];
      // if (!obj["LPA_CommonData"])
      //   LineId = ActiveRate[obj["LPA_CommonData"]]["LineId"];
      // else LineId = obj;

      LockRateDetails[LineId] = {
        Name,
        LenderLnProgName,
        LockExpDate: LockDays,
        LockPeriods: LockPeriodDesc.split(" Days")[0],
        LockPeriodID,
        InterestRate,
        BasePoints: BasePoints,
        IntRateID,
        IntRate: iInterestRate, // with addons rate
        BaseAmount,
        finalAmount: FinalAmt,
        finalPoints: FinalPoint,
        finalRate: iInterestRate,
        LineId,
        RateSheetName: RateSheetId,
        CompanyName: contextDetails["CompName"],
      };

      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          RateSheetId,
          LockRateDetails: LockRateDetails,
          LockingScenario: prevContext["ChangeRate"]
            ? "Change Interest Rate"
            : prevContext["FloatDown"]
            ? "Float Down Interest Rate"
            : prevContext["ChangeLoanProgram"]
            ? "Change Loan Program"
            : "Select Loan Program",
          LockingFrom: prevContext["ChangeRate"]
            ? "ChangeRate"
            : prevContext["FloatDown"]
            ? "FloatDown"
            : prevContext["ChangeLoanProgram"]
            ? "ChangeLoanProgram"
            : "PQ",
        };
      });
    }
    let {
      SessionId,
      CompNum,
      LO,
      EmpNum,
      LoanId,
      PageFrom,
      CloseDocs,
      ChangeRate,
    } = contextDetails;

    if (action === "Modal") {
      // Which includes the validation while opening the modal
      if (Open["LockRate"]) {
        setOpen({ ...Open, LockRate: !Open["LockRate"], obj: LineId });
        if (Open["LockRate"]) return;
      }
      if (contextDetails["pqLoan"] == 1) {
        LoanId = contextDetails["parentQueryString"]["LoanId"];
      }
      let checkPreQual = await IsPreQualLoan(LoanId, 0);
      let isPreQual = await IsPreQualLoan(LoanId, EmpNum);
      let showSSNPrompt = false;
      if (contextDetails["SSN"]?.length) {
        contextDetails["SSN"].forEach((e) => {
          if (e.length < 8) showSSNPrompt = true;
        });
      }
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          isPreQual,
          checkPreQual,
          showSSNPrompt,
          currentLockingLineId: LineId,
        };
      });
      if (isPreQual == -1 || isPreQual == -2) {
        //1516
      }
      CloseDocs = 0; // for testing
      if (ChangeRate && CloseDocs == 1) {
        //1522
      } else {
        fnLockConfirmationModalValidation(checkPreQual, LineId);
      }
    } else {
      if (
        contextDetails["OnloadProcess"] == "PQ" ||
        (contextDetails["showSSNPrompt"] && action.indexOf("Lock") != -1)
      ) {
        let modalFor =
          contextDetails["OnloadProcess"] == "PQ"
            ? "PQ"
            : contextDetails["showSSNPrompt"] && action.indexOf("Lock") != -1
            ? "SSN"
            : "PQ";
        handleBorInfoModalForLock(action, LineId, "Modal", {}, modalFor);
      } else handleLockAfterBorInfoValidation(action, LineId);
    }
  };

  const handleBorInfoModalForLock = async (
    action,
    LineId,
    Type,
    obj,
    modalFor
  ) => {
    if (Type == "Modal") {
      setOpen({
        ...Open,
        BorInfo: !Open["BorInfo"],
        LockRate: false,
        action,
        LineId,
        modalFor,
      });
    } else if (Type == "OnChange") {
      let { name, value, index = 0 } = obj;

      let additionalObj = {};
      if (["FirstName", "LastName", "SSN", "TBD"].includes(name)) {
        if (name == "SSN") {
          if (value.length == 9) {
            let a = value.substring(0, 3);
            let b = value.substring(3, 5);
            let c = value.substring(5, 9);
            value = `${a}-${b}-${c}`;
          } else {
            value = value
              .replaceAll("-", "")
              .replaceAll(".", "")
              .replaceAll("/", "")
              .replaceAll(",", "");
          }
        }

        setContextDetails((prevState) => {
          const newDataIn = [...prevState.InputData.DataIn];
          const BorrInfo = [...newDataIn[1].BorrInfo];
          const LoanSearchInfo = [...newDataIn[4].LoanSearchInfo];
          BorrInfo[index] = {
            ...BorrInfo[index],
            [name]: value,
          };
          if (name == "TBD") {
            LoanSearchInfo[0] = {
              ...LoanSearchInfo[0],
              [name]: value,
            };
          }
          newDataIn[1] = {
            ...newDataIn[1],
            BorrInfo: BorrInfo,
          };
          newDataIn[4] = {
            ...newDataIn[4],
            LoanSearchInfo: LoanSearchInfo,
          };
          return {
            ...prevState,
            InputData: {
              ...prevState.InputData,
              DataIn: newDataIn,
            },
          };
        });
      } else {
        if (name == "SubjectZip" && value.length === 5) {
          additionalObj = await handleAPI({
            name: "GetZipCodeDetails",
            params: { Zipcode: value },
          }).then((response) => {
            response = JSON.parse(response)["Table"][0];
            let { city, stateoption } = response;
            let obj = {
              SubjectCity: city,
              SubjectState: stateoption,
            };
            return obj;
          });
        }

        setContextDetails((prevState) => {
          const newDataIn = [...prevState.InputData.DataIn];
          const propertyInfo = [...newDataIn[2].PropertyInfo];
          propertyInfo[0] = {
            ...propertyInfo[0],
            ...additionalObj,
            [name]: value,
          };
          newDataIn[2] = {
            ...newDataIn[2],
            PropertyInfo: propertyInfo,
          };
          return {
            ...prevState,
            InputData: {
              ...prevState.InputData,
              DataIn: newDataIn,
            },
          };
        });
      }
    }
  };
  const handleLockAfterBorInfoValidation = async (action, LineId) => {
    let InputParams = contextDetails["InputData"],
      allowSave = true;
    if (InputParams["DataIn"].length > 6) {
      let index = fnGetIndex(InputParams["DataIn"], "BorrInfo");
      InputParams["DataIn"][index]["BorrInfo"].forEach((e) => {
        if (Object.keys(e).includes("firstTimeHomeBuyer")) {
          let val = e["firstTimeHomeBuyer"];
          e["firstTimeHomeBuyer"] = isNaN(Number(val))
            ? val === "No"
              ? 0
              : val === "Yes"
              ? 1
              : val
            : Number(val);
        }
        try {
          if (
            e["FirstName"].length &&
            e["LastName"].length &&
            (contextDetails?.["TBD"] == 0 || action.indexOf("Lock") == -1)
          )
            allowSave = true;
          else allowSave = false;
        } catch (error) {
          allowSave = true;
        }
      });
      index = fnGetIndex(InputParams["DataIn"], "LoanParamInfo");
      InputParams["DataIn"][index]["LoanParamInfo"][0]["LoanOfficer"] =
        contextDetails["LoanOfficerId"];
      index = fnGetIndex(InputParams["DataIn"], "RootObjects");
      InputParams["DataIn"][index]["RootObjects"][0]["FromNewRateLock"] =
        contextDetails["OnloadProcess"] == "PQ" ? 2 : 1;
    } else {
      let index = fnGetIndex(InputParams["DataIn"], "BorrInfo");

      let BorrObj = InputParams["DataIn"][index]["BorrInfo"][0];
      try {
        if (
          BorrObj["FirstName"].length &&
          BorrObj["LastName"].length &&
          (contextDetails?.["TBD"] == 0 || action.indexOf("Lock") == -1)
          // BorrObj["SSN"] && BorrObj["SSN"].replace("-", "").length == 9
        )
          allowSave = true;
        else allowSave = false;
      } catch (error) {
        allowSave = true;
      }
    }
    let obj = {
      LoanID: contextDetails["LoanId"],
      SaveJson: JSON.stringify(InputParams || ""),
    };
    let propertyAddress =
      contextDetails["InputData"]?.["DataIn"]?.[2]?.["PropertyInfo"]?.[0]?.[
        "SubjectAddress"
      ] || "";
    if (["tbd", "to be determined"].includes(propertyAddress.toLowerCase())) {
      if (contextDetails["TBD"] != 1) handleTBD(1);
    }
    try {
      let borInfo = contextDetails["InputData"]["DataIn"][1]["BorrInfo"];
      let blockSaving = false;
      borInfo.map((e) => {
        if ((e["SSN"] || "").length != 11) {
          blockSaving = true;
        }
      });
      if (blockSaving && action.indexOf("Lock") != -1) {
        setContextDetails((prevContext) => {
          return {
            ...prevContext,
            stopSSNSave: true,
          };
        });
        return;
      } else {
        setContextDetails((prevContext) => {
          return {
            ...prevContext,
            stopSSNSave: false,
          };
        });
      }
    } catch (error) {}
    if (!allowSave) return; // Restrict when required fields are not filled
    console.log("saving the searching info ==>", contextDetails["InputData"]);
    setContextDetails((prevContext) => {
      return {
        ...prevContext,
        currentProcess: "LoanBoardingSave",
        showSpinner: true,
        lockingProgress: "Saving...",
      };
    });
    let response = await handleAPI_({
      name: "LoanBoardingSave_",
      params: obj,
    }).then((response) => {
      return response;
    });
    let SelectFlag = 0,
      IsSearchedLoan = 0;
    let { SessionId, LoanId } = contextDetails;
    if (action === "CreateAndLock" || action === "CreateAndSelect") {
      if (action === "CreateAndLock") SelectFlag = 1;
      if (action === "CreateAndSelect") SelectFlag = 2;
      let obj_ = {};
      let { FirstName, LastName, SSN, FICO, Spouse, VAStatus } =
        contextDetails["InputData"]["DataIn"][1]["BorrInfo"][0];
      let { LoanOfficer } =
        contextDetails["InputData"]["DataIn"][3]["LoanParamInfo"][0];
      let { CompNum } =
        contextDetails["InputData"]["DataIn"][0]["RootObjects"][0];
      let { SubjectAddress, SubjectCity, SubjectState, SubjectZip } =
        contextDetails["InputData"]["DataIn"][2]["PropertyInfo"][0];

      if (SelectFlag === "1") {
        if (
          FirstName === "" ||
          LastName === "" ||
          SSN === "" ||
          SubjectCity === "" ||
          SubjectState === "" ||
          SubjectZip === ""
        ) {
          if (contextDetails["TBD"] === 1 && SubjectAddress === "") {
            return;
          }
          // if (contextDetails['TBD'] !== 1) {
          //     return;
          // }
        }
      } else if (SelectFlag === "2" && (FirstName === "" || LastName === "")) {
        return;
      }

      let strXmlInput =
        '<row RowId="' +
        1 +
        '" FirstName="' +
        FirstName +
        '" MInitial="' +
        "" +
        '" LastName ="' +
        LastName +
        '" SSN="' +
        SSN +
        '" FICO="' +
        FICO +
        '" PrimaryBorrower="1" Phone="' +
        "" +
        '" EvePhone="" Email="' +
        "" +
        '" VAStatus="' +
        VAStatus +
        '" FTU="' +
        "" +
        '" ExemptFundFee="' +
        "" +
        '" Spouse="' +
        Spouse +
        '"/>';
      let PropertyAddressXml =
        '<address SubjectAddress="' +
        SubjectAddress +
        '" SubjectCity="' +
        SubjectCity +
        '" SubjectState="' +
        SubjectState +
        '" SubjectZip ="' +
        SubjectZip +
        '"/>';
      let Input =
        '<root SessionId="' +
        SessionId +
        '" LoanOfficer="' +
        LoanOfficer +
        '" SelectFlag="' +
        SelectFlag +
        '"  Lineid="' +
        LineId +
        '" IsSearchedLoan="' +
        IsSearchedLoan +
        '" UseJsonParams="' +
        1 +
        '">' +
        strXmlInput +
        PropertyAddressXml +
        "</root>";
      obj_["CompanyNum"] = CompNum;
      obj_["Input"] = Input;
      obj_["NeedJSON"] = 1;
      //console.log(" CreateNewLoanUsingPreQual Input ==>", obj_);
      //return
      CreateNewLoanUsingPreQual(obj_, IsSearchedLoan, SelectFlag, LineId);
    }
    //Real Loan
    else if (action === "SelectAndLock" || action === "Select") {
      let { finalRate, BasePoints, LockPeriods, finalPoints, InterestRate } =
        contextDetails["LockRateDetails"][LineId];
      BasePoints = cleanValue(BasePoints);
      finalPoints = cleanValue(finalPoints);

      if (action === "SelectAndLock") {
        handleLockRate_DB(
          InterestRate, //finalRate,
          BasePoints,
          LockPeriods,
          finalPoints,
          LineId,
          LoanId
        );
      } else if (action === "Select") {
        handleRateLockOption_SelectOnly(
          InterestRate, //finalRate,
          BasePoints,
          LockPeriods,
          finalPoints,
          LineId,
          LoanId
        );
      }
    }
  };
  const fnLockConfirmationModalValidation = async (isPreQual, LineId) => {
    let {
      chkTBD,
      AllowlockStatus,
      currentProcess,
      ChangeRate,
      FloatDown,
      LoanId,
    } = contextDetails;
    let AllowLock = true,
      ErrorMsg = "",
      showSelectOnlyButton = true;
    if (isPreQual == 0) {
      let addressStatus = await fnCheckAddressValidity();
      let { ValidAddress, TBD } = JSON.parse(addressStatus)["Table"][0];
      if (ValidAddress == 0 && TBD == 0) {
        AllowLock = false;
        ErrorMsg =
          "Rate Lock option is not available until the property address is validated.";
      } else if (ValidAddress == 0 && TBD == 1) {
        let basicLockInfo = await fnValidateLoanBasicInfo();
        if (basicLockInfo.indexOf("SSN") >= 0) {
          AllowLock = false;
          ErrorMsg =
            "Rate Lock option is not available until the SSN is entered";
        } else {
          AllowLock = true;
        }
      } else if (ValidAddress == 1) {
        AllowLock = true;
      }

      if (ValidAddress == 1 && (AllowlockStatus == 4 || AllowlockStatus == 5)) {
        AllowLock = false;
        ErrorMsg =
          "Interest Rates are being regenerated. Please check back later for rate lock options.";
      }
    }
    if (ChangeRate || FloatDown) {
      showSelectOnlyButton = false;
    }
    setContextDetails((prevContext) => {
      return {
        ...prevContext,
        AllowLock,
        ErrorMsg,
        showSelectOnlyButton,
      };
    });
    setOpen({ ...Open, LockRate: true, obj: LineId, AddressValidation: false });
  };
  const fnCheckAddressValidity = async () => {
    let obj = { LoanId: contextDetails["LoanId"] };
    let Response = await handleAPI({
      name: "CheckAddressValidity",
      params: obj,
    }).then((response) => {
      return response;
    });
    return Response;
  };
  const fnValidateLoanBasicInfo = async () => {
    let obj = { LoanId: contextDetails["LoanId"], IsPrequalLoan: 0 };
    let Response = await handleAPI({
      name: "ValidateLoanBasicInfo",
      params: obj,
    }).then((response) => {
      return response;
    });
    return Response;
  };
  const CreateNewLoanUsingPreQual = (
    obj,
    IsSearchedLoan,
    SelectFlag,
    LineId
  ) => {
    setContextDetails((prevContext) => {
      return {
        ...prevContext,
        currentProcess: "Creating New Loan",
        showSpinner: true,
        lockingProgress: "Creating Loan...",
      };
    });
    handleAPI({
      name: "CreateNewLoanUsingPreQual",
      params: obj,
    }).then((response) => {
      response = JSON.parse(response);
      response = response["Table"][0]["Column1"];
      //let response = '<root><row LoanID="490235" CustID="537190" /></root>';
      response = new XMLParser().parseFromString(response);
      let { LoanID, CustID } = response["children"][0]["attributes"];
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          LoanId: LoanID,
          CustId: CustID,
          NewLoanId: LoanID,
          PageFrom: "LoanCreated",
          currentProcess: "Creating New Loan",
          showSpinner: true,
          lockingProgress:
            SelectFlag == 1 ? "Locking Rate..." : "Selecting Loan Program...",
        };
      });
      GloLoanId = LoanID;
      GloCustId = CustID;
      handleCopyDataFromPrequal(contextDetails["PQLoanId"], LoanID);

      handleUpdateViewPITI(IsSearchedLoan, LoanID);
      let { finalRate, BasePoints, LockPeriods, finalPoints } =
        contextDetails["LockRateDetails"][LineId];
      BasePoints = cleanValue(BasePoints);
      finalPoints = cleanValue(finalPoints);

      if (SelectFlag == 1) {
        handleLockRate_DB(
          finalRate,
          BasePoints,
          LockPeriods,
          finalPoints,
          LineId,
          LoanID
        );
      } else if (SelectFlag == 2) {
        handleRateLockOption_SelectOnly(
          finalRate,
          BasePoints,
          LockPeriods,
          finalPoints,
          LineId,
          LoanID
        );
      }
      //console.log("CreateNewLoanUsingPreQual ===>", response);
    });
  };
  const handleUpdateViewPITI = (SearchedLoan, NewLoan) => {
    let obj = { SearchedLoan, NewLoan };
    handleAPI({
      name: "UpdatePITIValue",
      params: obj,
    }).then((response) => {
      //console.log("VIew PITI got updated successfully!!!");
    });
  };
  const handleLockRate_DB = async (
    BaseRate,
    BasePoints,
    ParPeriod,
    FinalPoints,
    LineId,
    LoanId
  ) => {
    setContextDetails((prevContext) => {
      return {
        ...prevContext,

        currentProcess: "Locking Rate",
        showSpinner: true,
        lockingProgress: "Locking Rate...",
      };
    });
    let { EmpNum, SessionId, RateSheetId, ChangeLnPrgm } = contextDetails;
    SessionId = contextDetails["queryString"]["SessionId"];
    ChangeLnPrgm = 0;
    let strXML = await handleLockRateValidation(
      LineId,
      EmpNum,
      LoanId,
      RateSheetId
    );
    strXML = new XMLParser().parseFromString(strXML);
    let { Status, IntRateRights } = strXML["attributes"];
    let { value } = strXML["children"][0];

    // If Locked allow to lock without validation
    if (contextDetails["isLocked"] == 1) {
      let LockType = contextDetails["ChangeRate"]
        ? "ChangeIntrestRate"
        : contextDetails["FloatDown"]
        ? "FloatDown"
        : "";
      handleDoLockRateProcess(
        LineId,
        EmpNum,
        BaseRate,
        BasePoints,
        ParPeriod,
        LoanId,
        RateSheetId,
        LockType,
        SessionId,
        FinalPoints,
        1, // Process Type
        1 // Need JSON
      );
    } else {
      if (Status == 1) {
        let istrXML = await handleLockRateValidation_DBChecks(
          LineId,
          EmpNum,
          LoanId,
          RateSheetId,
          ChangeLnPrgm,
          SessionId,
          1,
          BaseRate,
          BasePoints,
          ParPeriod
        );
        istrXML = new XMLParser().parseFromString(istrXML);
        let { WarnStatus } = istrXML["children"][2]["attributes"];
        Status = istrXML["children"][1]["attributes"]["Status"];
        value = istrXML["children"][1]["children"][0]["value"];
        if (Status == 0) {
          let Msg = "";
          if (value != "") {
            if (
              value ===
              '"A price change has occurred since this loan was priced. Would you like to proceed?"'
            )
              Msg =
                "A price change has occurred. Clicking ?OK? will automatically update the pricing. Re-select the loan program after the update has completed.";
            else {
              Msg = value;
            }
          }
          // alert(
          else
            Msg =
              "Error occurred in locking the rate and selecting the loan program. Please try again or contact support@directcorp.com for additional assistance";
          // );

          let component = (
            <View style={{ gap: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 3,
                  padding: "15px",
                }}
              >
                <CustomText>{Msg}</CustomText>
              </View>
              <View
                style={{
                  justifyContent: "center",
                  flexDirection: "row",
                  paddingBottom: "5px",
                }}
              >
                <Button
                  title={
                    <CustomText
                      bold={false}
                      style={{ fontSize: 13, color: "#fff", fontWeight: 200 }}
                    >
                      {"Ok"}
                    </CustomText>
                  }
                  style={[styles["btn"], { paddingVertical: 10 }]}
                  onPress={() => {
                    {
                      Msg.indexOf("A price change has occurred") != -1
                        ? setOpen(false)
                        : setOpen(false);
                    }
                  }}
                />
              </View>
            </View>
          );
          setOpen({ Alert: true, Msg: false, component: component });
          return;
        } else {
          if (WarnStatus == 1) {
            let Msg = istrXML["children"][2]["children"][0]["value"];
            let LockType = "";
            let component = (
              <View style={{ gap: 20 }}>
                <View
                  style={{
                    //flexDirection: "row",
                    marginBottom: 3,
                    padding: 15,
                    paddingBottom: 0,
                    gap: 3,
                  }}
                >
                  {Msg.split("~").map((e) => (
                    <CustomText>{e}</CustomText>
                  ))}
                  {/* <CustomText>{`${Msg.split(". D")[0]}.`}</CustomText>
                  <CustomText>{Msg.split(". ")[2]}</CustomText> */}
                </View>
                <View
                  style={{
                    justifyContent: "flex-end",
                    flexDirection: "row",
                    padding: 15,
                    gap: 15,
                  }}
                >
                  <Button
                    title={
                      <CustomText
                        bold={false}
                        style={{ fontSize: 13, color: "#fff", fontWeight: 200 }}
                      >
                        {"Cancel"}
                      </CustomText>
                    }
                    style={[
                      styles["btn"],
                      {
                        paddingVertical: 10,
                        borderColor: "#262626",
                        borderWidth: 2,
                        backgroundColor: "#595959",
                      },
                    ]}
                    onPress={() => {
                      setOpen(false);
                    }}
                  />
                  <Button
                    title={
                      <CustomText
                        bold={false}
                        style={{ fontSize: 13, color: "#fff", fontWeight: 200 }}
                      >
                        {"Proceed"}
                      </CustomText>
                    }
                    style={[styles["btn"], { paddingVertical: 10 }]}
                    onPress={() => {
                      handleDoLockRateProcess(
                        LineId,
                        EmpNum,
                        BaseRate,
                        BasePoints,
                        ParPeriod,
                        LoanId,
                        RateSheetId,
                        LockType,
                        SessionId,
                        FinalPoints,
                        1,
                        1
                      );
                    }}
                  />
                </View>
              </View>
            );
            setOpen({ Alert: true, Msg: false, component: component });
          }
          if (WarnStatus == 99) {
            // if all validations are good - then will call the Actual Lock Rate process

            let LockType = "";
            handleDoLockRateProcess(
              LineId,
              EmpNum,
              BaseRate,
              BasePoints,
              ParPeriod,
              LoanId,
              RateSheetId,
              LockType,
              SessionId,
              FinalPoints,
              1, // Process Type
              1 // Need JSON
            );
          }
        }
      } else {
        let Msg = "";
        if (value != "") {
          //  alert(value);
          Msg = value;
        } else {
          //  alert(
          Msg =
            "Error occurred in locking the loan program. Please try again or contact support@directcorp.com for additional assistance";
          //  );
        }
        let component = (
          <View style={{ gap: 20 }}>
            <View
              style={{ flexDirection: "row", marginBottom: 3, padding: "15px" }}
            >
              <CustomText>{Msg}</CustomText>
            </View>
            <View
              style={{
                justifyContent: "center",
                flexDirection: "row",
                paddingBottom: "5px",
              }}
            >
              <Button
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 13, color: "#fff", fontWeight: 200 }}
                  >
                    {"Ok"}
                  </CustomText>
                }
                style={[styles["btn"], { paddingVertical: 10 }]}
                onPress={() => {
                  setOpen(false);
                }}
              />
            </View>
          </View>
        );
        setOpen({ Alert: true, Msg: false, component: component });
        //setOpen({ Alert: true, Msg: Msg });
      }
    }
  };
  const handleLockRateValidation = async (
    LineId,
    EmpNum,
    LoanId,
    RateSheetId
  ) => {
    let obj = { LineID: LineId, EmpNum, LoanId, RateSheetId };
    let response = await handleAPI({
      name: "LockRateValidation",
      params: obj,
    }).then((response) => {
      return response;
    });
    return response;
  };
  const handleLockRateValidation_DBChecks = async (
    LineId,
    EmpNum,
    LoanId,
    RateSheetId,
    ChangeLnPrgm,
    SessionId,
    flag,
    BaseRate,
    BasePoints,
    ParPeriod
  ) => {
    let obj = {
      LineID: LineId,
      EmpNum,
      LoanId,
      RateSheetId,
      ChangeLnPrgm,
      Sessionid: SessionId,
      flag,
      BaseRate,
      BasePoints,
      ParPeriod,
    };
    let response = await handleAPI({
      name: "LockRateValidation_DBChecks",
      params: obj,
    }).then((response) => {
      return response;
    });
    return response;
  };
  const handleDoLockRateProcess = (
    LineId,
    EmpNum,
    BaseRate,
    BasePoints,
    ParPeriod,
    LoanId,
    RateSheetId,
    LockType,
    SessionId,
    FinalPoints,
    ProcessType,
    NeedJson
  ) => {
    let objPopOut = 0,
      url = "";
    if (FinalPoints.includes("(") != -1) {
      FinalPoints = FinalPoints.replace("(", "-").replace(")", "");
    }
    let obj = {
      LineID: LineId,
      EmpNum,
      BaseRate,
      BasePoints,
      ParPeriod,
      LoanId,
      RateSheetId,
      LockType,
      SessionID: SessionId,
      FinalPoints,
      ProcessType,
      NeedJson,
    };
    // Passing the details to Lock Confirmation page
    let existingInfo = JSON.parse(localStorage.getItem("LoanSelectioInfo"));
    let json = {
      ...existingInfo,
      [LoanId]: {
        Addons: contextDetails["ProductAddons"][LineId] || "[]",
        RateInfo: contextDetails["LockRateDetails"][LineId] || [],
      },
    };
    localStorage.setItem("LoanSelectioInfo", JSON.stringify(json));
    //console.log("DoLockRateProcess input == >", obj);
    handleAPI({
      name: "DoLockRateProcess",
      params: obj,
    }).then((response) => {
      // handleLoanProducts([])
      try {
        let Fico = 0,
          LoanAmount = 0,
          LoanAmounttwo = 0,
          LTV = 0,
          CLTV = 0;
        handleSelectQuote(
          LineId,
          SessionId,
          Fico,
          LoanAmount,
          LoanAmounttwo,
          LTV,
          CLTV
        );
      } catch (error) {
        console.log("Error in Selecting MI Quote");
      }
      handleReset();
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          IsLocked: 1,
          currentProcess: "LockedRate",
          showSpinner: false,
          lockingProgress: "Locking Rate...",
        };
      });

      if (contextDetails["OnloadProcess"] == "PQ") {
        if (
          window.parent.location.href
            .toString()
            .indexOf("DirectDefault.aspx") != -1
        ) {
          try {
            if (
              window.opener.location.href
                .toString()
                .indexOf("DirectDefault.aspx") != -1
            ) {
              objPopOut =
                window.opener.document.getElementById("chkPopOut").checked;
            }
          } catch (e) {
            objPopOut = false;
          }
          let { LoanId, NewLoanId, CustId, SessionId, EmpNum } = contextDetails;
          SessionId = contextDetails["queryString"]["SessionId"];
          if (
            objPopOut == true &&
            window.parent.location.href
              .toString()
              .indexOf("LoanAppTabs.aspx") == -1
          ) {
            url =
              "../../../BorrowerApplication/Presentation/Webforms/LoanAppTabs.aspx?RemHeadFootr=0&LoanId=" +
              NewLoanId +
              "&CustId=" +
              CustId +
              "&SessionId=" +
              SessionId +
              "&PageName=" +
              "LockConfirmation" +
              "&HideNav=1" +
              "&from=NewLoan_LoanAppTab&IsReactNative=1  ";
            setTimeout(() => {
              window.document.location.href = url;
            }, 100);
          } else {
            url =
              "Loan_LockConfirmation.aspx?SessionId=" +
              SessionId +
              "&EmpNum=" +
              EmpNum +
              "&LineID=" +
              LineId;
            setTimeout(() => {
              window.document.location.href = url;
            }, 100);
          }

          try {
            if (
              parentURL.toString().indexOf("LoanAppTabs.aspx") > -1 ||
              parentURL.toString().indexOf("DirectDefault.aspx") > -1
            ) {
              $("#hdnLoanId", window.parent.document).val(LoanId);
              window.parent.GetLoanPulse();
            }
            ReloadLeftNav(1, LoanId);
          } catch (e) {}
        } else {
          // let NewLoanId_ = 0;
          // setContextDetails((prevContext) => {
          //   NewLoanId_ = prevContext.NewLoanId;
          //   return {
          //     ...prevContext,
          //   };
          // });
          let { CustId, SessionId } = contextDetails;
          SessionId = contextDetails["queryString"]["SessionId"];
          url =
            "../../../BorrowerApplication/Presentation/Webforms/LoanAppTabs.aspx?RemHeadFootr=0&LoanId=" +
            GloLoanId +
            "&CustId=" +
            GloCustId +
            "&SessionId=" +
            SessionId +
            "&PageName=" +
            "LockConfirmation" +
            "&HideNav=1" +
            "&from=NewLoan_LoanAppTab" +
            "&IsReactNative=1  ";
          if (contextDetails["isPublicRunScenario"]) {
            window.open(
              url,
              "PQ",
              "width=1200,height=900,resizable=1,scrollbars=1"
            );
            window.parent.GoToHome();
          } else {
            window.document.location.href = url;
          }

          return;
        }
      } else {
        setTimeout(() => {
          let obj = {
            ChangeRate: false,
            FloatDown: false,
            LoanLocked: true,
            ChangeLoanProgram: false,
          };
          handleLock(obj);
        }, 1000);
      }
      setOpen(false);
      // console.log("DoLockRateProcess is successful!!!");
    });
  };
  const handleRateLockOption_SelectOnly = (
    BaseRate,
    BasePoints,
    ParPeriod,
    FinalPoints,
    LineId,
    LoanId
  ) => {
    let { EmpNum, SessionId, RateSheetId, ChangeLnPrgm } = contextDetails;
    SessionId = contextDetails["queryString"]["SessionId"];
    let LockType = "";
    let { LoanProgId, Name } = LoanProducts.filter(
      (e) => e["LineId"] == LineId && e["Id"] != -1
    )[0];
    if (contextDetails["NoRateBandAvail"]) {
      BaseRate=0;
      BasePoints=0;
      ParPeriod=0;
      FinalPoints=0;
  }
    let obj = {
      LineID: LineId,
      EmpNum,
      BaseRate,
      BasePoints,
      ParPeriod,
      LoanId,

      RateSheetId,
      LockType,
      SessionID: SessionId,
      FinalPoints,
    };
    handleAPI({
      name: "RateLockOption_SelectOnly",
      params: obj,
    }).then((response) => {
      // console.log("RateLockOption_SelectOnly == > New Loan Id == >", LoanId);
      try {
        let Fico = 0,
          LoanAmount = 0,
          LoanAmounttwo = 0,
          LTV = 0,
          CLTV = 0;
        handleSelectQuote(
          LineId,
          SessionId,
          Fico,
          LoanAmount,
          LoanAmounttwo,
          LTV,
          CLTV
        );
      } catch (error) {
        console.log("Error in Selecting MI Quote");
      }

      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          currentProcess: "RateLockOption_SelectOnly",
          showSpinner: false,
          lockingProgress: "",
        };
      });
      let Msg = false;
      if (contextDetails["OnloadProcess"] == "PQ") {
        if (
          window.parent.location.href
            .toString()
            .indexOf("DirectDefault.aspx") != -1
        ) {
          // Code will come here
        } else {
          let { NewLoanId, CustId, SessionId } = contextDetails;
          SessionId = contextDetails["queryString"]["SessionId"];
          let url =
            "../../../BorrowerApplication/Presentation/Webforms/LoanAppTabs.aspx?RemHeadFootr=0&LoanId=" +
            GloLoanId +
            "&CustId=" +
            GloCustId +
            "&SessionId=" +
            SessionId +
            "&PageName=" +
            "LoanSelection" +
            "&HideNav=1" +
            "&from=NewLoan_LoanAppTab" +
            "&IsReactNative=1 ";
          window.document.location.href = url;
          return;
        }
      } else {
        let component = (
          <View style={{ padding: 15 }}>
            <View style={{ marginBottom: 3, padding: "15px", gap: 20 }}>
              <CustomText bold={true}>
                The following loan program has been selected:{" "}
              </CustomText>
              <CustomText>{Name}</CustomText>
              <CustomText>
                Would you like to continue on with the next page?
              </CustomText>
            </View>
            <View
              style={{
                justifyContent: "center",
                flexDirection: "row",
                paddingBottom: "5px",
              }}
              onKeyDown={handleKeyDown}
            >
              <Button
                forwardedRef={btnRefFloatClose}
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 13, color: "#428bca", fontWeight: 200 }}
                  >
                    {"Close and Return to Rate Lock"}
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  {
                    borderColor: "#428bca",
                    borderWidth: 2,
                    backgroundColor: "white",
                  },
                ]}
                onPress={() => {
                  window.parent.GetLoanPulse();
                  setOpen(false);
                }}
              />
              <Button
                forwardedRef={btnRefFloatProceed}
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 13, color: "#fff", fontWeight: 200 }}
                  >
                    {"Proceed"}
                  </CustomText>
                }
                style={[styles["btn"], { paddingVertical: 10 }]}
                disabled={true}
                onPress={() => {
                  window.parent.document.getElementById("btnNext").click();
                  setOpen(false);
                }}
              />
            </View>
          </View>
        );
        setOpen({ Alert: true, Msg: Msg, component: component });
      }
    });
  };
  const handleProgramGuidelines = (Row) => {
    let { Run, LoanProgId, LineId, LoanAmt } = Row["RootObjects"];
    let { IntRate, IntRateID, LockPeriodID, LockPeriodDays } = Row["Rate"];
    IntRate = cleanValue(IntRate, 2);
    LoanAmt = cleanValue(LoanAmt, 2);
    LockPeriodDays = LockPeriodDays.split(" ")[0];
    let url = `http://www.directmortgage.com/BorrowerApplication/Presentation/Webforms/LoanProgramGuidelines.aspx?SessionID=${contextDetails["SessionId"]}&lineid=${LineId}&lnprogram=${LoanProgId}&intrateid=${IntRateID}&lockperiodid=${LockPeriodID}&interestrate=${IntRate}&lockperioddesc=${LockPeriodDays}&LoanID=${contextDetails["LoanId"]}&totbitwise=64&seachedloan=0&runid=${Run}&loanAmount=${LoanAmt}`;
    //console.log("handleProgramGuidelines == >", url);
    <WebViewiFrame url={url}></WebViewiFrame>;
    //  window.open(url, "_self");
  };
  const handleCopyDataFromPrequal = (PrequalLoanId, LoanId) => {
    let obj = { PrequalLoanId, LoanId };
    handleAPI({
      name: "CopyDataFromPrequal",
      params: obj,
    }).then((response) => {
      // console.log("CopyDataFromPrequal is successfully");
    });
  };

  // For production navigation
  const ReloadLeftNav = (Id, LoanId) => {
    let GLO_pagename = 0;
    let parentURL = window.parent.location.href;
    let PopOut = 0;
    try {
      if (
        window.parent.opener.location.href
          .toString()
          .indexOf("/DirectDefault.aspx") > -1
      ) {
        PopOut =
          window.parent.opener.document.getElementById("drpPopOut").value;
      }
    } catch (e) {}
    try {
      if (
        window.parent.opener.location.href
          .toString()
          .indexOf("/DataPipeLine.aspx") > -1
      ) {
        PopOut =
          window.parent.opener.parent.document.getElementById(
            "drpPopOut"
          ).value;
      }
    } catch (e) {}
    if (PopOut == 3) {
      menuULid = "ulLeftNavTree";
    } else {
      menuULid = "myTabs";
    }
    if (GLO_pagename == "") {
      let pagename = "";
      $("#" + menuULid, window.parent.document)
        .find("li")
        .each(function () {
          // Access the active element from the leftnav and toptabs to get the current pagename
          if ($(this).hasClass("active") == true) {
            pagename = $(this).find("a").attr("pagename");
            GLO_pagename = pagename;
          }
        });
    }
    let strNavHTML = "";
    if (parentURL.toString().indexOf("LoanAppTabs.aspx") > -1) {
      strNavHTML = window.parent.opener.LoadLeftNavigationTree(LoanId, 0);
      if (PopOut == 3)
        $("#ulLeftNavTree", window.parent.document).html(strNavHTML);
      else $("#myTabs", window.parent.document).html(strNavHTML);
    }
    if (parentURL.toString().indexOf("DirectDefault.aspx") > -1) {
      strNavHTML = window.parent.LoadLeftNavigationTree(LoanId, 0);
      $("#ulLeftNavTree", window.parent.document).html(strNavHTML);
    }
    if ($(window).width() < 680) {
      $("#myTabs", window.parent.document).html(strNavHTML);
    }
    if (GLO_RefreshCount < 10) {
      if (Id == 1) {
        // 1 is for loan locked
        let loanlocked = LoanProduct_Selection_Lock.IsLoanLocked(LoanId);
        if (loanlocked.value == "0") {
          setTimeout("ReloadLeftNav(1,'" + LoanId + "')", 3000);
        }
      } else {
        //2 is for loan prog selected
        let loanprogId =
          LoanProduct_Selection_Lock.IsLoanProgramUpdated(LoanId);
        if (loanprogId.value == "0") {
          setTimeout("ReloadLeftNav(2,'" + LoanId + "')", 3000);
        }
      }
      GLO_RefreshCount = GLO_RefreshCount + 1;
    }
    if (parentURL.indexOf("/LoanAppTabs.aspx") != -1) {
      menuULid = "myTabs";
    } else if (parentURL.indexOf("/DirectDefault.aspx") != -1) {
      $("#ulLeftNavTree", window.parent.document).removeAttr("style");
      $("#sidebar", window.parent.document).removeClass("menu-min");
      $("#leftNavigation", window.parent.document).css("display", "");
      if (!$("#sidebar", window.parent.document).hasClass("sidebar")) {
        $("#sidebar", window.parent.document).addClass("sidebar");
      }
      menuULid = "ulLeftNavTree";
      try {
        $("#spnLoanId", window.parent.document).html(LoanId);
        $("#liLoanApplication", window.parent.document).addClass("open");
        $("#liLoanApplication ul", window.parent.document).removeClass(
          "nav-hide"
        );
        $("#liLoanApplication ul", window.parent.document).addClass("nav-show");
        $("#liLoanApplication ul", window.parent.document).css(
          "display",
          "block"
        );
        $("#DivLnPulse", window.parent.document).css("display", "");
        $("#divLoanPulseSection", window.parent.document).css("display", "");
        $("#DivLnPulse", window.parent.document).addClass("in");
      } catch (e) {}
    }
    window.parent
      .$("#" + menuULid)
      .find("li")
      .each(function () {
        if ($(this).find("a").attr("pagename") == GLO_pagename) {
          $(this).addClass("active special1");
        }
      });
  };
  const fnValidateAddress = async () => {
    let { LoanId, SessionId, EmpNum } = contextDetails;
    SessionId = contextDetails["queryString"]["SessionId"];
    let obj = { LoanId, CustId: 0, SessionId, EmpNum };
    handleAPI({
      name: "AddressValidation",
      params: obj,
    }).then(async (response) => {
      let url = JSON.parse(response)["Table"][0]["Column1"];
      //url = 'https://www.solutioncenter.biz/RateLockAPI/api/AddressValidation?LoanId=456760&CustId=0&SessionId={84E87238-433C-4B6F-9CE3-6871AC72C35E}&EmpNum=32179'
      //console.log("AddressValidation ==>", response);
      let pageContent = "",
        validAddress = 0;
      try {
        pageContent = await fetch(`${url}`, {
          method: "GET",
          mode: "cors",
          // crossDomain: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
          .then(async function (response) {
            let res = await response.json();

            return res;
          })
          .catch(function (err) {
            console.log(`Error from handleAPI ====>  ${err}`);
          });
      } catch (error) {
        pageContent =
          '<?xml version="1.0" encoding="UTF-8"?><AddressValidateResponse><Address ID="0"><Error><Number>-2147219401</Number><Source>clsAMS</Source><Description>Address Not Found.  </Description><HelpFile/><HelpContext/></Error></Address></AddressValidateResponse>';
      }
      if (!pageContent)
        pageContent =
          '<?xml version="1.0" encoding="UTF-8"?><AddressValidateResponse><Address ID="0"><Error><Number>-2147219401</Number><Source>clsAMS</Source><Description>Address Not Found.  </Description><HelpFile/><HelpContext/></Error></Address></AddressValidateResponse>';

      let AddressInfo = new XMLParser().parseFromString(pageContent);
      AddressInfo = AddressInfo?.["children"]?.[0]?.["children"];

      let ErrorInfo = AddressInfo?.filter((e) => e.name == "Error");
      let ValidateAddress = AddressInfo?.[0]?.["children"]?.filter(
        (e) => e.name == "Description"
      );
      if (ErrorInfo.length) {
        validAddress = 0;
        if (ValidateAddress.length) {
          validAddress = 0;
          ValidateAddress = ValidateAddress?.[0]?.["value"] || "";
        }
      } else {
        validAddress = 1;
      }
      obj = {
        LoanID: LoanId,
        SessionID: SessionId,
        strOutput: url,
        pageContent: pageContent,
        success: validAddress,
      };
      handleAPI({
        name: "AddressValidationResult",
        params: obj,
      }).then((response) => {
        response = JSON.parse(response)["Table"]?.[0];

        let { Column5, Column2, Column3, Column4 } = response;
        let resultArr = [
          validAddress,
          ValidateAddress,
          Column2,
          Column3,
          Column4,
          Column5,
        ];
        fnUSPSCheckAddressValid(validAddress, ValidateAddress, resultArr, 0);
        //console.log("AddressValidationResult ===>", response);
      });
    });
  };
  const fnUSPSCheckAddressValid = (strResult, returntext, arr, fromSLPflag) => {
    if (strResult == 1) {
    } else {
      let Index = fnGetIndex(
        contextDetails["InputData"]["DataIn"],
        "PropertyInfo"
      );
      let {
        SubjectAddress: PropertyAddress,
        SubjectCity: City,
        SubjectState: State,
        SubjectZip: Zip,
      } = contextDetails["InputData"]["DataIn"][Index]["PropertyInfo"][0];
      // let {
      //   City,
      //   State,
      //   Zip,
      //   ["Property Address"]: PropertyAddress,
      // } = searchDetails;
      let AddressInfo = [{ City, State, Zip, PropertyAddress }];
      setOpen({ ...Open, AddressValidation: true, AddressInfo });
    }
  };
  const fnSelectAddress = async (type, value) => {
    if (type == "Table") {
      setOpen({ ...Open, AddressValidation: value });
    } else {
      let res = await ManualValidation();
      res = await GetAddressInfo();
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          AddressValid: 1,
          // AllowLock:true
        };
      });
      //setOpen({ ...Open, AddressValidation: false });
      let checkPreQual = await IsPreQualLoan(contextDetails["LoanId"], 0);
      fnLockConfirmationModalValidation(
        checkPreQual,
        contextDetails["currentLockingLineId"]
      );
    }
  };
  const ManualValidation = async () => {
    let { LoanId, SessionId, EmpNum } = contextDetails;
    let obj = { LoanId, EmpNum, SessionId };
    let Response = await handleAPI({
      name: "ManualValidation",
      params: obj,
    }).then((response) => {
      // response = JSON.parse(response);
      // console.log("ManualValidation ==>", response);
      return response;
    });
    return Response;
  };
  const GetAddressInfo = async () => {
    let { LoanId, EmpNum } = contextDetails;
    let obj = { LoanId, EmpNum };
    let Response = await handleAPI({
      name: "GetAddressInfo",
      params: obj,
    }).then((response) => {
      // response = JSON.parse(response);
      // console.log("GetAddressInfo ==>", response);
      return response;
    });
    return Response;
  };
  const fnUnValidateAddress = async () => {
    let res = await handleUnValidateAddress();
    setContextDetails((prevContext) => {
      return {
        ...prevContext,
        AddressValid: 0,
      };
    });
  };
  const handleUnValidateAddress = async () => {
    let { LoanId, SessionId } = contextDetails;
    let obj = { LoanID: LoanId, SessionID: SessionId };
    let Response = await handleAPI({
      name: "UnValidateAddress",
      params: obj,
    }).then((response) => {
      response = JSON.parse(response);
      // console.log("UnValidateAddress ==>", response);
      return response;
    });
    return Response;
  };
  const handleValidateAddress = (value) => {
    if (value == 0) {
      //validate Address
      fnValidateAddress();
    } else {
      fnUnValidateAddress();
    }
  };
  const handleTBD = (value) => {
    let { LoanId, SessionId } = contextDetails;
    handleAPI({
      name: "InValidateAddress", //"GetLoanProgramIU_Json", GetCompressedJSON
      params: {
        LoanId: LoanId,
        SessionId: SessionId,
      },
    }).then((response) => {
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          TBD: value,
        };
      });
      //  console.log("Address is invalid!!!");
    });
  };
  ///////////////////////// Function Declaration Ends ///////////////////////////////
  const isMobileWeb = Dimensions.get("window").width <= 650;
  return (
    <View style={styles.container} ref={myViewRef} onLayout={handleLayout}>
      {LoanProducts?.length != 0 ? (
        <View style={styles.table}>
          <View
            style={[
              styles["header"],
              styles.bodyText,
              {
                backgroundColor: "#508BC9",
                justifyContent: "space-between",
                paddingVertical: 5,
                // height: 35,
                flexDirection: isMobileWeb ? "column" : "row",
              },
            ]}
          >
            <View
              style={[
                styles["header"],
                { backgroundColor: "#508BC9", alignItems: "center" },
              ]}
            >
              <CustomText style={{ color: "#fff", fontSize: 14 }}>
                Loan Products:{" "}
              </CustomText>
              <CustomText
                style={{
                  color: "#fff",
                  fontSize: 11,
                  alignText: "center",
                }}
              >
                {LoanProducts?.length / 2} Loan Products
              </CustomText>
              {contextDetails?.['ActiveLineId']?.["IsWorseCase"] && (
                <View
                  style={[
                    {
                      alignItems: "center",
                      //paddingTop: 5,
                      alignItems: "baseline",
                    },
                  ]}
                >
                  <>
                    <CustomText
                      style={{
                        fontSize: 12,
                        color: "#fff",
                        backgroundColor: "#C14242",
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 3,
                        // marginBottom: 5,
                        marginLeft: 20,
                      }}
                    >
                      {`Due to a previous rate lock, worse case pricing applies.`}
                    </CustomText>
                  </>
                </View>
              )}
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 7 }}
            >
              <CustomText style={{ color: "#fff", fontSize: 13 }}>
                Display Lender Comp{" "}
              </CustomText>
              <SwatchOutlined
                size={15}
                value={LenderComp}
                onChange={() => {
                  handleLenderComp(!LenderComp);
                }}
              ></SwatchOutlined>
            </View>
          </View>
          <View
            style={[
              styles["header"],
              { color: "#fff", borderBottomWidth: 1, borderColor: "#999999" },
            ]}
          >
            <CustomText
              style={[
                styles.bodyText,
                styles.colBorder,
                { color: "#333333", width: "35%", fontWeight: 600 }, //flex: 4
              ]}
            >
              Loan Product
            </CustomText>
            <CustomText
              style={[
                styles.bodyText,
                styles.colBorder,
                { color: "#333333", width: "10%", fontWeight: 600 }, //flex: 1
              ]}
            >
              Interest Rate
            </CustomText>
            <CustomText
              style={[
                styles.bodyText,
                styles.colBorder,
                { color: "#333333", width: "10%", fontWeight: 600 }, // flex: 1
              ]}
            >
              APR
            </CustomText>
            <CustomText
              style={[
                styles.bodyText,
                styles.colBorder,
                { color: "#333333", width: "10%", fontWeight: 600 }, // flex: 1
              ]}
            >
              Monthly Payment
            </CustomText>
            <CustomText
              style={[
                styles.bodyText,
                styles.colBorder,
                { color: "#333333", width: "10%", fontWeight: 600 }, // flex: 1
              ]}
            >
              Lock Days
            </CustomText>

            <CustomText
              style={[
                styles.bodyText,
                styles.colBorder,
                { color: "#333333", width: "15%", fontWeight: 600 }, // flex: 2
              ]}
            >
              Credit/Charge to Borrower
            </CustomText>
            <CustomText
              style={[
                styles.bodyText,
                { color: "#333333", width: "10%", fontWeight: 600 }, //flex: 1, maxWidth: 80
              ]}
            >
              Lock Rate
            </CustomText>
          </View>
          <View
            style={{ borderBottomEndRadius: 10, borderBottomStartRadius: 10 }}
          >
            {LoanProducts?.map((row, index) => {
              return (
                <Fragment key={index}>
                  {row["Id"] != -1 ? (
                    <View
                      style={[
                        styles.body,
                        {
                          backgroundColor: VisibleRateBand[row["LineId"]]
                            ? "#DEEAF1"
                            : row.isEven
                            ? "#fff"
                            : "#F2F2F2",
                          // flex: 8,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.bodyText,
                          {
                            width: "35%",
                            maxWidth: "100%",
                            flexDirection: "row",
                            gap: 10,
                          },
                        ]}
                      >
                        <View>
                          <Image
                            style={{
                              height: 26,
                              width: 21,
                              top: 6,
                            }}
                            resizeMode="contain"
                            source={require(`../../assets/${
                              row["Accept"] == 1 ? "AcceptRefer" : "CancelRefer"
                            }.svg`)}
                            onClick={() => {
                              handleAdjustmentDetails(false, "");
                            }}
                          />{" "}
                        </View>
                        <View style={{ flexDirection: "column" }}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <CustomText
                              style={[styles.bodyText, styles.removeColBorder]}
                              onPress={(e) => {
                                ProductClick({
                                  LineId: row["LineId"],
                                  index,
                                  LineIds: row["LineIds"],
                                  CommonId: row["LPA_CommonData"],
                                  InterestRate: row["InterestRate"],
                                  [row["LineId"]]: {
                                    LockPeriodId: row["LockPeriodID"],
                                  },
                                  LnProgActiveId: row["LnProgActiveId"],
                                });
                              }}
                            >
                              {row["CommonName"]}
                            </CustomText>
                          </View>
                          {row["showInfoInHeader"] && (
                            <View
                              style={[
                                {
                                  alignItems: "center",
                                  paddingTop: 5,
                                  gap: 5,
                                  alignItems: "baseline",
                                },
                              ]}
                            >
                              <>
                                {row["Accept"] == 1 ? (
                                  <CustomText
                                    style={{
                                      fontSize: 12,
                                      color: "#246C23",
                                      paddingVertical: 2,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {"Accept"}
                                  </CustomText>
                                ) : (
                                  <View style={{ flexDirection: "row" }}>
                                    <CustomText
                                      style={{
                                        color: "#C14242",
                                        fontSize: 12,
                                        fontWeight: 700,
                                      }}
                                    >
                                      {"Refer: "}
                                    </CustomText>
                                    <CustomText
                                      style={{ fontSize: 12, color: "#C14242" }}
                                    >
                                      {row["Reason"]}
                                    </CustomText>
                                  </View>
                                )}
                                {row["ProgWarnMsg"].length > 5 && (
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
                                    {row["ProgWarnMsg"]}
                                  </CustomText>
                                )}
                              </>
                            </View>
                          )}
                        </View>
                      </View>

                      <CustomText
                        style={[styles.bodyText, { width: "10%", top: 4 }]}
                        onPress={(e) => {
                          ProductClick({
                            LineId: row["LineId"],
                            index,
                            LineIds: row["LineIds"],
                            CommonId: row["LPA_CommonData"],
                            InterestRate: row["InterestRate"], //row["InterestRate"]
                            [row["LineId"]]: {
                              LockPeriodId: row["LockPeriodID"],
                            },
                            LnProgActiveId: row["LnProgActiveId"],
                          });
                        }}
                      >
                        {row["iInterestRate"]} {/*row["iInterestRate"] */}
                      </CustomText>
                      <CustomText
                        style={[styles.bodyText, { width: "10%", top: 4 }]}
                        onPress={(e) => {
                          ProductClick({
                            LineId: row["LineId"],
                            index,
                            LineIds: row["LineIds"],
                            CommonId: row["LPA_CommonData"],
                            InterestRate: row["InterestRate"],
                            [row["LineId"]]: {
                              LockPeriodId: row["LockPeriodID"] || 4,
                            },
                            LnProgActiveId: row["LnProgActiveId"],
                          });
                        }}
                      >
                        {row["APR"]}
                      </CustomText>
                      <View
                        style={[
                          styles.bodyText,
                          {
                            width: "10%",
                            top: 4,
                            flexDirection: "column",
                            flexWrap: isMobileWeb ? "column" : "wrap",
                            // flexWrap: "column",

                            gap: 5,
                          },
                        ]}
                      >
                        <CustomText style={{ fontSize: 12, color: "#6c757d" }}>
                          {formatCurrency(row["Payment"])}
                        </CustomText>
                        <View>
                          <Button
                            title={
                              <CustomText
                                style={{
                                  fontSize: 11,
                                  color: "#fff",
                                  fontWeight: 200,
                                }}
                              >
                                View PITI
                              </CustomText>
                            }
                            style={{
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              marginLeft: 0,
                              fontSize: 10,
                              // left: 30,
                              width: "fit-content",
                              bottom: 4,
                              backgroundColor: "#428bca",
                            }}
                            onPress={() => {
                              handleViewPITI(true, row);
                            }}
                          />
                        </View>
                      </View>
                      <CustomText
                        style={[styles.bodyText, { width: "10%", top: 4 }]}
                        onPress={(e) => {
                          ProductClick({
                            LineId: row["LineId"],
                            index,
                            LineIds: row["LineIds"],
                            CommonId: row["LPA_CommonData"],
                            InterestRate: row["InterestRate"],
                            [row["LineId"]]: {
                              LockPeriodId: row["LockPeriodID"] || 4,
                            },
                            LnProgActiveId: row["LnProgActiveId"],
                          });
                        }}
                      >
                        {row["LockPeriodDesc"].split("Days")[0]}
                      </CustomText>

                      <CustomText
                        style={[
                          styles.bodyText,
                          {
                            width: "15%",
                            top: 4,
                            color:
                              row["RateChosen"].indexOf("Credit") != -1
                                ? "green"
                                : "red",
                          },
                        ]}
                        onPress={(e) => {
                          ProductClick({
                            LineId: row["LineId"],
                            index,
                            LineIds: row["LineIds"],
                            CommonId: row["LPA_CommonData"],
                            InterestRate: row["InterestRate"],
                            [row["LineId"]]: {
                              LockPeriodId: row["LockPeriodID"] || 4,
                            },
                            LnProgActiveId: row["LnProgActiveId"],
                          });
                        }}
                      >
                        {row["RateChosen"] || ""}
                      </CustomText>
                      <CustomText
                        style={[
                          styles.bodyText,
                          {
                            width: "10%",
                            right: 0,
                            bottom: 3,
                            top: 0,
                            display: isMobileWeb ? "flex" : "block",
                            flexDirection: isMobileWeb ? "column" : "row",
                          },
                        ]}
                      >
                        {(//VisibleRateBand[row["LineId"]] && !contextDetails["NoRateBandAvail"] &&
                          //!ActiveRate[ActiveRate?.[row?.["LPA_CommonData"]]?.["LineId"]]?.["IsDummy"]) || "" 
                        !contextDetails["NoRateBandAvail"] || contextDetails["NoRateBandAvail"])
                          ? (
                          <Button
                            title={
                              <CustomText
                                style={{
                                  fontSize: 12,
                                  color: "white",
                                  fontWeight: 200,
                                }}
                              >
                                Lock/Float
                              </CustomText>
                            }
                            style={{
                              paddingHorizontal: 15,
                              paddingVertical: 8,
                              marginLeft: 0,
                              //borderRadius: 6,
                              borderWidth: 1,
                              borderColor: "#295B9A",
                            }}
                            onPress={() => {
                              handleLockRate(
                                row,
                                "Modal",
                                "Parent",
                                row["LineId"]
                              );
                            }}
                          />
                        ) : null}
                      </CustomText>
                    </View>
                  ) : VisibleRateBand[row["LineId"]] ? (
                    <View
                      style={
                        VisibleRateBand[row["LineId"]]
                          ? styles["showRateBand"]
                          : styles["hideRateBand"]
                      }
                    >
                      <View
                        style={[
                          {
                            display: VisibleRateBand[row["LineId"]]
                              ? "flex"
                              : "none",
                            backgroundColor: "#F2F2F2",
                            borderRightWidth: 1,
                            borderRightColor: "#5e9cd3",
                            borderRightStyle: "dotted",
                          },
                        ]}
                      >
                        <RateBandTable
                          RateBandClick={RateBandClick}
                          ActiveRate={ActiveRate}
                          RawRateBand={RawRateBand[row["LPA_CommonData"]] || []}
                          LineId={row["LineId"]}
                          LnProgActiveId={row["LnProgActiveId"]}
                          LineIds={
                            RawRateBand[row["LPA_CommonData"]][
                              "LineIds"
                            ]?.split(",") || []
                          }
                          CommonId={row["LPA_CommonData"]}
                          LockPeriodChange={LockPeriodChange}
                          RankByChange={RankByChange}
                          AdjustmentDetails={handleAdjustmentDetails}
                          LenderRank={handleLenderRank}
                          //RankCheckBox={handleLenderRank}
                          CheckBoxVal={Open}
                          // LockRateModal={handleLockRateModal}
                          handleLockRate={handleLockRate}
                          handleRunAUS={handleRunAUS}
                          handleProgramGuidelines={handleProgramGuidelines}
                        />
                      </View>
                    </View>
                  ) : (
                    <></>
                  )}
                </Fragment>
              );
            })}
          </View>
        </View>
      ) : (
        contextDetails["currentProcess"] === "ProductSearch" && (
          <View>
            <CustomText style={{ color: "red", fontSize: 25 }}>
              No Programs Were Found Matching Your Search Criteria
            </CustomText>
          </View>
        )
      )}
      <View style={{ position: "absolute" }}>
        {Open["PITI"] && (
          <PITI
            Open={Open}
            handleViewPITI={handleViewPITI}
            handleSavePITI={handleSavePITI}
          />
        )}
        {Open["Adjustments"] &&
          // ([32179, 2099, 26945].includes(Number(contextDetails["EmpNum"]) || true) ? (
            <>
              <AdjustmentDetailsNew
                Open={Open}
                handleAdjustmentDetails={handleAdjustmentDetails}
              />
            </>
          // ) : (
          //   <AdjustmentDetails
          //     Open={Open}
          //     handleAdjustmentDetails={handleAdjustmentDetails}
          //   />
          // ))
        }
        {Open["LenderRank"] && (
          <LenderRank Open={Open} handleLenderRank={handleLenderRank} />
        )}
        {Open["LockRate"] && (
          <LockRate
            Open={Open}
            handleLockRate={handleLockRate}
            handleTBD={handleTBD}
            handleValidateAddress={handleValidateAddress}
          />
        )}
        {Open["BorInfo"] && (
          <BorrowerInfo
            Open={Open}
            handleLockConfirm={handleLockAfterBorInfoValidation}
            handleChange={handleBorInfoModalForLock}
            handleTBD={handleTBD}
          />
        )}
        {Open["Alert"] && (
          <NotifyAlert
            handleOpen={setOpen}
            Msg={Open["Msg"]}
            Component={Open["component"]}
          />
        )}
        {/* <View>
          <Modal
            transparent={true}
            visible={Open["AddressValidation"] || false}
          > */}
        {Open["AddressValidation"] && (
          <AddressValidation
            Result={Open["AddressInfo"] || []}
            handleAddress={fnSelectAddress}
          />
        )}
        {/* </View>
          </Modal>
        </View> */}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "center",
    paddingHorizontal: 17,
  },
  table: {
    borderWidth: 0,
    borderColor: "#5e9cd3",
    borderStyle: "solid",
    borderRightWidth: 0,
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "rgba(0, 0, 0, 0.25) 0px 6px 20px",
  },
  header: {
    backgroundColor: "#F2F2F2",
    flexDirection: "row",
  },
  headerText: {
    color: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    width: "100%",
    borderRightWidth: 1,
    borderRightColor: "#fff",
    borderRightStyle: "dotted",
    fontSize: 12,
  },
  body: {
    flexDirection: "row",
  },
  bodyText: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    width: "100%",
    borderRightWidth: 0,
    borderRightColor: "#5e9cd3",
    borderRightStyle: "dotted",
    color: "#000000",
    fontSize: 12,
  },
  icon: {
    right: 20,
    position: "absolute",
  },
  colBorder: {
    borderRightWidth: 1,
    borderRightColor: "white",
    borderRightStyle: "dotted",
  },
  removeColBorder: {
    borderRightWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },

  showRateBand: {
    opacity: 1,
    transition: "all 150ms ease-in",
  },
  hideRateBand: {
    opacity: 0,
    maxHeight: 0,
    transition: "all 150ms ease-out",
  },
});

export default LoanProductTable;
