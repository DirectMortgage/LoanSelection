import { View, StyleSheet, Alert, Dimensions } from "react-native";
import {
  Separator,
  AccordionItem,
  Button,
  InputBoxOrdinary,
} from "../components/accessories/CommomComponents";
import Icon from "react-native-vector-icons/Ionicons"; //FontAwesome
import Entypo from "react-native-vector-icons/Entypo"; //FontAwesome
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import XMLParser from "react-xml-parser";

import CustomText from "../components/accessories/CustomText";
import Table from "../components/accessories/Table";
import { useContext, useEffect, useRef, useState } from "react";
import Dropdown from "./accessories/DropDown";
import ChangeCompany from "./ChangeCompany";
import {
  handleAPI,
  cleanValue,
  formatPercentage,
  formatCurrency,
  queryStringToObject,
  fnRoundUpAmount,
  handleGetSessionData,
  context,
  fnGetIndex,
  IsLockedLoan,
  handleGetEmpPreQualLoan,
  sortByTypeOption,
  handleSaveWindowSize,
  handleGetMIQuote,
  handleGetLendercompplanCheck,
  handleOpenPopUp_MIQuote,
  handleBasicInfoInProd,
  handleGetCompNameByCompID,
  handleAPI_,
  handleWholeSaleRights,
  handleProceedRunMIQuote,
  fnFindMinFICO,
  handleMOSearchFlow,
} from "./accessories/CommonFunctions";
import DropDownButton from "./accessories/DropDownButton";
import { web, android, ios } from "./accessories/Platform";
import ArrowSpinner from "./accessories/ArrowSpinner";
import CompanyTable from "./CompanyTable";
import CompanyTablei from "./CompanyTable_";
import { Image, Modal } from "react-native-web";
import NotifyAlert from "./accessories/NotifyAlert";
import WebViewiFrame from "./accessories/WebViewiFrame";
import LoanTable from "./accessories/LoanTable";
import Setting from "./Setting";
import AddressValidation from "./accessories/AddressValidation";
import Footer from "./Footer";
import Swatch from "./accessories/Swatch";

const SearchCriteria = ({
  handleLoanProducts,
  handleSearch,
  handleStatus,
  Status,
}) => {
  const { contextDetails, setContextDetails } = useContext(context); //Get value from context
  const [Logs, setLog] = useState({
    stTime: 0,
    gtLPTime: 0,
    tlTime: 0,
    //suppressRealLoan: !true,
    currentProcess: "onLoad",
    testLoans: [444656, 402420], // To enable AE rights to Usha and Rekha
  });
  const [isMenuOpen, setMenuOpen] = useState({
    bottom: false,
    top: false,
    Prospect: false,
    CreateNewScenario: false,
    EditLO: false,
  });
  const [modalOpen, setModalOpen] = useState({
    CompSearch: false,
    CompTable: false,
    LoanTable: false,
    SettingTable: false,
  });
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
  const [validation, setValidation] = useState({ stopSearch: false });
  const [TypeOption, setTypeOption] = useState({});
  const [GlobleValue, setGlobleValue] = useState({
    EmpNum: "",
    LoanId: "",
  });
  const [TableColumns, setTableColumns] = useState({});
  const [borrowerInfo, setBorrower] = useState([]);
  const [VAMilitary, setVAMilitary] = useState([]);
  const [VAStatus, setVAStatus] = useState(false);
  const [LoanDetails, SetLoanDetail] = useState({});
  const [LoanProduct, setLoanProducts] = useState({});
  const [searchDetails, setSearchDetails] = useState({
    // "Property Type": "0",
    "Product Type": 5,
    // "Product Type_Bitwise": 2,
    "Monthly Income ($)": "$0.00",
    "Self Employed": 0,
    "Liabilities ($)": "$0.00",
    "First Time Home Buyer": 0,
    "Term (Months)": "360",
    // "Term (Months)_Bitwise": "64",
    "Lien Position": 1,
    "Lock Period Days": 4,
    "Existing Government Loan": 1,
    "Other Options": 0,
    "Compensation Type": 1,
    "Loan Purpose": "0",
    "Purchase Price": "$0",
    "Appraised Value": "$0",
    "Loan Amount 1st": "$0",
    "Loan Amount 2nd": "$0",
    "Term Months 2nd": 0,
    LTV: "0.00%",
    CLTV: "0.00%",
    "Desired Rate": "5.99%",
    "Rate Charge% | (Rebate%)": "0.0000%",
    // "Lender Fees In Rate": 0,
    TBD: "0",
    ddlRateMethod: 1,
    "Rent Ratio": "0.00%",
    "Debt to Income Ratio %": "0.00%",
  });

  const topMenuUseref = useRef();
  const bottomMenuUseref = useRef();
  const btnMIQuote = useRef();

  useEffect(() => {
    handlePageLoad();
    const handleUpdateSize = () => {
      const isMobileWeb = Dimensions.get("window").width <= 650;
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          isMobileWeb,
        };
      });
      //  console.log('dfgfdg')
    };

    handleUpdateSize();
    window.addEventListener("resize", handleUpdateSize);
    return () => window.removeEventListener("resize", handleUpdateSize);
  }, []);
  // Use Last Run
  useEffect(() => {
    let borrIndex = 1;
    try {
      if (LoanDetails["UseLastRun"] && LoanDetails["UseLastRun"].length) {
        let queryString = queryStringToObject();
        let LoanInfo = [...LoanDetails["UseLastRun"]];
        // let LineId = [...LoanDetails["LineId"]];
        if (
          (queryString["OnloadProcess"] != "PQ" ||
            contextDetails["PageFrom"] == "RealLoan") &&
          contextDetails["currentProcess"] == "GotPageInfo" &&
          contextDetails["pqLoan"] != 1
        ) {
          borrIndex = 0;
          LoanInfo.splice(1, 1);
          handleRealLoan(LoanInfo, LoanDetails["LineId"]);
        }

        console.log("Use Last run ====>", LoanDetails["UseLastRun"]);

        let Index = fnGetIndex(LoanInfo, "PropertyInfo");
        let {
          LienPosition,
          NoOfUnits,
          OccupancyType,
          PropertyTypeType,
          SubjectAddress,
          SubjectCity,
          SubjectState,
          SubjectZip,
        } = LoanInfo[Index]["PropertyInfo"][0];

        Index = fnGetIndex(LoanInfo, "RootObjects");
        let {
          EmpNum,
          CompNum,
          EmpRights,
          FromNewRateLock,
          IISSessionId,
          LoanID,
          ViewType,
          compname,
        } = LoanInfo[Index]["RootObjects"][0];

        Index = fnGetIndex(LoanInfo, "LoanParamInfo");
        let {
          AppraisalPrice,
          CLTV,
          DTIRatio,
          ExistingLiens,
          Income,
          IsCorrLoan,
          IsSelfEmployed,
          LTV,
          Liabilities,
          LoanAmount,
          LoanAmount2,
          LoanPurpose,
          PurchasePrice,
          RentRatio,
          SecLenderNum,
          TermsInMonth2,
          LoanOfficer,
          DTI,
        } = LoanInfo[Index]["LoanParamInfo"][0];

        Index = fnGetIndex(LoanInfo, "LoanSearchInfo");
        let {
          DesiredRate,
          AmortType,
          AmortizeTime,
          FeesinRate,
          MortIns,
          NearestCharge,
          SearchNoPPP,
          RequestEscrow,
          PropertylistedonMLS,
          EnergyEffMort,
          NonProfitGiftFund,
          LawEnforceGrant,
          TBD,
          Term,
          ddlRateMethod,
          ExistingGovtLoan,
          IsLenderCompPlanExists,
          LoanType,
          ChargeRebate,
          LendersToSearch,
          LockPeriod,
          MortInsPremium,
        } = LoanInfo[Index]["LoanSearchInfo"][0];

        Index = fnGetIndex(LoanInfo, "BorrInfo");
        let CustIds = [],
          SSN = [],
          CRIDs = [],FTHB =0,
          showSSNPrompt = false;
        if (
          (Index != -1 &&
            LoanInfo[Index]["BorrInfo"].length > 1 &&
            contextDetails["OnloadProcess"] != "PQ") ||
          LoanInfo[Index]["BorrInfo"][0]["FirstName"] != ""
        ) {
          let TotalBrrw = [],
            TotalVAS = [];
          for (let i = 0; i < LoanInfo[Index]["BorrInfo"].length; i++) {
            let row = LoanInfo[Index]["BorrInfo"][i];
            CustIds.push(row["CustID"] || "");
            CRIDs.push(row["CRRId"] || "0");
            if(row['firstTimeHomeBuyer'] == 'Yes' || row['firstTimeHomeBuyer'] == 1){
              FTHB = 1
            }
            if ((row["SSN"] || "").length < 8) showSSNPrompt = true;
            SSN.push(row["SSN"] || "");
            let brw = [
              [
                {
                  columnName: "First Name",
                  ["First Name"]: row["FirstName"],
                  index: i,
                },
                { columnName: "Last Name", ["Last Name"]: row["LastName"] },
                { columnName: "FICO Score", ["FICO Score"]: row["FICO"] },
                {
                  columnName: "Cell Phone",
                  ["Cell Phone"]: row["Phone"] || "",
                },
                { columnName: "Email", ["Email"]: row["Email"] || "" },
              ],
            ];
            let VAS = [
              {
                BorName: `${row["FirstName"]} ${row["LastName"]} `,
                VAStatus: "VA Military Status",
                VADropdown: VAMilitaryOption,
                VA: row["VAStatus"] == 0 ? 8 : row["VAStatus"],
              },
              {
                BorName: "",
                VAStatus: "VA Loan - First Time Use",
                VADropdown: YesorNo,
                hint: "VAM",
                VA: row["FTU"],
              },
              {
                BorName: "",
                VAStatus: "Exempt From VA Funding Fee",
                VADropdown: YesorNo,
                hint: "VAM",
                VA: row["ExemptFundFee"],
              },
            ];
            if (queryString["OnloadProcess"] != "PQ") {
              brw = [
                [
                  {
                    columnName: "First Name",
                    ["First Name"]: row["FirstName"],
                    index: i,
                  },
                  { columnName: "Last Name", ["Last Name"]: row["LastName"] },
                  { columnName: "FICO Score", ["FICO Score"]: row["FICO"] },
                ],
              ];
            }
            TotalBrrw = [...TotalBrrw, ...brw];
            TotalVAS = [...TotalVAS, [...VAS]];
          }
          setBorrower(TotalBrrw);
          setVAMilitary(TotalVAS);
        } else {
          setBorrower([]);
        }
        let OtherOptionSelectedItems = [];
        if (RequestEscrow == 1) OtherOptionSelectedItems.push("1");
        if (PropertylistedonMLS == 1) OtherOptionSelectedItems.push("2");
        if (EnergyEffMort == 1) OtherOptionSelectedItems.push("3");
        if (NonProfitGiftFund == 1) OtherOptionSelectedItems.push("4");
        if (LawEnforceGrant == 1) OtherOptionSelectedItems.push("6");
        if (SearchNoPPP == 1) OtherOptionSelectedItems.push("7");

        let DeBitwisedAgency = handleTypeOptionsBitwise(
          "Product Type",
          LoanType,
          "De-Bitwise"
        );
        let _agency = DeBitwisedAgency?.split(",");
        if (_agency) {
          if (_agency.includes("2") || _agency.includes(" 2")) {
            setVAStatus(true);
          }
        }

        //*************************************** Search section details binding portion *****************************
        // let LoanAmount1st = 0,
        //   LoanAmount2nd = 0;
        // // if(LienPosition == 1){
        // LoanAmount1st = LoanAmount;
        // LoanAmount2nd = LoanAmount2;
        // // }
        // // else if(LienPosition == 2){
        // //   LoanAmount1st = LoanAmount2
        // //   LoanAmount2nd = LoanAmount
        // // }
        
        setSearchDetails((prevDetails) => {
          return {
            ...prevDetails,
            "Property Address": SubjectAddress == "0" ? "" : SubjectAddress,
            "Property Type": PropertyTypeType,
            "Monthly Income ($)": formatCurrency(Income),
            "Self Employed": IsSelfEmployed,
            "Liabilities ($)": formatCurrency(Liabilities),
            "First Time Home Buyer": FTHB||0,
            "Term (Months)": TermMonths,
            "Lien Position": LienPosition,
            "Lien Position Org": LienPosition,
            "Lock Period Days": LockPeriod,
            "Existing Government Loan": ExistingGovtLoan,
            "Other Options": 0,
            "Compensation Type": searchDetails["Compensation Type"] || 0, //0, //IsLenderCompPlanExists
            "Loan Purpose": LoanPurpose,
            "Purchase Price": formatCurrency(PurchasePrice, 0),
            "Appraised Value": formatCurrency(AppraisalPrice, 0),
            "Loan Amount 1st": formatCurrency(LoanAmount, 0),
            "Loan Amount 2nd": formatCurrency(LoanAmount2, 0),
            "Term Months 2nd": TermsInMonth2,
            LTV: formatPercentage(LTV, 2),
            CLTV: formatPercentage(CLTV, 2),
            "Desired Rate": formatPercentage(DesiredRate, 4),
            "Rate Charge% | (Rebate%)": `${ChargeRebate}%`,
            "Amortization Type": handleTypeOptionsBitwise(
              "Amortization Type",
              AmortType,
              "De-Bitwise"
            ),
            "Term (Months)": handleTypeOptionsBitwise(
              "Term (Months)",
              Term,
              "De-Bitwise"
            ),
            Zip: SubjectZip,
            City: SubjectCity,
            State: SubjectState,
            "Self Employed": IsSelfEmployed,
            Occupancy: OccupancyType,
            "FICO Score": LoanInfo[Index]["BorrInfo"][0]["FICO"],
            latestModifiedFICO:
              LoanInfo?.[Index]?.["BorrInfo"]?.[0]?.["FICO"] || 0,
            "Product Type": DeBitwisedAgency,
            "Single Premium MI": handleTypeOptionsBitwise(
              "Single Premium MI",
              MortIns,
              "De-Bitwise"
            ),
            "Other Options": OtherOptionSelectedItems.join(","),
            ddlRateMethod: ddlRateMethod,
            "Lender Fees In Rate": FeesinRate == 0 ? 2 : FeesinRate,
            "Nearest Rate Charge": NearestCharge,
            "Rent Ratio": formatPercentage(RentRatio,2),
            "Lenders to Search": LendersToSearch,
            TBD: TBD,
            "MI Type": MortInsPremium || 0,
            "Debt to Income Ratio %": formatPercentage(DTI, 2),
            "Mortgage Insurance Type": MortInsPremium || 0,
          };
        });
        //*************************************** Search section details binding portion *****************************

        if (!contextDetails["ChangeRate"] && !contextDetails["FloatDown"]) {
          handleSaveBroker(CompNum, queryString["LoanId"], "Use Last Run");
        }
        let iIndex = fnGetIndex(LoanInfo, "LoanOfficer");
        let LOName = "";
        if (iIndex != -1) {
          let { EmpNumber, Name } = LoanInfo[iIndex]["LoanOfficer"][0];
          LoanOfficer = EmpNumber;
          LOName = Name;
        }
        setGlobleValue((prevGlobleValue) => {
          return {
            ...prevGlobleValue,
            LO: LoanOfficer,
            LOName: LOName,
            CompNum: CompNum,
            CompName: compname,
          };
        }); //LoanOfficer
        setContextDetails((prevContext) => {
          return {
            ...prevContext,
            currentProcess: "UseLastRun",
            CustIds,
            SSN,
            CRIDs,
            showSSNPrompt,
            LoanOfficerId: LoanOfficer,
            InputData: { DataIn: [...LoanInfo] },
          };
        });
      }
    } catch (error) {
      console.error("Error is Use last run");
    }
  }, [LoanDetails]);

  //=================================== Function declarations Begins ===================================
  let VAMilitaryOption = [
    { TypeDesc: "None", TypeOption: "8" },
    { TypeDesc: "Regular Military", TypeOption: "1" },
    { TypeDesc: "Reserves or National Guard", TypeOption: "2" },
  ];
  let YesorNo = [
    { TypeOption: "0", TypeDesc: "No" },
    { TypeOption: "1", TypeDesc: "Yes" },
  ];
  const VAM = [
    {
      BorName: "",
      VAStatus: "VA Military Status",
      VADropdown: VAMilitaryOption,
      VA: 8,
    },
    {
      BorName: "",
      VAStatus: "VA Loan - First Time Use",
      VADropdown: YesorNo,
      hint: "VAM",
    },
    {
      BorName: "",
      VAStatus: "Exempt From VA Funding Fee",
      VADropdown: YesorNo,
      hint: "VAM",
    },
  ];
  let LoanOfficerOpt = [];
  const handlePageLoad = async () => {
    handleProdLoading(); // For production alone
    await fnGetTypeOptions();
    let queryString = queryStringToObject();
    let parentQueryString = queryStringToObject(window.parent.location.href);
    let EmpNum = await handleGetSessionData(queryString["SessionId"], "empnum");
    if (EmpNum == "Output") {
      setModalOpen({
        ...modalOpen,
        RateSheetRunWarning: true,
        Msg: "      Your Session is InActive!!!       ",
      });
    }
    let EmpType = await handleGetSessionData(queryString["SessionId"], "type");
    let CompNum = await handleGetSessionData(
      queryString["SessionId"],
      "compnum"
    );

    let LoanId = await handleGetEmpPreQualLoan(EmpNum);
    await handleSaveBroker(CompNum, LoanId);
    let iLoanId = LoanId;
    if (
      queryString["OnloadProcess"] != "PQ" &&
      parentQueryString["pqLoan"] != 1
    ) {
      //|| queryString["Test"] == 1
      iLoanId = queryString["LoanId"];
      // handleSaveBroker(CompNum, LoanId);
    }
    // if (queryString["Test"] != 1) handleSaveBroker(CompNum, LoanId);

    handleGetLoanBoardingData(
      iLoanId,
      EmpNum,
      1,
      0,
      queryString["SessionId"],
      0,
      CompNum
    ); // 1- PrequalLoan

    setGlobleValue((prevGlobleValue) => {
      return {
        ...prevGlobleValue,
        PQLoanId: LoanId,
        LoanId: iLoanId || 0,
        LO: EmpNum,
        EmpNum: EmpNum,
        queryString: queryString,
      };
    });
    setContextDetails((prevContext) => {
      return {
        ...prevContext,
        ...queryString,
        ...parentQueryString,
        parentQueryString,
        queryString,
        LO: EmpNum,
        EmpNum: EmpNum,
        EmpType: EmpType,
        PQLoanId: LoanId,
        LoanId: iLoanId || 0,
      };
    });
  };
  const handleAddBorrower = (Type, Id) => {
    let FICO = 0,
      SSN = [];
    SSN = contextDetails["SSN"] || [];
    setSearchDetails((prevDetails) => {
      FICO = prevDetails["FICO Score"];
      return { ...prevDetails };
    });

    let brw = [
      [
        { columnName: "First Name", columnValue: " " },
        { columnName: "Last Name", columnValue: " " },
        { columnName: "FICO Score", columnValue: " " },
        { columnName: "Cell Phone", columnValue: " " },
        { columnName: "Email", columnValue: " " },
      ],
    ];
    if (Type === "Add") {
      if (borrowerInfo.length == 0) {
        brw = [
          [
            ...brw[0].map((item) =>
              item.columnName === "FICO Score"
                ? { ...item, ["FICO Score"]: FICO }
                : item
            ),
          ],
        ];
      }
      if (contextDetails["OnloadProcess"] == "PQ")
        setBorrower((prevBorrower) => [...prevBorrower, ...brw]);
      setVAMilitary((prevVA) => [...prevVA, [...VAM]]);

      SSN.push("");
    } else {
      setBorrower((prevBorrower) =>
        prevBorrower.filter((item, index) => index != Id)
      );
      setVAMilitary((prevVA) => prevVA.filter((item, index) => index !== Id));

      SSN = SSN.filter((item, index) => index != Id);
    }
    setContextDetails((prevContext) => {
      return {
        ...prevContext,
        SSN,
      };
    });
  };
  const handleChangedDetails = (obj) => {
    const { name, value, index, iIndex, action } = obj;

    if (
      !["TBD", "ValidateAddress"].includes(name) &&
      contextDetails["IsLoanProductGridActive"]
    ) {
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          IsLoanProductGridActive: false,
        };
      });
      setLoanProducts([]);
      handleLoanProducts([]);
    } else {
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          enableFooterSave: true,
        };
      });
    }
    if (name === "VA" || action == "Borrower") {
      if (action == "Borrower") {
        setBorrower((prevBor) => {
          const updatedBorrower = [...prevBor]; // Create a copy of the array
          if (name == "FICO Score") {
            if (updatedBorrower[index][iIndex][name] != value) {
              setSearchDetails({
                ...searchDetails,
                initiateMIQuote: true,
                latestModifiedFICO: value,
              });
            }
          }
          updatedBorrower[index][iIndex] = {
            ...updatedBorrower[index][iIndex],
            [name]: value,
          };
          return updatedBorrower;
        });
      }

      setVAMilitary((prevVAMilitary) => {
        const updatedVAMilitary = [...prevVAMilitary]; // Create a copy of the array
        if (action === "Borrower" && name === "First Name") {
          updatedVAMilitary[index][iIndex] = {
            ...updatedVAMilitary[index][iIndex],
            BorName: value,
          };
        } else if (name === "VA") {
          updatedVAMilitary[index][iIndex] = {
            ...updatedVAMilitary[index][iIndex],
            [name]: value["value"],
          };
        }
        return updatedVAMilitary;
      });
    } else if (
      [
        "Purchase Price",
        "Appraised Value",
        "Loan Amount 1st",
        "Loan Amount 2nd",
        "LTV",
        "CLTV",
      ].includes(name) &&
      action != "formatted"
    ) {
      // Onchange Calculation

      handleOnChangeCalc(name, value);
    } else if (
      [
        "Product Type",
        "Amortization Type",
        "Term (Months)",
        "Single Premium MI",
      ].includes(name)
    ) {
      if (name == "Product Type") {
        let arr = value["value"].split(",");

        if (arr[arr.length - 1] == " 2" || arr[arr.length - 1] == "2") {
          setVAStatus(true);
          if (VAMilitary.length == 0) handleAddBorrower("Add");
        } else if (arr.indexOf(" 2") === -1 && arr.indexOf("2") === -1) {
          setVAStatus(false);
          setVAMilitary([]);
          if (contextDetails["OnloadProcess"] == "PQ") setBorrower([]);
        } else if (arr.length == 1) value = "All";
        setSearchDetails({
          ...searchDetails,
          [name]:
            typeof value === "string"
              ? value?.toString()
              : value["value"]?.toString(),
        });
      }
      // Multiselect
      let Bitwise = handleTypeOptionsBitwise(name, value["value"], "Bitwise");
      setSearchDetails({
        ...searchDetails,
        [name]: value["value"]?.toString(),
        [`${name}_Bitwise`]: Bitwise,
      });
    } else if (name == "Other Options") {
      let RequestEscrowWaiver = 0,
        PropertylistedMLS = 0,
        EnergyEfficient = 0,
        DownPaymentGift = 0,
        //  HARPLoan,
        LawEnforcement = 0,
        NoPPP = 0;
      if (value["value"].indexOf("1") != -1) RequestEscrowWaiver = 1;
      if (value["value"].indexOf("2") != -1) PropertylistedMLS = 1;
      if (value["value"].indexOf("3") != -1) EnergyEfficient = 1;
      if (value["value"].indexOf("4") != -1) DownPaymentGift = 1;
      if (value["value"].indexOf("6") != -1) LawEnforcement = 1;
      if (value["value"].indexOf("7") != -1) NoPPP = 1;
      let _value = value["value"].split(",");
      if (_value[_value.length - 1] == 0) {
        (RequestEscrowWaiver = 0),
          (PropertylistedMLS = 0),
          (EnergyEfficient = 0),
          (DownPaymentGift = 0),
          (LawEnforcement = 0),
          (NoPPP = 0);
        value["value"] = "0";
      } else {
        value["value"] = value["value"].replace("0,", "");
      }
      setSearchDetails({
        ...searchDetails,
        [name]: value["value"]?.toString(),
        RequestEscrowWaiver: RequestEscrowWaiver,
        PropertylistedMLS: PropertylistedMLS,
        EnergyEfficient: EnergyEfficient,
        DownPaymentGift: DownPaymentGift,
        // HARPLoan:HARPLoan,
        LawEnforcement: LawEnforcement,
        NoPPP: NoPPP,
      });
      // console.log("other option ===>", name, value);
    } else if (name == "TBD") {
      handleAPI({
        name: "InValidateAddress", //"GetLoanProgramIU_Json", GetCompressedJSON
        params: {
          LoanId: GlobleValue["LoanId"],
          SessionId: GlobleValue["queryString"]["SessionId"],
        },
      }).then((response) => {
        setSearchDetails({
          ...searchDetails,
          [name]: value,
        });
        //console.log("Address is invalid!!!");
      });
    } else if (name == "ValidateAddress") {
      if (value == 0) {
        //validate Address
        fnValidateAddress();
      } else {
        fnUnValidateAddress();
      }
    } else if (name == "Zip" && value.length === 5) {
      handleAPI({
        name: "GetZipCodeDetails",
        params: { Zipcode: value },
      }).then((response) => {
        response = JSON.parse(response)["Table"][0];
        let { city, stateoption } = response;
        setSearchDetails({
          ...searchDetails,
          [name]: value,
          ["City"]: city,
          ["State"]: stateoption,
        });
        // console.log("GetZipCodeDetails ===>", response);
      });
    } else if (name == "Lien Position") {
      let {
        ["Loan Amount 1st"]: LoanAmount1st,
        ["Loan Amount 2nd"]: LoanAmount2nd,
        ["Appraised Value"]: AppraisedVal,
        ["Purchase Price"]: PurchasePrice,
      } = searchDetails;
      let additionalObj = {},
        LoanAmount1 = 0,
        LoanAmount2 = 0,
        additionalObjCopy = {};
      //  if(value["value"] == 1)additionalObj = {['Loan Amount 1st']:LoanAmount1st,['Loan Amount 2nd']:LoanAmount2nd}
      if (value["value"] == 2) {
        LoanAmount1 = LoanAmount2nd;
        LoanAmount2 = LoanAmount1st;
      } else if (value["value"] == 1) {
        LoanAmount1 = LoanAmount1st;
        LoanAmount2 = LoanAmount2nd;
      }
      // CLTV/LTV calculation
      AppraisedVal = parseFloat(cleanValue(AppraisedVal || 0));
      PurchasePrice = parseFloat(cleanValue(PurchasePrice || 0));
      LoanAmount1 = parseFloat(cleanValue(LoanAmount1 || 0));
      LoanAmount2 = parseFloat(cleanValue(LoanAmount2 || 0));
      let iValue =
        AppraisedVal > PurchasePrice && PurchasePrice !== 0
          ? PurchasePrice
          : AppraisedVal;
      let LTV = (LoanAmount1 / iValue) * 100;
      let CLTV = ((LoanAmount1 + LoanAmount2) / iValue) * 100;
      additionalObj["LTV"] = formatPercentage(LTV, 2);
      additionalObj["CLTV"] = formatPercentage(CLTV, 2);

      setSearchDetails({
        ...searchDetails,
        ...additionalObj,
        [name]: value["value"]?.toString(),
      });

      // setTimeout(() => {
      //   handleOnChangeCalc('Appraised Value', AppraisedVal);
      // }, 10);
    }
    // else if (name == "MI Type") {
    //   let {
    //     ["Single Premium MI"]: PreMI,
    //     ["MI Type"]: MIType,
    //   } = searchDetails;
    //   let  additionalObj ={}, lastSelected = '';

    //   PreMI = PreMI.split(",");
    //   MIType = value["value"]?.toString().split(",");
    //  lastSelected = MIType[MIType.length-1]
    //   if (lastSelected.includes("5")) {
    //     if(PreMI.includes('1'))
    //       PreMI = PreMI.filter((e) => e != 1);
    //     else
    //     PreMI.push("1");
    //   } else if (lastSelected.includes("6")) {
    //     if(PreMI.includes('3'))
    //     PreMI = PreMI.filter((e) => e != 3);
    //   else
    //   PreMI.push("3");
    //   }

    //   // if (lastSelected.includes("5")) {
    //   //   PreMI.push("1");
    //   // } else if (lastSelected.includes("6")) {
    //   //   PreMI.push("3");
    //   // }

    //   additionalObj["Single Premium MI"] = PreMI.join(",");
    //   additionalObj[name] = value["value"];
    //   setSearchDetails({
    //     ...searchDetails,
    //     ...additionalObj,
    //   });
    // }
    else {
      setSearchDetails({
        ...searchDetails,
        [name]:
          typeof value === "string"
            ? value?.toString()
            : value["value"]?.toString(),
      });
    }
    //console.log("On change value ==>", searchDetails);
  };

  const handleGetLoanBoardingData = (
    LoanID,
    EmpNum,
    WhatProcess,
    Testing,
    SessionId,
    ProceedtoLoad,
    CompNumber
  ) => {
    const startTime = performance.now();
    setContextDetails((prevContext) => {
      return {
        ...prevContext,
        currentProcess: "PageLoad",
        showPageSpinner: contextDetails["OnloadProcess"] == "PQ" ? false : true,
        changeRateSpinner:
          contextDetails["ChangeRate"] || contextDetails["FloatDown"],
      };
    });
    let obj = { LoanID, EmpNum, WhatProcess, Testing, SessionId };
    handleAPI({
      name: "GetLoanBoardingData",
      params: obj,
    }).then((response) => {
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          currentProcess: "GotPageInfo",
          showPageSpinner: false,
        };
      });
      try {
        let htmlContent1 = parent.window.document.getElementById("Ul1");
        let htmlContent2 = parent.window.document.getElementById("LCOptions");
        let htmlLoader =
          parent.window.document.getElementsByClassName("loader");
        if (htmlLoader.length > 0) {
          htmlLoader[0].style.display = "none";
        }
        if (htmlContent1) {
          htmlContent1[0].style.display = "block";
          htmlContent2[0].style.display = "none";
        }
      } catch (error) {}
      let Index = 0;
      response = JSON.parse(response);
      let RootObjects = response["DataOut"][0]["RootObjects"][0];
      Index = fnGetIndex(response["DataOut"], "LoanOfficer");
      let LoanOfficerOpt = response["DataOut"][Index]["LoanOfficer"][0];
      Index = fnGetIndex(response["DataOut"], "LoanSearchInfo");
      let LoanSearchInfo = response["DataOut"][Index]["LoanSearchInfo"][0];
      let PageFrom = "PQLoan",
        ErrorLoadingLP = false;
      let queryString = queryStringToObject();
      let LO = {};
      if (
        (queryString["OnloadProcess"] != "PQ" &&
          contextDetails["pqLoan"] != 1) ||
        ProceedtoLoad == 1
      ) {
        PageFrom = "RealLoan";
        let Index = fnGetIndex(response["DataOut"], "DataOut");
        let LineId = 0,
          IsNoProgramSelected = true;
        if (Index != -1) {
          LineId = Object.keys(
            response["DataOut"]?.[Index]?.["DataOut"]?.[1] || []
          );
        }
        if (LineId.length) LineId = LineId?.[0].split("_")?.[1] || 0;
        else {
          let progIndex = fnGetIndex(response["DataOut"], "ProgramName");
          IsNoProgramSelected =
            (
              response["DataOut"][progIndex]?.["ProgramName"]?.[0][
                "ProgramName"
              ] || ""
            )?.length == 0;

          if (!IsNoProgramSelected) {
            setModalOpen({
              ...modalOpen,
              RateSheetRunWarning: true,
              Msg: "Exception occurred on Loading Selected Loan Product.Please Contact Administrator.",
              component: false,
            });
          }
        }
        SetLoanDetail({
          ...LoanDetails,
          UseLastRun: response["DataOut"],
          LineId: LineId || 0,
        });
        LO = { LoanOfficer: LoanOfficerOpt };
        // handleChangeRate(LineId);
      } else {
        if (queryString["OnloadProcess"] == "PQ") {
          let Index = fnGetIndex(response["DataOut"], "LoanSearchInfo");
          let { DesiredRate } = response["DataOut"][Index]["LoanSearchInfo"][0];
          setSearchDetails((prevDetails) => {
            return {
              ...prevDetails,
              "Desired Rate": DesiredRate,
            };
          });
        }
        handleSaveBroker(CompNumber || RootObjects["CompNum"], LoanID);
      }

      setGlobleValue((prevGlobleValue) => {
        return {
          ...prevGlobleValue,
          ...RootObjects,
          ...LO,
          CompName: RootObjects["compname"],
        };
      });
      // let CompName = await handleWholeSaleRights(value);

      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          ...RootObjects,
          ...LO,
          ...LoanSearchInfo,
          LoanId: LoanID,
          CompName: RootObjects["compname"],
          PageFrom: PageFrom,
          ErrorLoadingLP,
        };
      });
      try {
        window.parent.resizeIframe();
      } catch (error) {}

      const endTime = performance.now();
      const loadingTime = endTime - startTime;
      if (document.getElementById("divPageLoad").innerText == 0)
        document.getElementById("divPageLoad").innerText = `${(
          loadingTime / 1000
        ).toFixed(2)}s`;
      console.log("GetLoanBoardingData ===>", response);
    });
  };

  const fnGetTypeOptions = () => {
    handleAPI({
      name: "GetNeededTypeOptions",
      params: {},
    }).then((response) => {
      response = JSON.parse(response);
      let TypeOption = {
        Occupany: response["Table"],
        PropertyType: response["Table1"],
        LoanPurpose: response["Table2"],
        State: response["Table3"],
        YesorNo: response["Table4"],
        XMLOptions: response["Table6"][0]["TypeXml"],
        LockPeriod: response["Table8"],
        AgencyType: response["Table9"],
        Term: response["Table10"],
        AmortizationType: response["Table11"],
        MIType: response["Table14"],
        SinglePremium: SinglePremium,
      };
      let JSONOptions = new XMLParser().parseFromString(
        TypeOption["XMLOptions"]
      );
      // let options = {};
      let AgencyTypeOpt = [],
        SinglePre_Opt = [];
      for (let index = 0; index < JSONOptions["children"].length; index++) {
        let Row = JSONOptions["children"][index]["attributes"];
        if (Row["TypeId"] == 26) {
          AgencyTypeOpt.push(Row);
        }
        if (Row["TypeId"] == 145) {
          SinglePre_Opt.push(Row);
        }
      }
      TypeOption.AgencyType = sortByTypeOption(AgencyTypeOpt, [
        "5",
        "16",
        "2",
        "9",
        "29",
        "30",
        "32",
        "31",
        "33",
        "34",
        "35",
      ]);
      TypeOption.SinglePremium = SinglePre_Opt;
      setTypeOption(TypeOption);
      fnLoadGridColumns(TypeOption);
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          StateOpt: response["Table3"],
        };
      });
      // console.log("TypeOption ====>", TypeOption);
    });
  };
  const fnGetLoanOfficers = async (
    flag,
    value,
    Process,
    SelectedLOObj,
    from
  ) => {
    let additionalObj = {};
    // if (
    //   (contextDetails["OnloadProcess"] == "PQ" ||
    //     contextDetails["pqLoan"] == 1) &&
    //   Process != "Use Last Run" &&
    //   Process != "ChangeCompany"
    // ) {
    //   let CompName = await handleGetCompNameByCompID(
    //     contextDetails["SessionId"],
    //     "compname"
    //   );
    //   if (CompName != "Output") additionalObj = { CompName };
    // }
    let CompName = await handleGetCompNameByCompID(value);
    additionalObj = { CompName };
    let obj = { flag: flag, LOChoice: value };
    handleAPI({
      name: "GetLoanOfficer",
      params: obj,
    }).then((response) => {
      response = JSON.parse(response)["Table"];
      LoanOfficerOpt = [];
      LoanOfficerOpt.push({ label: "Loan Officer", value: 0 });
      response.forEach((item, index) => {
        let option = {
          label: item.Name,
          value: item.EmpNumber,
          compNum: item.CompanyNum,
        };
        LoanOfficerOpt.push(option);
      });
      setSearchDetails((prevDetails) => {
        return {
          ...prevDetails,
          "Loan Officers": LoanOfficerOpt,
        };
      });

      if (SelectedLOObj && from != "Comp") {
        additionalObj["LO"] = SelectedLOObj["Id"];
        additionalObj["LOName"] = SelectedLOObj["Name"];
        handleSaveLoanOfficer(contextDetails["LoanId"], SelectedLOObj["Id"]);
      }
      setGlobleValue((prevGlobleValue) => {
        return {
          ...prevGlobleValue,
          LOName:
            LoanOfficerOpt.filter(
              (e) => e.value == prevGlobleValue["LO"]
            )?.[0]?.["label"] || "",
          ...additionalObj,
        };
      });
      if (Process != "Use Last Run") {
        // To auto select the 1st Loan Officer when one LO is available
        if (LoanOfficerOpt.length == 2) {
          let { value, compNum, label } = LoanOfficerOpt[1];
          setGlobleValue((prevGlobleValue) => {
            return {
              ...prevGlobleValue,
              LO: value,
              LOName: label,
              CompNum: compNum,
            };
          });
          handleSaveLoanOfficer(contextDetails["LoanId"], value);
        }
      }
    });
  };
  const handleTypeOptionsBitwise = (name, val, type) => {
    let options = "";
    try {
      if (name === "Product Type") options = TypeOption["AgencyType"];
      else if (name === "Amortization Type")
        options = TypeOption["AmortizationType"];
      else if (name === "Term (Months)") options = TypeOption["Term"];
      else if (name === "Single Premium MI")
        options = TypeOption["SinglePremium"];
      // else if (name === "Other Options") options = OtherOptions;
      if (type === "Bitwise") {
        // const typeBitwiseArray = options.map((type) =>
        //   val.includes(type.TypeOption) ? type.TypeBitwise : 0
        // );
        val = val.toString();
        const typeBitwiseArray = options.map((type) =>
          val.split(",").indexOf(type.TypeOption) != -1 ? type.TypeBitwise : 0
        );

        // Sum the resulting array
        const sumResult = typeBitwiseArray.reduce(
          (sum, value) => parseInt(sum) + parseInt(value),
          0
        );
        return sumResult || "";
      } else {
        const selectedItems = options
          .filter(
            (type) =>
              (parseInt(type.TypeBitwise) & parseInt(val)) ===
              parseInt(type.TypeBitwise)
          )
          .map((type) => type.TypeOption);
        return selectedItems.join(", ");
      }
    } catch (error) {
      console.log("Error in handleTypeOptionsBitwise ====>>", name, val);
    }
  };

  const fnLoadGridColumns = (TypeOption) => {
    const BorrowerProperty = [
      {
        columnName: "Product Type, Borrower & Location",
        columnValue: (
          <>
            {contextDetails["OnloadProcess"] == "PQ" ? (
              <View
                style={{
                  position: "absolute",
                  top: 4,
                  right: 10,
                }}
              >
                <Button
                  title={
                    <CustomText
                      style={{ fontSize: 12, color: "white", fontWeight: 200 }}
                    >
                      Add Borrower
                    </CustomText>
                  }
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    backgroundColor: "#1e73bd",
                  }}
                  onPress={() => {
                    handleAddBorrower("Add");
                  }}
                />
              </View>
            ) : (
              ""
            )}
          </>
        ),
        type: "header",
      },
      {
        columnName: "Product Type",
        Option: TypeOption["AgencyType"],
        columnValue: " ",
        type: "multiSelect",
      },
      {
        columnName: "Borrower",
        borrowers: borrowerInfo,
        iconOnPress: handleAddBorrower,
      },
      {
        columnName: "FICO Score",
        columnValue: " ",
        type: "input",
        dataType: "int",
        hint: borrowerInfo?.length,
        name: "FICO",
      },
      {
        columnName: "Occupancy",
        columnValue: " ",
        Option: TypeOption["Occupany"],
        type: "dropDown",
        name: "OccupancyType",
      },
      {
        columnName: "Rent Ratio",
        columnValue: " ",
        dataType: "Percentage",
        type: "input",
      },
      {
        columnName: "Property Type",
        columnValue: " ",
        Option: TypeOption["PropertyType"],
        type: "dropDown",
      },
      {
        columnName: "Property Address",
        columnValue: " ",
        type: "input",
        hint: "Property Address",
      },
      { columnName: "Zip", columnValue: " ", type: "input" },
      { columnName: "City", columnValue: " ", type: "input" },
      {
        columnName: "State",
        columnValue: " ",
        Option: TypeOption["State"],
        type: "dropDown",
      },
      {
        columnName: "Self Employed",
        columnValue: " ",
        Option: TypeOption["YesorNo"],
        type: "dropDown",
      },
      {
        columnName: "Monthly Income ($)",
        columnValue: " ",
        dataType: "Currency",
        type: "input",
      },
      {
        columnName: "Liabilities ($)",
        columnValue: " ",
        dataType: "Currency",
        type: "input",
      },
      {
        columnName: "Debt to Income Ratio %",
        columnValue: " ",
        dataType: "Percentage",
        type: "input",
        name: "DTI",
      },
    ];
    const TermsOptions = [
      {
        columnName: "Terms and Options",
        columnValue: "",
        type: "header",
      },
      {
        columnName: "Amortization Type",
        columnValue: " ",
        Option: TypeOption["AmortizationType"],
        type: "multiSelect",
      },
      {
        columnName: "Term (Months)",
        columnValue: " ",
        Option: TypeOption["Term"],
        type: "multiSelect",
      },
      {
        columnName: "Lien Position",
        columnValue: " ",
        Option: LienOptions,
        type: "dropDown",
      },
      {
        columnName: "Single Premium MI",
        columnValue: " ",
        Option: SinglePremium,
        type: "multiSelect",
      },
      {
        columnName: "Mortgage Insurance Type",
        columnValue: " ",
        Option: TypeOption["MIType"],
        type: "multiSelect",
      },
      {
        columnName: "Lender Fees In Rate",
        columnValue: " ",
        Option: FeesOptions,
        type: "dropDown",
      },
      {
        columnName: "Lock Period Days",
        columnValue: " ",
        Option: TypeOption["LockPeriod"],
        type: "dropDown",
      },
      {
        columnName: "Existing Government Loan",
        columnValue: " ",
        Option: ExistGovOptions,
        type: "dropDown",
      },
      {
        columnName: "First Time Home Buyer",
        columnValue: " ",
        Option: TypeOption["YesorNo"],
        type: "dropDown",
      },
      {
        columnName: "Other Options",
        columnValue: " ",
        Option: OtherOptions,
        type: "multiSelect",
      },
      {
        columnName: "Compensation Type",
        columnValue: " ",
        Option: CompensationType,
        type: "dropDown",
      },
    ];
    const LoanInformation = [
      {
        columnName: "Loan Information",
        columnValue: "",
        type: "header",
      },
      {
        columnName: "Loan Purpose",
        columnValue: " ",
        Option: TypeOption["LoanPurpose"],
        type: "dropDown",
      },
      {
        columnName: "Purchase Price",
        columnValue: " ",
        dataType: "Currency",
        type: "input",
        hint: "Loan Purpose",
      },
      {
        columnName: "Appraised Value",
        columnValue: " ",
        dataType: "Currency",
        type: "input",
      },
      {
        columnName: "Loan Amount 1st",
        columnValue: " ",
        dataType: "Currency",
        type: "input",
      },
      {
        columnName: "Loan Amount 2nd",
        columnValue: " ",
        dataType: "Currency",
        type: "input",
      },
      {
        columnName: "Term Months 2nd",
        columnValue: " ",
        Option: TermMonths,
        type: "dropDown",
      },
      {
        columnName: "LTV",
        columnValue: " ",
        dataType: "Percentage",
        type: "input",
      },
      {
        columnName: "CLTV",
        columnValue: " ",
        dataType: "Percentage",
        type: "input",
      },
      {
        columnName: "Loan Program",
        columnValue: " ",
        type: "input",
        dataType: "int",
      },
      {
        columnName: "Desired Rate",
        columnType: "dropDown",
        columnOption: DesiredRate,
        columnValue: " ",
        dataType: "Percentage",
        type: "input",
      },
      {
        columnName: "Rate Charge% | (Rebate%)",
        columnValue: " ",
        dataType: "Percentage",
        type: "input",
        hint: "RateFormula",
      },
      {
        columnName: "Nearest Rate Charge",
        columnValue: " ",
        Option: NearestRateCharge,
        type: "dropDown",
        hint: "RateFormula",
      },
      {
        columnName: "Lenders to Search",
        columnValue: " ",
        Option: LendersOptions,
        type: "multiSelect",
      },
    ];
    setTableColumns({
      BorrowerProperty,
      TermsOptions,
      LoanInformation,
    });
    //setVAMilitary([VAM]);
  };
  const handleUseLastRun = async (LoanId) => {
    let EmpNum = await handleGetSessionData(
      contextDetails["SessionId"],
      "empnum"
    );
    if (EmpNum == "Output") {
      setModalOpen({
        ...modalOpen,
        RateSheetRunWarning: true,
        Msg: "      Your Session is InActive!!!       ",
      });
      return;
    }
    let obj = {
      SearchId: 0,
      LoanId: LoanId ? LoanId : GlobleValue["PQLoanId"], //405333,
    };
    handleAPI({
      name: "Get_LastLoanSearch",
      params: obj,
    }).then((response) => {
      if (!response) return;
      response = JSON.parse(response)["Table"][0]["SearchJSON"];
      if (response == "{}") {
        fnResetSearchInputs();
        return;
      }
      response = JSON.parse(response);
      SetLoanDetail({ ...LoanDetails, UseLastRun: response["DataIn"] });
      try {
        window.parent.resizeIframe();
      } catch (error) {}
    });
  };
  const handleMenuOpen = (position) => {
    if (position == "Top") {
      topMenuUseref.current.measure((_fx, _fy, _w, h, _px, py) => {
        setTopMenuPosition({
          top: py + (web ? 40 : 50),
          left: _px + (web ? -200 : -232),
          opacity: 1,
        });
      });
    } else if (position == "Bottom") {
      bottomMenuUseref.current.measure((_fx, _fy, _w, h, _px, py) => {
        setBottomMenuPosition({
          //   top: py + (web ? -440 : 50),
          bottom: 60,
          left: _px + (web ? 10 : -195),
          opacity: 1,
        });
      });
    }
  };
  const handleMenu = (position) => {
    if (position == "Top")
      setMenuOpen({ ...isMenuOpen, top: !isMenuOpen["top"] });
    else if (position == "Bottom")
      setMenuOpen({ ...isMenuOpen, bottom: !isMenuOpen["bottom"] });
    else setMenuOpen({ ...isMenuOpen, bottom: false, top: false });
  };
  let startTime = "",
    endTime = "",
    loadingTime = "",
    saveTime = "",
    GetTime = "";
  const handleLoanProductsSearch = async () => {
    //DoSLP
    console.clear();
    console.log(
      "============================ Search initiated =================="
    );
    let whichLoanAmount = "Loan Amount 1st";
    if (searchDetails["Lien Position"] == 2) {
      whichLoanAmount = "Loan Amount 2nd";
    }
    if (
      GlobleValue["LO"] != "0" &&
      //    searchDetails["FICO Score"] &&
      searchDetails["Occupancy"] &&
      searchDetails["Property Type"] != 0 &&
      searchDetails["Zip"] &&
      searchDetails["Loan Purpose"] != 0 &&
      searchDetails["Appraised Value"] != 0 &&
      searchDetails["Appraised Value"] != "$0" &&
      ((searchDetails["Purchase Price"] != 0 &&
        searchDetails["Purchase Price"] != "$0") ||
        searchDetails["Loan Purpose"] != 1) &&
      searchDetails[whichLoanAmount] &&
      searchDetails[whichLoanAmount] != "$0" &&
      searchDetails["Lien Position"] != 0 &&
      searchDetails["Lender Fees In Rate"] != 0
    ) {
      setValidation({ ...validation, stopSearch: false, SearchErrorMsg: "" });
    } else {
      setValidation({
        ...validation,
        stopSearch: true,
        SearchErrorMsg:
          "Please complete the required fields identified with a red border",
      });
      return;
    }
    handleStatus({ Searching: true });
    // setContextDetails((prevContext) => {
    //   return {
    //     ...prevContext,
    //     currentProcess: "ProductSearch",
    //   };
    // });

    // for MI Quote
    try {
      let miType = searchDetails["Mortgage Insurance Type"].split(",");
      if (
        parseFloat(cleanValue(searchDetails["LTV"])) > 80 &&
        !(miType.length == 1 && miType.includes("7"))
      ) {
        //let res = await handleOpenPopUp_MIQuote(contextDetails["LoanId"], 0); //CMS_SP_isMIQuote_Exists
        let QualifyingFICO = null;
        if (borrowerInfo.length) QualifyingFICO = fnFindMinFICO(borrowerInfo);
        else QualifyingFICO = searchDetails["FICO Score"];
        let res = await handleProceedRunMIQuote(
          contextDetails["LoanId"],
          QualifyingFICO || searchDetails["latestModifiedFICO"],
          cleanValue(searchDetails["Loan Amount 1st"]),
          cleanValue(searchDetails["Loan Amount 2nd"]),
          searchDetails["LTV"],
          searchDetails["CLTV"]
        );
        res = res.split("~");
        let productType = searchDetails["Product Type"].split(",");
        const valuesToCheck = ["16", "2", "9"]; //FHA/VA/USDA
        let exists = false;
        for (let value of valuesToCheck) {
          if (productType.includes(value)) {
            exists = true;
            break;
          }
        }
        if ((res?.[0] || 0) == 1 && (!exists || productType.includes("5"))) {
          let PlanType = miType.includes("6")
            ? 3
            : miType.includes("1") && miType.length == 1
            ? 1
            : 2;
          let obj_ = {
            LoanID: contextDetails["LoanId"],
            SessionID: contextDetails["queryString"]["SessionId"],
            PlanType: PlanType,
            VendorIds: "",
            fromRatelock: 1,
          };
          handleGetMIQuote(obj_);
        }
      }
    } catch (error) {
      console.log("Error in handleGetMIQuote");
    }

    //handleSearch(InputData);
    let InputData = handleConstructInputs();
    setContextDetails((prevContext) => {
      return {
        ...prevContext,
        InputData,
        currentProcess: "ProductSearch",
      };
    });
    console.log(" handleLoanProductsSearch Input ===>>", InputData);
    let obj = {
      InputJSON: JSON.stringify(InputData || ""),
    };
    handleAPI_({
      name: "DOSLPTasks_",
      params: obj,
    }).then((response) => {
      if (!response) return;
      console.log(
        "============================ Got the Run Id=================="
      );
      response = JSON.parse(response);

      let { RetStatus, Error, LatestRun } =
        response["DataOut"][0]["RootObjects"][0];
      // fnValidateAddress()

      if (RetStatus == 99) {
        setTimeout(() => {
          handleGetLoanProducts(RetStatus, LatestRun, 0); //16009895 ,16018701 , 16034653,16040931 - 66
        }, 500);
      } else if (RetStatus == -2) {
        alert(Error);
        handleGetLoanProducts("", 16018701); // when error occurs
      } else if (RetStatus == -5 || RetStatus == -1) {
        setModalOpen({ ...modalOpen, RateSheetRunWarning: true, Msg: Error });
        handleStatus({ Searching: false });
      }

      console.log("DOSLPTasks ==>>", response);
      // console.timeEnd("handleLoanProductsSearch");
    });
  };
  const handleGetLoanProducts = async (Status, LatestRun, pollingCount) => {
    console.log("pollingCount ==>>", pollingCount);
    let EmpNum = await handleGetSessionData(
      contextDetails["queryString"]["SessionId"],
      "empnum"
    );
    if (EmpNum == "Output") {
      setModalOpen({
        ...modalOpen,
        RateSheetRunWarning: true,
        Msg: "      Your Session is InActive!!!       ",
      });
      return;
    }
    let wholeSaleRights = await handleWholeSaleRights(EmpNum);
    let obj = {
      DataIn: [
        {
          RootObjects: [
            {
              LoanId: GlobleValue["LoanId"],
              EmpNum: GlobleValue["EmpNum"],
              Run: LatestRun || 0,
              ExcludeLines: "",
              IU_PollingCounter: pollingCount,
              UserType: contextDetails["EmpType"],
              IsSearchedLoan: "0",
              blCompressJson: "0",
            },
          ],
        },
      ],
    };
    console.log("Get_LoanProgramIU Inputs ===>", obj);
    handleAPI({
      name: "Get_LoanProgramIU", //"GetLoanProgramIU_Json", GetCompressedJSON
      params: { OutFlag: 1, Inputjson: JSON.stringify(obj) },
    }).then((response) => {
      try {
        if (response.indexOf("Unable to cast object") != -1) {
          if (pollingCount < 5) {
            // Looping till the program return
            setTimeout(() => {
              handleGetLoanProducts("", LatestRun, pollingCount + 1);
            }, 500);
          } else {
            setModalOpen({
              ...modalOpen,
              RateSheetRunWarning: true,
              Msg: "   Error occured in showing loan programs. Please contact administrator.  ",
            });
            handleStatus({ Searching: false });
            return;
          }
        } else {
          response = JSON.parse(response);
          setLoanProducts(response);
          handleStatus({ Searching: false });
          handleLoanProducts(response);
          setContextDetails((prevContext) => {
            return {
              ...prevContext,
              IsLoanProductGridActive: true,
              wholeSaleRights: wholeSaleRights || 0,
            };
          });
          setSearchDetails({
            ...searchDetails,
            initiateMIQuote: false,
          });

          setTimeout(() => {
            try {
              window.parent.resizeIframe();
            } catch (error) {}
          }, 1000);

          console.log("Get_LoanProgramIU == >", response);
        }
      } catch (error) {
        if (pollingCount < 5) {
          // Looping till the program return
          setTimeout(() => {
            handleGetLoanProducts("", LatestRun, pollingCount + 1);
          }, 500);
        }
        console.log(
          `Error while parsing the loan programs at ${pollingCount} polling`
        );
      }
    });
  };
  const handleOnChangeCalc = (name, value) => {
    try {
      let LTV,
        CLTV,
        Appraised,
        Purchase,
        LoanAmount,
        LoanAmount2,
        Value,
        additionalObj = {};

      try {
        if (
          ["Loan Amount 1st", "Loan Amount 2nd", "LTV", "CLTV"].includes(name)
        ) {
          if (cleanValue(searchDetails[name]) != cleanValue(value)) {
            additionalObj = { initiateMIQuote: true };
          }
        }
      } catch (error) {
        console.error("Error while onchange", error);
      }

      Purchase = parseFloat(cleanValue(searchDetails["Purchase Price"] || 0));
      Appraised = parseFloat(cleanValue(searchDetails["Appraised Value"] || 0));
      LoanAmount = parseFloat(
        cleanValue(searchDetails["Loan Amount 1st"] || 0)
      );
      LoanAmount2 = parseFloat(
        cleanValue(searchDetails["Loan Amount 2nd"] || 0)
      );
      LTV = parseFloat(cleanValue(searchDetails["LTV"] || 0));
      CLTV = parseFloat(cleanValue(searchDetails["CLTV"] || 0));
      if (searchDetails["Loan Purpose"] != 1) Purchase = 0;
      if (name === "Loan Amount 1st")
        LoanAmount = parseFloat(cleanValue(value || 0));
      else if (name === "Loan Amount 2nd")
        LoanAmount2 = parseFloat(cleanValue(value || 0));
      else if (name === "Purchase Price")
        Purchase = parseFloat(cleanValue(value || 0));
      else if (name === "Appraised Value")
        Appraised = parseFloat(cleanValue(value || 0));
      else if (name === "LTV") LTV = parseFloat(cleanValue(value || 0));
      else if (name === "CLTV") CLTV = parseFloat(cleanValue(value || 0));

      Value = Appraised > Purchase && Purchase !== 0 ? Purchase : Appraised;
      if (!["LTV", "CLTV"].includes(name) && Value) {
        let LoanAmount1 = 0,
          iLoanAmount2 = 0;
        if (searchDetails["Lien Position"] == 2) {
          LoanAmount1 = LoanAmount2;
          iLoanAmount2 = LoanAmount;
        } else if (searchDetails["Lien Position"] == 1) {
          LoanAmount1 = LoanAmount;
          iLoanAmount2 = LoanAmount2;
        }

        LTV = (LoanAmount1 / Value) * 100;
        CLTV = ((LoanAmount1 + iLoanAmount2) / Value) * 100;
        // let LTV_ = LTV.toFixed(2);
        // let CLTV_ = CLTV.toFixed(2);
        let deciLTV = LTV.toString().split(".");
        let deciCLTV = CLTV.toString().split(".");

        let deciLTV_ = LTV.toFixed(2).split(".");
        let deciCLTV_ = CLTV.toFixed(2).split(".");
        try {
          if (deciLTV_[1] == 0) {
            if (deciLTV[1] > 0 && deciLTV[0] == deciLTV[0])
              LTV = LTV.toFixed(2).split(".")[0] + ".01";
          }
          if (deciCLTV_[1] == 0) {
            //  deciCLTV = '0.' + deciCLTV
            if (deciCLTV[1] > 0 && deciCLTV[0] == deciCLTV_[0])
              CLTV = CLTV.toFixed(2).split(".")[0] + ".01";
          }
        } catch (error) {
          console.error("LTV/CTLV calculatio ==>", error);
        }
      } else {
        if (
          searchDetails["Loan Purpose"] === "Cash Out Refinance" ||
          searchDetails["Loan Purpose"] === "Rate and Term Refinance"
        )
          value = Appraised;
        else if (Purchase == Appraised) value = Purchase;
        else value = Math.min(Purchase, Appraised);
        if (value) {
          LoanAmount = (value * LTV) / 100;
          LoanAmount2 = (value * CLTV) / 100;
          LoanAmount2 = LoanAmount2 - LoanAmount;
        }
      }
      //console.log(' LTV ',LTV);

      setSearchDetails({
        ...searchDetails,
        ...additionalObj,
        LTV: name === "LTV" ? LTV : formatPercentage(LTV, 2),
        CLTV: name === "CLTV" ? CLTV : formatPercentage(CLTV, 2),
        ["Loan Amount 1st"]:
          name === "Loan Amount 1st"
            ? LoanAmount
            : formatCurrency(fnRoundUpAmount(LoanAmount, 2), 0),
        ["Loan Amount 2nd"]:
          name === "Loan Amount 2nd"
            ? LoanAmount2
            : formatCurrency(fnRoundUpAmount(LoanAmount2, 2), 0),
        ["Purchase Price"]:
          name === "Purchase Price" ? Purchase : formatCurrency(Purchase, 0),
        ["Appraised Value"]:
          name === "Appraised Value" ? Appraised : formatCurrency(Appraised, 0),
      });
      //}
    } catch (error) {
      console.log("Error in handleOnChangeCalc");
    }
  };
  const handleCompanySearch = (type, value, from) => {
    if (["Table", "Modal"].includes(type)) {
      setModalOpen({
        ...modalOpen,
        CompSearch: false,
        CompTable_Num: false,
        CompTable_Name: false,
      });
      //setValue("");
    } else {
      if (type == "Search") {
        if (!isNaN(value)) fnGetBrokerSearchListByCompNum(value);
        // else fnGetBrokerSearchListByCompName(value);
        else fnGetBrokerSearchListByEmpName(contextDetails["EmpType"], value);
      } else if (type == "Select") {
        fnSaveBroker(value, from);
        setLoanProducts([]);
        handleLoanProducts([]);
      }
    }
  };
  const fnGetBrokerSearchListByCompNum = (value) => {
    let { SessionId } = queryStringToObject();
    let obj = { SessionId: SessionId, Id: value, IsAlpha: 0 };
    handleAPI({
      name: "GetBrokerSearchListByCompNum",
      params: obj,
    }).then((response) => {
      response = JSON.parse(response)["Table"];
      setGlobleValue((prevGlobleValue) => {
        return {
          ...prevGlobleValue,
          CompanyInfo: response,
        };
      });
      setModalOpen({ ...modalOpen, CompSearch: false, CompTable_Num: true });

      //console.log("GetBrokerSearchListByCompNum ==>", response);
    });
  };
  const fnGetBrokerSearchListByCompName = (value) => {
    let { SessionId } = queryStringToObject();
    let obj = {
      SessionId: SessionId,
      Name: value,
      EmpNum: GlobleValue["EmpNum"],
    };
    handleAPI({
      name: "GetBrokerSearchList",
      params: obj,
    }).then((response) => {
      response = JSON.parse(response)["Table"];
      setGlobleValue((prevGlobleValue) => {
        return {
          ...prevGlobleValue,
          CompanyInfo: response,
        };
      });
      setModalOpen({ ...modalOpen, CompSearch: false, CompTable: true });

      //console.log("GetBrokerSearchList ==>", response);
    });
  };

  const fnGetBrokerSearchListByEmpName = (UserType, SearchTxt) => {
    let { SessionId } = queryStringToObject();
    let obj = { UserType, SearchTxt };
    handleAPI({
      name: "SearchCompanyByEmp",
      params: obj,
    }).then((response) => {
      response = JSON.parse(response);
      setGlobleValue((prevGlobleValue) => {
        return {
          ...prevGlobleValue,
          CompanyInfo: response,
        };
      });
      setModalOpen({ ...modalOpen, CompSearch: false, CompTable_Name: true });

      //console.log("GetBrokerSearchList ==>", response);
    });
  };

  const fnSaveBroker = (Row, from) => {
    let { UserName, UserNum, SelectedLOObj } = Row;
    if (!UserName) {
      UserName = Row.CompanyName;
      UserNum = Row.CompanyNum;
      SelectedLOObj = { Id: Row.EmpNumber, Name: Row.Contact };
    }
    setGlobleValue((prevGlobleValue) => {
      return {
        ...prevGlobleValue,
        CompName: UserName,
        CompNum: UserNum,
        LO: 0,
      };
    });
    setModalOpen({ ...modalOpen, CompTable_Num: false, CompTable_Name: false });
    let LoanId = contextDetails["NewLoanId"]
      ? contextDetails["NewLoanId"]
      : contextDetails["LoanId"];

    handleSaveBroker(UserNum, LoanId, "ChangeCompany", SelectedLOObj, from);
    // fnGetLoanOfficers(0, UserNum); //With Company Number
    handleCompanySelection_FessinRate(UserNum);
  };
  const handleSaveBroker = async (
    brokerid,
    LoanId,
    Process,
    SelectedLOObj,
    from
  ) => {
    if (brokerid != 1000) {
      let LenderCompExistCheck = await handleGetLendercompplanCheck(brokerid);
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          IslenderCompExist: LenderCompExistCheck == 0,
        };
      });
    }
    if (Process == "Use Last Run") {
      LoanId = contextDetails["PQLoanId"];
    }
    let obj = { brokerid, newloanid: LoanId };
    handleAPI({
      name: "SaveBrokerSelected",
      params: obj,
    }).then((response) => {
      //console.log("Broker Saved successfully!!!!");
      fnGetLoanOfficers(0, brokerid, Process, SelectedLOObj, from);
    });
  };
  const handleCompanySelection_FessinRate = (CompNum) => {
    let obj = { CompNum };
    handleAPI({
      name: "GetCompanySelection", //"GetBrokerSearchList",
      params: obj,
    }).then((response) => {
      response = response.split("~");
      setGlobleValue((prevGlobleValue) => {
        return { ...prevGlobleValue, Compfeesinrates: response[1] };
      });

      /*
      need to check
      */
    });
  };
  const fnSaveLoanOfficer = (obj) => {
    handleSaveLoanOfficer(GlobleValue["LoanId"], obj["value"]);
    let LOName =
      searchDetails["Loan Officers"].filter(
        (e) => e.value == obj["value"]
      )?.[0]?.["label"] || "";
    setGlobleValue((prevGlobleValue) => {
      return {
        ...prevGlobleValue,
        LO: obj["value"],
        LOName: LOName,
      };
    });

    let obj_ = {
      LoanID: GlobleValue["LoanId"],
      LOID: obj["value"],
      CompNum: GlobleValue["CompNum"] || 1000,
      EmpNum: GlobleValue["EmpNum"],
    };
    handleAPI({
      name: "GetLoanlevelRestriction",
      params: obj_,
    }).then((response) => {
      response = response.split("~");
      let Msg = response[0];
      let PreviouslyLockedDisclosed = response[1];
      let LOLockoption = response[2];
      let WholeSaleIntRateAccess = response[3];
      if (Msg == "Fees out Restricted") {
        // show only Fee Out
      } else if (Msg == "Fees in rates Restricted") {
        // show only Fee In
      } else {
        //Show Both
        handleGetLOFeesinRate(obj["value"]);
        //ChooseRecBroker() -Need to check
      }
      // console.log("GetLoanlevelRestriction ==>", response);
    });
  };
  const handleSaveLoanOfficer = (LoanId, LOId) => {
    // if (contextDetails["UseLastRunInfo"]) {
    //   LoanId = contextDetails["PQLoanId"];
    // }
    let obj = { LoanId: LoanId, UserId: LOId };
    handleAPI({
      name: "SaveLoanOfficer",
      params: obj,
    }).then((response) => {
      setMenuOpen({
        ...isMenuOpen,
        EditLO: !isMenuOpen["EditLO"],
      });
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          LoanOfficerId: LOId,
        };
      });
    });
  };
  const handleGetLOFeesinRate = (LOId) => {
    let obj = { LOId };
    handleAPI({
      name: "getLOFeesinRate",
      params: obj,
    }).then((response) => {
      //console.log("getLOFeesinRate ===>", response);
    });
  };
  const handleRealLoan = async (LoanInfo, LineId) => {
    let InputData = { DataIn: [...LoanInfo] };
    let Index = fnGetIndex(LoanInfo, "DataOut");
    if (Index != -1) {
      handleSearch(InputData);
      let mergedData = LoanInfo[Index];
      // console.log("Change rate before ===>", mergedData);

      if (contextDetails["ChangeRate"] || contextDetails["FloatDown"]) {
        let keysToBeModify = ["RateCol", "RateData", "Addons", "LockPeriod"];
        let worseCaseRaw = await handleChangeRate(LineId);
        let worseCaseData = worseCaseRaw?.["DataOut"]?.[1]?.["DataOut"] || [];

        let obj = mergedData?.["DataOut"]?.[1]?.[`LineDataOut_${LineId}`];
        for (let index = 0; index < obj.length; index++) {
          let row = obj[index];
          let key = Object.keys(row)[0] || 'Addons';
          if (keysToBeModify.indexOf(key) != -1  ) {
            let point = fnGetIndex(worseCaseData, key);
            let replacingData = worseCaseData[point]?.[key]|| [];
            obj[index][key] = replacingData;
            //console.log(key);
          }
        }
        mergedData["DataOut"][1][`LineDataOut_${LineId}`] = obj;
      }
      //console.log("Change rate final ===>", mergedData);
      if (!contextDetails["PreventLoanProgramLoan"]) {
        setLoanProducts(mergedData);
        handleLoanProducts(mergedData);
      }
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          SearchedInfo: InputData,
          IsLoanProductGridActive: true,
        };
      });
    }
    // let Index = fnGetIndex(LoanInfo, "LoanSearchInfo");
    // let {LnApprLatestRun,LoadSelectedProduct,NeedFreshRun,LoanSelectionStatus} =LoanInfo[Index][0]
    // handleSearch(InputData);
    // setLoanProducts(LoanInfo[Index]);
    // handleLoanProducts(LoanInfo[Index]);
  };
  const handleStartWithFreshRun = async () => {
    if (contextDetails["OnloadProcess"] != "PQ") {
      let url =
        "../../../LoanSelectionRct/index.html?SessionId=" +
        contextDetails["SessionId"] +
        "&OnloadProcess=PQ&HideNav=1&RemHeadFootr=0&FNM=undefined";
      window.open(url, "PQ", "width=1200,height=900,resizable=1,scrollbars=1");
      return;
    }
    let queryString = queryStringToObject();
    let EmpNum = await handleGetSessionData(queryString["SessionId"], "empnum");
    if (EmpNum == "Output") {
      setModalOpen({
        ...modalOpen,
        RateSheetRunWarning: true,
        Msg: "      Your Session is InActive!!!       ",
      });
      return;
    }
    let CompNum = await handleGetSessionData(
      queryString["SessionId"],
      "compnum"
    );
    let CompName = await handleGetSessionData(
      queryString["SessionId"],
      "compname"
    );
    handleSaveBroker(CompNum, queryString["LoanId"]);
    setGlobleValue((prevGlobleValue) => {
      return {
        ...prevGlobleValue,
        LO: EmpNum,
        CompName: CompName,
      };
    });
    setContextDetails((prevContext) => {
      return {
        ...prevContext,
        currentProcess: "FreshRun",
        CompName,
        PreventLoanProgramLoan: true,
      };
    });
    fnResetSearchInputs();
  };
  const fnResetSearchInputs = () => {
    setSearchDetails({
      //...searchDetails,
      "Property Type": "0",
      "Monthly Income ($)": "$0.00",
      "Self Employed": 0,
      "Liabilities ($)": "$0.00",
      "First Time Home Buyer": 0,
      "Term (Months)": 360,
      "Lien Position": 2,
      "Lock Period Days": 4,
      "Existing Government Loan": 1,
      "Other Options": 0,
      "Compensation Type": 1,
      "Loan Purpose": "0",
      "Purchase Price": "$0.00",
      "Appraised Value": "$0.00",
      "Loan Amount 1st": "$0.00",
      "Loan Amount 2nd": "$0.00",
      "Term Months 2nd": 0,
      LTV: "0.00%",
      CLTV: "0.00%",
      "Desired Rate": "5.99%",
      "Rate Charge% | (Rebate%)": "0.0000%",
      "Lender Fees In Rate": 2,
      TBD: "0",
      ddlRateMethod: 1,
      "Rent Ratio": "0.00%",
    });
    setBorrower([]);
    //handleLoanProducts({});
  };
  const handleGetTitlePricing = () => {
    let url = `../../../BorrowerApplication/Presentation/Webforms/TitleFees.aspx?SessionId=${contextDetails["SessionId"]}&LoanId=${contextDetails["LoanId"]}&ref=0`;

    window.open(
      url,
      "TitleFeesWindow",
      "width=1200,height=900,resizable=1,scrollbars=1"
    );
  };
  const handleFeeWorkSheet = async () => {
    let obj = { LoanId: contextDetails["LoanId"], Type: 46 };
    handleAPI({
      name: "GenerateClosingDisc",
      params: obj,
    }).then((response) => {
      //response = JSON.parse(response)
      response = JSON.parse(response)["Table"][0]["FileName"];
      let url = "../../../PDF/" + response;
      window.open(
        url,
        "_blank",
        "resizable=yes,scrollbars=yes,width=1200px,height=800px"
      );
      // console.log("handleFeeWorkSheet ===>", response);
    });
  };
  const handleWarningModal = () => {
    setModalOpen({ ...modalOpen, RateSheetRunWarning: false });
  };
  const handleMenuSearch = async (type, name, value) => {
    if (type == "Prospect" || type == "CreateNewScenario")
      setMenuOpen({ ...isMenuOpen, [type]: !isMenuOpen[type] });
    else if (type == "Input") setMenuOpen({ ...isMenuOpen, [name]: value });
    else if (type == "Search") {
      handleMenu();
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          currentProcess: name,
        };
      });
      let Input = contextDetails["isLoadedInsideiFrame"]
        ? value
        : isMenuOpen[name];
      let { EmpNum, SessionId } = contextDetails;
      if (isNaN(Input)) {
        //string
        let strResult = await GetSearchResults(
          SessionId,
          Input,
          contextDetails["LoanId"]
        );
        strResult = JSON.parse(strResult)["Table"];
        setModalOpen({ ...modalOpen, LoanTable: true });
        setGlobleValue((prevGlobleValue) => {
          return {
            ...prevGlobleValue,
            LoanData: strResult,
          };
        });
      } else {
        //number

        let isLocked = await IsLockedLoan(Input);
        let strResult = await IsSearchLoanNumber(SessionId, Input, "");
        strResult = JSON.parse(strResult)["Table"][0];
        let Status = strResult["Column1"];
        let iLoanId = strResult["Column3"];
        if (isLocked == 1) {
        } else {
          if (Status == 1) {
            if (name == "ProspectInfo")
              handleGetLoanBoardingData(iLoanId, EmpNum, 1, 0, SessionId, 1);
            else if (name == "CreateNewScenarioInfo") {
              handleLoanProducts("{}");
              handleUseLastRun(iLoanId);
            }
          }
        }
      }
    }
  };
  const handleChooseBor = (type, LoanId) => {
    if (type == "Table") {
      setModalOpen({ ...modalOpen, LoanTable: false });
    } else {
      if (contextDetails["currentProcess"] == "CreateNewScenarioInfo") {
        handleLoanProducts("{}");
        handleUseLastRun(LoanId);
      } else {
        let { EmpNum, SessionId } = contextDetails;
        handleGetLoanBoardingData(LoanId, EmpNum, 1, 0, SessionId, 1);
      }
      setModalOpen({ ...modalOpen, LoanTable: false });
    }
  };
  const IsSearchLoanNumber = async (strSessionId, LoanId, Text) => {
    let obj = { strSessionId, LoanId, Text };
    let response = await handleAPI({
      name: "IsSearchLoanNumber",
      params: obj,
    }).then((response) => {
      // response = JSON.parse(response);
      return response;
    });
    return response;
  };

  const GetSearchResults = async (strSessionId, Name, LoanId) => {
    let obj = { strSessionId, Name, LoanId };
    let response = await handleAPI({
      name: "GetSearchResults",
      params: obj,
    }).then((response) => {
      // response = JSON.parse(response);
      return response;
    });
    return response;
  };
  const GetLockRateXMLBySearchId = async (SearchId, LoanId) => {
    let obj = { SearchId, LoanId };
    let response = await handleAPI({
      name: "GetLockRateXMLBySearchId",
      params: obj,
    }).then((response) => {
      // response = JSON.parse(response);
      return response;
    });
    return response;
  };
  const handleSetting = (type, obj) => {
    if (type == "Save") {
      handleGetLoanProducts("", contextDetails["LnApprLatestRun"], 0);
      setModalOpen({ ...modalOpen, SettingTable: false });
    } else {
      setModalOpen({ ...modalOpen, SettingTable: !modalOpen["SettingTable"] });
    }
  };
  const handleChangeRate = async (LineId) => {
    // setContextDetails((prevContext) => {
    //   return {
    //     ...prevContext,
    //     changeRateSpinner: true,
    //   };
    // });
    let { LoanId, SessionId, EmpNum } = contextDetails;
    let obj = { LineId, EmpNum, LoanId, SessionId };
    let Response = await handleAPI({
      name: "ChangeRate",
      params: obj,
    }).then((response) => {
      response = JSON.parse(response);

      let changeRateResponse = response["DataOut"][1]["DataOut"];

      let index = fnGetIndex(changeRateResponse, "LoanData");
      let { RateSheetUsed, RateSheetNum } =
        changeRateResponse[index]["LoanData"][0];
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          ChangeRateJson: response,
          changeRateSpinner: false,
          RateSheetId: RateSheetNum,
          ratesheetused: RateSheetUsed,
        };
      });
      console.log("ChangeRate ==>", response);
      return response;
    });
    // setContextDetails((prevContext) => {
    //   return {
    //     ...prevContext,
    //   };
    // });
    return Response;
  };

  const fnValidateAddress = async () => {
    let { LoanId, SessionId, EmpNum } = contextDetails;
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
        pageContent = await fetch(url, {
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
        fnUSPSCheckAddressValid(
          validAddress,
          ValidateAddress,
          resultArr,
          !Status["Searching"] ? 1 : 0
        );
        //console.log("AddressValidationResult ===>", response);
      });
    });
  };
  const fnUSPSCheckAddressValid = (strResult, returntext, arr, fromSLPflag) => {
    if (strResult == 1) {
    } else if (strResult == 0 && fromSLPflag != 1) {
      let {
        City,
        State,
        Zip,
        ["Property Address"]: PropertyAddress,
      } = searchDetails;
      let AddressInfo = [{ City, State, Zip, PropertyAddress }];
      setModalOpen({ ...modalOpen, AddressValidation: true, AddressInfo });
    }
  };
  const fnSelectAddress = async (type, value) => {
    if (type == "Table") {
      setModalOpen({ ...modalOpen, AddressValidation: value });
    } else {
      let res = await ManualValidation();
      res = await GetAddressInfo();
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          AddressValid: 1,
        };
      });
      setModalOpen({ ...modalOpen, AddressValidation: false });
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
      //console.log("ManualValidation ==>", response);
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
      //console.log("GetAddressInfo ==>", response);
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
      //console.log("UnValidateAddress ==>", response);
      return response;
    });
    return Response;
  };
  const handleProdLoading = () => {
    try {
      let LSMenu = parent.window.document.getElementById(
        "divDirectDefaultRateLockMenu2"
      );
      let LCMenu = parent.window.document.getElementById("divLockConfMenu2");
      let LSBMenu = parent.window.document.getElementById(
        "divDirectDefaultRateLockMenu"
      );
      let LCBMenu = parent.window.document.getElementById("divLockConfMenu");
      let htmlLoader = parent.window.document.getElementsByClassName("loader");
      if (htmlLoader.length > 0) {
        htmlLoader[0].style.display = "none";
      }
      if (LSMenu != null) {
        //Lock Confirmation
        LCMenu.style.display = "none";
        LCBMenu.style.display = "none";

        //Loan Selection
        LSMenu.style.display = "block";
        LSBMenu.style.display = "block";
        parent.window.GetLoanPulse(); // To refresh the Loan Pulse area
      }

      parent.window.document.getElementById("divNavControls").style.display =
        "block";
      handleBasicInfoInProd();
      // try {
      //   setTimeout(function () {  parent.window.document.getElementById("spnBackBtn1").innerHTML('Back'); }, 100);
      //   setTimeout(function () {  parent.window.document.getElementById("spnBackBtn1").innerHTML('Next'); }, 100);
      // } catch (error) {

      // }

      let optlabel = window.parent.document.querySelector(
        '#ulLeftNavTree li a[pagename="LoanSelection"]'
      ).text;
      window.parent.document.getElementById("widgetTitleSpan").innerText =
        optlabel || "2. Loan Selection"; // Loan pulse header tab text
      window.parent.document
        .querySelector('#ulLeftNavTree li a[pagename="LoanSelection"]')
        .parentNode.classList.add("active", "special1");
    } catch (error) {}
  };
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
  const handleConstructInputs = () => {
    try {
      let borrRows = [];
      let RowId = 3;
      for (let i = 0; i < borrowerInfo.length; i++) {
        RowId = i == 0 ? RowId : RowId + 5;
        let borrInfo = borrowerInfo[i];
        let VAInfo = VAMilitary[i];
        let CustID = contextDetails?.["CustIds"]?.[i] || "1";
        let SSN = contextDetails?.["SSN"]?.[i] || "";
        let CRID = contextDetails?.["CRIDs"]?.[i] || "0";
        if (contextDetails["OnloadProcess"] == "PQ") CustID = 1;
        let VAStatus = 0,
          FTU = -1,
          ExtFee = -1,
          Spouse = 0;
        if (VAInfo) {
          if (VAInfo[0]["VAStatus"] == "VA Military Status")
            VAStatus = VAInfo[0]["VA"] || 0;
          if (VAInfo[1]["VAStatus"] == "VA Loan - First Time Use")
            FTU = VAInfo[1]["VA"] || -1;
          if (VAInfo[2]["VAStatus"] == "Exempt From VA Funding Fee")
            ExtFee = VAInfo[2]["VA"] || -1;
        }
        let bor = {
          RowId: RowId,
          CustID: CustID,
          SSN: SSN,
          FICO: borrInfo?.[2]?.["FICO Score"] || 0,
          PrimaryBorrower: i == 0 ? 1 : 0,
          FirstName: borrInfo?.[0]?.["First Name"] || "",
          LastName: borrInfo?.[1]?.["Last Name"] || "",
          Phone: borrInfo?.[3]?.["Cell Phone"] || "",
          Email: borrInfo?.[4]?.["Email"] || "",
          VAStatus: VAStatus,
          FTU: FTU,
          ExemptFundFee: ExtFee,
          CRRId: CRID,
          Spouse: "-1",
          firstTimeHomeBuyer: searchDetails["First Time Home Buyer"],
        };
        borrRows.push(bor);
      }
      if (borrRows.length == 0) {
        borrRows = [
          {
            RowId: "1",
            CustID: "1",
            FICO: searchDetails["FICO Score"],
            PrimaryBorrower: "1",
            FirstName: "",
            LastName: "",
            Phone: "",
            Email: "",
            VAStatus: "0",
            FTU: "-1",
            ExemptFundFee: "-1",
            CRRId: "0",
            Spouse: "0",
            firstTimeHomeBuyer: searchDetails["First Time Home Buyer"],
          },
        ];
      }
      let InputData = {
        DataIn: [
          {
            RootObjects: [
              {
                ViewType: "CV",
                SessionId: contextDetails["queryString"]["SessionId"],
                FromNewRateLock:
                  contextDetails["OnloadProcess"] == "PQ" ? 2 : 1,
                IISSessionId: "kk0htdbpzh3gg1kw5gprve4p",
                LoanID: GlobleValue["LoanId"],
                EmpNum: GlobleValue["EmpNum"],
                CompNum: GlobleValue["CompNum"],
                compname: GlobleValue["CompName"].replace("&", "~amp~"),
                EmpRights: "0",
                BorrCount: borrRows.length || 0,
                Prequal: contextDetails["OnloadProcess"] == "PQ" ? 1 : 0,
              },
            ],
          },
          {
            BorrInfo: [...borrRows],
          },
          {
            PropertyInfo: [
              {
                OccupancyType: searchDetails["Occupancy"] || 0,
                PropertyTypeType: searchDetails["Property Type"] || 0, /// Incorrect Spelling, need to check
                NoOfUnits: "",
                SubjectAddress:
                  searchDetails["Property Address"] == "0"
                    ? ""
                    : searchDetails["Property Address"] || "",
                SubjectState: searchDetails["State"] || "",
                SubjectCity: searchDetails["City"] || "",
                SubjectZip: searchDetails["Zip"] || "",
                LienPosition: searchDetails["Lien Position"] || 0,
              },
            ],
          },
          {
            LoanParamInfo: [
              {
                LoanPurpose: searchDetails["Loan Purpose"] || "0",
                AppraisalPrice: searchDetails["Appraised Value"],
                PurchasePrice:
                  searchDetails["Loan Purpose"] != 1
                    ? "0.00"
                    : searchDetails["Purchase Price"],
                // LoanAmount: searchDetails["Lien Position"] == 1 ? searchDetails["Loan Amount 1st"] : searchDetails["Loan Amount 2nd"],
                // LoanAmount2: searchDetails["Lien Position"] == 1 ? searchDetails["Loan Amount 2nd"] : searchDetails["Loan Amount 1st"],
                LoanAmount: searchDetails["Loan Amount 1st"],
                LoanAmount2: searchDetails["Loan Amount 2nd"],
                LTV: searchDetails["LTV"],
                RentRatio: searchDetails["Rent Ratio"], // *,
                CLTV: searchDetails["CLTV"],
                LoanOfficer: GlobleValue["LO"],
                Income: searchDetails["Monthly Income ($)"],
                Liabilities: searchDetails["Liabilities ($)"],
                TermInMonths2: searchDetails["Term Months 2nd"] || "0",
                SecLenderNum: "0", // *
                CorresLoan: "0", // *
                CorrespondLoanType: "0",
                IsSelfEmployed: searchDetails["Self Employed"] || "0",
                DTI: searchDetails["Debt to Income Ratio %"] || "0",
              },
            ],
          },
          {
            LoanSearchInfo: [
              {
                DesiredRate:
                  searchDetails["ddlRateMethod"] == 2
                    ? ""
                    : searchDetails["Desired Rate"],

                ddlRateMethod: searchDetails["ddlRateMethod"] || 0, // Rate DD

                ChargeRebate:
                  searchDetails["ddlRateMethod"] == 1
                    ? ""
                    : cleanValue(searchDetails["Rate Charge% | (Rebate%)"]) ||
                      "", // %

                NearestCharge:
                  searchDetails["ddlRateMethod"] == 1
                    ? ""
                    : searchDetails["Nearest Rate Charge"] || "0", // =/< DD

                LockPeriod: Number(searchDetails["Lock Period Days"]) || "4",
                FeesinRate:
                  searchDetails["Lender Fees In Rate"] == 2
                    ? 0
                    : searchDetails["Lender Fees In Rate"],
                RequestEscrow: searchDetails["RequestEscrowWaiver"] || "0", //other option
                EnergyEffMort: searchDetails["EnergyEfficient"] || "0", //other option
                PropertylistedonMLS: searchDetails["PropertylistedMLS"] || "0", //other option
                QualifyingFICO:
                  fnFindMinFICO(borrowerInfo) || searchDetails["FICO Score"], // min FICO from Borr
                LoanProgNum: searchDetails["Loan Program"] || "",
                NonProfitGiftFund: searchDetails["DownPaymentGift"] || "0", //other option
                LenderBorrowerPaid: "1", //Hard coded
                LoanType: !searchDetails["Product Type_Bitwise"]
                  ? handleTypeOptionsBitwise(
                      "Product Type",
                      searchDetails["Product Type"] || 0,
                      "Bitwise"
                    )
                  : searchDetails["Product Type_Bitwise"],

                AmortType: !searchDetails["Amortization Type_Bitwise"]
                  ? handleTypeOptionsBitwise(
                      "Amortization Type",
                      searchDetails["Amortization Type"] || 0,
                      "Bitwise"
                    ) || 0
                  : searchDetails["Amortization Type_Bitwise"] || 0,

                Term: !searchDetails["Term (Months)_Bitwise"]
                  ? handleTypeOptionsBitwise(
                      "Term (Months)",
                      searchDetails["Term (Months)"] || 0,
                      "Bitwise"
                    ) || 0
                  : searchDetails["Term (Months)_Bitwise"] || 0,

                AmortizeTime: !searchDetails["Term (Months)_Bitwise"]
                  ? handleTypeOptionsBitwise(
                      "Term (Months)",
                      searchDetails["Term (Months)"] || 0,
                      "Bitwise"
                    ) || 0
                  : searchDetails["Term (Months)_Bitwise"] || 0,
                ARMIndex: "", //Hard coded
                FixedPeriod: "0", //Hard coded
                MortIns: !searchDetails["Single Premium MI_Bitwise"]
                  ? handleTypeOptionsBitwise(
                      "Single Premium MI",
                      searchDetails["Single Premium MI"] || "0",
                      "Bitwise"
                    )
                  : searchDetails["Single Premium MI_Bitwise"] || 0,

                FHADate: "", //Hard coded
                ExistingGovtLoan:
                  searchDetails["Existing Government Loan"] || "0", // if 1 ? 0
                HudREPO: "0", //Hard coded
                DisplayLenderComp: "0", //Compensation Type
                LawEnforceGrant: searchDetails["LawEnforcement"] || "0", //other option
                SearchNoPPP: searchDetails["NoPPP"] || "0", //other option
                LendersToSearch: searchDetails["Lenders to Search"] || "",
                TBD: searchDetails["TBD"] || 0,
                MortInsPremium: searchDetails["Mortgage Insurance Type"] || "",
                //ChangeLnPrgm :
              },
            ],
          },
        ],
      };
      if (
        ["tbd", "to be determined", ""].includes(
          (searchDetails["Property Address"] || "").toLowerCase()
        )
      ) {
        if (contextDetails["TBD"] != 1) handleTBD(1);
      }

      if (searchDetails["Compensation Type"] == 1) {
        handleUpdateLenderComp(contextDetails["EmpNum"], 1, 1);
      }

      return InputData;
    } catch (error) {
      setModalOpen({
        ...modalOpen,
        RateSheetRunWarning: true,
        Msg: "  Error while searching loan products, Please check the inputs and Try again.         ",
      });
    }
  };
  const handleSaveInputs = () => {
    let InputData = handleConstructInputs();
    let obj = {
      LoanID: contextDetails["LoanId"],
      SaveJson: JSON.stringify(InputData || ""),
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
  };
  const handleLenderCompOpen = () => {
    let url = `../../../BorrowerApplication/Presentation/Webforms/LenderPaidComp.aspx?LoanId=0&SessionId=${contextDetails["queryString"]["SessionId"]}&Compbased=1&CompNum=${GlobleValue["CompNum"]}&CompMissing=1`;
    window.open(
      url,
      "LenderCompPlan",
      "status=0,toolbar=0,menubar=0,resizable=yes,scrollbars=yes,width=1000px,height=650px,"
    );
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

  const handleManualLoanSelection = () => {
    let url = `../../../BorrowerApplication/Presentation/Webforms/Loan_ManualProgramInput.aspx?LoanID=${
      contextDetails["LoanId"]
    }&SessionId=${contextDetails["queryString"]["SessionId"]}&EmpNum=${
      contextDetails["EmpNum"]
    }&LnAmt=${cleanValue(
      searchDetails["Loan Amount 1st"]
    )}&rnd=${Math.random()}`;
    window.open(
      url,
      "LenderCompPlan",
      "status=0,toolbar=0,menubar=0,resizable=yes,scrollbars=yes,width=1000px,height=650px,"
    );
  };
  const handleUpdateLenderComp = (EmpNum, Value, Flag) => {
    let obj = { EmpNum, Value, Flag };
    handleAPI({
      name: "UpdateLenderComp",
      params: obj,
    }).then((response) => {
      response = JSON.parse(response);
      let UpdateLenderComp = response["Table"][0]["Column1"];
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          UpdateLenderComp: UpdateLenderComp,
        };
      });
      console.log("UpdateLenderComp ===>", response);
    });
  };
  //=================================== Function declarations Ends=======================================
  let options = [
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" },
    { label: "Option 3", value: "3" },
  ];
  let LienOptions = [
    { TypeDesc: "Lien Position", TypeOption: "0" },
    { TypeDesc: "1st Lien", TypeOption: "1" },
    { TypeDesc: "2nd Lien", TypeOption: "2" },
  ];
  let SinglePremium = [
    { TypeDesc: "None", TypeOption: "4" },
    { TypeDesc: "Borrower Paid", TypeOption: "1" },
    { TypeDesc: "Lender Paid", TypeOption: "3" },
  ];

  let CompensationType = [
    { TypeDesc: "Lender Paid", TypeOption: "1" },
    { TypeDesc: "Borrower Paid", TypeOption: "2" },
  ];
  let FeesOptions = [
    { TypeDesc: "Select", TypeOption: "0" },
    { TypeDesc: "Fees In", TypeOption: "1" },
    { TypeDesc: "Fees Out", TypeOption: "2" },
  ];
  let ExistGovOptions = [
    { TypeDesc: "No", TypeOption: "0" },
    { TypeDesc: "FHA", TypeOption: "16" },
    { TypeDesc: "VA", TypeOption: "2" },
    { TypeDesc: "Rural Housing", TypeOption: "9" },
    { TypeDesc: "Fannie Mae", TypeOption: "29" },
    { TypeDesc: "Freddie Mac", TypeOption: "30" },
  ];
  let OtherOptions = [
    { TypeDesc: "None", TypeOption: "0" },
    { TypeDesc: "Request Escrow Waiver", TypeOption: "1" },
    {
      TypeDesc: "Property listed on MLS in the last 6 months",
      TypeOption: "2",
    },
    { TypeDesc: "Energy Efficient Mortgage", TypeOption: "3" },
    { TypeDesc: "Down Payment Gift", TypeOption: "4" },
    { TypeDesc: "Law Enforcement (or similar) Grant", TypeOption: "6" },
    { TypeDesc: "No Prepayment Penalty", TypeOption: "7" },
  ];
  let LendersOptions = [
    { TypeDesc: "Direct Mortgage, Corp.", TypeOption: "78" },
    { TypeDesc: "Axia Financial, LLC.", TypeOption: "106005" },
    { TypeDesc: "Orion Lending", TypeOption: "106002" },
  ];
  let TermMonths = [
    { TypeDesc: "Select", TypeOption: "0" },
    { TypeDesc: "120", TypeOption: "120" },
    { TypeDesc: "360", TypeOption: "360" },
  ];
  let DesiredRate = [
    { TypeDesc: "Desired Rate", TypeOption: "1" },
    { TypeDesc: "Rate Formula", TypeOption: "2" },
  ];
  let NearestRateCharge = [
    { TypeDesc: "Equal or Above", TypeOption: "0" },
    { TypeDesc: "Equal or Below", TypeOption: "1" },
  ];

  const menuOption = [
    {
      Name: "Import a Loan scenario",
      onPress: () => {
        setContextDetails((prevContext) => {
          return {
            ...prevContext,
            currentProcess: "FNMImport",
          };
        });
        handleMenu();
        setTimeout(() => {
          try {
            window.parent.resizeIframe();
          } catch (error) {}
        }, 1000);
      },
      icon: "FNM",
      from: "Material",
      size: 18,
      visible: true,
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
      visible: true,
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
      visible: true,
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
      visible: true,
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
      visible: true,
    },
    {
      Name: "Manual Loan Program Selection",
      onPress: () => {
        handleManualLoanSelection();
        handleMenu();
      },
      icon: "TitlePricing",
      from: "MaterialIcons",
      size: 20,
      visible:
        // contextDetails["isPublicRunScenario"] ||
        contextDetails["OnloadProcess"] == "PQ" ? false : true,
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
      visible:
        contextDetails["isPublicRunScenario"] ||
        contextDetails["OnloadProcess"] == "PQ"
          ? false
          : true,
    },
    {
      Name: "Initial Fee Worksheet",
      onPress: () => {
        handleFeeWorkSheet();
        handleMenu();
      },
      visible:
        contextDetails["isPublicRunScenario"] ||
        contextDetails["OnloadProcess"] == "PQ"
          ? false
          : true,
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
      visible: true,
    },
    {
      Name: "Save window size and position",
      onPress: () => {
        handleMenu();
        handleSaveWindowSize(contextDetails["SessionId"]);
      },
      visible: contextDetails["isPublicRunScenario"] ? false : true,
    },
    {
      Name: "Loan Selection - Old",
      onPress: () => {
        let url = `../../../BorrowerApplication/Presentation/Webforms/LoanProduct_Selection_Lock.aspx?SessionID=${contextDetails["SessionId"]}&OnloadProcess=PQ&HideNav=1&RemHeadFootr=0&FNM=undefined`;
        window.open(
          url,
          "PQ",
          "width=1200,height=900,resizable=1,scrollbars=1"
        );

        handleMenu();
      },
      visible: contextDetails["isPublicRunScenario"] ? false : true,
    },
  ];
  const isMobileWeb = Dimensions.get("window").width <= 650;
  return (
    <>
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
            contextDetails?.["queryString"]?.["RemHeadFootr"] == 0 ||
            (contextDetails["pqLoan"] != undefined &&
              contextDetails["pqLoan"] == 1)
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
              Price a Scenario
            </CustomText>
          </View>
          <View ref={topMenuUseref}>
            <Button
              title={
                <CustomText
                  bold={false}
                  style={{ color: "#000", fontSize: 11 }}
                >
                  Menu
                </CustomText>
              }
              style={[
                styles["btn"],
                styles["btnShadow"],
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
            <DropDownButton
              listOption={menuOption}
              Open={isMenuOpen["top"]}
              MenuPosition={topMenuPosition}
              handleOpen={handleMenu}
            />
          </View>
        </View>
      </LinearGradient>
      <View
        style={{
          backgroundColor: "#fff",
          // flex: 1,
          paddingHorizontal: 20,
          width: "100%",
        }}
      >
        {
          //contextDetails["LockingFrom"] != "PQ" &&
          contextDetails["IsLocked"] == 1 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 15,
                marginTop: 10,
              }}
            >
              <Button
                title={
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Icon
                      name="arrow-back-circle-sharp"
                      size={18}
                      color="white"
                    />
                    <CustomText
                      style={{ color: "#FFFFF", fontSize: 12, fontWeight: 200 }}
                    >
                      Back to Lock Confirmation
                    </CustomText>
                  </View>
                }
                style={[
                  styles["btn"],
                  {
                    borderRadius: 3,
                    marginLeft: 0,
                    paddingVertical: 8,
                    paddingHorizontal: 8,
                    backgroundColor: "#e59729",
                  },
                ]}
                onPress={() => {
                  let obj = {
                    ChangeRate: false,
                    FloatDown: false,
                    LoanLocked: true,
                    ChangeLoanProgram: false,
                  };
                  handleStatus(obj);
                  setContextDetails((prevContext) => {
                    return {
                      ...prevContext,
                      ChangeRate: false,
                      FloatDown: false,
                      ChangeLoanProgram: false,
                      PreventLoanProgramLoan: false,
                      changeRateXML: undefined,
                    };
                  });
                  setLoanProducts([]);
                  handleLoanProducts([]);
                }}
              />
              {!contextDetails["ChangeLoanProgram"] && (
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <CustomText
                    bold={true}
                    style={{ fontWeight: 200, color: "#000", fontSize: 13 }}
                  >
                    {`Rate Sheet Used: `}
                  </CustomText>
                  <CustomText
                    bold={true}
                    style={{ fontWeight: 200, color: "#000", fontSize: 13 }}
                  >
                    {contextDetails["ratesheetused"] || ""}
                  </CustomText>
                </View>
              )}
            </View>
          )
        }
        <View>
          <ChangeCompany
            Visible={modalOpen["CompSearch"]}
            handleSearch={handleCompanySearch}
          />
        </View>
        <View>
          <Modal
            transparent={true}
            visible={
              modalOpen["CompTable_Num"] || modalOpen["CompTable_Name"] || false
            }
            style={{ height: "90vh" }}
          >
            <View styles={{ top: 200 }}>
              {modalOpen["CompTable_Num"] && (
                <CompanyTable
                  Result={GlobleValue?.["CompanyInfo"] || []}
                  handleSearch={handleCompanySearch}
                />
              )}
              {modalOpen["CompTable_Name"] && (
                <CompanyTablei
                  Result={GlobleValue?.["CompanyInfo"] || []}
                  handleSearch={handleCompanySearch}
                />
              )}
            </View>
          </Modal>
        </View>
        <View>
          <Modal
            transparent={true}
            visible={modalOpen["AddressValidation"] || false}
          >
            <View styles={{ top: 200 }}>
              <AddressValidation
                Result={modalOpen["AddressInfo"] || []}
                handleAddress={fnSelectAddress}
              />
            </View>
          </Modal>
        </View>

        <View>
          <Modal transparent={true} visible={modalOpen["LoanTable"]}>
            <View styles={{ top: 200 }}>
              <LoanTable
                data={GlobleValue["LoanData"] || []}
                handleSelect={handleChooseBor}
              />
            </View>
          </Modal>
        </View>
        <View
          style={{
            top: 23,
            width: "fit-content",
            position: "absolute",
            right: 34,
            display: "none",
          }}
        >
          <View>
            <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
              <CustomText style={{ width: 200, fontSize: 12 }} bold={true}>
                Page Load Time:
              </CustomText>
              <CustomText id="divPageLoad" style={{ fontSize: 12 }}>
                0
              </CustomText>
            </View>
            <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
              <CustomText style={{ width: 200, fontSize: 12 }} bold={true}>
                Saving Time:
              </CustomText>
              <CustomText id="divsave" style={{ fontSize: 12 }}>
                0
              </CustomText>
            </View>
            <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
              <CustomText style={{ width: 200, fontSize: 12 }} bold={true}>
                Getting Loan Products:
              </CustomText>
              <CustomText id="divGetLP" style={{ fontSize: 12 }}>
                0
              </CustomText>
            </View>

            <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
              <CustomText style={{ width: 200, fontSize: 12 }} bold={true}>
                Loan Product Loading Time:
              </CustomText>
              <CustomText id="divProduct" style={{ fontSize: 12 }}>
                0
              </CustomText>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 10,
                marginTop: 10,
              }}
            >
              <CustomText style={{ width: 200, fontSize: 12 }} bold={true}>
                UI Painting:
              </CustomText>
              <CustomText id="divUI" style={{ fontSize: 12 }}>
                0
              </CustomText>
            </View>
          </View>
        </View>
        {contextDetails["currentProcess"] === "FNMImport" && (
          <View style={{ marginTop: 20 }}>
            <AccordionItem
              title={
                <>
                  <CustomText
                    style={{
                      fontSize: 16,
                      marginHorizontal: 9,
                      marginVertical: 0,
                    }}
                  >
                    Import a Loan Scenario
                  </CustomText>
                </>
              }
              isAccordion={true}
              isExpand={true}
            >
              <WebViewiFrame
                url={`../../../BorrowerApplication/Presentation/Webforms/ImportExportLoanPulse.aspx?SessionID=${contextDetails["SessionId"]}&removeHeaderFooter=1`} //../../../BorrowerApplication/Presentation/Webforms/DropZone.aspx?SessionId=${contextDetails["SessionId"]}&LoanId=${contextDetails["LoanId"]}&sType=LoanBoardingLock&Lenderdropdown=False&millsec=419&min=47`
              ></WebViewiFrame>
            </AccordionItem>
          </View>
        )}
        <Separator />
        {contextDetails["isPublicRunScenario"] && (
          <View style={{ gap: 10, marginBottom: 20 }}>
            <CustomText bold={true} style={{ fontSize: 13 }}>
              After running your scenario, you can lock the rate or create a
              loan for Underwriting submission (or both).
            </CustomText>
            <CustomText style={{ fontSize: 12 }}>
              If you have any questions click the “Contact Me” button below and
              your Account Executive will contact you.
            </CustomText>
          </View>
        )}
        <AccordionItem
          style={{
            display:
              contextDetails["ChangeRate"] || contextDetails["FloatDown"]
                ? "none"
                : "flex",
          }}
          title={
            <View
              style={{ flexDirection: "row", alignItems: "baseline", gap: 100 }}
            >
              <View
                style={{
                  flexDirection:
                    isMobileWeb && isMenuOpen["EditLO"]
                      ? "column"
                      : isMobileWeb
                      ? "column"
                      : "row",
                  gap: 20,
                  alignItems: "baseline",
                  maxWidth: "100%",
                  marginHorizontal: 9,
                }}
              >
                {/* <CustomText
                testID="txtProductSearch"
                  style={{
                    fontSize: isMobileWeb ? 14:16,
                    marginHorizontal: 9,
                    marginVertical: 0,
                    maxWidth: isMobileWeb ? "100%" : "50%",
                  }}
                >
                  Loan Product Search
                </CustomText> */}

                <View
                  style={{
                    flexDirection: isMobileWeb ? "column" : "row",
                    alignItems: "baseline",
                    maxWidth: "50%",
                    gap: 10,
                  }}
                >
                  {/* <View>
                  <InputBoxOrdinary
                    label={"Client Selected"}
                    name={"CompanyName"}
                    disabled={true}
                    Margin={true}
                    value={GlobleValue["CompName"]}
                  ></InputBoxOrdinary>
                </View> */}
                  {isMenuOpen["EditLO"] ? (
                    <>
                      <View style={{ width: 300, marginTop: 5 }}>
                        <Dropdown
                          isValid={true}
                          disabled={
                            contextDetails["ChangeRate"] ||
                            contextDetails["FloatDown"] ||
                            contextDetails["ChangeLoanProgram"]
                          }
                          label={"Loan Officer"}
                          options={searchDetails["Loan Officers"] || []}
                          value={GlobleValue["LO"]}
                          onSelect={(text) => {
                            fnSaveLoanOfficer(text);
                          }}
                        />
                      </View>
                      {GlobleValue["EmpAERights"] == "1" &&
                        !contextDetails["ChangeRate"] &&
                        !contextDetails["FloatDown"] &&
                        !contextDetails["ChangeLoanProgram"] && (
                          <View style={{ flexDirection: "row" }}>
                            <Button
                              title={
                                <CustomText
                                  style={{
                                    color: "#FFFFF",
                                    fontSize: 11,
                                    fontWeight: 200,
                                  }}
                                >
                                  Change Company
                                </CustomText>
                              }
                              style={[
                                styles["btn"],
                                {
                                  borderRadius: 3,
                                  //marginLeft: 12,
                                  paddingVertical: 8,
                                  paddingHorizontal: 8,
                                },
                              ]}
                              onPress={() => {
                                setModalOpen({
                                  ...modalOpen,
                                  CompSearch: true,
                                });
                              }}
                            />
                            <Button
                              title={
                                <CustomText
                                  style={{
                                    color: "#FFFFF",
                                    fontSize: 11,
                                    fontWeight: 200,
                                  }}
                                >
                                  Cancel
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
                                setMenuOpen({
                                  ...isMenuOpen,
                                  EditLO: !isMenuOpen["EditLO"],
                                });
                              }}
                            />
                          </View>
                        )}
                    </>
                  ) : (
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        maxWidth: "100%",
                      }}
                    >
                      <View style={{ flexDirection: "column" }}>
                        <CustomText
                          testID="txtLOName"
                          style={{ fontSize: isMobileWeb ? 14 : 16 }}
                        >
                          {GlobleValue["LOName"] || ""}
                        </CustomText>
                        <CustomText
                          testID="txtCompName"
                          style={{ fontSize: isMobileWeb ? 14 : 16 }}
                        >
                          {GlobleValue["CompName"]?.replace("~amp~", "&") || ""}
                        </CustomText>
                      </View>
                      {GlobleValue["EmpAERights"] == "1" &&
                        !contextDetails["ChangeRate"] &&
                        !contextDetails["FloatDown"] &&
                        !contextDetails["ChangeLoanProgram"] && (
                          <View style={{ flexDirection: "row" }}>
                            <Image
                              style={{
                                height: 15,
                                width: 25,
                              }}
                              resizeMode="contain"
                              source={require("../assets/edit.svg")}
                              onClick={() => {
                                setMenuOpen({
                                  ...isMenuOpen,
                                  EditLO: !isMenuOpen["EditLO"],
                                });
                              }}
                            />
                            <CustomText
                              style={{
                                textDecoration: "underline",
                                color: "#2F5DAA",
                              }}
                              onClick={() => {
                                setMenuOpen({
                                  ...isMenuOpen,
                                  EditLO: !isMenuOpen["EditLO"],
                                });
                              }}
                            >
                              edit
                            </CustomText>
                          </View>
                        )}
                    </View>
                  )}
                </View>
              </View>
              {!contextDetails["isMobileWeb"] && (
                <View testID="btnUseLastRun" style={{ alignSelf: "center" }}>
                  <Button
                    title={
                      <CustomText
                        style={{
                          color: "#FFFFF",
                          fontSize: 11,
                          fontWeight: 200,
                        }}
                      >
                        Use Last Run
                      </CustomText>
                    }
                    style={[
                      styles["btn"],
                      {
                        borderRadius: 3,
                        //marginLeft: 12,
                        paddingVertical: 8,
                        paddingHorizontal: 8,
                      },
                    ]}
                    onPress={() => {
                      handleUseLastRun();
                    }}
                  />
                </View>
              )}
            </View>
          }
          isExpand={true}
          isAccordion={false}
        >
          <View
            style={[
              styles["bodyContainer"],
              { display: isMobileWeb ? "flex" : "grid" },
            ]}
          >
            <View>
              <Table
                tableDetails={TableColumns["BorrowerProperty"]}
                borrowerDetails={borrowerInfo}
                onchange={handleChangedDetails}
                searchDetails={searchDetails}
              />
            </View>
            <View>
              <Table
                tableDetails={TableColumns["TermsOptions"]}
                onchange={handleChangedDetails}
                searchDetails={searchDetails}
              />
              {/*Commented for Change loan loan program scenario*/}
              {/* {contextDetails["feeIncludedMsg"] && (
                <View>
                  <View
                    style={{
                      marginVertical: 3,
                    }}
                  >
                    <CustomText
                      style={{ fontSize: 12, backgroundColor: "yellow" }}
                    >
                      The Fee Included Option may not be changed because this
                      loan has already been disclosed or the rate previously
                      locked.
                    </CustomText>
                  </View>
                </View>
              )} */}
            </View>
            <View>
              <Table
                tableDetails={TableColumns["LoanInformation"]}
                onchange={handleChangedDetails}
                searchDetails={searchDetails}
              />
              {contextDetails["IslenderCompExist"] ? (
                <View>
                  <View
                    style={{
                      marginVertical: 6,
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      gap: 10,
                    }}
                  >
                    <Button
                      title={
                        <CustomText
                          bold={false}
                          style={{
                            fontSize: 13,
                            color: "#fff",
                            justifyContent: "center",
                            textAlign: "center",
                            fontWeight: 200,
                          }}
                        >
                          <>
                            <Entypo name="forward" size={14} color="white" />
                            {` Set Lender Compensation Plan`}
                          </>
                        </CustomText>
                      }
                      style={[
                        styles["btn"],
                        {
                          width: "50%",
                          borderRadius: 3,
                          paddingHorizontal: 0,
                        },
                      ]}
                      onPress={() => {
                        handleLenderCompOpen();
                      }}
                    />
                  </View>
                </View>
              ) : (
                <View>
                  <View
                    style={{
                      marginVertical: 6,
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      gap: 10,
                    }}
                  >
                    {
                      contextDetails["wholeSaleRights"] != 0 && (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            width: "45%",
                          }}
                        >
                          <CustomText
                            style={{
                              fontSize: 11,
                             // marginLeft: 5,
                              width: "59%",
                              color: "#6c757d",
                            }}
                          >
                            Search With Memory Optimized Flow
                          </CustomText>
                          <Swatch
                            style={{flex:0,alignItems:'left'}}
                            value={contextDetails["MOSearchFlow"]}
                            size={13}
                            onChange={(text) => {
                              let val = text ? 1 : 0;
                              handleMOSearchFlow(
                                val,
                                contextDetails["LoanId"],
                                "Update"
                              );
                              setContextDetails((prevContext) => {
                                return {
                                  ...prevContext,
                                  MOSearchFlow: Boolean(val),
                                };
                              });
                            }}
                          />
                        </View>
                      )}
                    <Button
                      isDisable={Status["Searching"]}
                      title={
                        <CustomText
                          bold={false}
                          style={{
                            fontSize: 13,
                            color: "#fff",
                            justifyContent: "center",
                            textAlign: "center",
                            fontWeight: 200,
                          }}
                        >
                          {!Status["Searching"] ? (
                            <>
                              <Icon name="search" size={14} color="white" />
                              {` Search for Loan Products`}
                            </>
                          ) : (
                            `Searching...`
                          )}
                        </CustomText>
                      }
                      style={[
                        styles["btn"],
                        {
                          width: Status["Searching"] ? "44%" : "50%",
                          borderRadius: 3,
                          paddingHorizontal: 0,
                        },
                      ]}
                      onPress={() => {
                        handleLoanProductsSearch();
                      }}
                    />
                    {Status["Searching"] && (
                      <View>
                        <ArrowSpinner />
                      </View>
                    )}
                  </View>
                  {validation["stopSearch"] && (
                    <View
                      style={{
                        justifyContent: "flex-end",
                        flexDirection: "row",
                        marginVertical: 3,
                      }}
                    >
                      <CustomText style={{ color: "red", fontSize: 13 }}>
                        {validation["SearchErrorMsg"]}
                      </CustomText>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
          {VAStatus && (
            <View style={{ top: 10 }}>
              <Table
                tableDetails={VAMilitary}
                onchange={handleChangedDetails}
                isVA={true}
              />
            </View>
          )}
          {/* <Footer/> */}

          <View style={{ position: "absolute" }}>
            {/* <View style={{backgroundColor:'#00000087',height:'100%',width:'100%'}} >

        <ArrowSpinner size={40}/>
          </View> */}
            {modalOpen["RateSheetRunWarning"] && (
              <NotifyAlert
                handleOpen={handleWarningModal}
                Msg={modalOpen["Msg"] || ""}
                Component={modalOpen["component"] || ""}
              />
            )}
            {modalOpen["SettingTable"] && (
              <Setting
                isOpen={modalOpen["SettingTable"]}
                handleSaveSetting={handleSetting}
              />
            )}
          </View>
          {/* <View>
          <Modal transparent={true} visible ={true}>
        
          <WebViewiFrame url={'  http://www.directmortgage.com/BorrowerApplication/Presentation/Webforms/LoanProgramGuidelines.aspx?SessionID={DA1DCAFF-ECFA-41AA-8518-D3CC47216F99}&lineid=18259148&lnprogram=6332&intrateid=32&lockperiodid=4&interestrate=7.7500&lockperioddesc=30&LoanID=465962&totbitwise=64&seachedloan=0&runid=16116499&loanAmount=400000'}></WebViewiFrame>;
          </Modal>
        </View> */}
        </AccordionItem>
      </View>
      {contextDetails["queryString"]["RemHeadFootr"] == 0 && (
        <View style={[styles.footerBackground, { color: "white" }]}>
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
            <DropDownButton
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
              isDisable={!contextDetails["enableFooterSave"]}
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
                  borderColor: !contextDetails["enableFooterSave"]
                    ? "#c1c0c0"
                    : "#0d6ac5",
                },
              ]}
              onPress={() => {
                handleSaveInputs();
              }}
            />
          </View>
        </View>
      )}
      {contextDetails["changeRateSpinner"] && (
        <View
          style={{
            flex: 1,
            backgroundColor: "#dddddd8c",
            width: "100%",
            position: "absolute",
            height: "100%",
          }}
        >
          <ArrowSpinner size={50} />
        </View>
      )}
      {/* Trigerring portion from production menu option */}
      <View style={{ display: "none" }}>
        <div
          id={"FNMImport"}
          onClick={() => {
            setContextDetails((prevContext) => {
              return {
                ...prevContext,
                currentProcess: "FNMImport",
              };
            });
          }}
        ></div>
        <div
          id={"UseLastRun"}
          onClick={() => {
            handleUseLastRun();
          }}
        ></div>
        <div
          id={"FreshRun"}
          onClick={() => {
            handleStartWithFreshRun();
          }}
        />
        <div
          id={"TitlePricing"}
          onClick={() => {
            handleGetTitlePricing();
          }}
        />
        <div
          id={"FeeWorksheet"}
          onClick={() => {
            handleFeeWorkSheet();
          }}
        />
        <div
          id={"Settings"}
          onClick={() => {
            handleSetting("Modal");
          }}
        />
        <div
          id={"Prospect"}
          onClick={() => {
            let text =
              window.parent.document.getElementById("txtSearch1")?.value ||
              "testcase";
            handleMenuSearch("Search", "ProspectInfo", text);
          }}
        />
        <div
          id={"CreateNewScenario"}
          onClick={() => {
            let text =
              window.parent.document.getElementById("txtSearch2")?.value ||
              "testcase";
            handleMenuSearch("Search", "CreateNewScenarioInfo", text);
          }}
        />
        <div
          id={"RunValidation"}
          onClick={() => {
            handleRunValidation();
          }}
        />
        <div
          id={"IslenderCompExist"}
          onClick={() => {
            setContextDetails((prevContext) => {
              return {
                ...prevContext,
                IslenderCompExist: false,
              };
            });
          }}
        ></div>
        <div
          id={"ManualLoanSelection"}
          onClick={() => {
            handleManualLoanSelection();
          }}
        ></div>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  bodyContainer: {
    gap: 15,
    display: "grid",
    //  "grid-template-columns": "repeat(-fit,minmax(400px,1fr))",
    "grid-template-columns": "repeat(3,1fr)",
  },

  btn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignSelf: "flex-end",
    fontSize: 12,
    justifyContent: "center",
  },
  RateText: {
    backgroundColor: "#5e9cd3",
    height: 24,
    left: 10,
    fontSize: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  MenuInput: {
    marginBottom: 0,
    marginTop: 17,
  },
  btnShadow: {
    "box-shadow": "0px 4px 8px rgba(0, 0, 0, 0.25)",
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
  cardShadow: {
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
});
export default SearchCriteria;
