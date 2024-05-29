import React, { useContext, useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import Swatch from "./accessories/Swatch";
import XMLParser from "react-xml-parser";

import CustomText from "./accessories/CustomText";
import {
  AccordionCustom,
  AccordionItem,
  Button,
  InputBox,
} from "./accessories/CommomComponents";
import GridDropDown from "./accessories/GridDropDown";

import {
  cleanValue,
  context,
  fnFormatAmount,
  formatAmount,
  formatCurrency,
  formatDate,
  formatDateTimeNew,
  formatPercentage,
  generateBoxShadowStyle,
  handleAPI,
  handleBasicInfoInProd,
  handleGetSessionData,
  handleWholeSaleRights,
} from "./accessories/CommonFunctions";
import { LinearGradient } from "expo-linear-gradient";
import { web } from "./accessories/Platform";
import DropDownButton from "./accessories/DropDownButton";
import MenuDropDown from "./accessories/MenuDropDown";
import ArrowSpinner from "./accessories/ArrowSpinner";
import CancelLock from "./accessories/CancelLock";
import TransferLock from "./accessories/TransferLock";
import Footer from "./Footer";
import NotifyAlert from "./accessories/NotifyAlert";
import ExtendLock from "./accessories/ExtendLock";
import { Image } from "react-native-web";

const LockConfirmation = (props) => {
  let { handleLock } = props;
  const { contextDetails, setContextDetails } = useContext(context); //Get value from context
  const [LockedInfo, setLockedInfo] = useState({});
  const [LockDetails, setLockDetails] = useState({});
  const [Addons, setAddons] = useState([]);
  const [option, setOption] = useState({});
  const [isMenuOpen, setMenuOpen] = useState({
    bottom: false,
    top: false,
    CustomModal: false,
    //CreateNewScenario: false,
  });

  const [Open, setOpen] = useState({ Open: false });
  const [topMenuPosition, setTopMenuPosition] = useState({
    top: 0,
    left: 0,
    opacity: 0,
  });
  const [bottomMenuPosition, setBottomMenuPosition] = useState({
    top: 0,
    left: 0,
    opacity: 0,
  });
  const [modalComponent, setModalComponent] = useState({
    header: "",
    body: "",
    footer: "",
  });
  const topMenuUseref = useRef();
  const bottomMenuUseref = useRef();
  const acdRef = useRef();

  const myViewRef = useRef(null);
  useEffect(() => {
    async function PageLoad() {
      if (contextDetails["EmpNum"] == "Output") {
        let component = (
          <View style={{ padding: 7 }}>
            <View style={{ marginBottom: 3, padding: "15px", gap: 20 }}>
              <CustomText>Your Session is InActive!!!</CustomText>
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
                    style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                  >
                    {"Ok"}
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  {
                    borderColor: "#0d6ac5",
                    borderWidth: 2,
                    // backgroundColor: "#595959",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  },
                ]}
                disabled={true}
                onPress={() => {
                  setOpen(false);
                }}
              />
            </View>
          </View>
        );
        setOpen({ Alert: true, Msg: false, component: component });
        return;
      }

      handleDoLockRateProcess(
        0,
        contextDetails["EmpNum"],
        "",
        "",
        "",
        contextDetails["LoanId"],
        0,
        "",
        contextDetails["queryString"]["SessionId"],
        "",
        2, // Lock confirmation
        1, // Need Json
        1, // pageload flag
        1 //polling
      );

      handleGetInvestorIncome(contextDetails["LoanId"]);
      handleGetLeadSourceRights(contextDetails["EmpNum"]);
    }
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    setTimeout(() => {
      PageLoad();
    }, 1000);
    // Load Temp values untill the data comes
    handleLoadTempDetails();
  }, []);

  //======================================= Function declaration Begins ===============================================

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
    NeedJson,
    CallingFrom,
    Polling
  ) => {
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
    handleAPI({
      name: "DoLockRateProcess",
      params: obj,
    }).then((response) => {
      try {
        handleProdLoading(); // for production alone
        response = JSON.parse(response)["DataOut"];
        // let addons = response?.[2]?.["Addons"];
        // setAddons(addons);
        if (Object.keys(response?.[2]).length != 0) {
          setLockedInfo(response);
        }
        if (Object.keys(response?.[2]).length == 0 && Polling < 4) {
          Polling = Polling + 1;
          handleDoLockRateProcess(
            0,
            EmpNum,
            "",
            "",
            "",
            LoanId,
            0,
            "",
            SessionId,
            "",
            2, // Lock confirmation
            1,
            0, //pageload
            Polling
          );
        } else if (Polling > 4) {
          console.log("Polling count ==>", Polling);
        } else {
          let {
            showchangeintrate,
            allowlockstatus,
            funded,
            settled,
            withdrawn,
            showrelock,
            finaluw,
            closed,
            ClosingDocsSent,
            lockaccess,
          } = response?.[1]?.["LockConfObjects"]?.[0];
          let showLockExtend = 0,
            showLockbtn = 0,
            showChangeRate = 0,
            showCancelLock = 0,
            showFloatDown_ = 0,
            showRelock = 0;
          if (
            showchangeintrate == "1" &&
            (allowlockstatus == "1" || allowlockstatus == "0") &&
            funded == "0" &&
            settled == "0" &&
            withdrawn == 0
          )
            showLockExtend = 1;
          if (showrelock == "1" && settled == "0" && finaluw == "1")
            showLockbtn = 1;

          if (
            showchangeintrate == "1" &&
            funded == "0" &&
            settled == "0" &&
            finaluw == "0"
          )
            showChangeRate = 1;
          if (funded == "0" && settled == "0") showCancelLock = 1;
          if (
            showchangeintrate == "1" &&
            (allowlockstatus == "1" || allowlockstatus == "0") &&
            funded == "0" &&
            settled == "0" &&
            withdrawn == "0" &&
            closed == "0"
          )
            showFloatDown_ = 1;

          if (
            showchangeintrate == "0" &&
            lockaccess == "1" &&
            funded == "0" &&
            settled == "0" &&
            ClosingDocsSent == "0" &&
            withdrawn == 0
          )
            showRelock = 1;
          // Passing the details to Lock Confirmation page
          let existingInfo = JSON.parse(
            localStorage.getItem("LoanSelectioInfo") || "{}"
          );

          if (
            existingInfo[LoanId] &&
            Object.keys(existingInfo[LoanId]).length > 0
          ) {
            delete response?.[1]?.["LockConfObjects"]?.[0]["comppointsreq"];
            delete response?.[1]?.["LockConfObjects"]?.[0]["RateChosenPoint"];
            delete response?.[1]?.["LockConfObjects"]?.[0]["comppointsadj"];
            delete response?.[1]?.["LockConfObjects"]?.[0]["RateChosenPoint"];
            delete response?.[1]?.["LockConfObjects"]?.[0]["comppointsadj"];
            delete response?.[1]?.["LockConfObjects"]?.[0]["compamtadj"];
          } else {
            let addons = response?.[2]?.["Addons"];
            setAddons(addons);
          }
          setLockDetails((preLockDetails) => {
            return {
              ...preLockDetails,
              ...response?.[0]?.["RootObjects"]?.[0],
              ...response?.[1]?.["LockConfObjects"]?.[0],
              ...response?.[9]?.["InvestorInfo"]?.[0],
              showLockExtend,
              showLockbtn,
              showChangeRate,
              showCancelLock,
              showFloatDown_,
              showRelock,
              // extendLockModal: true,
            };
          });
          // handleOnchangeDetails(
          //   "ratesheetused",
          //   response?.[1]?.["LockConfObjects"]?.[0]['ratesheetused'],
          //   "SupervisorEdit"
          // );
          // Passing the details to Lock Confirmation page
          let json = {
            ...existingInfo,
            [LoanId]: {},
          };
          localStorage.setItem("LoanSelectioInfo", JSON.stringify(json));
        }
        /////////////////////////////// Needed Options ////////////////////////////
        if (CallingFrom == 1) handleOptions(response);
        /////////////////////////////// Needed Options ////////////////////////////

        console.log("DoLockRateProcess ===>", response);
      } catch (error) {
        console.log("DoLockRateProcess Error ==>", response);
      }
    });
  };
  const handleGetInvestorIncome = (LoanId) => {
    let obj = { LoanId };
    handleAPI({
      name: "GetInvIncome",
      params: obj,
    }).then((response) => {
      response = JSON.parse(response)["Table"][0];
      let {
        Column1,
        Column2,
        Column3,
        Column4,
        Column5,
        Column6,
        Column7,
        Column8,
        Column9,
        Column10,
        Column11,
        Column12,
        Column13,
        Column14,
        Column15,
      } = response;
      if (new Date(Column3).toDateString() == "Mon Jan 01 1900") {
        Column3 = "";
      }
      if (new Date(Column8).toDateString() == "Mon Jan 01 1900") {
        Column8 = "";
      }
      // let iLeadSource =  (Column10!= 0 && Column10 != 1) ||

      setLockDetails((preLockDetails) => {
        return {
          ...preLockDetails,
          Actincome: Column1,
          Expincome: Column2,
          funddate: Column3,
          LoanProgId: Column4,
          FICORetailAdj: Column5,
          WarmHotLeadAdj: Column6,
          CheckAmount: Column7,
          ChkReceivedDate: Column8,
          DocumentDate: Column9,
          LeadSource: Column10,
          LeadSourcePriceAdj: Column11,
          leadPricingAdjustment: Column11,
          ServicerLoanNumber: Column12,
          blPriceExceptionApproved: Column13,
          Relock30: Column14,
          CoprAdj: Column15,
        };
      });

      //
      // console.log("GetInvIncome ==>", response);
    });
  };
  const handleGetLeadSourceRights = (EmpNum) => {
    let obj = { EmpNum };
    handleAPI({
      name: "GetLeadSourceRights",
      params: obj,
    }).then((response) => {
      response = JSON.parse(response)["Table"][0];
      setLockDetails((preLockDetails) => {
        return {
          ...preLockDetails,
          leadsourceright: 1, //response["Column1"],
        };
      });
      //console.log("GetLeadSourceRights ==>", response);
    });
  };
  const handleMenu = (position) => {
    if (position == "Top")
      setMenuOpen({ ...isMenuOpen, top: !isMenuOpen["top"] });
    else if (position == "Bottom")
      setMenuOpen({ ...isMenuOpen, bottom: !isMenuOpen["bottom"] });
    else setMenuOpen({ ...isMenuOpen, bottom: false, top: false });
  };
  const handleMenuOpen = (position) => {
    if (position == "Top") {
      topMenuUseref.current.measure((_fx, _fy, _w, h, _px, py) => {
        setTopMenuPosition({
          top: py + (web ? 40 : 50),
          left: _px + (web ? -198 : -195),
          opacity: 1,
        });
      });
    } else if (position == "Bottom") {
      bottomMenuUseref.current.measure((_fx, _fy, _w, h, _px, py) => {
        setBottomMenuPosition({
          bottom: 60,
          left: _px + (web ? 10 : -195),
          opacity: 1,
        });
      });
    }
  };

  const handleOptions = (response) => {
    let investorOpt = response?.[7]?.VendorList;
    if (Array.isArray(investorOpt)) {
      investorOpt.splice(0, 0, { ID: "-2", Company: "Add Investor..." });
      investorOpt.splice(0, 0, { ID: "-1", Company: "Select" });
    }
    investorOpt = investorOpt
      ?.filter((e) => e["Company"])
      .map((e) => ({
        TypeOption: e["ID"],
        TypeDesc: e["Company"],
      }));
    let loanServicers = response?.[6]?.["@LoanServicers"];
    if (Array.isArray(loanServicers)) {
      loanServicers.splice(0, 0, { ContactId: "0", Company: "Select" });
    }
    loanServicers = loanServicers
      ?.filter((e) => e["Company"])
      .map((e) => ({
        TypeOption: e["ContactId"],
        TypeDesc: e["Company"],
      }));

    let RateSheetDateOpt = response?.[3]?.["RateSheetDateValues"].map((e) => ({
      TypeOption: e["RateSheetDateValue"],
      TypeDesc: e["RateSheetDateValue"],
    }));
    let RateSheetIdsOpt = response?.[4]?.["@RateSheetIDs"].map((e) => ({
      TypeOption: e["IntRateSheetId"],
      TypeDesc: e["StrRateSheetId"],
    }));
    let LockTypeOpt = [
      { TypeDesc: "Mandatory", TypeOption: "0" },
      { TypeDesc: "Best Effort", TypeOption: "1" },
    ];
    let LeadSourceOpt = [
      { TypeDesc: "None", TypeOption: "0" },
      { TypeDesc: "Self Generated", TypeOption: "1" },
      { TypeDesc: "Warm Lead", TypeOption: "2" },
      { TypeDesc: "Hot Lead", TypeOption: "3" },
      { TypeDesc: "Loan Sifter", TypeOption: "4" },
    ];
    let ProfitMarginOpt = [
      { TypeDesc: "Select", TypeOption: "0" },
      { TypeDesc: "Approved", TypeOption: "1" },
    ];

    setOption({
      investorOpt,
      loanServicers,
      LockTypeOpt,
      LeadSourceOpt,
      ProfitMarginOpt,
      RateSheetDateOpt,
      RateSheetIdsOpt,
      filteredRateSheetIdsOpt: RateSheetIdsOpt,
    });
  };
  const fnCalculateValue = (name, value) => {
    let {
      comppointsadj,
      compamtadj,
      dblCompAmtAdj,
      Lendpointsreq,
      dblLendamtreq,
      RateChosen = "Charge",
      comppointsreq,
      compamtreq,
    } = LockDetails;
    let tltPoint = 0,
      tltAmt = 0,
      val = 0;
    if (["LenderPoint", "LenderAmt"].includes(name)) {
      tltPoint =
        parseFloat(cleanValue(comppointsadj)) +
        parseFloat(cleanValue(Lendpointsreq));
      tltAmt =
        parseFloat(cleanValue(dblCompAmtAdj)) +
        parseFloat(cleanValue(dblLendamtreq));
    } else if (
      ["RateChosenPoint", "RateChosenAmt", "RateChosen"].includes(name)
    ) {
      comppointsadj = parseFloat(cleanValue(comppointsadj));
      compamtadj = parseFloat(cleanValue(compamtadj));
      if (comppointsadj < 0) {
        comppointsadj = comppointsadj.toString().replace("-", "");
        comppointsadj = `(${formatPercentage(comppointsadj, 3)})`;
      } else comppointsadj = `${formatPercentage(comppointsadj, 3)}`;

      if (compamtadj < 0) {
        compamtadj = compamtadj.toString().replace("-", "");
        compamtadj = `(${formatCurrency(compamtadj)})`;
      } else compamtadj = `${formatCurrency(compamtadj)}`;
    }

    if (name == "LenderPoint") val = formatPercentage(tltPoint, 3);
    else if (name == "LenderAmt") val = formatCurrency(tltAmt);
    else if (name == "RateChosenPoint") val = comppointsadj;
    else if (name == "RateChosenAmt") val = compamtadj;
    else if (name == "RateChosen")
      val = comppointsadj.indexOf("(") != -1 ? "Credit" : "Charge";
    else if (name == "Adjustment")
      val = value.indexOf("-") != -1 ? `(${value.replace("-", "")})` : value;
    return val;
  };
  const handleOnchangeDetails = (name, value, section) => {
    let additionalObj = {};
    if (name == "LeadSource") {
      if (value == 0) {
        additionalObj["leadPricingAdjustment"] = 0;
        additionalObj["WarmHotLeadAdj"] = "0.0000%";
      } else {
        if (value != 1) additionalObj["leadPricingAdjustment"] = 1;
        else additionalObj["leadPricingAdjustment"] = 0;

        if (value == 2) additionalObj["WarmHotLeadAdj"] = "(0.4500%)";
        else if (value == 3) additionalObj["WarmHotLeadAdj"] = "(0.8500%)";
        else if (value != 2 || value != 3)
          additionalObj["WarmHotLeadAdj"] = "0.0000%";
      }
    } else if (name == "CancelLockReason") {
      additionalObj["cancelLockReasonValidation"] = false;
    } else if (name == "TransferLock") {
      additionalObj["TLDetails"] = "";
      additionalObj["TLConfirmation"] = false;
      additionalObj["TLError"] = false;
      additionalObj["TLErrorReason"] = "";
    } else if (name == "VendorId") {
      if (value == -2) handleInvestor(value);
    } else if (name == "ratesheetdate") {
      let maxDate = new Date(value);
      let maxRateSheetId = option?.["RateSheetIdsOpt"].filter((e) => {
        let rateSheet = e["TypeDesc"].split(".");
        rateSheet.pop();
        let rs = rateSheet.join("/");
        if (maxDate <= new Date(rs)) return e;
      });
      maxRateSheetId.unshift({ TypeOption: 0, TypeDesc: "--Select--" });
      setOption((preOpt) => {
        return {
          ...preOpt,
          filteredRateSheetIdsOpt: maxRateSheetId,
        };
      });
    } else if (["comppointsadj", "compamtadj"].includes(name)) {
      let calVal = "00",
        lnAmount = parseFloat(cleanValue(LockDetails["baseloanamt"]));
      if (name == "comppointsadj") {
        calVal = (parseFloat(value) * lnAmount) / 100;
        additionalObj["compamtadj"] = calVal.toFixed(2);
      } else {
        calVal = (parseFloat(value) / lnAmount) * 100;
        additionalObj["comppointsadj"] = calVal.toFixed(3);
      }
    }

    if (
      ["investorInfo", "SupervisorEdit"].includes(section) ||
      name == "LeadSource"
    ) {
      additionalObj["saveInvestor"] = true;
      // Get the element with ID "btnSave"
      let btnSave = parent.document.getElementById("btnSave");
      if (btnSave) {
        btnSave.classList.add("btn", "btn-primary");
        btnSave.classList.remove("btnDisable");
        btnSave.removeAttribute("disabled");
      }
    }

    setLockDetails((prevLockDetails) => {
      return {
        ...prevLockDetails,
        ...additionalObj,
        [name]: value,
      };
    });
    // if (
    //   [
    //     "escrowrequest",
    //     "nonprofitgiftfund",
    //     "propertylistedonmls",
    //     "energyeffmort",
    //   ].includes(name)
    // ) {
    //   setTimeout(() => {
    //     handleSaveBorSwatch();
    //   }, 1000);
    // }
  };
  const handleOnBlur = (name, value) => {
    if (
      [
        "WholesaleLockDate",
        "WholesaleDeliveryDate",
        "WholesaleLockExpire",
        "complockeddate",
        "complockexpire",
      ].includes(name)
    ) {
      value = formatDateTimeNew(value);
    }
    setLockDetails((prevLockDetails) => {
      return {
        ...prevLockDetails,
        [name]: value,
      };
    });
  };
  const handleLockHistoryOpen = () => {
    let url = `../../../BorrowerApplication/Presentation/Webforms/LockRateHistory.aspx?SessionId=${contextDetails["SessionId"]}&LoanId=${contextDetails["LoanId"]}&HistType=0`;

    window.open(
      url,
      "LockRateHistory",
      "width=1200,height=900,resizable=1,scrollbars=1"
    );
  };
  // ***************************** Page Save Begins*****************************
  const handleSaveBorSwatch = async () => {
    let RequestEscrow = 0,
      EnergyEffMort = 0,
      PropertylistedonMLS = 0,
      NonProfitGiftFund = 0;
    setLockDetails((preLockDetails) => {
      RequestEscrow = preLockDetails["escrowrequest"];
      EnergyEffMort = preLockDetails["energyeffmort"];
      PropertylistedonMLS = preLockDetails["propertylistedonmls"];
      NonProfitGiftFund = preLockDetails["nonprofitgiftfund"];
      return {
        ...preLockDetails,
      };
    });
    let SaveXml =
      '<root><row  RequestEscrow="' +
      RequestEscrow +
      '" EnergyEffMort="' +
      EnergyEffMort +
      '"  PropertylistedonMLS="' +
      PropertylistedonMLS +
      '"  NonProfitGiftFund="' +
      NonProfitGiftFund +
      '"  PropertyTaxExempt="0" /></root>';
    let obj = {
      LoanId: contextDetails["LoanId"],
      SaveXml: SaveXml,
    };
    //console.log("Save Xml ==>", SaveXml);
    let Response = await handleAPI({
      name: "SaveConfirmationFields",
      params: obj,
    }).then((response) => {
      //console.log("SaveConfirmationFields ==>", response);
      return response;
    });
    return Response;
  };

  const handleInvestorSave = async () => {
    let {
      InvestorLoanId,
      WholesaleMandatoryLock,
      VendorId,
      LockedWithInvestor,
      CommitmentId,
      fSRPPrice,
      fInvestorBasePrice,
      fINVestorAdj,
      blPriceExceptionApproved,
      LoanServicer,
      LeadSource,
      leadPricingAdjustment,
      ServicerLoanNumber,
      CorporateAdj,
      WarmHotLeadAdj,
      WholesaleNetPrice,
      WholesaleLocked,
      WholesaleLockDays,
      WholesaleLockDate,
      WholesaleDeliveryDate,
      WholesaleLockExpire,
    } = LockDetails;
    WholesaleDeliveryDate = WholesaleDeliveryDate || "";
    leadPricingAdjustment = leadPricingAdjustment || "0";
    WholesaleLocked = WholesaleLocked || 0;
    CorporateAdj = CorporateAdj || 0.0;
    let warmHotFlag = 0;
    if (LeadSource == 2 || LeadSource == 3) warmHotFlag = 1;
    else warmHotFlag = 0;

    let xmldoc =
      '<root><request Query="SaveInvestorInfo" LoanID="' +
      contextDetails["LoanId"] +
      '" WholeSaleLockDays="' +
      WholesaleLockDays +
      '" WholeSaleLockDate="' +
      WholesaleLockDate +
      '" WholeSaleLockExpire="' +
      WholesaleLockExpire + // Empty
      '" InvestorLoanId="' +
      InvestorLoanId +
      '" WholesaleInvestorRebate="' +
      0 +
      '" WholeSaleDeliveryDate="' +
      WholesaleDeliveryDate +
      '" LockType="' +
      WholesaleMandatoryLock +
      '" Investor="' +
      VendorId +
      '" WholesaleNetRebate="' +
      0 +
      '" WholesaleNetPrice="' +
      WholesaleNetPrice +
      '" LockedWInv="' +
      WholesaleLocked +
      '" EmployeeNumber="' +
      contextDetails["EmpNum"] +
      '" CommitmentId="' +
      CommitmentId +
      '" fSRPPrice="' +
      fSRPPrice +
      '" fInvestorAdj="' +
      fINVestorAdj +
      '" fInvestorBasePrice="' +
      fInvestorBasePrice +
      '" LoanServicer="' +
      LoanServicer +
      '" FICORetailAdj="' +
      0 +
      '" CheckReceivedDate="' +
      "" +
      '" CheckReceivedAmt="' +
      0 +
      '" DocumentReviewed="' +
      0 +
      '" LeadSource="' +
      LeadSource +
      '" LeadSourcePriceAdj="' +
      leadPricingAdjustment +
      '" ExpectedIncome="' +
      "0.00" +
      '" ActualIncome="' +
      0 +
      '" DateFunded="' +
      "" +
      '" ServicerLoanNumber="' +
      ServicerLoanNumber +
      '" WarmHotLeadAdjval="' +
      cleanValue(WarmHotLeadAdj, 3) +
      '" CorpAdj="' +
      CorporateAdj +
      '" ProfileMarginNormalRng="' +
      blPriceExceptionApproved +
      '" WarmHotLeadFlag="' +
      warmHotFlag +
      '"></request></root>';
    let obj = {
      Loanid: contextDetails["LoanId"],
      strXml: xmldoc,
    };
    //console.log("Save Xml ==>", xmldoc);
    let Response = await handleAPI({
      name: "UpdateInvestorInfo",
      params: obj,
    }).then((response) => {
      let res = response.split("~");
      // if (res[0] == 1) {
      //   setLockDetails({ ...LockDetails, saveInvestor: false });
      // }
      // console.log("UpdateInvestorInfo ==>", response);
      return res;
    });
    return Response;
  };
  const handleSupervisorSave = async () => {
    let {
      totaladjrate,
      totaladjpoints,
      compperiodreq,
      comprateadj,
      BaseRate,
      BasePoints,
      comppointsadj,
      complockeddate,
      complockexpire,
      SupNotes,
      ratesheetused,
      ratesheetdate,
      selWorseCase,
    } = LockDetails;

    ratesheetused = option?.["RateSheetIdsOpt"].filter(
      (e) => e["TypeDesc"] == ratesheetused || e["TypeOption"] == ratesheetused
    );
    ratesheetused = ratesheetused[0]["TypeOption"];
    totaladjrate = cleanValue(totaladjrate);
    totaladjpoints = cleanValue(totaladjpoints);
    compperiodreq = cleanValue(compperiodreq);
    comprateadj = cleanValue(comprateadj);

    BaseRate = parseFloat(comprateadj) - parseFloat(totaladjrate);
    BasePoints = parseFloat(comppointsadj) - parseFloat(totaladjpoints);
    BasePoints = BasePoints.toFixed(4)
    selWorseCase = selWorseCase || 0;
    let strXML =
      '<Root><BaseData EmpNum="' +
      contextDetails["EmpNum"] +
      '" BasePeriod="' +
      compperiodreq +
      '" BaseRate="' +
      BaseRate +
      '" BasePoints="' +
      BasePoints +
      '" LockedDate="' +
      complockeddate +
      '" LockExpDate="' +
      complockexpire +
      '" FinalRate="' +
      comprateadj +
      '" FinalPoints="' +
      comppointsadj +
      '" RateSheetID="' +
      ratesheetused +
      '" RateSheetDate="' +
      ratesheetdate +
      '" WorseCase="' +
      selWorseCase +
      '" Notes="' +
      SupNotes +
      '"';
    strXML += "/></Root>";
    console.log({strXML})
    let obj = {
      Loanid: contextDetails["LoanId"],
      strXml: strXML,
    };
    //console.log("Save Xml ==>", strXML);
    let Response = await handleAPI({
      name: "SaveSupervisorLock",
      params: obj,
    }).then((response) => {
      let res = response;

      //console.log("SaveSupervisorLock ==>", response);
      return res;
    });
    return Response;
  };
  // ***************************** Page Save Ends*****************************

  const handleCancelSuperviserEdit = () => {
    let { complockeddate, ratesheetdate, ratesheetused } =
      LockedInfo?.[1]?.["LockConfObjects"]?.[0];

    let { WarmHotLeadAdj, CorporateAdj } =
      LockedInfo?.[9]?.["InvestorInfo"]?.[0];
    setLockDetails((preLockDetails) => {
      return {
        ...preLockDetails,
        complockeddate,
        ratesheetdate,
        ratesheetused,
        WarmHotLeadAdj,
        CorporateAdj,
      };
    });
  };
  // ********************************* Cancel Lock Starts here ********************
  const fnCancelLock = () => {
    setLockDetails((preLockDetails) => {
      return {
        ...preLockDetails,
        cancelLockModal: true,
        cancelLockReasonValidation: false,
        cancellingLock: false,
        CancelLockReason: "",
      };
    });
  };
  const handleCancelLock = async () => {
    let { EmpNum, LoanId } = contextDetails;
    let { CancelLockReason } = LockDetails;
    //setModalComponent({ ...modalComponent, spinner: true });
    if (!CancelLockReason) {
      setLockDetails((preLockDetails) => {
        return { ...preLockDetails, cancelLockReasonValidation: true };
      });
      return;
    }
    setLockDetails((preLockDetails) => {
      return { ...preLockDetails, cancellingLock: true };
    });
    //let EmpType = await handleGetSessionData(SessionId, "type");
    let Response = await handleGetJournalPost(LoanId);
    let Result = "";
    Response = Response.split("~");
    if (Response[0] == "") {
      //Do Nothing
    } else if (Response[0] == "0" || Response[2] != "1") {
      let XmlDataIn =
        '<param Name="LoanID">' +
        LoanId +
        '</param><param Name="ProcessId">1</param><param Name="Posting_Action">0</param><param Name="EmpNum">' +
        EmpNum +
        "</param>";
      Result = await handleUnPostJournal(XmlDataIn);
    }

    Result = await SaveLockRateCancelReason(
      LoanId,
      EmpNum,
      CancelLockReason,
      "BrokerCancel"
    );
    if (Result == 1) {
      setModalComponent({ ...modalComponent, visible: false });
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          LNCancel: 1,
          IsLocked: 0,
        };
      });
      handleLock({ LoanLocked: false });
      setTimeout(() => {
        parent.window.GetLoanPulse(); // To refresh the Loan Pulse area
      }, 100);
    }
    //console.log("Cancel Lock ==>", Result);
  };
  const handleGetJournalPost = async (LoanId) => {
    let obj = { LoanId };
    let Response = await handleAPI({
      name: "getJournalPostStatus",
      params: obj,
    }).then((response) => {
      return response;
    });
    return Response;
  };
  const handleUnPostJournal = async (XmlDataIn) => {
    let obj = { XmlDataIn };
    let Response = await handleAPI({
      name: "getJournalPostStatus",
      params: obj,
    }).then((response) => {
      return response;
    });
    return Response;
  };
  const SaveLockRateCancelReason = async (
    Loanid,
    EmpNum,
    CancelReason,
    CancelType
  ) => {
    let obj = {
      Loanid,
      EmpNum,
      CancelReason: CancelReason || "",
      CancelType,
    };
    let Response = await handleAPI({
      name: "SaveLockRateCancelReason",
      params: obj,
    }).then((response) => {
      return response;
    });
    return Response;
  };
  // ********************************* Cancel Lock Ends here ********************

  // ********************************* Transfer Lock Starts here ********************
  const fnTransferLock = () => {
    // let strXml =
    //   '<Root><row RateSheetDate="03/05/2024" RateSheetID="2024.03.05.05" iRateSheetID_From="18578" DateRateLocked="03/06/2024" InterestRateSetDate="03/05/2024" DeliveryExpirationDate="04/05/2024" BasePriceFromRateSheet="6.788" FinalPriceFromRateSheet="4.403"/></Root>';

    setLockDetails((preLockDetails) => {
      return {
        ...preLockDetails,
        transferLockModal: true,
        transferLockValidation: false,
        transferringLock: false,
        transferLoanId: 0,
      };
    });
  };

  const handleGetTransferInfo = () => {
    let obj = {
      Loanid: contextDetails["LoanId"],
      TargetLoanid: LockDetails["transferLoanId"],
    };
    handleAPI({
      name: "GoLockTransfer",
      params: obj,
    }).then((response) => {
      response = response.split("~");
      if (response[0] == 0) {
        let errMsg = response[1];
        errMsg = errMsg.split(";");
        let errorComponent = errMsg.map((e) => {
          if (e.length > 5) {
            return (
              <CustomText
                style={[
                  styles["minText"],
                  { fontWeight: 200, fontSize: 12, color: "#a94442" },
                ]}
              >
                {`${e.trim()}.`}
              </CustomText>
            );
          }
        });
        setLockDetails({
          ...LockDetails,
          TLErrorReason: errorComponent,
          TLError: true,
        });
      } else if (response[0] == 1) {
        let strXml = response[1];
        strXml = new XMLParser().parseFromString(strXml);
        let {
          BasePriceFromRateSheet,
          DateRateLocked,
          DeliveryExpirationDate,
          // FinalPriceFromRateSheet,
          InterestRateSetDate,
          RateSheetDate,
          RateSheetID,
          // iRateSheetID_From,
        } = strXml["children"][0]["attributes"];

        let TLDetails = (
          <View>
            <CustomText style={{ marginBottom: 15 }} bold={true}>
              Please confirm below details for Transfer of Lock:
            </CustomText>
            <View style={{ gap: 3 }}>
              <View style={[styles["row"]]}>
                <CustomText
                  bold={true}
                  style={[styles["MidText"], { color: "#000" }]}
                >
                  {`RateSheet Date: `}
                </CustomText>
                <CustomText styles={{ fontSize: 11 }}>
                  {RateSheetDate}
                </CustomText>
              </View>
              <View style={styles["row"]}>
                <CustomText
                  bold={true}
                  style={[styles["MidText"], { color: "#000" }]}
                >
                  {`RateSheet ID: `}
                </CustomText>
                <CustomText styles={{ fontSize: 11 }}>{RateSheetID}</CustomText>
              </View>
              <View style={styles["row"]}>
                <CustomText
                  bold={true}
                  style={[styles["MidText"], { color: "#000" }]}
                >
                  {`Date Rate Locked: `}
                </CustomText>
                <CustomText styles={{ fontSize: 11 }}>
                  {DateRateLocked}
                </CustomText>
              </View>
              <View style={styles["row"]}>
                <CustomText
                  bold={true}
                  style={[styles["MidText"], { color: "#000" }]}
                >
                  {`Interest Rate Set Date: `}
                </CustomText>
                <CustomText styles={{ fontSize: 11 }}>
                  {InterestRateSetDate}
                </CustomText>
              </View>
              <View style={styles["row"]}>
                <CustomText
                  bold={true}
                  style={[styles["MidText"], { color: "#000" }]}
                >
                  {`Delivery Expiration Date: `}
                </CustomText>
                <CustomText styles={{ fontSize: 11 }}>
                  {DeliveryExpirationDate}
                </CustomText>
              </View>
              <View style={styles["row"]}>
                <CustomText
                  bold={true}
                  style={[styles["MidText"], { color: "#000" }]}
                >
                  {`Base Price: `}
                </CustomText>
                <CustomText styles={{ fontSize: 11 }}>
                  {formatPercentage(BasePriceFromRateSheet)}
                </CustomText>
              </View>
            </View>
          </View>
        );

        setLockDetails({
          ...LockDetails,
          TLDetails: TLDetails,
          TLDetailsXml: response[1],
          TLConfirmation: true,
          TLError: false,
        });
      }
      //console.log("GoLockTransfer ===>", response);
    });
  };
  const handleTransferLock = () => {
    setLockDetails((preLockDetails) => {
      return {
        ...preLockDetails,
        transferringLock: true,
      };
    });
    let obj = {
      Loanid: contextDetails["LoanId"],
      TargetLoanid: LockDetails["transferLoanId"],
      TransferXml: LockDetails["TLDetailsXml"],
      EmpNum: contextDetails["EmpNum"],
    };
    handleAPI({
      name: "DoTransferLock",
      params: obj,
    }).then((response) => {
      response = response.split("~");
      if (response[0] == 0) {
        let errMsg = response[1];
        errMsg = errMsg.split(";");
        let errorComponent = errMsg.map((e) => (
          <CustomText
            style={[
              styles["minText"],
              { fontWeight: 200, fontSize: 12, color: "#a94442" },
            ]}
          >
            {`${e.trim()}.`}
          </CustomText>
        ));
        setLockDetails({
          ...LockDetails,
          TLErrorReasonAfterTL: errorComponent,
          ErrorAfterTL: true,
        });
      } else if (response[0] == 1) {
        setLockDetails((preLockDetails) => {
          return {
            ...preLockDetails,
            transferringLock: false,
            TLDetails: "",
            TLConfirmation: true,
            TLError: false,
            transferLockModal: false,
          };
        });
        handleMenu();
        handleDoLockRateProcess(
          0,
          contextDetails["EmpNum"],
          "",
          "",
          "",
          contextDetails["LoanId"],
          0,
          "",
          contextDetails["queryString"]["SessionId"],
          "",
          2, // Lock confirmation
          1
        );
      }
    });
  };

  // ********************************* Transfer Lock Ends here ******************************

  const handlePageSave = async () => {
    let borSwatchWait = await handleSaveBorSwatch();
    if (LockDetails["SupervisorEdit"]) {
      let supervisorSaveWait = await handleSupervisorSave();
      if (supervisorSaveWait == 1) {
        // setLockDetails({
        //   ...LockDetails,
        //   saveSupervisor: false,
        //   SupervisorEdit: false,
        //   saveInvestor: false,
        // });
          
          handleDoLockRateProcess(
            0,
            contextDetails["EmpNum"],
            "",
            "",
            "",
            contextDetails["LoanId"],
            0,
            "",
            contextDetails["queryString"]["SessionId"],
            "",
            2, // Lock confirmation
            1
          );
      }
    }
    let investorWait = await handleInvestorSave();

    handleDoLockRateProcess(
      0,
      contextDetails["EmpNum"],
      "",
      "",
      "",
      contextDetails["LoanId"],
      0,
      "",
      contextDetails["queryString"]["SessionId"],
      "",
      2, // Lock confirmation
      1
    );
    let btnSave = parent.document.getElementById("btnSave");
    if (btnSave) {
      btnSave.classList.remove("btn", "btn-primary");
      btnSave.classList.add("btnDisable");
      btnSave.setAttribute("disabled", "disabled");
    }
    setLockDetails({
      ...LockDetails,
      saveSupervisor: false,
      SupervisorEdit: false,
      saveInvestor: false,
    });
    handleSuperviserEditProd(2);
  };

  // ********************************* Extend Lock Starts here *********************************

  const handleInitExtendLock = async () => {
    let { allowlockstatus, disclosureSigned, addresschangedaftervalidation } =
      LockDetails;
    if (allowlockstatus != 1) {
      if (allowlockstatus == 4 || allowlockstatus == 5) {
        let component = (
          <View style={{ padding: 15 }}>
            <View style={{ marginBottom: 3, gap: 20 }}>
              <CustomText>
                Interest Rates are currently unavailable. Please check back
                later for pricing and rate lock options.
              </CustomText>
            </View>
            <View
              style={{
                justifyContent: "flex-end",
                flexDirection: "row",
                paddingBottom: "5px",
              }}
            >
              <Button
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                  >
                    {"Ok"}
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  {
                    borderColor: "#262626",
                    borderWidth: 2,
                    backgroundColor: "#595959",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  },
                ]}
                disabled={true}
                onPress={() => {
                  setOpen(false);
                }}
              />
            </View>
          </View>
        );
        setOpen({ Alert: true, Msg: false, component: component });
      }
      return;
    }
    let wholeSaleAcceeRights = await handleWholeSaleRights(
      contextDetails["EmpNum"]
    );
    let validatedFlag = 0;
    setContextDetails((prevContext) => {
      return {
        ...prevContext,
        wholeSaleAcceeRights: wholeSaleAcceeRights || 0,
      };
    });
    let component = "";
    if (disclosureSigned == 0) {
      if (wholeSaleAcceeRights != 0) {
        validatedFlag = 1;
        component = (
          <View style={{ padding: 15 }}>
            <View style={{ marginBottom: 3, padding: "15px", gap: 20 }}>
              <CustomText>
                A lock extension is not allowed until after the initial
                disclosures are eSigned.
              </CustomText>
            </View>
            <View
              style={{
                justifyContent: "flex-end",
                flexDirection: "row",
                paddingBottom: "5px",
              }}
            >
              <Button
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                  >
                    {"Override"}
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  {
                    borderColor: "#0d6ac5",
                    borderWidth: 2,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  },
                ]}
                onPress={() => {
                  fnAddressValidation();
                  // setOpen(false);
                }}
              />
              <Button
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                  >
                    {"Close"}
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  {
                    borderColor: "#262626",
                    borderWidth: 2,
                    backgroundColor: "#595959",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  },
                ]}
                disabled={true}
                onPress={() => {
                  setOpen(false);
                }}
              />
            </View>
          </View>
        );
      } else {
        component = (
          <View style={{ padding: 15 }}>
            <View style={{ marginBottom: 3, padding: "15px", gap: 20 }}>
              <CustomText>
                A lock extension is not allowed until after the initial
                disclosures are eSigned.
              </CustomText>
            </View>
            <View
              style={{
                justifyContent: "flex-end",
                flexDirection: "row",
                paddingBottom: "5px",
              }}
            >
              <Button
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                  >
                    {"Close"}
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  {
                    borderColor: "#262626",
                    borderWidth: 2,
                    backgroundColor: "#595959",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  },
                ]}
                disabled={true}
                onPress={() => {
                  setOpen(false);
                }}
              />
            </View>
          </View>
        );
      }
      setOpen({ Alert: true, Msg: false, component: component });
    }
    if (addresschangedaftervalidation == 1) {
      if (wholeSaleAcceeRights != 0) {
        if (validatedFlag != 1) {
          component = (
            <View style={{ padding: 15 }}>
              <View style={{ marginBottom: 3, padding: "15px", gap: 20 }}>
                <CustomText>
                  A lock extension is not allowed if the property address has
                  changed from the original Rate Lock.
                </CustomText>
              </View>
              <View
                style={{
                  justifyContent: "flex-end",
                  flexDirection: "row",
                  paddingBottom: "5px",
                }}
              >
                <Button
                  title={
                    <CustomText
                      bold={false}
                      style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                    >
                      {"Override"}
                    </CustomText>
                  }
                  style={[
                    styles["btn"],
                    {
                      borderColor: "#0d6ac5",
                      borderWidth: 2,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                    },
                  ]}
                  onPress={() => {
                    fnListExtendOptions();
                    setOpen(false);
                  }}
                />
                <Button
                  title={
                    <CustomText
                      bold={false}
                      style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                    >
                      {"Close"}
                    </CustomText>
                  }
                  style={[
                    styles["btn"],
                    {
                      borderColor: "#262626",
                      borderWidth: 2,
                      backgroundColor: "#595959",
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                    },
                  ]}
                  disabled={true}
                  onPress={() => {
                    setOpen(false);
                  }}
                />
              </View>
            </View>
          );
        }
      } else {
        component = (
          <View style={{ padding: 15 }}>
            <View style={{ marginBottom: 3, padding: "15px", gap: 20 }}>
              <CustomText>
                A lock extension is not allowed if the property address has
                changed from the original Rate Lock.
              </CustomText>
            </View>
            <View
              style={{
                justifyContent: "flex-end",
                flexDirection: "row",
                paddingBottom: "5px",
              }}
            >
              <Button
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                  >
                    {"Close"}
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  {
                    borderColor: "#262626",
                    borderWidth: 2,
                    backgroundColor: "#595959",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  },
                ]}
                disabled={true}
                onPress={() => {
                  setOpen(false);
                }}
              />
            </View>
          </View>
        );
      }
      setOpen({ Alert: true, Msg: false, component: component });
    }
    if (disclosureSigned == 1 && addresschangedaftervalidation == 0) {
      fnListExtendOptions();
    }
  };

  const fnAddressValidation = () => {
    let { addresschangedaftervalidation } = LockDetails;
    let component = "";
    if (addresschangedaftervalidation == 1) {
      component = (
        <View style={{ padding: 15 }}>
          <View style={{ marginBottom: 3, padding: "15px", gap: 20 }}>
            <CustomText>
              A lock extension is not allowed if the property address has
              changed from the original Rate Lock.
            </CustomText>
          </View>
          <View
            style={{
              justifyContent: "flex-end",
              flexDirection: "row",
              paddingBottom: "5px",
            }}
          >
            <Button
              title={
                <CustomText
                  bold={false}
                  style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                >
                  {"Override"}
                </CustomText>
              }
              style={[
                styles["btn"],
                {
                  borderColor: "#0d6ac5",
                  borderWidth: 2,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                },
              ]}
              onPress={() => {
                fnListExtendOptions();
                setOpen(false);
              }}
            />
            <Button
              title={
                <CustomText
                  bold={false}
                  style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                >
                  {"Close"}
                </CustomText>
              }
              style={[
                styles["btn"],
                {
                  borderColor: "#262626",
                  borderWidth: 2,
                  backgroundColor: "#595959",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                },
              ]}
              disabled={true}
              onPress={() => {
                setOpen(false);
              }}
            />
          </View>
        </View>
      );
      setOpen({ Alert: true, Msg: false, component: component });
    } else {
      fnListExtendOptions();
    }
  };
  const fnListExtendOptions = async () => {
    let Result = await handleCheckExtensionUsed();
    setContextDetails((prevContext) => {
      return {
        ...prevContext,
        ExtensionUsed: JSON.parse(Result)["Table"][0]["Column1"],
      };
    });
    setLockDetails((preLockDetails) => {
      return {
        ...preLockDetails,
        extendLockModal: true,
      };
    });
  };
  const handleCheckExtensionUsed = async () => {
    let obj = { Loanid: contextDetails["LoanId"] };
    let Response = await handleAPI({
      name: "CheckExtensionUsed",
      params: obj,
    }).then((response) => {
      return response;
    });
    return Response;
  };
  const handleExtendLock = (row) => {
    let { TypeOption, OtherLookUp } = row?.[0];
    let totalExtDays =
      parseInt(TypeOption) + parseInt(contextDetails["ExtensionUsed"] || 0);
    let component = "";
    if (!row) {
      component = (
        <View style={{ padding: 15 }}>
          <View style={{ marginBottom: 3, padding: "15px", gap: 20 }}>
            <CustomText>
              Atleast one option should be selected for extending the lock rate.
            </CustomText>
          </View>
          <View
            style={{
              justifyContent: "flex-end",
              flexDirection: "row",
              paddingBottom: "5px",
            }}
          >
            <Button
              title={
                <CustomText
                  bold={false}
                  style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                >
                  {"Close"}
                </CustomText>
              }
              style={[
                styles["btn"],
                {
                  borderColor: "#262626",
                  borderWidth: 2,
                  backgroundColor: "#595959",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                },
              ]}
              disabled={true}
              onPress={() => {
                setOpen(false);
              }}
            />
          </View>
        </View>
      );
    }
    if (totalExtDays > 31) {
      if (contextDetails["wholeSaleAcceeRights"] != 0) {
        component = (
          <View style={{ padding: 15 }}>
            <View style={{ marginBottom: 3, padding: "15px", gap: 20 }}>
              <CustomText>
                With this extension, you would exceed the 30-day maximum lock
                extension timeframe. The total days of all Lock extensions are
                not allowed to be extended beyond 30 days.
              </CustomText>
            </View>
            <View
              style={{
                justifyContent: "flex-end",
                flexDirection: "row",
                paddingBottom: "5px",
              }}
            >
              <Button
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                  >
                    {"Override"}
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  {
                    borderColor: "#0d6ac5",
                    borderWidth: 2,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  },
                ]}
                onPress={() => {
                  fnLockExtendSave(TypeOption, OtherLookUp, 1);
                  //setOpen(false);
                }}
              />
              <Button
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                  >
                    {"Close"}
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  {
                    borderColor: "#262626",
                    borderWidth: 2,
                    backgroundColor: "#595959",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  },
                ]}
                disabled={true}
                onPress={() => {
                  setOpen(false);
                }}
              />
            </View>
          </View>
        );
      } else {
        component = (
          <View style={{ padding: 15 }}>
            <View style={{ marginBottom: 3, padding: "15px", gap: 20 }}>
              <CustomText>
                With this extension, you would exceed the 30-day maximum lock
                extension timeframe. The total days of all Lock extensions are
                not allowed to be extended beyond 30 days.
              </CustomText>
            </View>
            <View
              style={{
                justifyContent: "flex-end",
                flexDirection: "row",
                paddingBottom: "5px",
              }}
            >
              <Button
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                  >
                    {"Close"}
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  {
                    borderColor: "#262626",
                    borderWidth: 2,
                    backgroundColor: "#595959",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  },
                ]}
                disabled={true}
                onPress={() => {
                  setOpen(false);
                }}
              />
            </View>
          </View>
        );
      }
      setOpen({ Alert: true, Msg: false, component: component });
    } else {
      fnLockExtendSave(TypeOption, OtherLookUp, 0);
    }
  };

  const fnLockExtendSave = (LockPeriod, LockFee, overriden) => {
    setLockDetails((preLockDetails) => {
      return {
        ...preLockDetails,
        extendLockModal: false,
      };
    });
    let strXML =
      '<root lockperiod="' +
      LockPeriod +
      '" lockfee="' +
      LockFee +
      '" overriden="' +
      overriden +
      '" ></root>';
    let component = (
      <View style={{ padding: 15 }}>
        <View style={{ marginBottom: 3, padding: "15px", gap: 20 }}>
          <CustomText>
            {`Loan will be extended for ${LockPeriod} days at a cost of ${LockFee} Do you want to proceed?`}
          </CustomText>
        </View>
        <View
          style={{
            justifyContent: "flex-end",
            flexDirection: "row",
            paddingBottom: "5px",
          }}
        >
          <Button
            title={
              <CustomText
                bold={false}
                style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
              >
                {"Override"}
              </CustomText>
            }
            style={[
              styles["btn"],
              {
                borderColor: "#0d6ac5",
                borderWidth: 2,
                paddingHorizontal: 10,
                paddingVertical: 6,
              },
            ]}
            onPress={() => {
              handleExtendLockfinal(strXML);
            }}
          />
          <Button
            title={
              <CustomText
                bold={false}
                style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
              >
                {"Close"}
              </CustomText>
            }
            style={[
              styles["btn"],
              {
                borderColor: "#262626",
                borderWidth: 2,
                backgroundColor: "#595959",
                paddingHorizontal: 10,
                paddingVertical: 6,
              },
            ]}
            disabled={true}
            onPress={() => {
              setOpen(false);
            }}
          />
        </View>
      </View>
    );
    setOpen({ Alert: true, Msg: false, component: component });
  };
  const handleExtendLockfinal = (Xml) => {
    let obj = {
      Loanid: contextDetails["LoanId"],
      EmpNum: contextDetails["EmpNum"],
      strXML: Xml,
    };
    handleAPI({
      name: "SaveLockRateExtendLock",
      params: obj,
    }).then((response) => {
      let component = "";
      if (response != -1) {
        component = (
          <View style={{ padding: 15 }}>
            <View style={{ marginBottom: 3, padding: "15px", gap: 20 }}>
              <CustomText>Lock rate has been extended successfully.</CustomText>
            </View>
            <View
              style={{
                justifyContent: "flex-end",
                flexDirection: "row",
                paddingBottom: "5px",
              }}
            >
              <Button
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                  >
                    {"Ok"}
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  {
                    borderColor: "#0d6ac5",
                    borderWidth: 2,
                    // backgroundColor: "#595959",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  },
                ]}
                disabled={true}
                onPress={() => {
                  setOpen(false);
                }}
              />
            </View>
          </View>
        );
      } else {
        component = (
          <View style={{ padding: 15 }}>
            <View style={{ marginBottom: 3, padding: "15px", gap: 20 }}>
              <CustomText>Error on Lock rate extension.</CustomText>
            </View>
            <View
              style={{
                justifyContent: "flex-end",
                flexDirection: "row",
                paddingBottom: "5px",
              }}
            >
              <Button
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                  >
                    {"Ok"}
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  {
                    borderColor: "#0d6ac5",
                    borderWidth: 2,
                    // backgroundColor: "#595959",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  },
                ]}
                disabled={true}
                onPress={() => {
                  setOpen(false);
                }}
              />
            </View>
          </View>
        );
      }
      setLockDetails((preLockDetails) => {
        return {
          ...preLockDetails,
          extendLockModal: false,
        };
      });
      setOpen({ Alert: true, Msg: false, component: component });
      handleDoLockRateProcess(
        0,
        contextDetails["EmpNum"],
        "",
        "",
        "",
        contextDetails["LoanId"],
        0,
        "",
        contextDetails["queryString"]["SessionId"],
        "",
        2, // Lock confirmation
        1
      );
    });
  };
  // ********************************* Extend Lock Ends here *********************************

  // ********************************* Change Rate Starts here *********************************
  const handleInitChangeRate = () => {
    let { allowlockstatus, progchanged, ratesheetused } = LockDetails;
    // if (allowlockstatus != 1) {
    //   if (allowlockstatus == 4 || allowlockstatus == 5) {
    //     let component = (
    //       <View style={{ padding: 15 }}>
    //         <View style={{ marginBottom: 3, gap: 20 }}>
    //           <CustomText>
    //             Interest Rates are currently unavailable. Please check back
    //             later for pricing and rate lock options.
    //           </CustomText>
    //         </View>
    //         <View
    //           style={{
    //             justifyContent: "flex-end",
    //             flexDirection: "row",
    //             paddingBottom: "5px",
    //           }}
    //         >
    //           <Button
    //             title={
    //               <CustomText
    //                 bold={false}
    //                 style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
    //               >
    //                 {"Ok"}
    //               </CustomText>
    //             }
    //             style={[
    //               styles["btn"],
    //               {
    //                 borderColor: "#262626",
    //                 borderWidth: 2,
    //                 backgroundColor: "#595959",
    //                 paddingHorizontal: 10,
    //                 paddingVertical: 6,
    //               },
    //             ]}
    //             disabled={true}
    //             onPress={() => {
    //               setOpen(false);
    //             }}
    //           />
    //         </View>
    //       </View>
    //     );
    //     setOpen({ Alert: true, Msg: false, component: component });
    //   }
    //   return;
    // }
    let Msg = "";
    if (progchanged == 0) {
      Msg = `The lock will be priced as of Rate Sheet ID ${ratesheetused}. Do you want to proceed?`;
    } else {
      Msg = `Since this program on this lock has changed the lock may be subject to worse case pricing. Do you want to proceed?`;
    }
    let component = (
      <View>
        <View style={styles.header}>
          <CustomText bold={true} style={{ color: "#292b2c", fontSize: 16 }}>
            {`Change Rate`}
          </CustomText>
        </View>
        <View>
          <View style={{ marginBottom: 3, padding: "15px", gap: 20 }}>
            <CustomText>{Msg}</CustomText>
          </View>
          <View
            style={{
              justifyContent: "flex-end",
              flexDirection: "row",
              padding: 15,
              paddingTop: 0,
            }}
          >
            <Button
              title={
                <CustomText
                  bold={false}
                  style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                >
                  {"Cancel"}
                </CustomText>
              }
              style={[
                styles["btn"],
                {
                  borderColor: "#262626",
                  borderWidth: 2,
                  backgroundColor: "#595959",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                },
              ]}
              disabled={true}
              onPress={() => {
                setOpen(false);
              }}
            />
            <Button
              title={
                <CustomText
                  bold={false}
                  style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                >
                  {"Ok"}
                </CustomText>
              }
              style={[
                styles["btn"],
                {
                  borderColor: "#0d6ac5",
                  borderWidth: 2,
                  paddingHorizontal: 20,
                  paddingVertical: 6,
                },
              ]}
              onPress={() => {
                handleChangeRate(ratesheetused);
              }}
            />
          </View>
        </View>
      </View>
    );
    setOpen({ Alert: true, Msg: false, component: component });
  };
  const fnChangeRateSet = async () => {
    let obj = { Loanid: contextDetails["LoanId"] };
    let Response = await handleAPI({
      name: "ChangeRateSet",
      params: obj,
    }).then((response) => {
      return response;
    });
    return Response;
  };
  const handleChangeRate = async (ratesheetused) => {
    let Result = await fnChangeRateSet();
    if (Result != "1") {
      let component = (
        <View style={{ padding: 15 }}>
          <View style={{ marginBottom: 3, padding: "15px", gap: 20 }}>
            <CustomText>{`Error occurred in setting up the loan for changing the rate. Please try again or contact support@directcorp.com for additional assistance`}</CustomText>
          </View>
          <View
            style={{
              justifyContent: "flex-end",
              flexDirection: "row",
              paddingBottom: "5px",
            }}
          >
            <Button
              title={
                <CustomText
                  bold={false}
                  style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                >
                  {"Ok"}
                </CustomText>
              }
              style={[
                styles["btn"],
                {
                  borderColor: "#0d6ac5",
                  borderWidth: 2,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                },
              ]}
              onPress={() => {
                setOpen(false);
              }}
            />
          </View>
        </View>
      );
      setOpen({ Alert: true, Msg: false, component: component });
      return;
    }

    let rateSheetId = option?.["RateSheetIdsOpt"].filter(
      (e) => e["TypeDesc"] == ratesheetused || e["TypeOption"] == ratesheetused
    );
    setContextDetails((prevContext) => {
      return {
        ...prevContext,
        ChangeRate: true,
        ratesheetused: ratesheetused,
        RateSheetId: rateSheetId[0]["TypeOption"],
      };
    });
    handleLock({ ChangeRate: true });
  };
  // ********************************* Change Rate Ends here ***********************************

  // ********************************* Floatdown Starts here *************************************
  const handleInitFloatDown = () => {
    let {
      allowlockstatus,
      floatdownallowed,
      showfloatdown,
      maximumFloatDown,
      floatdownflag,
    } = LockDetails;
    let { CompNum } = contextDetails;
    if (allowlockstatus != 1 && CompNum != 1000) {
      if (allowlockstatus == 4 || allowlockstatus == 5) {
        let component = (
          <View style={{ padding: 15 }}>
            <View style={{ marginBottom: 3, gap: 20 }}>
              <CustomText>
                Interest Rates are currently unavailable. Please check back
                later for pricing and rate lock options.
              </CustomText>
            </View>
            <View
              style={{
                justifyContent: "flex-end",
                flexDirection: "row",
                paddingBottom: "5px",
              }}
            >
              <Button
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                  >
                    {"Ok"}
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  {
                    borderColor: "#262626",
                    borderWidth: 2,
                    backgroundColor: "#595959",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  },
                ]}
                disabled={true}
                onPress={() => {
                  setOpen(false);
                }}
              />
            </View>
          </View>
        );
        setOpen({ Alert: true, Msg: false, component: component });
      }
      return;
    }
    let component = "",
      Msg = "",
      proceedFD = false;
    if (floatdownflag == 1) {
      Msg =
        "The Float Down Option has already been used and can only be used once.";
    } else if (floatdownallowed == 0) {
      Msg = "The Float Down Option is not allowed on this program.";
    } else if (showfloatdown == 0) {
      Msg = `The rate lock is no longer eligible to Float Down because it has reached the maximum ${maximumFloatDown} Float down(s) allowed. Please contact the Lock Desk if you need additional assistance.`;
    } else if (floatdownallowed == 3) {
      Msg = `This lock is not eligible for a float-down because the loan amount falls within the new, temporary FHA loan amount limits.`;
    } else {
      Msg =
        "Selecting the Float Down option may cause your expiration date to change, so please note your new expiration date";
      proceedFD = true;
    }
    if (proceedFD) {
      component = (
        <View>
          <View style={styles.header}>
            <CustomText bold={true} style={{ color: "#292b2c", fontSize: 16 }}>
              {`Float Down Option`}
            </CustomText>
          </View>
          <View>
            <View style={{ marginBottom: 3, padding: "15px", gap: 20 }}>
              <CustomText>{Msg}</CustomText>
              <CustomText>{"Do you want to proceed?"}</CustomText>
            </View>
            <View
              style={{
                justifyContent: "flex-end",
                flexDirection: "row",
                paddingBottom: "15px",
                paddingRight: "15px",
              }}
            >
              <Button
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                  >
                    {"Cancel"}
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  {
                    borderColor: "#262626",
                    borderWidth: 2,
                    backgroundColor: "#595959",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  },
                ]}
                disabled={true}
                onPress={() => {
                  setOpen(false);
                }}
              />
              <Button
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                  >
                    {"Ok"}
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  {
                    borderColor: "#0d6ac5",
                    borderWidth: 2,
                    paddingHorizontal: 20,
                    paddingVertical: 6,
                  },
                ]}
                onPress={() => {
                  handleFloatDown();
                }}
              />
            </View>
          </View>
        </View>
      );
    } else {
      component = (
        <View style={{ padding: 15 }}>
          <View style={{ marginBottom: 3, padding: "15px", gap: 20 }}>
            <CustomText>{Msg}</CustomText>
          </View>
          <View
            style={{
              justifyContent: "flex-end",
              flexDirection: "row",
              paddingBottom: "5px",
            }}
          >
            <Button
              title={
                <CustomText
                  bold={false}
                  style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                >
                  {"Ok"}
                </CustomText>
              }
              style={[
                styles["btn"],
                {
                  borderColor: "#0d6ac5",
                  borderWidth: 2,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                },
              ]}
              onPress={() => {
                setOpen(false);
              }}
            />
          </View>
        </View>
      );
    }
    setOpen({ Alert: true, Msg: false, component: component });
  };

  const handleFloatDownSet = async () => {
    let { LoanId, EmpNum } = contextDetails;
    let obj = { LoanId, EmpNum };
    let Response = await handleAPI({
      name: "FloatDownSet",
      params: obj,
    }).then((response) => {
      return response;
    });
    return Response;
  };
  const handleFloatDown = async () => {
    let Result = await handleFloatDownSet();
    setContextDetails((prevContext) => {
      return {
        ...prevContext,
        FloatDown: true,
        ratesheetused: LockDetails["ratesheetused"],
      };
    });
    handleLock({ FloatDown: true });
  };
  // ********************************* Floatdown Ends here ***********************************
  // ********************************* Print Lock Confirmation Begins here ***********************************
  const handlePrintLockConfirmation = async () => {
    let Result = await handlePrintLCDetails();
    let Msg = "",
      component = "";
    if (["-1", "-2", "-3"].includes(Result) || isNaN(Result)) {
      Msg =
        "Exception occurred in printing the lock confirmation. Please try again or contact support@directcorp.com for additional assistance.";
      component = (
        <View style={{ padding: 15 }}>
          <View style={{ marginBottom: 3, padding: "15px", gap: 20 }}>
            <CustomText>{Msg}</CustomText>
          </View>
          <View
            style={{
              justifyContent: "flex-end",
              flexDirection: "row",
              paddingBottom: "5px",
            }}
          >
            <Button
              title={
                <CustomText
                  bold={false}
                  style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                >
                  {"Ok"}
                </CustomText>
              }
              style={[
                styles["btn"],
                {
                  borderColor: "#0d6ac5",
                  borderWidth: 2,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                },
              ]}
              onPress={() => {
                setOpen(false);
              }}
            />
          </View>
        </View>
      );
      setOpen({ Alert: true, Msg: false, component: component });
    } else {
      // let url = '../../../BorrowerApplication/Presentation/Webforms/ScanDocumentsManager.aspx?SessionId=' + contextDetails['SessionId'] + '&Id=' + Result
      let url =
        "../../../BorrowerApplication/Presentation/Webforms/ScanDocumentsManager.aspx?SessionId=" +
        contextDetails["SessionId"] +
        "&Id=" +
        Result;
      window.open(
        url,
        "ScanDocManager1",
        "scrollbars=yes,width=1200px,height=900px"
      );
    }
  };
  const handlePrintLCDetails = async () => {
    let { LoanId, EmpNum } = contextDetails;
    let obj = { Loanid: LoanId, EmpNum };
    let Response = await handleAPI({
      name: "PrintLockConf",
      params: obj,
    }).then((response) => {
      return response;
    });
    return Response;
  };
  // ********************************* Print Lock Confirmation Ends here *************************************
  // ********************************* Clear Lock Starts here *************************************
  const handleClearRelock = () => {
    let { LoanId, SessionId, EmpNum } = contextDetails;
    let obj = { LoanId, SessionId, EmpNum };
    handleAPI({
      name: "ClearRelock",
      params: obj,
    }).then((response) => {
      setLockDetails((prevDetails) => {
        return {
          ...prevDetails,
          disableReLock: true,
        };
      });
    });
  };
  const handleClearLockChangeLog = () => {
    let { LoanId } = contextDetails;
    let obj = {
      LoanId,
      CustID: 0,
      DBFieldId: "-5902",
      ItemId: 0,
    };

    handleAPI({
      name: "FindChangeLogXML",
      params: obj,
    }).then((response) => {
      response = JSON.parse(response)["Table"][0]["Column1"];
      let strXml = new XMLParser().parseFromString(response);

      let component = (
        <View>
          <View style={styles.header}>
            <CustomText bold={true} style={{ color: "#292b2c", fontSize: 16 }}>
              {`Change Log`}
            </CustomText>
          </View>
          <View>
            <View style={{ marginBottom: 3, padding: "15px", gap: 20 }}>
              <View
                style={[
                  styles["cardShadow"],
                  {
                    borderWidth: 1,
                    borderColor: "#B9B9B9",
                    borderRadius: 5,
                    width: strXml["children"].length == 0 ? 400 : "auto",
                  },
                ]}
              >
                <View
                  style={[
                    styles["oddBG"],
                    {
                      borderTopRightRadius: 5,
                      borderTopLeftRadius: 5,
                      gap: 10,
                    },
                  ]}
                >
                  <CustomText
                    style={[
                      styles["MidText"],
                      { flex: 2, fontSize: 12, textAlign: "left" },
                    ]}
                  >
                    Action
                  </CustomText>
                  <CustomText
                    style={[
                      styles["MidText"],
                      { flex: 2, fontSize: 12, textAlign: "left" },
                    ]}
                  >
                    User
                  </CustomText>
                  <CustomText
                    style={[
                      styles["MidText"],
                      {
                        flex: 2,
                        fontSize: 12,
                        textAlign: "left",
                      },
                    ]}
                  >
                    Change Date
                  </CustomText>
                </View>
                {strXml["children"]?.map((row, index) => (
                  <View
                    style={[
                      styles["oddBG"],
                      {
                        backgroundColor: index / 2 != 0 ? "#f4f4f4" : "#fff",
                        gap: 10,
                      },
                    ]}
                  >
                    <CustomText style={[styles["SemiMidText"], { flex: 2 }]}>
                      {row["attributes"]["ValueTo"]}
                    </CustomText>
                    <CustomText
                      style={[
                        styles["SemiMidText"],
                        { flex: 2, textAlign: "left" },
                      ]}
                    >
                      {row["attributes"]["Who"]}
                    </CustomText>
                    <CustomText
                      style={[
                        styles["SemiMidText"],
                        {
                          flex: 2,
                          textAlign: "left",
                        },
                      ]}
                    >
                      {row["attributes"]["cWhen"]}
                    </CustomText>
                  </View>
                ))}
                {strXml["children"].length == 0 && (
                  <View
                    style={[
                      styles["oddBG"],
                      {
                        backgroundColor: "#fff",
                      },
                    ]}
                  >
                    <CustomText
                      style={[
                        styles["SemiMidText"],
                        { flex: 6, textAlign: "center" },
                      ]}
                    >
                      {"No Records Found!!!"}
                    </CustomText>
                  </View>
                )}
              </View>
            </View>
            <View
              style={{
                justifyContent: "flex-end",
                flexDirection: "row",
                paddingBottom: "15px",
                paddingRight: "15px",
              }}
            >
              <Button
                title={
                  <CustomText
                    bold={false}
                    style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                  >
                    {"Ok"}
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  {
                    borderColor: "#0d6ac5",
                    borderWidth: 2,
                    paddingHorizontal: 20,
                    paddingVertical: 6,
                  },
                ]}
                onPress={() => {
                  setOpen(false);
                }}
              />
            </View>
          </View>
        </View>
      );
      setOpen({ Alert: true, Msg: false, component: component });
    });
  };
  // ********************************* Clear Lock Ends here *************************************
  const handleInvestor = (id) => {
    let Id = 0;
    Id = id == -2 ? 0 : id;
    let sURL =
      "../../../VendorChanges/Presentation/Webforms/VendorInfoChangeRequest_bootstrap.aspx?SessionId=" +
      contextDetails["SessionId"] +
      "&VendorId=" +
      Id +
      "&changeid=&changeaction=Edit&PageUse=Edit";
    window.open(
      sURL,
      "",
      "height=800px,width=1200px,resizable=1,scrollbars=yes"
    );
  };

  // ********************************* Change Loan Program Starts here *************************************
  const handleInitChangeLoanProgram = () => {
    let component = (
      <View>
        <View style={styles.header}>
          <CustomText bold={true} style={{ color: "#292b2c", fontSize: 16 }}>
            {`Change Loan Program`}
          </CustomText>
        </View>
        <View>
          <View style={{ marginBottom: 3, padding: "15px", gap: 20 }}>
            <CustomText>
              {
                "Do you want to change the Locked Loan Program? This change may be subject to worse case pricing"
              }
            </CustomText>
          </View>
          <View
            style={{
              justifyContent: "flex-end",
              flexDirection: "row",
              paddingBottom: "15px",
              paddingRight: "15px",
            }}
          >
            <Button
              title={
                <CustomText
                  bold={false}
                  style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                >
                  {"Cancel"}
                </CustomText>
              }
              style={[
                styles["btn"],
                {
                  borderColor: "#262626",
                  borderWidth: 2,
                  backgroundColor: "#595959",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                },
              ]}
              disabled={true}
              onPress={() => {
                setOpen(false);
              }}
            />
            <Button
              title={
                <CustomText
                  bold={false}
                  style={{ fontSize: 12, color: "#fff", fontWeight: 200 }}
                >
                  {"Ok"}
                </CustomText>
              }
              style={[
                styles["btn"],
                {
                  borderColor: "#0d6ac5",
                  borderWidth: 2,
                  paddingHorizontal: 20,
                  paddingVertical: 6,
                },
              ]}
              onPress={() => {
                handleChangeLoanProgram();
              }}
            />
          </View>
        </View>
      </View>
    );
    setOpen({ Alert: true, Msg: false, component: component });
  };
  const handleChangeLoanProgram = async () => {
    let { LoanId, EmpNum } = contextDetails;
    let ret = await handleWorseCaseTest(LoanId, 0, EmpNum, 0, 0);
    let rateSheetId = option?.["RateSheetIdsOpt"].filter(
      (e) =>
        e["TypeDesc"] == LockDetails["ratesheetused"] ||
        e["TypeOption"] == LockDetails["ratesheetused"]
    );
    setContextDetails((prevContext) => {
      return {
        ...prevContext,
        ChangeLoanProgram: true,
        feeIncludedMsg: true,
        PreventLoanProgramLoan: true,
        ratesheetused: LockDetails["ratesheetused"],
        RateSheetId: rateSheetId[0]["TypeOption"],
      };
    });
    handleLock({ ChangeLoanProgram: true });
  };
  const handleWorseCaseTest = async (
    LoanId,
    LoanProgId,
    EmpNum,
    LnProgActiveId,
    TestOnly
  ) => {
    let obj = { LoanId, LoanProgId, EmpNum, LnProgActiveId, TestOnly };
    let Response = await handleAPI({
      name: "WorseCaseTest",
      params: obj,
    }).then((response) => {
      return response;
    });
    return Response;
  };
  // ********************************* Change Loan Program Ends here ***************************************

  const handleProdLoading = () => {
    try {
      let activeId = "divLockConfMenu2";
      let LSMenu = parent.window.document.getElementById(
        "divDirectDefaultRateLockMenu2"
      );
      let LCMenu = parent.window.document.getElementById("divLockConfMenu2");
      let htmlLoader = parent.window.document.getElementsByClassName("loader");
      if (htmlLoader.length > 0) {
        htmlLoader[0].style.display = "none";
      }
      let optlabel = window.parent.document.querySelector(
        '#ulLeftNavTree li a[pagename="LoanSelection"]' //LockConfirmation
      ).text;

      window.parent.document.getElementById("widgetTitleSpan").innerText =
        optlabel || "25. Lock Confirmation"; // Loan pulse header tab text

      window.parent.document
        .querySelector('#ulLeftNavTree li a[pagename="LoanSelection"]')
        .parentNode.classList.add("active", "special1");
      if (LSMenu.style.display != "none") {
        LSMenu.style.display = "none";
        LCMenu.style.display = "block";
      } else {
        if (LCMenu.style.display != "none") {
          let elements = document.querySelectorAll("#UlLockConfMenu2 > li");
          elements.forEach(function (element) {
            if (element.className.indexOf("NewLC-") === -1) {
              element.style.display = "none";
            }
          });
        } else {
          LCMenu.style.display = "block";
        }
      }
      try {
        let ul1 = parent.window.document.querySelector("#divLockConfMenu ul");
        let ul2Items = parent.window.document.querySelectorAll(
          "#divLockConfMenu2 ul li"
        );

        parent.window.document.querySelector("#divLockConfMenu ul").innerHTML =
          "";
        if (ul2Items) {
          ul2Items.forEach(function (item) {
            ul1.appendChild(item.cloneNode(true));
          });
        }

        parent.window.document.getElementById(
          "divDirectDefaultRateLockMenu"
        ).style.display = "none";
        parent.window.document.getElementById("divLockConfMenu").style.display =
          "block";
      } catch (error) {}

      const idsToHide = ["NewLC-ATP", "NewLC-IFW", "NewLC-SEL"];

      idsToHide.forEach((id) => {
        let elements = parent.window.document.querySelectorAll("." + id);
        elements.forEach(function (element) {
          element.style.display = "none";
        });
      });

      parent.window.document.getElementById("divNavControls").style.display =
        "block";
      handleBasicInfoInProd();
      // try {
      //   setTimeout(function () {
      //     parent.window.document.getElementById("spnBackBtn1").innerHTML("Back");
      //   }, 100);
      //   setTimeout(function () {
      //     parent.window.document.getElementById("spnBackBtn1").innerHTML("Next");
      //   }, 100);
      // } catch (error) {

      // }

      //window.parent.Showvalidationstatus(494312,30, 'Lock Confirmation','{643C9AD8-D287-42E7-B110-1015494DB7FD}', 'RateLock')
      parent.window.GetLoanPulse(); // To refresh the Loan Pulse area
      setTimeout(() => {
        let PopOut =
          window.parent.opener.document.getElementById("drpPopOut").value;
        if (PopOut == "0") {
          let LCB = parent.window.document.querySelector("#divLockConfMenu ul");
          let LCT = parent.window.document.querySelector(
            "#divLockConfMenu2 ul"
          );
          LCB.innerHTML = "";
          LCT.innerHTML = "";
          let elements = document.querySelectorAll("#NewLCMenu > li");
          elements.forEach(function (item) {
            LCT.appendChild(item.cloneNode(true));
            LCB.appendChild(item.cloneNode(true));
          });
        }
      }, 100);

      // window.parent.document.getElementById("widgetTitleSpan").innerText = "25.Lock Confirmation"; // Loan pulse header tab text
      // let parentNav = window.parent.document.querySelectorAll('#ulLeftNavTree li'); // highlighting the menu option
      // for (let index = 0; index < parentNav.length; index++) {
      //   let aElement = parentNav[index].querySelector('a');
      //   if (aElement.getAttribute('pagename') == 'LoanSelection')
      //         parentNav[index].classList.add("active", "special1");
      // }
      //       parent.window.GetLoanPulse(); // To refresh the Loan Pulse area
    } catch (error) {}
  };

  const handleLoadTempDetails = () => {
    try {
      let tempValues = JSON.parse(localStorage.getItem("LoanSelectioInfo"))[
        contextDetails["LoanId"]
      ];
      let { finalRate, finalPoints, finalAmount, BasePoints, BaseAmount } =
        tempValues["RateInfo"];
      setLockDetails((prevLockDetails) => {
        return {
          ...prevLockDetails,
          compratereq: finalRate,
          comprateadj: finalRate,
          comppointsreq: cleanValue(BasePoints, 3),
          RateChosenPoint: cleanValue(finalPoints, 3),
          comppointsadj: cleanValue(finalPoints, 3),
          compamtadj: cleanValue(finalAmount, 3),
          // compamtreq: BaseAmount.toString(),
        };
      });
      let addons = fnChangeKeys(tempValues["Addons"]);
      setAddons(addons);
    } catch (error) {}
  };
  function fnChangeKeys(jsonArray) {
    return jsonArray.map((obj) => {
      return {
        desc: obj.Descript,
        rate: obj.Rate,
        points: cleanValue(obj.Disc, 3),
        amt: cleanValue(obj.AddonAmount, 3),
        CondLink: obj.CondLink,
      };
    });
  }
  const handleRunValidation = () => {
    parent.document.getElementById(
      "SpnRunAllpageValidationTop"
    ).style.backgroundColor = "orange";
    parent.document.getElementById(
      "SpnRunAllpageValidation"
    ).style.backgroundColor = "";
    parent.document.getElementById("SpnRunAllpageValidation").html = "";
    parent.document.getElementById("SpnRunAllpageValidation").style.display =
      "";
    window.parent.Showvalidationstatus(
      contextDetails["LoanId"],
      40,
      "Loan Selection",
      contextDetails["SessionId"],
      "LoanSelection"
    );
  };
  const handleSuperviserEditProd = (type) => {
    let Edit = "",
      Cancel = "",
      btnS = "#btnSupervisorSave",
      btnE = "#btnSupervisorEdit",
      btnC = "#btnSupervisorCancel";
    if (type == 1) {
      Edit = "none";
      Cancel = "block";
    } else {
      Edit = "block";
      Cancel = "none";
    }
    //Save
    try {
      if (
        window.parent.document
          .getElementById("UlLockConfMenu2")
          .querySelector("#btnSupervisorSaveNew") != null
      ) {
        btnS = "#btnSupervisorSaveNew";
        btnE = "#btnSupervisorEditNew";
        btnC = "#btnSupervisorCancelNew";
      }
      let parentSaveEle1 = window.parent.document
          .getElementById("UlLockConfMenu2")
          .querySelector(btnS),
        parentSaveEle2 = window.parent.document
          .getElementById("UlLockConfMenu")
          .querySelector(btnS);
      parentSaveEle1.style.display = Cancel;
      parentSaveEle2.style.display = Cancel;
      parentSaveEle1.parentNode.nextElementSibling.style.display = Cancel;
      parentSaveEle2.parentNode.nextElementSibling.style.display = Cancel;

      //Edit
      let parentEditEle1 = window.parent.document
          .getElementById("UlLockConfMenu2")
          .querySelector(btnE),
        parentEditEle2 = window.parent.document
          .getElementById("UlLockConfMenu")
          .querySelector(btnE);
      parentEditEle1.style.display = Edit;
      parentEditEle2.style.display = Edit;
      parentEditEle1.parentNode.nextElementSibling.style.display = Edit;
      parentEditEle2.parentNode.nextElementSibling.style.display = Edit;

      //Cancel
      let parentCancelEle1 = window.parent.document
          .getElementById("UlLockConfMenu2")
          .querySelector(btnC),
        parentCancelEle2 = window.parent.document
          .getElementById("UlLockConfMenu")
          .querySelector(btnC);
      parentCancelEle1.style.display = Cancel;
      parentCancelEle2.style.display = Cancel;
      parentCancelEle1.parentNode.nextElementSibling.style.display = Cancel;
      parentCancelEle2.parentNode.nextElementSibling.style.display = Cancel;
    } catch (error) {}
  };
  //======================================= Function declaration Ends ===============================================
  let menuOption = [
    {
      Name: "Supervisor Edit",
      onPress: () => {
        handleOnchangeDetails("SupervisorEdit", true, "Menu");
        acdRef.current.click();
        handleMenu();
      },
      icon: "SuperviserEdit",
      from: "AntDesign",
      size: 22,
      show:
        LockDetails?.SupervisorEdit !== true &&
        LockDetails?.viewwholesaleintrate == 1,
    },
    // {
    //   Name: "Supervisor Save",
    //   onPress: () => {},
    //   icon: "Save",
    //   from: "AntDesign",
    //   size: 22,
    //   show: LockDetails?.SupervisorEdit || false,
    // },
    {
      Name: "Supervisor Cancel",
      onPress: () => {
        handleOnchangeDetails("SupervisorEdit", false, "Menu");
        handleCancelSuperviserEdit();
      },
      icon: "cancel",
      from: "AntDesign",
      size: 22,
      show: LockDetails?.SupervisorEdit || false,
    },
    {
      Name: "Transfer Lock",
      onPress: () => {
        fnTransferLock();
      },
      icon: "TransferLock",
      from: "Material",
      size: 22,
    },
    {
      Name: "Change Rate",
      onPress: () => {
        handleInitChangeRate();
      },
      icon: "ChangeRate",
      from: "Ionicons",
      size: 22,
      show: LockDetails?.showChangeRate == 1,
    },
    {
      Name: "Extend Lock",
      onPress: () => {
        handleInitExtendLock();
      },
      icon: "ExtendLock",
      from: "Material",
      size: 22,
      show: LockDetails?.showLockExtend == 1,
    },
    {
      Name: "Change Loan Program",
      onPress: () => {
        handleInitChangeLoanProgram();
      },
      icon: "ChangeLoanProgram",
      from: "Material",
      size: 22,
    },
    {
      Name: "Float Down to Current Day Pricing",
      onPress: () => {
        handleInitFloatDown();
      },
      icon: "FloatDown",
      from: "Ionicons",
      size: 22,
      show: LockDetails?.showFloatDown_ == 1,
    },
    {
      Name: "Print Lock Confirmation",
      onPress: () => {
        handlePrintLockConfirmation();
      },
      icon: "print",
      from: "Ionicons",
      size: 22,
    },
    {
      Name: "Rate Lock History",
      onPress: () => {},
      icon: "LockHistory",
      from: "Ionicons",
      size: 22,
    },
    {
      Name: "Cancel Lock",
      onPress: () => {
        fnCancelLock();
      },
      icon: "cancel",
      from: "AntDesign",
      size: 22,
    },
    {
      Name: "Run Completion Review",
      onPress: () => {},
      icon: "RunComplience",
      from: "MaterialIcons",
      size: 22,
      isLast: true,
    },
  ];

  return (
    <View>
      <LinearGradient
        colors={["#4680e1", "#386cc3", "#386CC3"]}
        start={{ x: 0.0, y: 0.25 }}
        end={{ x: 0.5, y: 1.0 }}
        style={{
          alignItems: "center",
          justifyContent: "space-evenly",
          width: "100%",
          padding: 20,
          display:
            contextDetails["queryString"]["RemHeadFootr"] == 0
              ? "flex"
              : "none",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <View>
            <CustomText style={{ fontSize: 27, color: "#fff" }} bold={true}>
              {`Interest Rate Lock Confirmation (Loan ${contextDetails["LoanId"]})`}
            </CustomText>
          </View>
          <View ref={topMenuUseref}>
            <Button
              title={
                <CustomText
                  bold={false}
                  style={{ color: "#000", fontSize: 11, fontWeight: 200 }}
                >
                  Menu
                </CustomText>
              }
              style={[
                styles["btn"],
                styles["cardShadow"],
                {
                  borderRadius: 3,
                  paddingVertical: 6,
                  paddingHorizontal: 15,
                  borderWidth: 1,
                  borderColor: "#6B6B6B",
                  backgroundColor: "#E8E8E8",
                },
              ]}
              onPress={() => {
                handleMenu("Top");
                handleMenuOpen("Top");
              }}
            />
            <MenuDropDown
              listOption={menuOption}
              Open={isMenuOpen["top"]}
              MenuPosition={topMenuPosition}
              handleOpen={handleMenu}
            />
          </View>
        </View>
      </LinearGradient>
      <View style={styles["container"]}>
        {/* <View ref={topMenuUseref}>
          <Button
            title={
              <CustomText
                bold={false}
                style={{ color: "#FFFFF", fontSize: 11, fontWeight: 200 }}
              >
                Menu
              </CustomText>
            }
            style={[
              styles["btn"],
              styles["cardShadow"],
              {
                borderRadius: 3,
                paddingVertical: 6,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: "#0d6ac5",
              },
            ]}
            onPress={() => {
              handleMenu();
              handleMenuOpen();
            }}
          />
          <MenuDropDown
            listOption={menuOption}
            Open={isMenuOpen["top"]}
            MenuPosition={topMenuPosition}
            handleOpen={handleMenu}
          />
        </View> */}
        <View style={{ gap: 30, alignItems: "center" }}>
          <View
            style={[
              styles.shadow,

              {
                boxShadow: "rgba(0, 0, 0, 0.25) 0px 6px 20px",
                width: 800,
                alignItems: "center",
              },
            ]}
          >
            <LinearGradient
              colors={["#f6f6f6", "#e8e8e8", "#F6F6F6"]}
              style={{
                alignItems: "center",
                justifyContent: "space-evenly",
                borderRadius: 6,
                width: "100%",
                paddingVertical: 20,
              }}
            >
              {LockDetails["compperiodreq"] ? (
                <View style={{ gap: 5 }}>
                  <CustomText fontName="Inter" style={styles["maxText"]}>
                    {LockDetails["broker"]}
                  </CustomText>
                  <CustomText fontName="Inter" style={styles["maxText"]}>
                    Lock Confirmation
                  </CustomText>
                  {!LockDetails["SupervisorEdit"] ? (
                    <CustomText fontName="Inter" style={[styles["MidText"]]}>
                      {`Lock expires on ${formatDate(
                        new Date(LockDetails["complockexpire"] || "")
                      )} (${LockDetails["compperiodreq"]} Days)`}
                    </CustomText>
                  ) : (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <CustomText fontName="Inter" style={[styles["MidText"]]}>
                        {`Lock expires on`}
                      </CustomText>
                      <View style={{ width: 80 }}>
                        <InputBox
                          validate={false}
                          //disabled={LockDetails["wssettled"] == 1}
                          showBorder={true}
                          value={LockDetails["complockexpire"] || ""}
                          onChangeText={(text) => {
                            handleOnchangeDetails(
                              "complockexpire",
                              text,
                              "SupervisorEdit"
                            );
                          }}
                          onBlur={(text) => {
                            text = text.target.value || "";
                            handleOnBlur("complockexpire", text);
                          }}
                        />
                      </View>
                      <View style={{ width: 33 }}>
                        <InputBox
                          validate={false}
                          //disabled={LockDetails["wssettled"] == 1}
                          showBorder={true}
                          value={LockDetails["compperiodreq"] || ""}
                          onChangeText={(text) => {
                            handleOnchangeDetails(
                              "compperiodreq",
                              text,
                              "SupervisorEdit"
                            );
                          }}
                        />
                      </View>
                      <CustomText style={[styles["MidText"]]}>Days</CustomText>
                    </View>
                  )}
                  <CustomText
                    bold={true}
                    style={[
                      styles["MidText"],
                      { color: "#000", textAlign: "center" },
                    ]}
                  >
                    {LockDetails["ratepattern"]}
                  </CustomText>
                </View>
              ) : (
                <View style={{ paddingVertical: 20 }}>
                  <ArrowSpinner size={25} style={{ top: 10 }} />
                </View>
              )}
              <View style={{ gap: 10, width: "100%" }}>
                <View
                  style={{
                    marginHorizontal: 15,
                    marginTop: 30,
                    backgroundColor: "#FFF",
                    borderColor: "#c6c6c6",
                    borderWidth: 1,
                    padding: 10,
                  }}
                >
                  {/* Collapse Header */}
                  <View
                    style={{ flexDirection: "row", gap: 80, marginLeft: 6 }}
                  >
                    <View style={{ alignItems: "flex-start", gap: 5 }}>
                      <CustomText style={styles["minText"]}>
                        Interest Rate
                      </CustomText>
                      {LockDetails["comprateadj"] ? ( //compratereq
                        <CustomText
                          style={[styles["maxText"], { color: "#000" }]}
                        >
                          {LockDetails["comprateadj"]}
                        </CustomText>
                      ) : (
                        <View>
                          <ArrowSpinner style={{ top: 10 }} />
                        </View>
                      )}
                    </View>
                    <View style={{ alignItems: "flex-start", gap: 5 }}>
                      <CustomText style={styles["minText"]}>
                        {`${fnCalculateValue(
                          "RateChosen"
                        )} For Interest Rate Chosen`}
                      </CustomText>
                      {LockDetails["comppointsadj"] ? (
                        <CustomText
                          style={[
                            styles["maxText"],
                            {
                              color:
                                (LockDetails["comppointsadj"] || "")?.indexOf(
                                  "-"
                                ) != -1
                                  ? "#88AB35"
                                  : "#B73333",
                            },
                          ]}
                        >
                          {`${fnCalculateValue(
                            "RateChosenPoint"
                          )}  |  ${fnCalculateValue("RateChosenAmt")}`}
                        </CustomText>
                      ) : (
                        <View style={{ alignSelf: "center" }}>
                          <ArrowSpinner style={{ top: 10 }} />
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={{ marginTop: 20 }}>
                    <AccordionCustom
                      title={
                        <>
                          <CustomText>Rate Lock Details</CustomText>
                        </>
                      }
                      forwardedRef={acdRef}
                      isAccordion={true}
                      isExpand={LockDetails["SupervisorEdit"]}
                      overrideBG={true}
                    >
                      <View>
                        <View
                          style={[
                            styles["cardShadow"],
                            {
                              borderWidth: 1,
                              borderColor: "#B9B9B9",
                              borderRadius: 5,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles["oddBG"],
                              {
                                borderTopRightRadius: 5,
                                borderTopLeftRadius: 5,
                              },
                            ]}
                          >
                            <CustomText
                              style={[
                                styles["MidText"],
                                { flex: 2.5, fontSize: 12 },
                              ]}
                            >
                              Adjustment Description
                            </CustomText>
                            <CustomText
                              style={[
                                styles["MidText"],
                                { flex: 1, fontSize: 12, textAlign: "right" },
                              ]}
                            >
                              Rate Adjustment
                            </CustomText>
                            <CustomText
                              style={[
                                styles["MidText"],
                                {
                                  flex: 2,
                                  fontSize: 12,
                                  textAlign: "center",
                                  textAlign: "right",
                                },
                              ]}
                            >
                              Adjustment Amount and Price
                            </CustomText>
                          </View>
                          <View style={[styles["evenBG"]]}>
                            <CustomText
                              style={[styles["SemiMidText"], { flex: 3 }]}
                            >
                              {`Base Interest Rate and Price`}
                            </CustomText>
                            <CustomText
                              style={[
                                styles["MidText"],
                                { flex: 1, textAlign: "center" },
                              ]}
                            >
                              {formatPercentage(LockDetails["compratereq"], 4)}
                            </CustomText>
                            <CustomText
                              style={[
                                styles["MidText"],
                                {
                                  flex: 1,
                                  textAlign: "right",
                                  color: (LockDetails?.["comppointsreq"] || "")
                                    .toString()
                                    .includes("-")
                                    ? "#88AB35"
                                    : "#B73333",
                                },
                              ]}
                            >
                              {fnCalculateValue(
                                "Adjustment",
                                formatPercentage(
                                  LockDetails?.["comppointsreq"],
                                  3
                                )
                              )}
                            </CustomText>
                            <CustomText
                              style={[
                                styles["MidText"],
                                {
                                  flex: 1,
                                  textAlign: "right",
                                  color:
                                    LockDetails["compamtreq"]?.indexOf("-") !=
                                    -1
                                      ? "#88AB35"
                                      : "#B73333",
                                },
                              ]}
                            >
                              {fnCalculateValue(
                                "Adjustment",
                                formatCurrency(LockDetails["compamtreq"])
                              )}
                            </CustomText>
                          </View>
                          {Addons?.map((row, index) => (
                            <View
                              style={[
                                styles["oddBG"],
                                {
                                  backgroundColor:
                                    index % 2 == 0 ? "#f4f4f4" : "#fff",
                                },
                              ]}
                            >
                              <CustomText
                                style={[styles["SemiMidText"], { flex: 3 }]}
                              >
                                {
                                  row["desc"]
                                    .replace("[rab]", "")
                                    .replace("[rae]", "")
                                    .split("||")?.[0]
                                }
                              </CustomText>
                              <CustomText
                                style={[
                                  styles["MidText"],
                                  { flex: 1, textAlign: "center", color:
                                  row["rate"].toString().indexOf("-") !=
                                  -1
                                    ? "#88AB35"
                                    : "#B73333", },
                                ]}
                              >
                                {fnCalculateValue(
                                  "Adjustment",formatPercentage(row["rate"], 3))}
                              </CustomText>
                              <CustomText
                                style={[
                                  styles["MidText"],
                                  {
                                    flex: 1,
                                    textAlign: "right",
                                    color:
                                      row["points"].toString().indexOf("-") !=
                                      -1
                                        ? "#88AB35"
                                        : "#B73333",
                                  },
                                ]}
                              >
                                {fnCalculateValue(
                                  "Adjustment",
                                  formatPercentage(row["points"], 3)
                                )}
                              </CustomText>
                              <CustomText
                                style={[
                                  styles["MidText"],
                                  {
                                    flex: 1,
                                    textAlign: "right",
                                    color:
                                      row["amt"].indexOf("-") != -1
                                        ? "#88AB35"
                                        : "#B73333",
                                  },
                                ]}
                              >
                                {fnCalculateValue(
                                  "Adjustment",
                                  formatCurrency(row["amt"])
                                )}
                              </CustomText>
                            </View>
                          ))}

                          <View
                            style={[
                              styles["oddBG"],
                              {
                                backgroundColor: "#d5d5d5",
                                borderBottomWidth: 0,
                                borderBottomRightRadius: 5,
                                borderBottomLeftRadius: 5,
                              },
                            ]}
                          >
                            <CustomText
                              style={[styles["MidText"], { flex: 3 }]}
                            >
                              Final Interest Rate and Price
                            </CustomText>
                            {!LockDetails["SupervisorEdit"] ? (
                              <>
                                <CustomText
                                  style={[
                                    styles["MidText"],
                                    { flex: 1, textAlign: "center" },
                                  ]}
                                >
                                  {LockDetails["comprateadj"]}
                                </CustomText>
                                <CustomText
                                  style={[
                                    styles["MidText"],
                                    {
                                      flex: 1,
                                      textAlign: "right",
                                      color:
                                        (
                                          LockDetails["comppointsadj"] || ""
                                        )?.indexOf("-") != -1
                                          ? "#88AB35"
                                          : "#B73333",
                                    },
                                  ]}
                                >
                                  {fnCalculateValue(
                                    "Adjustment",
                                    formatPercentage(
                                      LockDetails["comppointsadj"],
                                      3
                                    )
                                  )}
                                </CustomText>
                                <CustomText
                                  style={[
                                    styles["MidText"],
                                    {
                                      flex: 1,
                                      textAlign: "right",
                                      color:
                                        (
                                          LockDetails["compamtadj"] || ""
                                        )?.indexOf("-") != -1
                                          ? "#88AB35"
                                          : "#B73333",
                                    },
                                  ]}
                                >
                                  {fnCalculateValue(
                                    "Adjustment",
                                    formatCurrency(LockDetails["compamtadj"])
                                  )}
                                  {/* {formatCurrency(LockDetails["compamtadj"])} */}
                                </CustomText>
                              </>
                            ) : (
                              <>
                                <View style={{ flex: 1 }}>
                                  <View style={{ width: 90 }}>
                                    <InputBox
                                      validate={false}
                                      //disabled={LockDetails["wssettled"] == 1}
                                      showBorder={true}
                                      value={LockDetails["comprateadj"] || ""}
                                      onChangeText={(text) => {
                                        handleOnchangeDetails(
                                          "comprateadj",
                                          text,
                                          "SupervisorEdit"
                                        );
                                      }}
                                    />
                                  </View>
                                </View>
                                <View
                                  style={{ flex: 1, alignItems: "flex-end" }}
                                >
                                  <View style={{ width: 90 }}>
                                    <InputBox
                                      validate={false}
                                      //disabled={LockDetails["wssettled"] == 1}
                                      showBorder={true}
                                      value={LockDetails["comppointsadj"] || ""}
                                      onChangeText={(text) => {
                                        handleOnchangeDetails(
                                          "comppointsadj",
                                          text,
                                          "SupervisorEdit"
                                        );
                                      }}
                                    />
                                  </View>
                                </View>
                                <View
                                  style={{ flex: 1, alignItems: "flex-end" }}
                                >
                                  <View style={{ width: 90 }}>
                                    <InputBox
                                      validate={false}
                                      //disabled={LockDetails["wssettled"] == 1}
                                      showBorder={true}
                                      value={LockDetails["compamtadj"] || ""}
                                      onChangeText={(text) => {
                                        handleOnchangeDetails(
                                          "compamtadj",
                                          text,
                                          "SupervisorEdit"
                                        );
                                      }}
                                    />
                                  </View>
                                </View>
                              </>
                            )}
                          </View>
                        </View>
                      </View>
                    </AccordionCustom>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        paddingHorizontal: 10,
                      }}
                    >
                      <View style={{ width: 250, marginTop: 15 }}>
                        <View
                          style={{
                            borderColor: "#c6c6c6",
                            borderWidth: 1,
                            borderRadius: 3,
                          }}
                        >
                          <View
                            style={{
                              borderColor: "#c6c6c6",
                              borderBottomWidth: 1,
                              backgroundColor: "#f6f6f6",
                              alignItems: "center",
                              borderTopRightRadius: 5,
                              borderTopLeftRadius: 5,
                            }}
                          >
                            <CustomText
                              style={[styles["MidText"], { color: "#000" }]}
                            >
                              Underwriting Fees
                            </CustomText>
                          </View>
                          <View style={[styles["oddBG"], { padding: 0 }]}>
                            <CustomText
                              style={[
                                styles["MidText"],
                                {
                                  paddingLeft: 3,
                                  fontSize: 12,
                                },
                              ]}
                            >
                              {`Underwriting Fee ${
                                LockDetails["IsUWFeeIncludedInRate"]
                                  ? `In`
                                  : `Out`
                              }: `}
                            </CustomText>

                            <CustomText style={styles["SemiMidText"]}>
                              {LockDetails["UWFeeAmountDesc"]}
                            </CustomText>
                          </View>

                          <View
                            style={[
                              styles["evenBG"],
                              {
                                padding: 0,
                                borderBottomWidth: 0,
                                borderBottomRightRadius: 5,
                                borderBottomLeftRadius: 5,
                              },
                            ]}
                          >
                            <CustomText
                              style={[
                                {
                                  paddingLeft: 3,
                                  flexDirection: "row",
                                },
                              ]}
                            >
                              <CustomText
                                style={[styles["MidText"], { fontSize: 12 }]}
                              >
                                {`Rate Sheet ID: `}
                              </CustomText>
                              <CustomText style={[styles["SemiMidText"]]}>
                                {LockDetails["ratesheetused"]}
                              </CustomText>
                            </CustomText>
                          </View>
                        </View>
                      </View>
                      <View style={{ width: 400, marginTop: 10 }}>
                        <View
                          style={{
                            borderColor: "#c6c6c6",
                            borderWidth: 1,
                            borderRadius: 3,
                          }}
                        >
                          <View
                            style={{
                              borderColor: "#c6c6c6",
                              borderBottomWidth: 1,
                              backgroundColor: "#f6f6f6",
                              alignItems: "center",
                              borderTopRightRadius: 5,
                              borderTopLeftRadius: 5,
                            }}
                          >
                            <CustomText
                              style={[styles["MidText"], { color: "#000" }]}
                            >
                              Compensation Plan Details
                            </CustomText>
                          </View>

                          <View style={[styles["oddBG"], { padding: 0 }]}>
                            <CustomText
                              style={[
                                styles["MidText"],
                                {
                                  flex: 2,
                                  borderRightWidth: 1,
                                  borderColor: "#c6c6c6",
                                  paddingLeft: 3,
                                  fontSize: 12,
                                },
                              ]}
                            >
                              Compensation Type
                            </CustomText>

                            <CustomText
                              style={[
                                styles["SemiMidText"],
                                {
                                  flex: 1,
                                  borderRightWidth: 1,
                                  borderColor: "#c6c6c6",
                                  textAlign: "center",
                                },
                              ]}
                            >
                              Lender Paid %
                            </CustomText>

                            <CustomText
                              style={[
                                styles["SemiMidText"],
                                {
                                  paddingLeft: 3,
                                  flex: 1,
                                  textAlign: "center",
                                },
                              ]}
                            >
                              Lender Paid $
                            </CustomText>
                          </View>

                          <View style={[styles["evenBG"], { padding: 0 }]}>
                            <CustomText
                              style={[
                                styles["MidText"],
                                {
                                  flex: 2,
                                  borderRightWidth: 1,
                                  borderColor: "#c6c6c6",
                                  paddingLeft: 3,
                                  fontSize: 12,
                                },
                              ]}
                            >
                              Price Without Lender Comp
                            </CustomText>
                            <View
                              style={{
                                flex: 1,
                                borderRightWidth: 1,
                                borderColor: "#c6c6c6",
                              }}
                            >
                              <CustomText
                                style={[
                                  styles["SemiMidText"],
                                  { textAlign: "right", paddingRight: 13 },
                                ]}
                              >
                                {fnCalculateValue(
                                  "Adjustment",
                                  formatPercentage(
                                    LockDetails["comppointsadj"],
                                    3
                                  )
                                )}
                              </CustomText>
                            </View>
                            <View
                              style={{
                                flex: 1,
                                marginLeft: 3,
                              }}
                            >
                              <CustomText
                                style={[
                                  styles["SemiMidText"],
                                  { textAlign: "right", paddingRight: 13 },
                                ]}
                              >
                                {fnCalculateValue(
                                  "Adjustment",
                                  formatCurrency(LockDetails["dblCompAmtAdj"])
                                )}
                              </CustomText>
                            </View>
                          </View>

                          <View style={[styles["oddBG"], { padding: 0 }]}>
                            <CustomText
                              style={[
                                styles["MidText"],
                                {
                                  flex: 2,
                                  borderRightWidth: 1,
                                  borderColor: "#c6c6c6",
                                  paddingLeft: 3,
                                  fontSize: 12,
                                },
                              ]}
                            >
                              Lender Comp
                            </CustomText>
                            <View
                              style={{
                                flex: 1,
                                borderRightWidth: 1,
                                borderColor: "#c6c6c6",
                              }}
                            >
                              <CustomText
                                style={[
                                  styles["SemiMidText"],
                                  { textAlign: "right", paddingRight: 13 },
                                ]}
                              >
                                {fnCalculateValue(
                                  "Adjustment",
                                  formatPercentage(
                                    LockDetails["Lendpointsreq"],
                                    3
                                  )
                                )}
                              </CustomText>
                            </View>
                            <View
                              style={{
                                flex: 1,
                                marginLeft: 3,
                              }}
                            >
                              <CustomText
                                style={[
                                  styles["SemiMidText"],
                                  { textAlign: "right", paddingRight: 13 },
                                ]}
                              >
                                {fnCalculateValue(
                                  "Adjustment",
                                  formatCurrency(LockDetails["dblLendamtreq"])
                                )}
                              </CustomText>
                            </View>
                          </View>

                          <View
                            style={[
                              styles["evenBG"],
                              {
                                padding: 0,
                                borderBottomWidth: 0,
                                borderBottomRightRadius: 5,
                                borderBottomLeftRadius: 5,
                              },
                            ]}
                          >
                            <CustomText
                              style={[
                                styles["MidText"],
                                {
                                  flex: 2,
                                  borderRightWidth: 1,
                                  borderColor: "#c6c6c6",
                                  paddingLeft: 3,
                                  fontSize: 12,
                                },
                              ]}
                            >
                              Price Including Lender Comp
                            </CustomText>

                            <View
                              style={{
                                flex: 1,
                                borderRightWidth: 1,
                                borderColor: "#c6c6c6",
                              }}
                            >
                              <CustomText
                                style={[
                                  styles["MidText"],
                                  { textAlign: "right", paddingRight: 13 },
                                ]}
                              >
                                {fnCalculateValue(
                                  "Adjustment",
                                  fnCalculateValue("LenderPoint")
                                )}
                              </CustomText>
                            </View>
                            <View
                              style={{
                                flex: 1,
                                marginLeft: 3,
                              }}
                            >
                              <CustomText
                                style={[
                                  styles["MidText"],
                                  { textAlign: "right", paddingRight: 13 },
                                ]}
                              >
                                {fnCalculateValue(
                                  "Adjustment",
                                  fnCalculateValue("LenderAmt")
                                )}
                              </CustomText>
                            </View>
                          </View>

                          {/* <View style={[styles["oddBG"], { padding: 0 }]}>
                              <CustomText
                                style={[
                                  styles["MidText"],
                                  {
                                    flex: 2,
                                    borderRightWidth: 1,
                                    borderColor: "#c6c6c6",
                                    paddingLeft: 3,
                                    fontSize: 12,
                                  },
                                ]}
                              >
                                {`Underwriting Fee ${
                                  LockDetails["IsUWFeeIncludedInRate"]
                                    ? `In`
                                    : `Out`
                                }`}
                              </CustomText>
                              <View
                                style={{
                                  flex: LockDetails["IsUWFeeIncludedInRate"]
                                    ? 2
                                    : 1,
                                  marginLeft: !LockDetails[
                                    "IsUWFeeIncludedInRate"
                                  ]
                                    ? 2
                                    : 4,
                                }}
                              >
                                <CustomText
                                  style={[
                                    styles["SemiMidText"],
                                    {
                                      flex: LockDetails["IsUWFeeIncludedInRate"]
                                        ? 2
                                        : 1,
                                      borderRightWidth: !LockDetails[
                                        "IsUWFeeIncludedInRate"
                                      ]
                                        ? 1
                                        : 0,
                                      borderColor: "#c6c6c6",
                                      textAlign: LockDetails[
                                        "IsUWFeeIncludedInRate"
                                      ]
                                        ? "center"
                                        : "right",
                                      paddingRight: 13,
                                    },
                                  ]}
                                >
                                  {formatPercentage(
                                    LockDetails["UWFeePercentDesc"],
                                    3
                                  )}
                                </CustomText>
                              </View>
                              {!LockDetails["IsUWFeeIncludedInRate"] && (
                                <View
                                  style={{
                                    flex: 1,
                                    marginLeft: 3,
                                  }}
                                >
                                  <CustomText
                                    style={[
                                      styles["SemiMidText"],
                                      {
                                        paddingLeft: 3,
                                        flex: 1,
                                        textAlign: "right",
                                        paddingRight: 13,
                                      },
                                    ]}
                                  >
                                    {LockDetails["UWFeeAmountDesc"]}
                                  </CustomText>
                                </View>
                              )}
                            </View>

                            <View
                              style={[
                                styles["evenBG"],
                                {
                                  padding: 0,
                                  borderBottomWidth: 0,
                                  borderBottomRightRadius: 5,
                                  borderBottomLeftRadius: 5,
                                },
                              ]}
                            >
                              <CustomText
                                style={[
                                  {
                                    flex: 2,
                                    borderRightWidth: 1,
                                    borderColor: "#c6c6c6",
                                    paddingLeft: 3,
                                    flexDirection: "row",
                                  },
                                ]}
                              >
                                <CustomText
                                  style={[styles["MidText"], { fontSize: 12 }]}
                                >
                                  {`Rate Sheet ID: `}
                                </CustomText>
                                <CustomText style={[styles["SemiMidText"]]}>
                                  {LockDetails["ratesheetused"]}
                                </CustomText>
                              </CustomText>

                              <CustomText
                                style={[
                                  styles["SemiMidText"],
                                  {
                                    flex: 1,
                                    borderRightWidth: 1,
                                    borderColor: "#c6c6c6",
                                    textAlign: "center",
                                  },
                                ]}
                              >
                              </CustomText>

                              <CustomText
                                style={[
                                  styles["SemiMidText"],
                                  {
                                    paddingLeft: 3,
                                    flex: 1,
                                    textAlign: "center",
                                  },
                                ]}
                              ></CustomText>
                            </View> */}
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
                {LockDetails?.["SupervisorEdit"] && (
                  <View style={{ marginHorizontal: 15, marginTop: 3, gap: 4 }}>
                    <CustomText
                      bold={true}
                      style={[styles["MidText"], { color: "#000" }]}
                    >
                      Supervisor Edit Notes:
                    </CustomText>
                    <View
                      style={{
                        // height: 70,
                        backgroundColor: "#FFF",
                        borderColor: "#c6c6c6",
                        borderWidth: 1,
                        padding: 10,
                      }}
                    >
                      <InputBox
                        validate={false}
                        showBorder={false}
                        value={LockDetails["SupNotes"] || ""}
                        onChangeText={(text) => {
                          handleOnchangeDetails(
                            "SupNotes",
                            text,
                            "SupervisorEdit"
                          );
                        }}
                        style={[
                          styles["minText"],
                          {
                            textAlign: "start",
                            width: "100%",
                            height: 70,
                            fontWeight: 200,
                            fontSize: 11,
                          },
                        ]}
                        textAlignVertical="top"
                        multiline={true}
                      />
                    </View>
                    {/* <Button
                      title={
                        <CustomText
                          bold={false}
                          style={{
                            color: "#FFFFF",
                            fontSize: 11,
                            fontWeight: 200,
                          }}
                        >
                          Save Notes
                        </CustomText>
                      }
                      style={[
                        styles["btn"],
                        styles["cardShadow"],
                        {
                          borderRadius: 3,
                          paddingVertical: 6,
                          paddingHorizontal: 8,
                          borderWidth: 2,
                          borderColor: "#0d6ac5",
                        },
                      ]}
                      onPress={() => {
                        handleSupervisorSave();
                      }}
                    /> */}
                  </View>
                )}
              </View>
            </LinearGradient>
          </View>
          {/* Latest Interest Rate Action */}
          <View
            style={[
              styles.shadow,

              {
                boxShadow: "rgba(0, 0, 0, 0.25) 0px 6px 20px",
                width: 800,
                alignItems: "center",
              },
            ]}
          >
            <LinearGradient
              colors={["#f6f6f6", "#e8e8e8", "#F6F6F6"]}
              style={{
                borderRadius: 6,
                width: "100%",
                padding: 15,
              }}
            >
              <View>
                <View
                  style={[
                    styles["row"],
                    {
                      justifyContent: "space-between",
                      marginBottom: 7,
                      gap: 10,
                    },
                  ]}
                >
                  <CustomText
                    fontName="Inter"
                    style={[
                      styles["maxText"],
                      { textAlign: "start", lineHeight: "1.8" },
                    ]}
                  >
                    Latest Interest Rate Actions
                  </CustomText>
                </View>
                <View
                  style={{
                    borderBottomColor: "#c6c6c6",
                    borderBottomWidth: 1,
                    // marginLeft: 20,
                  }}
                ></View>
                <View
                  style={{
                    borderColor: "#c6c6c6",
                    borderWidth: 1,
                    marginVertical: 5,
                  }}
                >
                  {LockedInfo?.[11]?.["LatestHistoryInfo"] ? (
                    <View
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 10,
                        backgroundColor: "white",
                        gap: 5,
                      }}
                    >
                      <CustomText
                        style={[
                          styles["minText"],
                          { textAlign: "start", fontWeight: 200, fontSize: 11 },
                        ]}
                      >
                        {`${LockedInfo?.[11]?.["LatestHistoryInfo"][0]["LatestHistoryWhen"]} - ${LockedInfo?.[11]?.["LatestHistoryInfo"][0]["LatestHistoryWho"]}`}
                      </CustomText>
                      <CustomText
                        style={[
                          styles["minText"],
                          { textAlign: "start", fontWeight: 200, fontSize: 11 },
                        ]}
                      >
                        {`${
                          LockedInfo?.[11]?.["LatestHistoryInfo"][0][
                            "LatestHistoryWhat"
                          ] == "undefined"
                            ? ""
                            : LockedInfo?.[11]?.["LatestHistoryInfo"][0][
                                "LatestHistoryWhat"
                              ]
                        }`}
                      </CustomText>
                    </View>
                  ) : (
                    <CustomText
                      style={[
                        styles["minText"],
                        {
                          textAlign: "start",
                          fontWeight: 200,
                          fontSize: 11,
                          paddingVertical: 10,
                          paddingHorizontal: 10,
                          backgroundColor: "white",
                        },
                      ]}
                    >
                      Loading...
                    </CustomText>
                  )}
                </View>
                <View>
                  <View
                    style={{
                      paddingVertical: 10,
                      //paddingHorizontal: 10,
                      flexDirection: "row",
                    }}
                  >
                    <View style={{ display: "contents" }}>
                      <CustomText
                        style={[
                          styles["minText"],
                          { textAlign: "start", fontWeight: 200, fontSize: 11 },
                        ]}
                      >
                        <CustomText bold={true} style={{ color: "#000" }}>
                          Disclaimer:{" "}
                        </CustomText>
                        The pricing provided on this confirmation is subject to
                        change. Changes, including but not limited to changes in
                        the loan characteristics, program eligibility,
                        commitment terms and late fees will affect the final
                        loan price. We reserve the right to modify and/or revise
                        the information provided herein at any time. If
                        product/program changes, worst case scenario pricing
                        applies.
                      </CustomText>
                    </View>
                    <View>
                      <Button
                        title={
                          <CustomText
                            bold={false}
                            style={{
                              color: "#FFFFF",
                              fontSize: 11,
                              fontWeight: 200,
                            }}
                          >
                            View All Notes
                          </CustomText>
                        }
                        style={[
                          styles["btn"],
                          styles["cardShadow"],
                          {
                            borderRadius: 3,
                            paddingVertical: 6,
                            paddingHorizontal: 8,
                            borderWidth: 2,
                            borderColor: "#0d6ac5",
                          },
                        ]}
                        onPress={() => {
                          handleLockHistoryOpen();
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Loan Details */}
          <View
            style={[
              styles.shadow,

              {
                boxShadow: "rgba(0, 0, 0, 0.25) 0px 6px 20px",
                width: 800,
                alignItems: "center",
              },
            ]}
          >
            <LinearGradient
              colors={["#f6f6f6", "#e8e8e8", "#F6F6F6"]}
              style={{
                borderRadius: 6,
                width: "100%",
                //padding: 4,
              }}
            >
              <View>
                <AccordionCustom
                  title={
                    <>
                      <CustomText>Loan Details</CustomText>
                    </>
                  }
                  isAccordion={true}
                  isExpand={LockDetails?.SupervisorEdit}
                >
                  <View>
                    <View
                      style={{
                        borderTopColor: "#c6c6c6",
                        borderTopWidth: 1,
                        marginHorizontal: 25,
                      }}
                    ></View>
                    <View style={{ paddingHorizontal: 24 }}>
                      <View
                        style={{
                          borderColor: "#c6c6c6",
                          borderWidth: 1,
                          marginTop: 5,
                        }}
                      >
                        <View style={{ marginVertical: 7 }}>
                          <CustomText
                            style={[
                              styles["maxText"],
                              {
                                fontSize: 12,
                                textAlign: "start",
                                marginHorizontal: 15,
                              },
                            ]}
                            //fontName="'Segoe'"
                          >
                            Borrower Information
                          </CustomText>
                        </View>

                        <View
                          style={{
                            // flexDirection: "row",
                            marginHorizontal: 15,
                            marginVertical: 10,
                            justifyContent: "space-between",
                            gap: 15,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 60,
                            }}
                          >
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Borrower(s)
                              </CustomText>
                              <View style={{}}>
                                <CustomText style={[styles["MidText"]]}>
                                  {LockDetails["primborrower"]}
                                </CustomText>
                                <CustomText
                                  fontName="Inter"
                                  style={[styles["MidText"]]}
                                >
                                  {LockDetails["primborrowerssn"] ==
                                  "undefined  "
                                    ? ""
                                    : LockDetails["primborrowerssn"] || ""}
                                </CustomText>
                              </View>
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                FICO Scores
                              </CustomText>
                              <View style={{}}>
                                <CustomText style={[styles["MidText"]]}>
                                  {LockDetails["PrimBorrFICOs"]}
                                </CustomText>
                                {/* <CustomText style={[styles["MidText"]]}>
                                {LockDetails["CoBorrFICOs"]}
                              </CustomText> */}
                              </View>
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Qualifying FICO
                              </CustomText>
                              <CustomText style={[styles["MidText"]]}>
                                {LockDetails["qualifyfico"]}
                              </CustomText>
                            </View>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 60,
                            }}
                          >
                            <View style={{ gap: 3, flex: 1 }}>
                              {/* <CustomText
                              style={[
                                styles["SemiMidText"],
                              ]}
                            >
                              SSN(s)
                            </CustomText> */}
                              <View style={{}}>
                                <CustomText style={[styles["MidText"]]}>
                                  {/* {LockDetails["primborrowerssn"] == "undefined  "
                                  ? ""
                                  : LockDetails["primborrowerssn"] || ""} */}
                                  {LockDetails["coborrower"] || ""}
                                </CustomText>
                                <CustomText style={[styles["MidText"]]}>
                                  {LockDetails["coborrowerssn"] || ""}
                                </CustomText>
                              </View>
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                {""}
                              </CustomText>
                              <View style={{}}>
                                {LockDetails["coborrower"]?.length > 2 && (
                                  <CustomText style={[styles["MidText"]]}>
                                    {LockDetails["CoBorrFICOs"]}
                                  </CustomText>
                                )}
                              </View>
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                DTI
                              </CustomText>
                              <CustomText style={[styles["MidText"]]}>
                                {formatPercentage(LockDetails["dti"], 2)}
                              </CustomText>
                            </View>
                          </View>
                        </View>
                      </View>

                      <View
                        style={{
                          borderColor: "#c6c6c6",
                          borderWidth: 1,
                          marginTop: 8,
                        }}
                      >
                        <View style={{ marginVertical: 7 }}>
                          <CustomText
                            style={[
                              styles["MidText"],
                              { marginHorizontal: 15 },
                            ]}
                            //fontName="'Segoe'"
                          >
                            Property Information
                          </CustomText>
                        </View>
                        <View
                          style={{
                            //flexDirection: "row",
                            marginHorizontal: 15,
                            marginVertical: 10,
                            justifyContent: "space-between",
                            gap: 10,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 60,
                            }}
                          >
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Property Address
                              </CustomText>
                              <View style={{}}>
                                <CustomText style={[styles["MidText"]]}>
                                  {LockDetails["propaddress"]}
                                </CustomText>
                                <CustomText style={[styles["MidText"]]}>
                                  {LockDetails["propaddcsz"]}
                                </CustomText>
                              </View>
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Property Type
                              </CustomText>
                              <CustomText style={[styles["MidText"]]}>
                                {LockDetails["proptype"]}
                              </CustomText>
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Occupancy
                              </CustomText>
                              <CustomText style={[styles["MidText"]]}>
                                {LockDetails["occupancy"]}
                              </CustomText>
                            </View>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 60,
                            }}
                          >
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                County
                              </CustomText>
                              <CustomText style={[styles["MidText"]]}>
                                {LockDetails["county"]}
                              </CustomText>
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                No of Units
                              </CustomText>
                              <CustomText style={[styles["MidText"]]}>
                                {LockDetails["nounits"]}
                              </CustomText>
                            </View>
                            <View style={{ gap: 3, flex: 1 }}></View>
                          </View>
                        </View>
                      </View>

                      <View
                        style={{
                          borderColor: "#c6c6c6",
                          borderWidth: 1,
                          marginTop: 8,
                        }}
                      >
                        <View style={{ marginVertical: 7 }}>
                          <CustomText
                            style={[
                              [styles["MidText"], { marginHorizontal: 15 }],
                            ]}
                            //fontName="'Segoe'"
                          >
                            Loan Details
                          </CustomText>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            marginHorizontal: 15,
                            marginVertical: 10,
                            justifyContent: "space-between",
                            gap: 10,
                          }}
                        >
                          <View style={{ gap: 10, flex: 1 }}>
                            <View style={{ gap: 3 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Loan Purpose
                              </CustomText>
                              <CustomText style={[styles["MidText"]]}>
                                {LockDetails["loanpurpose"]}
                              </CustomText>
                            </View>
                            {LockDetails["loanpurpose"] == "Purchase" && (
                              <View style={{ gap: 3 }}>
                                <CustomText style={[styles["SemiMidText"]]}>
                                  Purchase Price
                                </CustomText>
                                <CustomText style={[styles["MidText"]]}>
                                  {LockDetails["purchaseprice"]}
                                </CustomText>
                              </View>
                            )}
                            <View style={{ gap: 3 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Appraised Value
                              </CustomText>
                              <CustomText style={[styles["MidText"]]}>
                                {LockDetails["apprvalue"]}
                              </CustomText>
                            </View>
                            <View style={{ gap: 3 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Base Loan Amount
                              </CustomText>
                              <CustomText style={[styles["MidText"]]}>
                                {LockDetails["baseloanamt"]}
                              </CustomText>
                            </View>
                            <View style={{ gap: 3 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Total Loan Amount
                              </CustomText>
                              <CustomText style={[styles["MidText"]]}>
                                {LockDetails["totalloanamt"]}
                              </CustomText>
                            </View>
                          </View>
                          <View style={{ gap: 10, flex: 1 }}>
                            <View style={{ gap: 3, marginLeft: 17 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                LTV
                              </CustomText>
                              <CustomText style={[styles["MidText"]]}>
                                {LockDetails["ltv"]}
                              </CustomText>
                            </View>
                            <View style={{ gap: 3, marginLeft: 17 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                CLTV
                              </CustomText>
                              <CustomText style={[styles["MidText"]]}>
                                {LockDetails["cltv"]}
                              </CustomText>
                            </View>
                          </View>
                          <View style={{ gap: 10, flex: 1 }}>
                            <View style={{ gap: 3 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Escrow Waiver
                              </CustomText>
                              <View style={{ alignItems: "flex-start" }}>
                                <Swatch
                                  value={LockDetails["escrowrequest"] == 1}
                                  size={13}
                                  onChange={(text) => {
                                    let val = text ? 1 : 0;
                                    handleOnchangeDetails(
                                      "escrowrequest",
                                      val,
                                      "SupervisorEdit"
                                    );
                                  }}
                                />
                              </View>
                              <CustomText style={[styles["MidText"]]}>
                                {`Escrow Waiver ${
                                  LockDetails["escrowrequest"] == 1 &&
                                  LockDetails["escrowallowed"] == 1
                                    ? `Requested and Allowed`
                                    : LockDetails["escrowrequest"] == 1 &&
                                      LockDetails["escrowallowed"] == 0
                                    ? `Requested - Not Allowed`
                                    : `Not Requested`
                                }`}
                              </CustomText>
                            </View>
                            <View style={{ gap: 3 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Down Payment Gift
                              </CustomText>
                              <View style={{ alignItems: "flex-start" }}>
                                <Swatch
                                  size={13}
                                  value={LockDetails["nonprofitgiftfund"] == 1}
                                  onChange={(text) => {
                                    let val = text ? 1 : 0;
                                    handleOnchangeDetails(
                                      "nonprofitgiftfund",
                                      val,
                                      "SupervisorEdit"
                                    );
                                  }}
                                />
                              </View>
                            </View>
                            <View style={{ gap: 3 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Property listed on MLS in the last 6 months
                              </CustomText>
                              <View style={{ alignItems: "flex-start" }}>
                                <Swatch
                                  size={13}
                                  value={
                                    LockDetails["propertylistedonmls"] == 1
                                  }
                                  onChange={(text) => {
                                    let val = text ? 1 : 0;
                                    handleOnchangeDetails(
                                      "propertylistedonmls",
                                      val,
                                      "SupervisorEdit"
                                    );
                                  }}
                                />
                              </View>
                            </View>
                            <View style={{ gap: 3 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Energy Efficient Mortgage
                              </CustomText>
                              <View style={{ alignItems: "flex-start" }}>
                                <Swatch
                                  size={13}
                                  disable={false}
                                  value={LockDetails["energyeffmort"] == 1}
                                  onChange={(text) => {
                                    let val = text ? 1 : 0;
                                    handleOnchangeDetails(
                                      "energyeffmort",
                                      val,
                                      "SupervisorEdit"
                                    );
                                  }}
                                />
                              </View>
                            </View>
                            {/* <View style={{ gap: 3 }}>
                          <CustomText style={[styles["SemiMidText"]]}>
                            Escrow Waiver Result
                          </CustomText>
                          <CustomText style={[styles["MidText"]]}>
                            Escrow Waiver Not Requested
                          </CustomText>
                        </View> */}
                          </View>
                        </View>
                      </View>

                      <View
                        style={{
                          borderColor: "#c6c6c6",
                          borderWidth: 1,
                          marginTop: 8,
                          marginBottom: 20,
                        }}
                      >
                        <View style={{ marginVertical: 7 }}>
                          <CustomText
                            style={[
                              [styles["MidText"], { marginHorizontal: 15 }],
                            ]}
                            //fontName="'Segoe'"
                          >
                            Rate Lock Details
                          </CustomText>
                        </View>
                        <View
                          style={{
                            //flexDirection: "row",
                            marginHorizontal: 15,
                            marginVertical: 10,
                            //justifyContent: "space-between",
                            gap: 10,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 60,
                            }}
                          >
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Date Rate Locked
                              </CustomText>
                              {!LockDetails["SupervisorEdit"] ? (
                                <CustomText style={[styles["MidText"]]}>
                                  {LockDetails["complockeddate"]}
                                </CustomText>
                              ) : (
                                <View>
                                  <InputBox
                                    validate={false}
                                    showBorder={true}
                                    value={LockDetails["complockeddate"] || ""}
                                    onChangeText={(text) => {
                                      handleOnchangeDetails(
                                        "complockeddate",
                                        text,
                                        "SupervisorEdit"
                                      );
                                    }}
                                    onBlur={(text) => {
                                      text = text.target.value || "";
                                      handleOnBlur("complockeddate", text);
                                    }}
                                  />
                                </View>
                              )}
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Rate Sheet Date
                              </CustomText>
                              {!LockDetails["SupervisorEdit"] ? (
                                <CustomText style={[styles["MidText"]]}>
                                  {LockDetails["ratesheetdate"]}
                                </CustomText>
                              ) : (
                                <View>
                                  <GridDropDown
                                    style={{}}
                                    showBorder={true}
                                    isValid={false}
                                    label={""}
                                    options={option?.["RateSheetDateOpt"]}
                                    value={LockDetails["ratesheetdate"]}
                                    onSelect={(text) => {
                                      handleOnchangeDetails(
                                        "ratesheetdate",
                                        text["value"],
                                        "SupervisorEdit"
                                      );
                                    }}
                                    onBlur={() => {}}
                                  />
                                </View>
                              )}
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Rate Sheet ID
                              </CustomText>
                              {!LockDetails["SupervisorEdit"] ? (
                                <CustomText style={[styles["MidText"]]}>
                                  {LockDetails["ratesheetused"]}
                                </CustomText>
                              ) : (
                                <View>
                                  <GridDropDown
                                    name="ratesheetused"
                                    style={{}}
                                    showBorder={true}
                                    isValid={false}
                                    label={""}
                                    options={
                                      option?.["filteredRateSheetIdsOpt"]
                                    }
                                    value={LockDetails["ratesheetused"]}
                                    onSelect={(text) => {
                                      handleOnchangeDetails(
                                        "ratesheetused",
                                        text["value"],
                                        "SupervisorEdit"
                                      );
                                    }}
                                    onBlur={() => {}}
                                  />
                                </View>
                              )}
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Interest Rate Set Date
                              </CustomText>
                              <CustomText style={[styles["MidText"]]}>
                                {LockDetails["lockchangedate"] ||
                                  LockDetails["complockeddate"]}
                              </CustomText>
                            </View>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 30,
                            }}
                          >
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Rate Pattern
                              </CustomText>
                              <CustomText style={[styles["MidText"]]}>
                                {LockDetails["ratepattern"]}
                              </CustomText>
                            </View>
                            <View style={{ gap: 3, flex: 2 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Loan Program ID
                              </CustomText>
                              <CustomText style={[styles["MidText"]]}>
                                {LockDetails["LoanProgName"]}
                              </CustomText>
                            </View>

                            <View
                              style={{
                                gap: 3,
                                flex: 1,
                                justifyContent: "flex-end",
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "flex-end",
                                  gap: 6,
                                }}
                              >
                                <Button
                                  title={
                                    <CustomText
                                      style={{
                                        color: "#FFFFF",
                                        fontSize: 11,
                                        fontWeight: 200,
                                      }}
                                    >
                                      Remove Re-Lock Fee
                                    </CustomText>
                                  }
                                  style={[
                                    styles["btn"],
                                    styles["cardShadow"],
                                    {
                                      borderRadius: 3,
                                      paddingVertical: 6,
                                      paddingHorizontal: 8,
                                      borderWidth: 2,
                                      borderColor:
                                        LockDetails["wholeSaleAcceeRights"] ==
                                          0 ||
                                        LockDetails["Relock30"] == 0 ||
                                        LockDetails["disableReLock"]
                                          ? "#c1c0c0"
                                          : "#0d6ac5",
                                      marginLeft: 0,
                                    },
                                  ]}
                                  isDisable={
                                    LockDetails["wholeSaleAcceeRights"] == 0 ||
                                    LockDetails["Relock30"] == 0 ||
                                    LockDetails["disableReLock"]
                                  }
                                  onPress={() => {
                                    handleClearRelock();
                                  }}
                                />
                                <Image
                                  style={{
                                    height: 18,
                                    width: 18,
                                    cursor: "pointer",
                                  }}
                                  resizeMode="contain"
                                  source={require(`../assets/ChangeLog.svg`)}
                                  onClick={handleClearLockChangeLog}
                                />
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </AccordionCustom>
              </View>
            </LinearGradient>
          </View>

          {/* Investor Information */}
          {LockDetails["intrateaccess"] == "True" && (
            <View
              style={[
                styles.shadow,

                {
                  boxShadow: "rgba(0, 0, 0, 0.25) 0px 6px 20px",
                  width: 800,
                  alignItems: "center",
                },
              ]}
            >
              <LinearGradient
                colors={["#f6f6f6", "#e8e8e8", "#F6F6F6"]}
                style={{
                  borderRadius: 6,
                  width: "100%",
                  //padding: 4,
                }}
              >
                <View>
                  <AccordionCustom
                    title={
                      <>
                        <CustomText>Investor Information</CustomText>
                      </>
                    }
                    isAccordion={true}
                    isExpand={true}
                  >
                    <View>
                      <View
                        style={{
                          borderTopColor: "#c6c6c6",
                          borderTopWidth: 1,
                          marginHorizontal: 25,
                        }}
                      ></View>
                      <View style={{ paddingHorizontal: 24 }}>
                        <View
                          style={{
                            //  flexDirection: "row",
                            //  marginHorizontal: 15,
                            marginVertical: 10,
                            justifyContent: "space-between",
                            gap: 10,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 60,
                            }}
                          >
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Investor
                              </CustomText>
                              <View style={{ flexDirection: "row" }}>
                                <View style={{ width: "80%" }}>
                                  <GridDropDown
                                    style={{}}
                                    showBorder={true}
                                    disabled={LockDetails["wssettled"] == 1}
                                    isValid={false}
                                    label={""}
                                    options={option?.["investorOpt"]}
                                    value={LockDetails["VendorId"] || "0"}
                                    onSelect={(text) => {
                                      handleOnchangeDetails(
                                        "VendorId",
                                        text["value"],
                                        "investorInfo"
                                      );
                                    }}
                                    onBlur={() => {}}
                                  />
                                </View>
                                <View>
                                  <Button
                                    title={
                                      <CustomText
                                        style={{
                                          color: "#FFFFF",
                                          fontSize: 11,
                                          fontWeight: 200,
                                        }}
                                      >
                                        View
                                      </CustomText>
                                    }
                                    style={{
                                      paddingVertical: 3,
                                      paddingHorizontal: 3,
                                      fontSize: 10,
                                      borderWidth: 2,
                                      borderColor: "#0d6ac5",
                                      backgroundColor: "#428bca",
                                    }}
                                    onPress={() => {
                                      handleInvestor(LockDetails["VendorId"]);
                                    }}
                                  ></Button>
                                </View>
                              </View>
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Locked with Investor?
                              </CustomText>
                              <View style={{ alignItems: "flex-start" }}>
                                <Swatch
                                  value={
                                    LockDetails["WholesaleLocked"] == 1 || false
                                  }
                                  size={13}
                                  disable={LockDetails["wssettled"] == 1}
                                  onChange={(text) => {
                                    let val = text ? 1 : 0;
                                    handleOnchangeDetails(
                                      "WholesaleLocked", //LockedWithInvestor
                                      val,
                                      "investorInfo"
                                    );
                                  }}
                                />
                              </View>
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Investor Base Price
                              </CustomText>

                              <View>
                                <InputBox
                                  validate={false}
                                  disabled={LockDetails["wssettled"] == 1}
                                  showBorder={true}
                                  value={
                                    LockDetails["fInvestorBasePrice"] || ""
                                  }
                                  onChangeText={(text) => {
                                    handleOnchangeDetails(
                                      "fInvestorBasePrice",
                                      text,
                                      "investorInfo"
                                    );
                                  }}
                                />
                              </View>
                            </View>
                          </View>

                          <View
                            style={{
                              flexDirection: "row",
                              gap: 60,
                            }}
                          >
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Loan Servicer
                              </CustomText>
                              <View style={{}}>
                                <GridDropDown
                                  style={{}}
                                  showBorder={true}
                                  disabled={LockDetails["wssettled"] == 1}
                                  isValid={false}
                                  label={""}
                                  options={option?.["loanServicers"]}
                                  value={LockDetails["LoanServicer"] || "0"}
                                  onSelect={(text) => {
                                    handleOnchangeDetails(
                                      "LoanServicer",
                                      text["value"],
                                      "investorInfo"
                                    );
                                  }}
                                  onBlur={() => {}}
                                />
                              </View>
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Lock Type
                              </CustomText>
                              <View style={{}}>
                                <GridDropDown
                                  style={{}}
                                  showBorder={true}
                                  disabled={LockDetails["wssettled"] == 1}
                                  isValid={false}
                                  label={""}
                                  options={option?.LockTypeOpt}
                                  value={
                                    LockDetails["WholesaleMandatoryLock"] || ""
                                  }
                                  onSelect={(text) => {
                                    handleOnchangeDetails(
                                      "WholesaleMandatoryLock",
                                      text["value"],
                                      "investorInfo"
                                    );
                                  }}
                                  onBlur={() => {}}
                                />
                              </View>
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Investor SRP
                              </CustomText>
                              <View>
                                <InputBox
                                  validate={false}
                                  disabled={LockDetails["wssettled"] == 1}
                                  showBorder={true}
                                  value={LockDetails["fSRPPrice"] || ""}
                                  onChangeText={(text) => {
                                    handleOnchangeDetails(
                                      "fSRPPrice",
                                      text,
                                      "investorInfo"
                                    );
                                  }}
                                />
                              </View>
                            </View>
                          </View>

                          <View
                            style={{
                              flexDirection: "row",
                              gap: 60,
                            }}
                          >
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Commitment Number
                              </CustomText>

                              <View>
                                <InputBox
                                  validate={false}
                                  disabled={LockDetails["wssettled"] == 1}
                                  showBorder={true}
                                  value={LockDetails["CommitmentId"] || ""}
                                  onChangeText={(text) => {
                                    handleOnchangeDetails(
                                      "CommitmentId",
                                      text,
                                      "investorInfo"
                                    );
                                  }}
                                />
                              </View>
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Investor Lock Date
                              </CustomText>

                              <View>
                                <InputBox
                                  validate={false}
                                  disabled={LockDetails["wssettled"] == 1}
                                  showBorder={true}
                                  value={LockDetails["WholesaleLockDate"] || ""}
                                  onChangeText={(text) => {
                                    handleOnchangeDetails(
                                      "WholesaleLockDate",
                                      text,
                                      "investorInfo"
                                    );
                                  }}
                                  onBlur={(text) => {
                                    text = text.target.value || "";
                                    handleOnBlur("WholesaleLockDate", text);
                                  }}
                                />
                              </View>
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Investor Adjustments
                              </CustomText>

                              <View>
                                <InputBox
                                  validate={false}
                                  disabled={LockDetails["wssettled"] == 1}
                                  showBorder={true}
                                  value={LockDetails["fINVestorAdj"] || ""}
                                  onChangeText={(text) => {
                                    handleOnchangeDetails(
                                      "fINVestorAdj",
                                      text,
                                      "investorInfo"
                                    );
                                  }}
                                />
                              </View>
                            </View>
                          </View>

                          <View
                            style={{
                              flexDirection: "row",
                              gap: 60,
                            }}
                          >
                            <View style={{ gap: 3, flex: 1 }}>
                              {LockDetails["InvestorLoanId"] != 0 ? (
                                <>
                                  <CustomText style={[styles["SemiMidText"]]}>
                                    Investor Loan ID
                                  </CustomText>

                                  <View>
                                    <InputBox
                                      validate={false}
                                      disabled={LockDetails["wssettled"] == 1}
                                      showBorder={true}
                                      value={
                                        LockDetails["InvestorLoanId"] || ""
                                      }
                                      onChangeText={(text) => {
                                        handleOnchangeDetails(
                                          "InvestorLoanId",
                                          text,
                                          "investorInfo"
                                        );
                                      }}
                                    />
                                  </View>
                                </>
                              ) : (
                                <View></View>
                              )}
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Delivery Deadline
                              </CustomText>

                              <View>
                                <InputBox
                                  validate={false}
                                  disabled={LockDetails["wssettled"] == 1}
                                  showBorder={true}
                                  value={
                                    LockDetails["WholesaleDeliveryDate"] || ""
                                  }
                                  onChangeText={(text) => {
                                    handleOnchangeDetails(
                                      "WholesaleDeliveryDate",
                                      text,
                                      "investorInfo"
                                    );
                                  }}
                                  onBlur={(text) => {
                                    text = text.target.value || "";
                                    handleOnBlur("WholesaleDeliveryDate", text);
                                  }}
                                />
                              </View>
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Net Investor Price
                              </CustomText>
                              <CustomText style={[styles["MidText"]]}>
                                {LockDetails["WholesaleNetPrice"]}
                              </CustomText>
                            </View>
                          </View>

                          <View
                            style={{
                              flexDirection: "row",
                              gap: 60,
                            }}
                          >
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Servicer Loan ID
                              </CustomText>

                              <View>
                                <InputBox
                                  validate={false}
                                  disabled={LockDetails["wssettled"] == 1}
                                  showBorder={true}
                                  value={
                                    LockDetails["ServicerLoanNumber"] || ""
                                  }
                                  onChangeText={(text) => {
                                    handleOnchangeDetails(
                                      "ServicerLoanNumber",
                                      text,
                                      "investorInfo"
                                    );
                                  }}
                                />
                              </View>
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Lock Expire Date
                              </CustomText>

                              <View>
                                <InputBox
                                  validate={false}
                                  disabled={LockDetails["wssettled"] == 1}
                                  showBorder={true}
                                  value={
                                    LockDetails["WholesaleLockExpire"] || ""
                                  }
                                  onChangeText={(text) => {
                                    handleOnchangeDetails(
                                      "WholesaleLockExpire",
                                      text,
                                      "investorInfo"
                                    );
                                  }}
                                  onBlur={(text) => {
                                    text = text.target.value || "";
                                    handleOnBlur("WholesaleLockExpire", text);
                                  }}
                                />
                              </View>
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Profit Margin Outside Normal Range
                              </CustomText>
                              <View style={{}}>
                                <GridDropDown
                                  style={{}}
                                  showBorder={true}
                                  isValid={false}
                                  label={""}
                                  options={option?.ProfitMarginOpt}
                                  value={
                                    LockDetails["blPriceExceptionApproved"] ||
                                    ""
                                  }
                                  onSelect={(text) => {
                                    handleOnchangeDetails(
                                      "blPriceExceptionApproved",
                                      text["value"],
                                      "investorInfo"
                                    );
                                  }}
                                  onBlur={() => {}}
                                />
                              </View>
                            </View>
                          </View>

                          <View
                            style={{
                              flexDirection: "row",
                              gap: 60,
                            }}
                          >
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Lead Source
                              </CustomText>
                              <View style={{}}>
                                <GridDropDown
                                  style={{}}
                                  showBorder={true}
                                  isValid={false}
                                  disabled={LockDetails["leadsourceright"] == 0}
                                  label={""}
                                  options={option?.LeadSourceOpt}
                                  value={LockDetails["LeadSource"] || ""}
                                  onSelect={(text) => {
                                    handleOnchangeDetails(
                                      "LeadSource",
                                      text["value"],
                                      "investorInfo"
                                    );
                                  }}
                                  onBlur={() => {}}
                                />
                              </View>
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Warm/Hot Lead Adjustment
                              </CustomText>
                              {!LockDetails["SupervisorEdit"] ? (
                                <CustomText style={[styles["MidText"]]}>
                                  {LockDetails["WarmHotLeadAdj"] ||
                                    formatPercentage(
                                      LockDetails["WarmHotLeadAdj"],
                                      4
                                    )}
                                </CustomText>
                              ) : (
                                <View>
                                  <InputBox
                                    validate={false}
                                    disabled={
                                      LockDetails["leadsourceright"] == 0
                                    }
                                    showBorder={true}
                                    value={
                                      LockDetails["WarmHotLeadAdj"] || "0.00%"
                                    }
                                    onChangeText={(text) => {
                                      handleOnchangeDetails(
                                        "WarmHotLeadAdj",
                                        text,
                                        "investorInfo"
                                      );
                                    }}
                                    onFocus={(event) => {
                                      let val = cleanValue(
                                        LockDetails["WarmHotLeadAdj"] || "0.00%"
                                      );
                                      if (val.indexOf("(") != -1) {
                                        val = val
                                          .replace("(", "-")
                                          .replace(")", "");
                                      }
                                      handleOnchangeDetails(
                                        "WarmHotLeadAdj",
                                        val,
                                        "investorInfo"
                                      );
                                    }}
                                    onBlur={() => {
                                      let val = formatPercentage(
                                        LockDetails["WarmHotLeadAdj"],
                                        4
                                      );
                                      //if (val.indexOf("-") != -1) {
                                        val = `(${val})`;
                                        val = val.replace("-", "");
                                    //  }
                                      handleOnchangeDetails(
                                        "WarmHotLeadAdj",
                                        val,
                                        "investorInfo"
                                      );
                                    }}
                                  />
                                </View>
                              )}
                            </View>

                            <View style={{ gap: 3, flex: 1 }}>
                              {/* {LockDetails["SupervisorEdit"] && (
                              <View>
                                <Button
                                  isDisable={!LockDetails["saveSupervisor"]}
                                  title={
                                    <CustomText
                                      style={{
                                        color: "#FFFFF",
                                        fontSize: 11,
                                        fontWeight: 200,
                                      }}
                                    >
                                      Supervisor Save
                                    </CustomText>
                                  }
                                  style={[
                                    styles["btn"],
                                    styles["cardShadow"],
                                    {
                                      borderRadius: 3,
                                      paddingVertical: 6,
                                      paddingHorizontal: 8,
                                      borderWidth: 2,
                                      borderColor: !LockDetails[
                                        "saveSupervisor"
                                      ]
                                        ? "#c1c0c0"
                                        : "#0d6ac5",
                                    },
                                  ]}
                                  onPress={() => {
                                    handleSupervisorSave();
                                  }}
                                />
                              </View>
                            )} */}
                            </View>
                          </View>

                          <View
                            style={{
                              flexDirection: "row",
                              gap: 60,
                            }}
                          >
                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Lead Source Pricing Adjustment
                              </CustomText>
                              <View style={{ alignItems: "flex-start" }}>
                                <Swatch
                                  disable={
                                    LockDetails["leadsourceright"] == 0 ||
                                    LockDetails["LeadSource"] == 0
                                  }
                                  size={13}
                                  value={
                                    LockDetails["leadPricingAdjustment"] == 1
                                  }
                                  onChange={(text) => {
                                    let val = text ? 1 : 0;
                                    handleOnchangeDetails(
                                      "leadPricingAdjustment",
                                      val,
                                      "investorInfo"
                                    );
                                  }}
                                />
                              </View>
                            </View>

                            <View style={{ gap: 3, flex: 1 }}>
                              <CustomText style={[styles["SemiMidText"]]}>
                                Corporate Adjustment
                              </CustomText>
                              {!LockDetails["SupervisorEdit"] ? (
                                <CustomText style={[styles["MidText"]]}>
                                  {formatPercentage(
                                    LockDetails["CorporateAdj"],
                                    2
                                  )}
                                </CustomText>
                              ) : (
                                <View>
                                  <InputBox
                                    validate={false}
                                    // disabled={LockDetails["wssettled"] == 1}
                                    showBorder={true}
                                    value={
                                      LockDetails["CorporateAdj"] || "0.00%"
                                    }
                                    onChangeText={(text) => {
                                      handleOnchangeDetails(
                                        "CorporateAdj",
                                        text,
                                        "investorInfo"
                                      );
                                    }}
                                    onFocus={(event) => {
                                      let val = cleanValue(
                                        LockDetails["CorporateAdj"] || "0.00%"
                                      );
                                      if (val.indexOf("(") != -1) {
                                        val = val
                                          .replace("(", "-")
                                          .replace(")", "");
                                      }
                                      handleOnchangeDetails(
                                        "CorporateAdj",
                                        val,
                                        "investorInfo"
                                      );
                                    }}
                                    onBlur={() => {
                                      let val = formatPercentage(
                                        LockDetails["CorporateAdj"],
                                        2
                                      );
                                      if (val.indexOf("-") != -1) {
                                        val = `(${val})`;
                                        val = val.replace("-", "");
                                      }
                                      handleOnchangeDetails(
                                        "CorporateAdj",
                                        val,
                                        "investorInfo"
                                      );
                                    }}
                                  />
                                </View>
                              )}
                            </View>
                            <View style={{ gap: 3, flex: 1 }}>
                              {/* <View>
                              <Button
                                isDisable={!LockDetails["saveInvestor"]}
                                title={
                                  <CustomText
                                    style={{
                                      color: "#FFFFF",
                                      fontSize: 11,
                                      fontWeight: 200,
                                    }}
                                  >
                                    Save Investor Information
                                  </CustomText>
                                }
                                style={[
                                  styles["btn"],
                                  styles["cardShadow"],
                                  {
                                    borderRadius: 3,
                                    paddingVertical: 6,
                                    paddingHorizontal: 8,
                                    borderWidth: 2,
                                    borderColor: !LockDetails["saveInvestor"]
                                      ? "#c1c0c0"
                                      : "#0d6ac5",
                                  },
                                ]}
                                onPress={() => {
                                  handleInvestorSave();
                                }}
                              />
                            </View> */}
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </AccordionCustom>
                </View>
              </LinearGradient>
            </View>
          )}
        </View>

        <View style={{ position: "absolute" }}>
          {LockDetails?.["cancelLockModal"] && (
            <CancelLock
              handleOnchangeDetails={handleOnchangeDetails}
              LockDetails={LockDetails}
              handleCancelLock={handleCancelLock}
            />
          )}
          {LockDetails?.["transferLockModal"] && (
            <TransferLock
              handleOnchangeDetails={handleOnchangeDetails}
              LockDetails={LockDetails}
              handleGetTransferInfo={handleGetTransferInfo}
              handleTransferLock={handleTransferLock}
            />
          )}
          {LockDetails?.["extendLockModal"] && (
            <ExtendLock
              handleOnchangeDetails={handleOnchangeDetails}
              LockDetails={LockDetails}
              options={LockedInfo?.[8]?.["ExtendOptions"]}
              handleExtendLock={handleExtendLock}
            />
          )}
          {Open["Alert"] && (
            <NotifyAlert
              handleOpen={setOpen}
              Msg={Open["Msg"]}
              Component={Open["component"]}
            />
          )}
        </View>
      </View>
      {contextDetails["queryString"]["RemHeadFootr"] == 0 && (
        <View
          style={[
            styles.footerBackground,
            {
              color: "white",
            },
          ]}
        >
          <View
            style={[
              styles.footerMenu,
              { color: "white", justifyContent: "center" },
            ]}
            ref={bottomMenuUseref}
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
                handleMenu("Bottom");
                handleMenuOpen("Bottom");
              }}
            />
            <MenuDropDown
              listOption={menuOption}
              Open={isMenuOpen["bottom"]}
              MenuPosition={bottomMenuPosition}
              handleOpen={() => {
                handleMenu("Bottom");
              }}
            />
          </View>
          <View style={[styles.footerSave, { color: "white" }]}>
            <Button
              isDisable={!LockDetails["saveInvestor"]}
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
                  borderColor: !LockDetails["saveInvestor"]
                    ? "#c1c0c0"
                    : "#0d6ac5",
                },
              ]}
              onPress={() => {
                handlePageSave();
              }}
            />
          </View>
        </View>
      )}
      {/* Triggerring portion from production menu option */}
      <View style={{ display: "none" }}>
        <div
          id={"SuperEdit"}
          onClick={() => {
            handleOnchangeDetails("SupervisorEdit", true, "Menu");
            acdRef.current.click();
            handleSuperviserEditProd(1);
          }}
        ></div>
        <div
          id={"SuperSave"}
          onClick={() => {
            handlePageSave();
            //  handleSuperviserEditProd(2);
          }}
        ></div>
        <div
          id={"SuperCancel"}
          onClick={() => {
            handleOnchangeDetails("SupervisorEdit", false, "Menu");
            handleCancelSuperviserEdit();
            handleSuperviserEditProd(2);
          }}
        ></div>
        <div
          id={"TransferLock"}
          onClick={() => {
            fnTransferLock();
          }}
        />
        <div
          id={"FloatDown"}
          onClick={() => {
            handleInitFloatDown();
          }}
        />
        <div
          id={"ChangeRate"}
          onClick={() => {
            handleInitChangeRate();
          }}
        />
        <div
          id={"ExtendLock"}
          onClick={() => {
            handleInitExtendLock();
          }}
        />
        <div
          id={"ReLock"}
          onClick={() => {
            // handleInitExtendLock();
          }}
        />
        <div
          id={"CancelLock"}
          onClick={() => {
            fnCancelLock();
          }}
        />
        <div
          id={"ChangeLP"}
          onClick={() => {
            handleInitChangeLoanProgram();
          }}
        />
        <div
          id={"PrintLC"}
          onClick={() => {
            handlePrintLockConfirmation();
          }}
        />
        <div
          id={"RunValidation"}
          onClick={() => {
            handleRunValidation();
          }}
        />
        <div
          id={"ProdSave"}
          onClick={() => {
            handlePageSave();
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    margin: "auto",
    flexDirection: "row",
  },
  text: {
    fontSize: 17,
  },
  row: {
    flexDirection: "row",
  },

  shadow: {
    shadowColor: "black",
    shadowOffset: { width: 7, height: 7 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    // padding: 10,
    borderRadius: 6,
    backgroundColor:
      "linear-gradient(rgb(246, 246, 246) 10%, rgb(232, 232, 232) 100%)",
    // backgroundColor: "red",
  },
  minText: {
    fontWeight: 600,

    fontSize: 10,
    // lineHeight: "1.15",
    color: "#646464",
    textAlign: "center",
  },
  maxText: {
    fontWeight: 700,
    fontSize: 18,
    // lineHeight: "1.15rem",
    color: "#646464",
    textAlign: "center",
  },
  greenValue: {
    ...{
      color: "#88ab35",
      fontSize: 16,
      marginBottom: web ? 5 : 0,
    },
    ...(web ? { fontWeight: "800" } : {}),
  },
  label: {
    color: "#696767",
    fontSize: 13,
    fontFamily: "Inter",
  },
  rowText: {
    justifyContent: "space-between",
    //flex: 3,
  },
  btn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignSelf: "flex-end",
    fontSize: 12,
    justifyContent: "center",
  },
  MidText: {
    fontSize: 13,
    textAlign: "start",
    lineHeight: "1.15rem",
    color: "#646464",
    fontWeight: 700,
  },
  SemiMidText: {
    fontSize: 11,
    textAlign: "start",
    lineHeight: "1.15rem",
    color: "#646464",
  },
  textWeight: {
    fontWeight: 800,
  },
  cardShadow: {
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  oddBG: {
    flexDirection: "row",
    backgroundColor: "#f4f4f4",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomColor: "#c6c6c6",
    borderBottomWidth: 1,
  },
  evenBG: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#c6c6c6",
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#e5e5e5",
    paddingVertical: 15,
    paddingHorizontal: 10,
    width: "100%",
  },
  footerSave: {
    // fontSize: 40,
    textAlign: "center",
    justifyContent: "center",
    width: "50%",
  },

  footerBackground: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    height: 59,
    width: "100%",
    // alignItems: "center",
    // justifyContent: "center",
    bottom: 0,
    position: "fixed",
    zIndex: 2,
  },
});


export default LockConfirmation;
