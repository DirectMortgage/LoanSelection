import { createContext } from "react";

const handleAPI = async ({ name, params, method, requestOptions = null }) => {
  let url = "https://www.solutioncenter.biz/RateLockAPI/api/";
  params = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  try {
    return fetch(
      `${url}${name}?${params}`,
      requestOptions
        ? requestOptions
        : {
            method: method || "POST",
            mode: "cors",
            // crossDomain: true,
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "Content-Length": params.length,
            },
          }
    )
      .then(async function (response) {
        let res = await response.json();

        return res;
      })
      .catch(function (err) {
        console.log(`Error from handleAPI ====>  ${err}`);
      });
  } catch (error) {}
};

const handleAPI_ = async ({ name, params, method, requestOptions = null }) => {
  let url = "https://www.solutioncenter.biz/RateLockAPI/api/";
  // params = Object.keys(params)
  // .map((key) => `${key}=${params[key]}`)
  // .join("&");
  let body = JSON.stringify(params);
  try {
    return fetch(`${url}${name}?`, {
      method: method || "POST",
      mode: "cors",
      // crossDomain: true,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        //'Content-Length': params.length
      },
      body: body,
    })
      .then(async function (response) {
        let res = await response.json();

        return res;
      })
      .catch(function (err) {
        console.log(`Error from handleAPI ====>  ${err}`);
      });
  } catch (error) {}
};

function formatCurrency(value, flag, digit = 2) {
  // let num = parseFloat(
  //     (value || "").toString().replace("$", "").replace(",", "")
  //   ).toString(),
  //   numParts = num||'0'?.toFixed(digit).split("."),
  //   dollars = numParts[0],
  //   cents = numParts[1] || "",
  //   sign = num == (num = Math.abs(num));
  // dollars = dollars.replace(/\$|\,/g, "");
  // if (isNaN(dollars)) dollars = "0";
  // dollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  // let val = "$" + ((sign ? "" : "-") + dollars + (cents ? "." + cents : ".00"));
  value = cleanValue(value);
  let num = parseFloat(
      (value || "").toString().replace("$", "").replace(",", "")
    ),
    numParts = num?.toFixed(digit).split("."),
    dollars = numParts[0],
    cents = numParts[1] || "",
    sign = num == (num = Math.abs(num));
  dollars = dollars.replace(/\$|\,/g, "");
  if (isNaN(dollars)) dollars = "0";
  dollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  let val =
    "$" + ((sign ? "" : "-") + dollars + (cents.length ? "." + cents : ".00")); //+ (cents ? "." + cents : ".00");
  val = val.replaceAll("--", "-");
  if (val == "$-0.00") val = "$0.00";
  if (flag === 1) {
    val = `(${val.replace("-", "")})`;
  } else if (flag == 0) {
    val = val.split(".")[0];
  }

  return val;
}
function formatCurrencyNew(
  amount,
  decimalCount = 2,
  decimal = ".",
  thousands = ","
) {
  try {
    const currencySymbol = "$";
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

    const negativeSign = amount < 0 ? "-" : "";

    let i = parseInt(
      (amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))
    ).toString();
    let j = i.length > 3 ? i.length % 3 : 0;

    return (
      negativeSign +
      (j ? i.substr(0, j) + thousands : "") +
      i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
      (decimalCount
        ? decimal +
          Math.abs(amount - i)
            .toFixed(decimalCount)
            .slice(2)
        : "")
      //   +
      // currencySymbol
    );
  } catch (e) {
    console.error(e);
    return "";
  }
}

function formatAmount(value) {
  let num = parseFloat(
    (value || "0").toString().replace("$", "").replace(",", "")
  ).toString();
  let val = parseFloat(num).toFixed(2);
  val = `$${val}`;
  val = val ? val : "$00.00";
  return val;
}
function formatPercentage(value, prefix = 4) {
  const floatValue = parseFloat(value || 0);
  if (!isNaN(floatValue)) {
    const formattedPercentage = floatValue.toFixed(prefix) + "%";
    return formattedPercentage;
  } else {
    return "";
  }
}
const cleanValue = (sVal, Flag) => {
  try {
    if (Flag === 2)
      sVal = sVal
        .replaceAll("$", "")
        .replaceAll("%", "")
        .replaceAll(",", "")
        .replaceAll("(", "")
        .replaceAll(")", "");
    else if (Flag === 3)
      sVal = sVal
        .replaceAll("$", "")
        .replaceAll("%", "")
        .replaceAll("(", "-")
        .replaceAll(")", "");
    else
      sVal = sVal.replaceAll("$", "").replaceAll(",", "").replaceAll("%", "");
    if (sVal == "") sVal = 0;
  } catch (e) {}
  return sVal;
};
const fnProvideRowsByKeys = (Input, Key, LineId, Flag) => {
  /*
  Flag = 1 ==> Will return particular key based on the given Line id
  Flag = 2 ==> Will return all the rows from all the loan products based on the given Key
  Flag = 3 ==> Will return all the roots associated with LineId
  Flag = 4 ==> Will return Root object
  Flag = 5 ==> Return MultiLender Product name
  */
  let OutPut = [];
  try {
    OutPut = Input["DataOut"].filter((e, index) => {
      return Object.keys(e)[0].indexOf("LineDataOut_") != -1;
    });
    if (Flag === 1) {
      OutPut = OutPut.filter((e) => Object.keys(e)[0].indexOf(LineId) != -1);
      OutPut = OutPut["0"]["LineDataOut_" + LineId].filter((e) => e[Key]);
      OutPut = OutPut[0][Key];
    } else if (Flag === 2) {
      let OutKeys = [];
      for (let index = 0; index < OutPut.length; index++) {
        let Out = OutPut[index][Object.keys(OutPut[index])].filter(
          (e) => e[Key]
        )[0][Key][0];
        OutKeys.push(Out);
      }
      OutPut = OutKeys;
    } else if (Flag === 3) {
      OutPut = OutPut.filter((e) => Object.keys(e)[0].indexOf(LineId) != -1);
      OutPut = OutPut[0]["LineDataOut_" + LineId];
    } else if (Flag === 4) {
      OutPut = Input["DataOut"][0]["RootObjects"];
    } else if (Flag == 5) {
      OutPut = Input["DataOut"].filter(
        (e) => Object.keys(e) == "LoanProgramsList"
      )[0]["LoanProgramsList"];
    }
  } catch (error) {
    console.log("Error in fnProvideRowsByKeys function" + Flag);
  }
  return OutPut;
};
const fnAddAdditionRow = (Input) => {
  let OutPut = [];
  for (let i = 0; i < Input.length; i++) {
    OutPut.push({ ...Input[i], isEven: i % 2 == 0 });
    OutPut.push({
      Id: -1,
      LineId: Input[i]["LineId"],
      LineIds: Input[i]["LineIds"],
      LPA_CommonData: Input[i]["LPA_CommonData"],
      show: false,
      isEven: 0,
    });
  }
  return OutPut;
};
const fnFormatAmount = (value) => {
  if (value) {
    value = value.replace("$", "").replace("-", "");
    if (value < 0) value = `($${value.replace("-", "")})`;
    return value;
  }
};

const fnRoundUpValue = (FullValue, Precision = 2) => {
  const decimalPart = FullValue % 1;
  let returnValue = "";
  if (decimalPart !== 0) {
    const decimalPosition = FullValue.toString().indexOf(".");
    const wholeNumPart = FullValue.toString().substring(0, decimalPosition);
    const decimalString = FullValue.toString().substring(decimalPosition); // keep the decimal portion as a string

    const timesBy100 = parseFloat(decimalString) * 10000;
    const roundedValue = Math.round(timesBy100) / 10000;

    returnValue =
      parseInt(wholeNumPart) + (FullValue >= 0 ? roundedValue : -roundedValue);
  } else {
    returnValue = FullValue;
  }

  const strReturnValue = returnValue.toFixed(Precision);

  return strReturnValue;
};

const handleAddons = (Row, Addons) => {
  if (!Row["Row"]) return;
  let { BasePoints, BaseAmt, IntRate } = Row["Row"];
  let finalPoints = 0,
    finalAmount = 0,
    finalRate = 0;
  for (let i = 0; i < Addons.length; i++) {
    let AddonPoints = "",
      AddonAmount = "",
      AddonRate = "";
    let iAddonAmount = Addons[i]["AddonAmount"];
    let iDisc = Addons[i]["Disc"];
    if (
      Addons[i]["AdjustmentJSON"] != null &&
      Addons[i]["AdjustmentJSON"].length > 0
    ) {
      //let AdjustmentJson = JSON.parse(Addons[i]["AdjustmentJSON"]);
      let iAdjustmentRow = Addons[i]["AdjustmentJSON"].filter(
        (e) => parseFloat(e["NoteRate"]) == cleanValue(IntRate)
      );
      if (iAdjustmentRow.length > 0) {
        iDisc = iAdjustmentRow[0]["Adjustment"];
        iAddonAmount = iAdjustmentRow[0]["AddonAmount"];
      } else {
        iDisc = "0";
        iAddonAmount = "0";
      }
    }
    if (iDisc.toString().indexOf("-") != -1)
      iDisc = "(" + iDisc.toString().replace("-", "") + ")";
    else iDisc = iDisc;

    if (iDisc.toString().indexOf("(") != -1)
      AddonPoints = `-${iDisc.toString().replace(/[^0-9.-]/g, "")}`;
    else AddonPoints = iDisc.toString().replace(/[^0-9.-]/g, "");
    if (AddonPoints === "-") AddonPoints = "0.00";
    finalPoints += parseFloat(AddonPoints);

    //=======================================================
    if (iAddonAmount.indexOf("(") != -1)
      AddonAmount = `-${iAddonAmount.replace(/[^0-9.-]/g, "")}`;
    else AddonAmount = iAddonAmount.replace(/[^0-9.-]/g, "");

    if (AddonAmount === "-") AddonAmount = "0.00";
    finalAmount += parseFloat(AddonAmount);
    //=======================================================

    if (Addons[i]["Rate"].indexOf("(") != -1)
      AddonRate = `-${Addons[i]["Rate"].replace(/[^0-9.-]/g, "")}`;
    else AddonRate = Addons[i]["Rate"].replace(/[^0-9.-]/g, "");

    if (AddonAmount === "-") AddonRate = "0.00";
    finalRate += parseFloat(AddonRate);
    //=======================================================
  }
  let formatedPoints = BasePoints.replace(/[^0-9.-]/g, "");
  let formatedAmt = BaseAmt.replace(/[^0-9.-]/g, "");
  if (BasePoints.indexOf("(") != -1) {
    formatedPoints = BasePoints.replace("(", "").replace(")");
    formatedPoints = `-${formatedPoints}`;
  } else {
    formatedPoints = `${formatedPoints}`;
  }
  if (formatedAmt.indexOf("(") != -1) {
    formatedAmt = formatedAmt.replace("(", "").replace(")");
    formatedAmt = `-${formatedAmt}`;
  } else {
    formatedAmt = `${formatedAmt}`;
  }

  finalPoints += parseFloat(formatedPoints);
  finalAmount += parseFloat(formatedAmt);
  finalRate += parseFloat(IntRate.replace(/[^0-9.-]/g, ""));
  finalAmount = finalAmount.toFixed(2);
  finalAmount =
    finalAmount.toString().indexOf("-") != -1
      ? formatCurrency(finalAmount, 1)
      : formatCurrency(finalAmount, -1);

  if (finalPoints > 0) {
    finalPoints = `${fnRoundUpValue(finalPoints, 3)}%`;
  } else {
    finalPoints = `(${fnRoundUpValue(finalPoints, 3)})%`;
    finalPoints = finalPoints.replace("-", "");
  }
  Row["FinalVal"] = {
    finalPoints: finalPoints,
    finalAmount: finalAmount,
    RateChosen: finalAmount.indexOf("(") != -1 ? "Credit" : "Charge",
    finalRate: finalRate + "%",
  };
  //RateBandClick(Row);

  // console.log("Final Calculation ====>", {
  //   finalPoints,
  //   finalAmount,
  //   finalRate,
  // });
  return Row;
};
const queryStringToObject = (queryString) => {
  if (!queryString) queryString = window.location.href;
  queryString = queryString.split("?")[1];
  const params = new URLSearchParams(queryString),
    result = {};
  for (const [key, value] of params) {
    result[key] = value.replace("#", "");
  }
  return result;
};

const fnRoundUpAmount = (value, decimalPlaces) => {
  let multiplier = Math.pow(10, decimalPlaces);
  let val = Math.round(value * multiplier) / multiplier;
  return val.toFixed(2);
};
const formatDate = (date) => {
  try {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return new Intl.DateTimeFormat("en-US", options).format(date);
  } catch (error) {
    console.log("Error in Dat formate");
  }
};
const handleGetRankingInfo = (
  LoanID,
  RunID,
  CommonID,
  LockPeriod,
  IncludeFee
) => {
  let obj = { LoanID, RunID, CommonID, LockPeriod, IncludeFee };
  handleAPI({
    name: "GetRankingInfo",
    params: obj,
  }).then((response) => {
    response = JSON.parse(response)["DataOut"][0];
    //console.log("GetRankingInfo ===>", response);
  });
};
const handleGetSessionData = async (strSessionId, SessVarName) => {
  let obj = { strSessionId, SessVarName };
  let response = await handleAPI({
    name: "GetSessionData",
    params: obj,
  }).then((response) => {
    // response = JSON.parse(response);
    return response;
  });
  return response;
};

const IsPreQualLoan = async (LoanId, EmpNum) => {
  let obj = { LoanId, EmpNum };
  let response = await handleAPI({
    name: "IsPreQualLoan",
    params: obj,
  }).then((response) => {
    // response = JSON.parse(response);
    return response;
  });
  return response;
};
const IsLockedLoan = async (LoanId) => {
  let obj = { LoanId };
  let response = await handleAPI({
    name: "IsLoanLocked",
    params: obj,
  }).then((response) => {
    // response = JSON.parse(response);
    return response;
  });
  return response;
};
const context = createContext();
const fnGetIndex = (data, key) => {
  let Index = data.findIndex((e) => Object.keys(e) == key);
  return Index;
};
// const handleSessionCheck = async () => {
//   let queryString = queryStringToObject();
//   let SessionId = contextDetails["SessionId"] || queryString["SessionId"];
//   let EmpNum = await handleGetSessionData(
//     contextDetails["SessionId"],
//     "empnum"
//   );
//   if (EmpNum == "Output") {
//     setModalOpen({
//       ...modalOpen,
//       RateSheetRunWarning: true,
//       Msg: "      Your Session is InActive!!!       ",
//     });
//     return;
//   }
// };

const handleGetEmpPreQualLoan = async (strEmpNum) => {
  let obj = { strEmpNum };
  let response = await handleAPI({
    name: "GetEmpPreQualLoan",
    params: obj,
  }).then((response) => {
    // response = JSON.parse(response);
    return response;
  });
  return response;
};
const generateBoxShadowStyle = (
  xOffset,
  yOffset,
  shadowColorIos,
  shadowOpacity,
  shadowRadius,
  elevation,
  shadowColorAndroid
) => {
  let boxShadow;
  if (ios) {
    boxShadow = {
      shadowColor: shadowColorIos,
      shadowOpacity,
      shadowRadius,
      shadowOffset: { width: xOffset, height: yOffset },
    };
  } else if (android) {
    boxShadow = { elevation, shadowColor: shadowColorAndroid };
  } else if (web) {
  }
  return boxShadow;
};
const sleep = (milliseconds) => {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
};
const isValidDate = (dateStr) => {
  let datePat = /^(\d{1,2})(\/)(\d{1,2})\2(\d{2}|\d{4})$/;
  let matchArray = dateStr.match(datePat);
  if (matchArray == null) return false;
  else return true;
};
const handleWholeSaleRights = async (EmpNum) => {
  let obj = { EmpNum: EmpNum };
  let Response = await handleAPI({
    name: "Iswholesaleaccess",
    params: obj,
  }).then((response) => {
    return response;
  });
  return Response;
};

const handleEditRights = async (LoanId, EmpId, userType, FromId) => {
  let obj = { LoanId, EmpId, userType, FromId };
  let Response = await handleAPI({
    name: "WorseCaseTest",
    params: obj,
  }).then((response) => {
    return response;
  });
  return Response;
};
const sortByTypeOption = (array, ordering) => {
  const orderingMap = {};
  ordering.forEach((value, index) => {
    orderingMap[value] = index;
  });

  return array.sort((a, b) => {
    const typeOptionA = parseInt(a.TypeOption);
    const typeOptionB = parseInt(b.TypeOption);

    return orderingMap[typeOptionA] - orderingMap[typeOptionB];
  });
};

const handleSaveWindowSize = (SessionId) => {
  let { innerWidth, innerHeight, screenX, screenY } = window;
  let viewPosition = {
    Width: innerWidth,
    Height: innerHeight,
    CurrentView: 0,
    Left: screenX,
    Top: screenY,
  };
  var obj = {
    SessionId: SessionId,
    ViewJson: JSON.stringify(viewPosition),
    UpdateFlag: 1,
    FormID: 0,
    FormName: "/LoanSelectionRct",
  };
  handleAPI({
    name: "SaveWindowSize",
    params: obj,
  }).then((response) => {
    return response;
  });
};
const fnRemoveSpecChar = (value) => {
  if (value.toString().indexOf("(") != -1)
    value = value
      .replace("(", "-")
      .replace(")", "")
      .replace(",", "")
      .replace("$", "");
  else value = value.toString().replace(",", "").replace("$", "");

  return value;
};
const fnAddDummyRow = (obj, lineIds) => {
  let maxLength = -Infinity,
    lineId = 0;

  lineIds.forEach((e) => {
    const length = obj[e].length;
    if (length > maxLength) {
      maxLength = length;
      lineId = e;
    }
  });
  let otherLineIds = lineIds.filter((e) => e != lineId);
  obj[lineId].forEach((i) => {
    otherLineIds.forEach((key) => {
      const isExist = obj[key].some((j) => j.IntRate === i.IntRate);
      if (!isExist) {
        let DummyRow = {
          LockPeriodDays: i.LockPeriodDays,
          IntRate: i.IntRate,
          LockPeriodID: i.LockPeriodID,
          LineId: i.LineId,
          IntRateID: i.IntRateID,
          BasePoints: "-",
          BaseAmt: "-",
          MonthlyPayment: "-",
          CalAmt: "",
          RateSheetName: "",
          LnProgActiveId: i.LnProgActiveId,
          IsDummy: true,
        };
        obj[key].push(DummyRow);
        obj[key].sort(
          (a, b) =>
            parseFloat(cleanValue(a.IntRate)) -
            parseFloat(cleanValue(b.IntRate))
        );
      }
    });
  });
  return obj;
};

const formatDateTimeNew = (date) => {
  if (date === "" || !date) return "";
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();

  let [month, day, year] = date.split("/");

  if (!day) {
    day = month;
    month = currentDate.getMonth() + 1;
  }

  const parsedMonth = parseInt(month);
  const parsedDay = parseInt(day);

  const isValidMonth =
    !isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12;
  const isValidDay = !isNaN(parsedDay) && parsedDay >= 1 && parsedDay <= 31;

  if (!isValidMonth || !isValidDay) {
    const formattedCurrentMonth = (currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0");
    const formattedCurrentDay = currentDate
      .getDate()
      .toString()
      .padStart(2, "0");
    return `${formattedCurrentMonth}/${formattedCurrentDay}/${currentYear}`;
  }

  if (year && year.length === 2) {
    year = currentYear.slice(0, 2) + year;
  } else if (!year) {
    year = currentYear;
  }

  const formattedMonth = parsedMonth.toString().padStart(2, "0");
  const formattedDay = parsedDay.toString().padStart(2, "0");

  return `${formattedMonth}/${formattedDay}/${year}`;
};

const handleGetMIQuote = (obj) => {
  handleAPI({
    name: "GetMIQuote_Wrapper",
    params: obj,
  }).then((response) => {
    console.info("GetMIQuote_Wrapper initiated");
    return response;
  });
};
const handleGetLendercompplanCheck = async (CompNum) => {
  let obj = { CompNum };
  let Response = await handleAPI({
    name: "GetLendercompplanCheck",
    params: obj,
  }).then((response) => {
    return response;
  });
  return Response;
};
const handleOpenPopUp_MIQuote = async (LoanID, isUpdatedelay) => {
  let obj = { LoanID, isUpdatedelay };
  let Response = await handleAPI({
    name: "OpenPopUp_MIQuote",
    params: obj,
  }).then((response) => {
    return response;
  });
  return Response;
};
const handleProceedRunMIQuote = async (
  LoanID,
  Fico,
  LoanAmount,
  LoanAmounttwo,
  LTV,
  CLTV
) => {
  let obj = {
    LoanID: parseInt(LoanID),
    Fico,
    LoanAmount: parseFloat(LoanAmount),
    LoanAmounttwo: parseFloat(LoanAmounttwo),
    LTV: parseFloat(LTV),
    CLTV: parseFloat(CLTV),
  };
  let Response = await handleAPI({
    name: "ProceedRunMiQuote",
    params: obj,
  }).then((response) => {
    return response;
  });
  return Response;
};

const handleBasicInfoInProd = () => {
  try {
    const elements = parent.document.querySelectorAll(".lnkEditRights");

    elements.forEach((element) => {
      element.innerHTML =
        '<button class="btn-smallow" tabindex="-1">Edit Rights: Allowed</button>';
    });
  } catch (error) {}
};
const handleConstructXML = (res) => {
  // let index = fnGetIndex(res,'DataOut')
  let changeRateResponse = res["DataOut"][1]["DataOut"];

  let index = fnGetIndex(changeRateResponse, "BorrData");
  let borrData = changeRateResponse[index]["BorrData"][0];
  const attrBorrData = Object.keys(borrData)
    .map((key) => `${key}="${borrData[key]}"`)
    .join(" ");
  let BorrDataXML = `<BorrData ${attrBorrData}/>`;

  index = fnGetIndex(changeRateResponse, "LoanData");
  let loanData = changeRateResponse[index]["LoanData"][0];
  const attrLoanData = Object.keys(loanData)
    .map(
      (key) =>
        `${key}="${
          typeof loanData[key] == "boolean"
            ? loanData[key]
              ? 1
              : 0
            : loanData[key]
        }"`
    )
    .join(" ");
  let LoanDataXML = `<LoanData ${attrLoanData}/>`;

  index = fnGetIndex(changeRateResponse, "RateCol");
  let rateCol = changeRateResponse[index]["RateCol"][0];
  const attrRateCol = Object.keys(rateCol)
    .map((key) => `${key}="${rateCol[key]}"`)
    .join(" ");
  let RateColXML = `<RateCol ${attrRateCol}/>`;

  index = fnGetIndex(changeRateResponse, "LockPeriod");
  let lockPeriod = changeRateResponse[index]["LockPeriod"][0];
  const attrLockPeriodXML = Object.keys(lockPeriod)
    .map((key) => `${key}="${lockPeriod[key]}"`)
    .join(" ");
  let LockPeriodXML = `<LockPeriodXML><row ${attrLockPeriodXML}/></LockPeriodXML>`;

  index = fnGetIndex(changeRateResponse, "RateData");
  let rateData = changeRateResponse[index]["RateData"];
  let RateDataXML = "";
  for (let i = 0; i < rateData.length; i++) {
    const element = rateData[i];
    const attrRateDataXML = Object.keys(element)
      .map((key) => `${key}="${element[key]}"`)
      .join(" ");
    RateDataXML += `<row ${attrRateDataXML}/> `;
  }
  RateDataXML = `<RateDataXML>${RateDataXML}</RateDataXML>`;

  index = fnGetIndex(changeRateResponse, "Addons");
  let addons = changeRateResponse[index]["Addons"];
  let AddonsXML = "";
  for (let i = 0; i < addons.length; i++) {
    const element = addons[i];
    const attrRateDataXML = Object.keys(element)
      .map((key) => `${key}="${element[key]}"`)
      .join(" ");
    AddonsXML += `<row ${attrRateDataXML}/> `;
  }
  AddonsXML = `<Addons>${AddonsXML}</Addons>`;

  index = fnGetIndex(changeRateResponse, "PrimBorrInfo");
  let primBorrInfo = changeRateResponse[index]["PrimBorrInfo"][0];
  const attrPrimBorrInfo = Object.keys(primBorrInfo)
    .map((key) => `${key}="${primBorrInfo[key]}"`)
    .join(" ");
  let PrimBorrInfoXML = `<PrimBorrInfo ${attrPrimBorrInfo}/>`;

  index = fnGetIndex(changeRateResponse, "BasePrice_ChangeInfo");
  let basePrice_ChangeInfo = changeRateResponse[index]["BasePrice_ChangeInfo"];
  let BasePrice_ChangeInfoXML = "";
  for (let i = 0; i < basePrice_ChangeInfo.length; i++) {
    const element = basePrice_ChangeInfo[i];
    const attrRateDataXML = Object.keys(element)
      .map((key) => `${key}="${element[key]}"`)
      .join(" ");
    BasePrice_ChangeInfoXML += `<row ${attrRateDataXML}/> `;
  }

  index = fnGetIndex(changeRateResponse, "MicroAdj");
  let MicroAdjXML = "";
  if (index == -1) {
    MicroAdjXML = `<MicroAdj></MicroAdj>`;
  } else {
    let MicroAdj = changeRateResponse[index]["MicroAdj"];

    for (let i = 0; i < MicroAdj.length; i++) {
      const element = MicroAdj[i];
      const attrRateDataXML = Object.keys(element)
        .map((key) => `${key}="${element[key]}"`)
        .join(" ");
      MicroAdjXML += `<row ${attrRateDataXML}/> `;
    }
    MicroAdjXML = `<MicroAdj>${MicroAdjXML}</MicroAdj>`;
  }

  index = fnGetIndex(changeRateResponse, "SRPNoteAdj");
  let SRPNoteAdjXML = "";
  if (index == -1) {
    SRPNoteAdjXML = `<SRPNoteAdj></SRPNoteAdj>`;
  } else {
    let SRPNoteAdj = changeRateResponse[index]["SRPNoteAdj"];
    for (let i = 0; i < SRPNoteAdj.length; i++) {
      const element = SRPNoteAdj[i];
      const attrRateDataXML = Object.keys(element)
        .map((key) => `${key}="${element[key]}"`)
        .join(" ");
      SRPNoteAdjXML += `<row ${attrRateDataXML}/> `;
    }
    SRPNoteAdjXML = `<SRPNoteAdj>${SRPNoteAdjXML}</SRPNoteAdj>`;
  }

  BasePrice_ChangeInfoXML = `<BasePrice_ChangeInfo>${BasePrice_ChangeInfoXML} ${MicroAdjXML} ${SRPNoteAdjXML}</BasePrice_ChangeInfo>`;
  let changeRateXML = "";
  changeRateXML = `<Root>${BorrDataXML} ${LoanDataXML} ${RateColXML} ${LockPeriodXML} ${RateDataXML} ${AddonsXML} ${PrimBorrInfoXML} ${BasePrice_ChangeInfoXML}</Root>`;

  return changeRateXML;
};
const handleGetCompNameByCompID = async (CompNum) => {
  let obj = { CompNum };
  let Response = await handleAPI({
    name: "GetCompNameByCompID",
    params: obj,
  }).then((response) => {
    return response;
  });
  return Response;
};
const handleGetWholesaleRights = async (EmpNum) => {
  let obj = { EmpNum };
  let Response = await handleAPI({
    name: "wholesaleintrateaccess",
    params: obj,
  }).then((response) => {
    return response;
  });
  return Response;
};
function restrictCharacters(value) {
  const allowedCharacters = /^[A-Za-z]*$/;

  if (!allowedCharacters.test(value)) {
    return true;
  } else {
    return false;
  }
}
const handleSelectQuote = (
  LineId,
  SessionId,
  Fico,
  LoanAmount,
  LoanAmounttwo,
  LTV,
  CLTV
) => {
  let obj = { LineId, SessionId, Fico, LoanAmount, LoanAmounttwo, LTV, CLTV };
  try {
    handleAPI({
      name: "SelectMIQuote",
      params: obj,
    }).then((response) => {
      console.log("Selected MI Quote successfully =>",response);
    });
  } catch (error) {
    console.log("Error in Selecting MI Quote API");
  }
};

const fnSortBy = (array, key) => {
  return array.sort((a, b) => {
    const valueA = parseInt(a[key]);
    const valueB = parseInt(b[key]);

    return valueA - valueB;
  });
};

const handleGetUpdatedPaymentSection = (RunID, Lineid) => {
  let obj = { RunID, Lineid };
  handleAPI({
    name: "GetUpdatedPaymentSection",
    params: obj,
  }).then((response) => {
    console.log("GetUpdatedPaymentSection ===>", response);
  });
};

const handleUpdateLenderComp = (EmpNum, Value, Flag)=>{
  let obj = { EmpNum, Value, Flag };
  handleAPI({
    name: "UpdateLenderComp",
    params: obj,
  }).then((response) => {
    response =JSON.parse(response)
    console.log("UpdateLenderComp ===>", response);
  });
}
export {
  handleAPI,
  formatCurrency,
  formatPercentage,
  cleanValue,
  fnProvideRowsByKeys,
  fnAddAdditionRow,
  fnFormatAmount,
  fnRoundUpValue,
  handleAddons,
  queryStringToObject,
  fnRoundUpAmount,
  formatDate,
  handleGetRankingInfo,
  handleGetSessionData,
  context,
  fnGetIndex,
  IsPreQualLoan,
  IsLockedLoan,
  formatAmount,
  handleGetEmpPreQualLoan,
  generateBoxShadowStyle,
  sleep,
  handleWholeSaleRights,
  isValidDate,
  sortByTypeOption,
  handleSaveWindowSize,
  fnRemoveSpecChar,
  fnAddDummyRow,
  formatDateTimeNew,
  handleGetMIQuote,
  handleGetLendercompplanCheck,
  handleOpenPopUp_MIQuote,
  handleBasicInfoInProd,
  handleConstructXML,
  handleAPI_,
  handleGetCompNameByCompID,
  restrictCharacters,
  handleSelectQuote,
  handleProceedRunMIQuote,
  fnSortBy,
  handleGetWholesaleRights,
  handleGetUpdatedPaymentSection,
  handleUpdateLenderComp
};
