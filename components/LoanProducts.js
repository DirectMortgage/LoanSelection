import { View } from "react-native";
import CustomText from "./accessories/CustomText";
import LoanProductTable from "./accessories/LoanProductTable";
import { Profiler, useContext, useEffect, useState } from "react";
import {
  cleanValue,
  fnAddAdditionRow,
  fnFormatAmount,
  fnProvideRowsByKeys,
  fnRoundUpValue,
  formatCurrency,
  formatDate,
  formatPercentage,
  handleAPI,
  handleAddons,
  context,
  sleep,
  fnRemoveSpecChar,
  fnAddDummyRow,
  handleUpdateLenderComp,
} from "./accessories/CommonFunctions";

const LoanProducts = ({ Data, SearchInfo, handleLock, handleLoanProducts }) => {
  const { contextDetails, setContextDetails } = useContext(context); //Get value from context
  const [LoanProducts, setLoanProducts] = useState();
  const [searchDetails, setSearchDetails] = useState();
  const [RawLoanProducts, setRawLoanProducts] = useState();
  const [RateBands, setRateBands] = useState({});
  const [ProductOpen, setProductOpen] = useState({});
  const [ActiveRate, setActiveRate] = useState({ Row: { IntRate: "6.000" } });
  const [ProductInfo, setProductInfo] = useState({});
  const [LenderComp, setLenderComp] = useState(false);
  //console.log("Loan Products ===>>", Data);
  useEffect(() => {
    if (Data["DataOut"] !== undefined) {
      setRawLoanProducts(Data);
      setSearchDetails(SearchInfo);
      handleLoadGrid(Data, SearchInfo);
    } else {
      setRawLoanProducts([]);
    }
    //console.log("Context Info ======>", contextDetails);
  }, [Data["DataOut"]]);
  const handleLoadGrid = (RawLoanData, SearchInfo) => {
    const { RunDate, ALLLinesSorted, NumLoanPrograms, CorrespondentLoan } =
      RawLoanData["DataOut"][0]["RootObjects"][0];
    let LoanProduct = fnProvideRowsByKeys(
      RawLoanData,
      "LoanProgramDetails",
      -1,
      2
    );
    let RawCommonLoanProducts = fnProvideRowsByKeys(RawLoanData, "", -1, 5);
    let PaymentDetails = [],
      Glo_IncludeLenderComp = 0;
    for (let i = 0; i < LoanProduct.length; i++) {
      const {
        Accept,
        LineId,
        InterestRate,
        LockDays,
        LoanAmt,
        ParPoints,
        PointsCost,
        PointsCostFormatted,
        IncludeLenderComp,
      } = LoanProduct[i];
      Glo_IncludeLenderComp = IncludeLenderComp;
      let OneDay = 24 * 60 * 60 * 1000;
      let FirstDate = new Date(RunDate);
      let SecondDate = new Date(LockDays);
      let LockPeriod = Math.round(
        Math.abs((FirstDate.getTime() - SecondDate.getTime()) / OneDay)
      );
      LockPeriod = `${LockPeriod} Days`;
      let RateDataJSON = fnProvideRowsByKeys(
        RawLoanData,
        "RateData",
        LineId,
        1
      );
      let LockPeriodJSON = fnProvideRowsByKeys(
        RawLoanData,
        "LockPeriod",
        LineId,
        1
      );
      let LoanDataJSON = fnProvideRowsByKeys(
        RawLoanData,
        "LoanData",
        LineId,
        1
      );
      let PaymentDetailsJSON = fnProvideRowsByKeys(
        RawLoanData,
        "PaymentDetails",
        LineId,
        1
      );
      let Glo_LockPeriodId = "",
        Glo_IntRateId = "",
        Glo_AddonRate_Total = 0,
        Glo_AddonPoints_Total = 0,
        Glo_AddonAmt_Total = 0,
        Glo_LenderCompAmount = 0;
      for (let j = 0; j < RateDataJSON.length; j++) {
        // RateData
        const { Rate, IntRateID } = RateDataJSON[j];

        if (Rate == InterestRate) Glo_IntRateId = IntRateID;

        if (j === RateDataJSON.length - 1) {
          if (RateDataJSON.length === 1 && Glo_IntRateId === "")
            Glo_IntRateId = IntRateID;
        }
      }
      for (let j = 0; j < LockPeriodJSON.length; j++) {
        //LockPeriod
        const { LockPeriodDesc, LockPeriodID } = LockPeriodJSON[j];

        if (LockPeriodDesc == LockPeriod) Glo_LockPeriodId = LockPeriodID;
        if (j === LockPeriodJSON.length - 1) {
          if (LockPeriodJSON.length === 1 && Glo_LockPeriodId === "")
            Glo_LockPeriodId = LockPeriodID;
        }
      }
      if (Glo_IntRateId && Glo_LockPeriodId) {
        let { LenderCompAmt, LenderCompPlan } = LoanDataJSON[0];
        LenderCompAmt = LenderCompAmt || 0;
        let Glo_LockPeriodRow = LockPeriodJSON.filter(
          (e) => e["LockPeriodID"] == Glo_LockPeriodId
        )[0];

        let { COlID, LockPeriods } = Glo_LockPeriodRow;

        let Glo_BasePoints = RateDataJSON.filter(
          (e) => e["IntRateID"] == Glo_IntRateId
        )[0][COlID];

        let LenderCompPoints =
          (parseFloat(LenderCompAmt) / parseFloat(cleanValue(LoanAmt))) * 100;
        LenderCompPoints = LenderCompPoints.toFixed(3);

        let strBaseAmt =
          (parseFloat(LoanAmt) * parseFloat(Glo_BasePoints)) / 100.0;
        strBaseAmt = formatCurrency(strBaseAmt);

        PaymentDetailsJSON[0] = {
          ...PaymentDetailsJSON[0],
          IntRateID: Glo_IntRateId,
          LockPeriodID: Glo_LockPeriodId,
          CorresLoan: 1,
          IntRate: InterestRate,
          Points: Glo_BasePoints,
          BaseAmount: strBaseAmt,
          BasePeriod: LockPeriods,
          LockExpDate: LockDays,
        };
        const dtLockExpDate = new Date(LockDays);
        let LockExpDate_Formatted = formatDate(dtLockExpDate);

        PaymentDetailsJSON[0]["LockExpDate_Formatted"] = LockExpDate_Formatted;
        let BaseAmount = 0;
        BaseAmount = parseFloat(strBaseAmt.replace(/[^0-9.-]/g, ""));
        if (strBaseAmt.indexOf("(") != -1) BaseAmount *= -1;
        let FinalRate =
          parseFloat(InterestRate) + parseFloat(Glo_AddonRate_Total);
        FinalRate = fnRoundUpValue(FinalRate, 4) + "%";

        let FinalPoints =
          parseFloat(Glo_BasePoints) + parseFloat(Glo_AddonPoints_Total);
        FinalPoints = FinalPoints.toFixed(3);

        let FinalAmt = BaseAmount + parseFloat(Glo_AddonAmt_Total);
        if (false) {
          //GLO_CorrespondentLoan == 1 # 1430
          let FinalPoints1;
          FinalPoints1 = (FinalPoints - 100) * -1;
          FinalAmt = (parseFloat(LoanAmt) * parseFloat(FinalPoints1)) / 100.0;
        } else {
          FinalAmt = (parseFloat(LoanAmt) * parseFloat(FinalPoints)) / 100.0;
        }
        FinalAmt = parseFloat(fnRoundUpValue(FinalAmt, 2));
        //FinalAmt = fnFormatAmount(FinalAmt);

        let divOrderID =
          parseInt(Glo_IntRateId) * 100 + parseInt(Glo_LockPeriodId);

        let LenderCompPointsformate = Math.abs(LenderCompPoints).toFixed(3);
        let FinalLendercompAmount = (
          parseFloat(Glo_LenderCompAmount) +
          parseFloat(fnFormatAmount(FinalAmt))
        ).toFixed(3);
        FinalLendercompAmount = fnFormatAmount(FinalLendercompAmount);
        let FinalLendercompPoints = (
          parseFloat(LenderCompPointsformate) + parseFloat(FinalPoints)
        ).toFixed(3);
        let tmp_LenderCompAmount = parseFloat(Glo_LenderCompAmount).toFixed(2);
        let tmp_LenderCompAmount_Ex = fnFormatAmount(tmp_LenderCompAmount);

        PaymentDetailsJSON[0] = {
          ...PaymentDetailsJSON[0],
          FinalAmt_Formatted: fnFormatAmount(FinalAmt),
          FinalRate: FinalRate,
          FinalPoints: FinalPoints,
          FinalAmt: FinalAmt,
          DivOrderID: divOrderID,
          PointsCost: PointsCost,
          ParPoints: ParPoints,
          ParPointsABS: FinalPoints,
          PointsCostFormatted: fnFormatAmount(FinalAmt),
        };

        LoanProduct[i] = {
          ...LoanProduct[i],
          IntRateID: Glo_IntRateId,
          LockPeriodID: Glo_LockPeriodId,
          LenderCompPoints: LenderCompPoints,
          LenderCompAmt: LenderCompAmt,
          FinalLendercompPoints: FinalLendercompPoints,
          FinalLendercompAmount: FinalLendercompAmount,
          LenderCompAmount_Formatted: tmp_LenderCompAmount_Ex,
          ParPointsABS: FinalPoints,
          PointsCostFormatted: fnFormatAmount(FinalAmt),
          IncludeLenderComp: LenderCompPlan || 0,
          //  Payment: Total,
          LenderCompPlan: LenderCompPlan,
          LockPeriodDesc: LockPeriod,
          APR: "Calculating...",
        };
        PaymentDetails.push(PaymentDetailsJSON[0]);
      } else {
        // Place to remove the loan products
      }
    }
    LoanProduct = handleUpdateLoanProducts(
      LoanProduct,
      SearchInfo,
      RawLoanData
    );

    //======================================= MULTI LENDER =====================================
    let CommonLoanProducts = [],
      availableCommonIds = [],IsWorseCase = false;
    for (let i = 0; i < RawCommonLoanProducts.length; i++) {
      let LenderProducts = LoanProduct.filter(
        (e) => e["LPA_CommonData"] == RawCommonLoanProducts[i]["LPA_CommonData"]
      );
      if (
        availableCommonIds.indexOf(
          RawCommonLoanProducts[i]["LPA_CommonData"]
        ) == -1
      ) {
        if (LenderProducts.length > 0) {
          let LineIds = [],
            LnProgActiveIds = [];
          for (let j = 0; j < LenderProducts.length; j++) {
            LineIds.push(LenderProducts[j]["LineId"]);
            availableCommonIds.push(LenderProducts[j]["LPA_CommonData"]);
            LnProgActiveIds.push(LenderProducts[j]["LnProgActiveId"]);
          }
          let CombineProp = {};
          let IsShowInfoInHeader = true;
          let uniqueVal = [...new Set(LnProgActiveIds)];
          if (LnProgActiveIds.length > 1) {
            if (uniqueVal.length > 1) {
              IsShowInfoInHeader = false;
            } else IsShowInfoInHeader = true;
          }
          // let isWorseCase = LnProgActiveIds.filter(
          //   (item, index) => LnProgActiveIds.indexOf(item) !== index
          // );
          IsWorseCase = uniqueVal.length != LnProgActiveIds.length ? true : false
          CombineProp = {
            ...LenderProducts[0],
            LineIds: LineIds.join(","),
            LnProgActiveIds: LnProgActiveIds.join(","),
            IsWorseCase:IsWorseCase,
            CommonName: RawCommonLoanProducts[i]["CommonProgramName"],
            showInfoInHeader: IsShowInfoInHeader,
          };
          CommonLoanProducts.push(CombineProp);
        }
      }
    }
    //console.log("Multi Lender Products =====>>", CommonLoanProducts);

    // ============================= Worsecase pageload =============
    for (let index = 0; index < CommonLoanProducts.length; index++) {
      const Row = CommonLoanProducts[index];

      let RateBandDetails = handleRateBands(
        Row["LineId"],
        "",
        Row["LineIds"],
        Row["LPA_CommonData"],
        CommonLoanProducts,
        RawLoanData
      );
      let AllLoanProduct = fnProvideRowsByKeys(
        RawLoanData,
        "LoanProgramDetails",
        -1,
        2
      );
      let { finalWCRates, worseCaseLineId_1, worseCaseLineId_2 } =
        handleWorseCase(
          AllLoanProduct,
          RateBandDetails,
          Row["LnProgActiveId"],
          Row["LPA_CommonData"]
        );

      let result = finalWCRates.filter(
        (e) =>
          parseFloat(cleanValue(e?.["IntRate"] || 0)) ==
          parseFloat(cleanValue(Row["InterestRate"]))
      );
      let ActiveLineId = {
        [Row["LPA_CommonData"]]: {
          Id: Row["LineId"],
          RateSheetName: result?.[0]?.["RateSheetName"] || "",
        },
      };
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          ActiveLineId: {
            ...prevContext.ActiveLineId,
            ...ActiveLineId,
            IsWorseCase
          },
        };
      });
      //RateBandDetails["RateBandsRows"][worseCaseLineId_1] = finalWCRates;
    }
    // ============================= Worsecase pageload ====================

    //===================================== Adding Additional Row for Showing Sub Grid ========================
    LoanProduct = fnAddAdditionRow(CommonLoanProducts);
    //===================================== Adding Additional Row for Showing Sub Grid ========================

    //===================================== Updating APR ========================
    setTimeout(() => {
      for (let i = 0; i < LoanProduct.length; i++) {
        try {
          if (LoanProduct[i]["Id"] != -1)
            handleGetAPR(
              LoanProduct[i]["LineId"],
              LoanProduct[i]["InterestRate"] &&
                LoanProduct[i]["InterestRate"].replace(/[^0-9.-]/g, ""),
              i
            );
        } catch (error) {
          console.log(
            "Error in product Load ===>",
            LoanProduct[i]["LineId"],
            LoanProduct[i]["InterestRate"]
          );
        }
      }
    }, 10);
    //===================================== Updating APR ========================

    //===================================== Updating Lender Comp ========================
    setTimeout(() => {
      handleLenderComp(
        "PageLoad",
        LoanProduct,
        contextDetails["UpdateLenderComp"] || 0
      ); //Glo_IncludeLenderComp
    }, 10);
    //===================================== Updating Lender Comp ========================
    //======================================= MULTI LENDER =====================================

    // console.log("keys ==>", LoanProduct);
    // console.log("RawData ==>", RawLoanData);
    setLoanProducts(LoanProduct);
    setProductInfo({ ...ProductInfo, PaymentDetails: PaymentDetails });
    setContextDetails((prevContext) => {
      return {
        ...prevContext,
        Glo_IncludeLenderComp,
      };
    });
  };
  const handleUpdateLoanProducts = (Product, SearchInfo, RawLoanData) => {
    let ProductAddons = {},
      NoRateBandAvail = false;
    for (let i = 0; i < Product.length; i++) {
      let ActiveProduct = fnProvideRowsByKeys(
        Data,
        "",
        Product[i]["LineId"],
        3
      );
      let RootObjects = ActiveProduct[0]["RootObjects"] || [];
      let Addons = ActiveProduct[6]["Addons"] || [];
      let ActiveRateRow = {},
        TotalAdjust = 0,
        TotalDiscount = 0,
        Adjustmentarr = [],
        OrgBaseAmt = 0,
        AddonAmountLB = 0,
        DicsLB = 0,
        AdjustmentJSON = [],
        AdjustmentJSONCopy = [];

      for (let j = 0; j < Addons.length; j++) {
        let AddonAmount = Addons[j]["AddonAmount"];
        let Disc = Addons[j]["Disc"];
        AdjustmentJSON = [];
        if (
          Addons[j]["AdjustmentJSON"] != null &&
          Addons[j]["AdjustmentJSON"].length > 0
        ) {
          AdjustmentJSON = JSON.parse(Addons[j]["AdjustmentJSON"]);
          AdjustmentJSONCopy = AdjustmentJSON;
          let iAdjustmentRow = AdjustmentJSON.filter(
            (e) =>
              parseFloat(e["NoteRate"]) ==
              cleanValue(Product[i]["InterestRate"])
          );
          if (iAdjustmentRow.length > 0) {
            Disc = iAdjustmentRow[0]["Adjustment"];
            AddonAmount = iAdjustmentRow[0]["AddonAmount"];
            AddonAmountLB = AddonAmount;
            DicsLB = Disc;
          } else {
            Disc = "0";
            AddonAmount = "0";
          }
        }

        let iDisc = "";
        if (Disc.toString().indexOf("-") != -1)
          Disc = "(" + Disc.toString().replace("-", "") + ")";
        else Disc = Disc;

        Adjustmentarr.push({
          Descript: Addons[j]["Descript"],
          Rate: Addons[j]["Rate"],
          Disc: Disc,
          AddonAmount: AddonAmount,
          CondLink: Addons[j]["CondLink"],
          AdjustmentJSON,
        });
        if (AddonAmount.indexOf("(") != -1)
          TotalAdjust = -+AddonAmount.replace("(", "")
            .replace(")", "")
            .replace(",", "")
            .replace("$", "");
        else TotalAdjust = AddonAmount.replace(",", "").replace("$", "");
        TotalAdjust += parseFloat(TotalAdjust);

        let Dic = "0";
        if (Disc.toString().indexOf("(") != -1)
          Dic = Disc.replace("(", "-")
            .replace(")", "")
            .replace(",", "")
            .replace("$", "");
        else Dic = Disc.toString().replace(",", "").replace("$", "");
        TotalDiscount += parseFloat(Dic);
      }
      ProductAddons = {
        ...ProductAddons,
        ...{ [Product[i]["LineId"]]: Adjustmentarr },
      };
      //============================= RATE FORMULA ===========================
      let RateBand_ = {},
        AddonsResult = "",
        BasePoints = "",
        RatefromFormula = [];
      let RateFormula =
        (SearchInfo["DataIn"] &&
          SearchInfo["DataIn"][4]["LoanSearchInfo"][0]) ||
        1;
      let { ddlRateMethod, NearestCharge, ChargeRebate } = RateFormula;
      if (ddlRateMethod == 2) {
        // Rate formula section
        let RateFormulaPoints = [];
        for (let j = 0; j < ActiveProduct[5]["RateData"].length; j++) {
          let Rate_ = ActiveProduct[5]["RateData"][j];
          BasePoints = fnGetBasePoints(
            Rate_["IntRateID"],
            Product[i]["LockPeriodID"],
            ActiveProduct[5]["RateData"],
            ActiveProduct[4]["LockPeriod"]
          );

          let finalPoint = parseFloat(TotalDiscount) + parseFloat(BasePoints);
          // console.log('TotalDiscount ==>',`d:${TotalDiscount} - r:${Rate_["Rate"]} - f:${finalPoint} - b:${BasePoints}` )
          if (NearestCharge == 0) {
            if (finalPoint >= parseFloat(ChargeRebate)) {
              RateFormulaPoints.push({
                Rate: Rate_["Rate"],
                IntRateID: Rate_["IntRateID"],
                FinalPoint: finalPoint,
                BasePoints,
              });
            }
          } else {
            if (finalPoint <= parseFloat(ChargeRebate)) {
              RateFormulaPoints.push({
                Rate: Rate_["Rate"],
                IntRateID: Rate_["IntRateID"],
                FinalPoint: finalPoint,
                BasePoints,
              });
            }
          }
        }
        if (RateFormulaPoints.length == 0) {
          let finalPoint = parseFloat(BasePoints) + parseFloat(TotalDiscount);
          let Rate =
            ActiveProduct[5]["RateData"][
              ActiveProduct[5]["RateData"].length - 1
            ];
          RateFormulaPoints.push({
            Rate: Rate["Rate"],
            IntRateID: Rate["IntRateID"],
            FinalPoint: finalPoint,
            BasePoints: BasePoints,
          });
        }

        let CalculatedFinalPoints = [],
          DesiredFinalPoints = "";
        for (let j = 0; j < RateFormulaPoints.length; j++) {
          CalculatedFinalPoints.push(RateFormulaPoints[j]["FinalPoint"]);
        }

        if (NearestCharge == 0) {
          // 0=> Equal or Above, 1=> Equal or Below
          DesiredFinalPoints = Math.min.apply(Math, CalculatedFinalPoints);
        } else {
          DesiredFinalPoints = Math.max.apply(Math, CalculatedFinalPoints);
        }

        RatefromFormula = RateFormulaPoints.filter(
          (e) => e["FinalPoint"] == DesiredFinalPoints
        );
        let { FinalPoint, Rate, BasePoints, IntRateID } = RatefromFormula[0];
        /////////////////// Loan Amount < 250000 and Rate Formula Used //////////////////////
        if (parseFloat(Rate) != parseFloat(Product[i]["InterestRate"])) {
          let discount = 0,
            AddonAmountWithoutLB = 0;

          for (let index = 0; index < Adjustmentarr.length; index++) {
            if (
              Adjustmentarr[index]["AdjustmentJSON"] == null ||
              Adjustmentarr[index]["AdjustmentJSON"].length == 0
            ) {
              AddonAmountWithoutLB += parseFloat(
                fnRemoveSpecChar(Adjustmentarr[index]["Disc"])
              );
            }
          }

          let jAdjustmentRow = AdjustmentJSONCopy.filter(
            (e) => parseFloat(e["NoteRate"]) == cleanValue(Rate)
          );
          if (jAdjustmentRow.length > 0) {
            discount = jAdjustmentRow[0]["Adjustment"];
          } else {
            discount = "0";
          }
          discount = fnRemoveSpecChar(discount);

          TotalDiscount =
            parseFloat(AddonAmountWithoutLB) + parseFloat(discount);
          FinalPoint = parseFloat(TotalDiscount) + parseFloat(BasePoints);
        }
        /////////////////// Loan Amount < 250000 and Rate Formula Used //////////////////////

        let BaseAmt =
          (parseFloat(cleanValue(Product[i].LoanAmt, 1)) *
            parseFloat(FinalPoint)) /
          100.0;
        BaseAmt = BaseAmt.toFixed(2);

        let RateChosen = "";
        if (FinalPoint > 0) {
          RateChosen = "Charge";
          FinalPoint = formatPercentage(FinalPoint, 3);
          BaseAmt = formatCurrency(BaseAmt);
        } else {
          RateChosen = "Credit";
          FinalPoint = `${FinalPoint.toFixed(3)}%`;
          BaseAmt = formatCurrency(BaseAmt, 1);
        }
        Product[i]["BasePoints"] = BasePoints;
        Product[i]["BaseAmount"] = BaseAmt;
        Product[i]["FinalPoint"] = FinalPoint;
        Product[i]["FinalAmt"] = BaseAmt;
        Product[i]["IntRateID"] = IntRateID;
        Product[i]["InterestRate"] = Rate;
        Product[i]["iInterestRate"] = Rate;
        Product[i]["RateChosen"] = `${FinalPoint} | ${BaseAmt} ${RateChosen}`;
      } else {
        if (ActiveProduct?.[5]?.["RateData"]) {
          let hasRate = (ActiveProduct?.[5]?.["RateData"] || [])?.filter(
            (e) =>
              parseFloat(e["Rate"]) == parseFloat(Product[i]["InterestRate"])
          );
          let nearestRate = 0;
          if (hasRate.length == 0 || hasRate[0]["Col1"] == "1000.000") {
            nearestRate = fnFindNearestInterestRate(
              Product[i]["InterestRate"],
              ActiveProduct[5]["RateData"]
            );
            if (Object.keys(nearestRate).length) {
              Product[i]["InterestRate"] = nearestRate["Rate"];
              Product[i]["IntRateID"] = nearestRate["IntRateID"];
              //console.log("nearestRate == >", nearestRate);
            }
          }
          let BasePoints = fnGetBasePoints(
            Product[i].IntRateID,
            Product[i].LockPeriodID,
            ActiveProduct[5]["RateData"],
            ActiveProduct[4]["LockPeriod"]
          );
          //BasePoints = parseFloat(BasePoints) + parseFloat(TotalDiscount);
          let BaseAmt =
            (parseFloat(cleanValue(Product[i].LoanAmt, 1)) *
              parseFloat(BasePoints)) /
            100.0;
          3;
          OrgBaseAmt = BaseAmt.toString().replace(",", "").replace("$", "");
          OrgBaseAmt = parseFloat(OrgBaseAmt) + parseFloat(TotalAdjust);
          RateBand_ = {
            lineid: Product[i]["LineId"],
            LockPeriodDays: Product[i].LockPeriodDesc,
            IntRate: formatPercentage(Product[i].InterestRate),
            BasePoints: BasePoints + "%",
            BaseAmt: formatCurrency(fnRoundUpValue(BaseAmt, 2)),
            MonthlyPayment: Product[i].MonthlyPayment,
            LockPeriodID: Product[i].LockPeriodID,
            CalAmt: OrgBaseAmt,
          };

          AddonsResult = handleAddons({ Row: RateBand_ }, Adjustmentarr);
          let { finalPoints, finalAmount, finalRate } =
            AddonsResult["FinalVal"];

          Product[i]["BasePoints"] = BasePoints;
          Product[i]["BaseAmount"] = BaseAmt;
          Product[i]["FinalPoint"] = finalPoints;
          Product[i]["FinalAmt"] = finalAmount;
          Product[i]["iInterestRate"] = finalRate;
          Product[i][
            "RateChosen"
          ] = `${finalPoints} | ${finalAmount} ${AddonsResult["FinalVal"]["RateChosen"]}`;
        }
      }
      ////////////////////////////////// Monthly Payment /////////////////////////////////////////
      let PaymentDetailsJSON = fnProvideRowsByKeys(
        RawLoanData,
        "PaymentDetails",
        Product[i]["LineId"],
        1
      );

      let Row = PaymentDetailsJSON.filter(
        (e) => e["LineId"] == Product[i]["LineId"]
      );
      let Rate, Payment;
      if (ddlRateMethod == 2) {
        Rate = RatefromFormula[0]["Rate"];
      } else {
        Rate = Product[i]["InterestRate"];
      }
      let RatBand = (ActiveProduct?.[5]?.["RateData"] || []).filter(
        (e) => e["Rate"] == Rate
      );

      if (RatBand.length == 1 && RatBand[0]["Col1"] == "1000.000") {
        NoRateBandAvail = true;
      }
      if (ActiveProduct?.[5]?.["RateData"] && Row[0]) {
        let {
          PropFin,
          PropHOA,
          PropHazard,
          PropMI,
          PropOtherI,
          PropOther,
          PropRETaxes,
        } = Row[0];
        let Monthly = RatBand?.[0]?.["MonthlyPayment"] || 0;
        let Total =
          parseFloat(cleanValue(Monthly)) +
          parseFloat(PropFin) +
          parseFloat(PropHazard) +
          parseFloat(PropRETaxes) +
          parseFloat(PropMI) +
          parseFloat(PropHOA) +
          parseFloat(PropOther);
        Product[i]["Payment"] = Total;
        Product[i]["PaymentWithoutAddons"] = Monthly;
        Product[i]["IsLenderComp"] = RootObjects?.[0]?.["CompLender"];

        ////////////////////////////////// Monthly Payment /////////////////////////////////////////
      }
    }
    setContextDetails((prevContext) => {
      return {
        ...prevContext,
        ProductAddons, // To take the loan selection value to LC Page
        NoRateBandAvail,
      };
    });
    return Product;
  };
  const handleProductInfo = (val, type) => {
    if (type == "PaymentDetails") {
      let Total =
        parseFloat(val["PropHOA"]) +
        parseFloat(val["PropHazard"]) +
        parseFloat(val["PropOther"]) +
        parseFloat(val["PropMI"]) +
        parseFloat(val["PropFin"]) +
        parseFloat(val["PropRETaxes"]);
      setLoanProducts((PreLoanProducts) => {
        return PreLoanProducts.map((product) => ({
          ...product,
          Payment:
            parseFloat(cleanValue(product["PaymentWithoutAddons"])) + Total,
        }));
      });
      setProductInfo((preProductInfo) => {
        return {
          ...preProductInfo,
          PaymentDetails: preProductInfo["PaymentDetails"].map((payment) => ({
            ...payment,
            ...val,
          })),
        };
      });
    }
  };
  var count = 0,
    prevLineId = "";
  const handleGetAPR = async (lineid, IntRate, Index, LockPeriodID) => {
    let obj = { lineid, IntRate };
    handleAPI({
      name: "GetAPRValue",
      params: obj,
    }).then((response) => {
      response = response.split("~")[1];
      response = JSON.parse(response);
      response = response["DataOut"] && response["DataOut"][0]["APRData"][0];
      let { APR } = response;
      if (APR == "0.0000%" && count < 10) {
        if (prevLineId == lineid) count = count + 1;
        else count = 0;
        handleGetARM(lineid, IntRate, "30", Index); // need to check
        prevLineId = lineid;
      } else {
        setLoanProducts((PreProducts) => {
          PreProducts[Index]["APR"] = APR;
          return [...PreProducts];
        });
      }
    });
  };
  const handleGetARM = async (lineid, IntRate, LockPeriod, Index) => {
    let obj = { lineid, IntRate, LockPeriodID: LockPeriod };
    handleAPI({
      name: "GetARMDetails",
      params: obj,
    }).then((response) => {
      setTimeout(() => {
        handleGetAPR(lineid, IntRate, Index);
      }, 1000);
    });
  };
  const handleLoanProductClick = (obj) => {
    //console.log("Loan production row click ==>>>", obj);

    setProductOpen({
      ...ProductOpen,
      [obj["LineId"]]: !ProductOpen[obj["LineId"]],
    });
    setActiveRate({
      ...ActiveRate,
      Row: {
        IntRate: obj["InterestRate"],
        LnProgActiveId: obj["LnProgActiveId"],
      },
    });
    let RateBandDetails = handleRateBands(
      obj["LineId"],
      "",
      obj["LineIds"],
      obj["CommonId"]
    );
    let AllLoanProduct = fnProvideRowsByKeys(
      RawLoanProducts,
      "LoanProgramDetails",
      -1,
      2
    );
    //*********************************** Worsecase scenario *****************************
    let { finalWCRates, worseCaseLineId_1, worseCaseLineId_2 } =
      handleWorseCase(
        AllLoanProduct,
        RateBandDetails,
        obj["LnProgActiveId"],
        obj["CommonId"]
      );
    RateBandDetails["RateBandsRows"][worseCaseLineId_1] = finalWCRates;
    // console.log('finalWCRates ==>',finalWCRates);
    //*********************************** Worsecase scenario Ends *****************************

    let LockPeriod = fnProvideRowsByKeys(
      RawLoanProducts,
      "LockPeriod",
      obj["LineId"],
      1
    );
    setProductInfo({ ...ProductInfo, LockPeriod });
    let RootObjects = {},
      LenderComp = {},
      LockRateDetails = {},
      NoteRate = {},
      RunID = "",
      LockPeriodsDesc = "",
      RateSheetId_ = "",
      IsWorseCase_ = false;
    let Ids = obj["LineIds"].split(",");
    for (let index = 0; index < Ids.length; index++) {
      //let Row = LoanProducts.filter((e) => e["LineId"] == Ids[index] && e['Id'] != -1);
      let Row = AllLoanProduct.filter((e) => e["LineId"] == Ids[index]);
      try {
        let iRow = LoanProducts.filter(
          (e) => e["LineId"] == Ids[0] && e["Id"] != -1
        );
        let { IsWorseCase } = iRow[0];
        IsWorseCase_ = IsWorseCase;
      } catch (error) {}
      let {
        Name,
        Accept,
        Reason,
        ProgWarnMsg,
        LenderLnProgName,
        LoanProgId,
        InterestRate,
        RateSheetId,

        Run,
        LineId,
      } = Row[0];
      RunID = Row[0]["Run"];
      RateSheetId_ = RateSheetId;

      let LenderCompRow = fnProvideRowsByKeys(
        RawLoanProducts,
        "LoanData",
        Ids[index],
        1
      );
      let NoteRateRow = fnProvideRowsByKeys(
        RawLoanProducts,
        "NoteRateAddons",
        Ids[index],
        1
      );

      NoteRate[Ids[index]] = { NoteRateRow: NoteRateRow[0] };
      let { LenderCompAmt, LoanAmt, LenderCompPoint } = LenderCompRow[0];
      let { LockExpDate, LockPeriods, LockPeriodID } = LockPeriod.filter(
        (e) => e["LockPeriodID"] == obj[obj["LineId"]]["LockPeriodId"]
      )[0];
      LockPeriodsDesc = LockPeriods;
      RootObjects[Ids[index]] = {
        Name,
        Accept,
        Reason,
        ProgWarnMsg,
        LenderLnProgName,
        LockExpDate,
        LoanProgId,
        Run,
        LineId,
        LoanAmt,
      };
      LenderCompPoint =
        (parseFloat(LenderCompAmt) / parseFloat(cleanValue(LoanAmt))) * 100;
      LenderComp[Ids[index]] = {
        LenderCompAmt: LenderCompAmt,
        LenderCompPoint: LenderCompPoint.toFixed(3),
      };
      LockRateDetails[Ids[index]] = {
        Name,
        LenderLnProgName,
        LockExpDate,
        LockPeriods,
        LockPeriodID,
        InterestRate,
      };
    }

    //===================== Set Context Details=======================
    setContextDetails((prevContext) => {
      return {
        ...prevContext,
        LockRateDetails: LockRateDetails,
        RateSheetId:
          IsWorseCase_ || !contextDetails["RateSheetId"]
            ? RateSheetId_
            : contextDetails["RateSheetId"],
      };
    });
    //===================== Set Context Details=======================

    RateBandDetails["RootObjects"] = RootObjects; // Parent info for the rate bands
    RateBandDetails["LenderComp"] = LenderComp;
    RateBandDetails["LineIds"] = obj["LineIds"].replace(
      `,${worseCaseLineId_2}`,
      ""
    ); // to show one grid when worse case
    RateBandDetails["NoteRate"] = NoteRate;
    setRateBands({ ...RateBands, [obj["CommonId"]]: RateBandDetails });

    let AcitveRate = LoanProducts.filter(
      (e) => e["LineId"] == obj["LineId"] && e["Id"] != -1
    )[0]["InterestRate"];
    let ActiveRateRow = {};

    for (
      let i = 0;
      i < RateBandDetails["RateBandsRows"][obj["LineId"]].length;
      i++
    ) {
      let RateBand = RateBandDetails["RateBandsRows"][obj["LineId"]][i];
      if (RateBand["IntRate"] == AcitveRate) {
        ActiveRateRow = {
          Index: i,
          LineId: obj["LineId"],
          Row: RateBand,
          CommonId: obj["CommonId"],
          RateSheetName: RateBand["RateSheetName"],
          LnProgActiveId: obj["LnProgActiveId"],
          activeLNPId: obj["LnProgActiveId"],
        };
        break;
      }
    }

    let AddonsResult = handleAddons(
      ActiveRateRow,
      RateBandDetails["Addons"][obj["LineId"]]
    );

    handleRateBandRowClick(
      AddonsResult,
      obj["LineId"]["LockPeriodId"],
      "No APR"
    );
    handleGetRankingInfo(
      contextDetails["LoanId"], //searchDetails["DataIn"][0]["RootObjects"][0]["LoanID"],
      RunID,
      obj["CommonId"],
      LockPeriodsDesc,
      2,
      Ids,
      "FreshLoad"
    );

    //console.log("Product click addons ===>", AddonsResult);
    //console.log("Rate band details===>", RateBandDetails);
  };
  const handleRateBandRowClick = (obj, LockPeriodId, Action) => {
    try {
      // let {  CondLink } =
      //   RateBands?.[obj["CommonId"]]?.["NoteRate"]?.[obj["LineId"]]?.[
      //     "NoteRateRow"
      //   ] || [];
      try {
        let { AdjustmentJSON } = RateBands?.[obj["CommonId"]]?.["Addons"]?.[
          obj["LineId"]
        ].filter(
          (e) => e["AdjustmentJSON"] != null && e["AdjustmentJSON"].length > 0
        )[0];
        let NoteRateRow = handleNoteRate(
          AdjustmentJSON || "[]",
          obj["Row"]["IntRate"]
        );

        if (AdjustmentJSON) {
          if (!NoteRateRow) NoteRateRow = [];
          let { Adjustment, AddonAmount } = NoteRateRow;
          if (NoteRateRow.length == 0) {
            Adjustment = "0";
            AddonAmount = "0";
          }
          if (Adjustment.toString().indexOf("-") != -1)
            Adjustment = "(" + Adjustment.toString().replace("-", "") + ")";
          else Adjustment = Adjustment;

          let NoteRateValue = {
            Disc: Adjustment || 0,
            AddonAmount: AddonAmount || 0,
          };
          setRateBands((prevState) => ({
            ...prevState,
            [obj["CommonId"]]: {
              ...prevState[obj["CommonId"]],
              Addons: {
                ...prevState[obj["CommonId"]].Addons,
                [obj["LineId"]]: (
                  prevState[obj["CommonId"]]?.Addons?.[obj["LineId"]] || []
                ).map((item) => {
                  if (
                    item["AdjustmentJSON"] != null &&
                    item["AdjustmentJSON"].length > 0
                  ) {
                    return { ...item, ...NoteRateValue };
                  }
                  return item;
                }),
              },
            },
          }));
        }
      } catch (error) {}
      try {
        if (!obj) return;
        setActiveRate((PreActiveRate) => {
          return {
            ...PreActiveRate,
            [obj["parallelLineId"] || obj["LineId"]]: obj["Row"],
            [obj["LineId"] || "Empty"]: obj["Row"], // Useful When If worst case scenario
            [obj["CommonId"]]: {
              IntRate: obj["Row"]["IntRate"],
              LineId: obj["LineId"],
              LnProgActiveId: obj["activeLNPId"],
            },
          };
        });
        const updatedItems = [...LoanProducts];
        var Index = updatedItems.findIndex(
          (e) => e["LineIds"].indexOf(obj["LineId"]) != -1 && e["Id"] != -1
        );
        if (Action != "No APR") {
          setTimeout(() => {
            handleGetAPR(
              obj["LineId"],
              obj["Row"]["IntRate"].replace(/[^0-9.-]/g, ""),
              Index,
              obj["Row"]["LockPeriodID"]
            );
          }, 100);
          updatedItems[Index] = {
            ...updatedItems[Index],
            APR: "Calculating...",
          };
        }
        let Row = ProductInfo["PaymentDetails"].filter(
          (e) => e["LineId"] == obj["LineId"]
        );
        let { PropFin, PropHOA, PropHazard, PropMI, PropOther, PropRETaxes } =
          Row[0];
        let Total =
          parseFloat(cleanValue(obj["Row"]["MonthlyPayment"])) +
          parseFloat(PropFin) +
          parseFloat(PropHazard) +
          parseFloat(PropRETaxes) +
          parseFloat(PropMI) +
          parseFloat(PropHOA) +
          parseFloat(PropOther);
        // Update the specific item based on the index

        if (obj["parallelLineId"] || 0 == obj["LineId"]) {
          let { IsLenderComp, LenderCompAmt, LenderCompPoints } =
            updatedItems[Index];
          // if (IsLenderComp == 0) {
          if (!LenderComp) {
            LenderCompAmt = 0;
            LenderCompPoints = 0;
          }
          let { lenderFinalAmt, LenderFinalPoint, RateChosen } =
            fnCalcLenderComp(
              obj["FinalVal"]["finalPoints"],
              obj["FinalVal"]["finalAmount"],
              LenderCompPoints,
              LenderCompAmt
            );

          updatedItems[Index] = {
            ...updatedItems[Index],
            InterestRate: obj["FinalVal"]["finalRate"], //obj["Row"]["IntRate"],
            iInterestRate: obj["FinalVal"]["finalRate"],
            Payment: fnRoundUpValue(Total, 3),
            BasePoints: obj["Row"]["BasePoints"],
            BaseAmount: obj["Row"]["BaseAmt"],
            FinalPoint: obj["FinalVal"]["finalPoints"],
            FinalAmt: obj["FinalVal"]["finalAmount"],
            IntRateID: obj["Row"]["IntRateID"],
            RateChosen: `${LenderFinalPoint} | ${lenderFinalAmt} ${RateChosen}`,
            //APR: "Calculating...",
          };
          if (obj["activeLNPId"] == obj["LnProgActiveId"])
            setLoanProducts(updatedItems);
        }

        let { BaseAmt, BasePoints, IntRateID, IntRate } = obj["Row"];
        let { finalAmount, finalPoints, finalRate } = obj["FinalVal"];

        // if (finalAmount.indexOf("(") != -1) {
        //   finalAmount = cleanValue(finalAmount, 2);
        //   finalAmount = parseFloat(`-${finalAmount}`);
        //   finalAmount = formatCurrency(finalAmount);
        // }
        // if (finalPoints.indexOf("(") != -1) {
        //   finalPoints = cleanValue(finalPoints, 2);
        //   finalPoints = parseFloat(`-${finalPoints}`);
        //   finalPoints = formatPercentage(finalPoints);
        // }
        let ActiveLineId = {
          [obj["CommonId"]]: {
            Id: obj["LineId"],
            RateSheetName: obj["RateSheetName"],
            // LnProgActiveId:obj['LnProgActiveId']
          },
        };
        let RateSheetName = {};
        if (contextDetails["ChangeLoanProgram"])
          RateSheetName = { RateSheetName: obj["RateSheetName"] };

        setContextDetails((prevContext) => {
          return {
            ...prevContext,
            ...RateSheetName,
            ActiveLineId: {
              ...prevContext.ActiveLineId,
              ...ActiveLineId,
            },
            LockRateDetails: {
              ...prevContext.LockRateDetails,
              [obj["parallelLineId"]]: {
                ...prevContext.LockRateDetails[obj["parallelLineId"]],
                BasePoints,
                IntRateID,
                IntRate: finalRate,
                InterestRate: IntRate, // This will not add any addons Rate
                BaseAmt,
                finalAmount,
                finalPoints,
                finalRate,
                RateSheetName: obj["RateSheetName"],
                LockPeriodID: LockPeriodId,
                LockPeriods:
                  obj?.["Row"]?.["LockPeriodDays"]?.split(" Days")[0],
                LineId: obj?.["Row"]?.["LineId"],
                Name: obj?.["Name"],
                LockExpDate: obj?.["LockExpDate"],
                CompanyName: contextDetails["CompName"],
              },
            },
          };
        });

        //console.log("Rate Band click =>>>", obj);
      } catch (error) {}
    } catch (error) {
      console.log("Error in handleRateBandRowClick - Error is", error);
    }
  };

  const handleGetRankingInfo = (
    LoanID,
    RunID,
    CommonID,
    LockPeriod,
    IncludeFee,
    LineIds,
    Action
  ) => {
    let obj = { LoanID, RunID, CommonID, LockPeriod, IncludeFee };
    handleAPI({
      name: "GetRankingInfo",
      params: obj,
    }).then((response) => {
      response = JSON.parse(response)["DataOut"];
      //console.log("GetRankingInfo ===>", response);
      try {
        setRateBands((prevRateBands) => {
          const updatedRateBands = { ...prevRateBands };
          let LenderRowsArr = {};

          for (let index = 0; index < LineIds.length; index++) {
            let LenderFees = [],
              LenderRanking = [];
            if (
              response[0]["LenderRanking"] &&
              response[0]["LenderRanking"].length > 0
            ) {
              LenderRanking = response[0]["LenderRanking"].filter(
                (e) => e["Lineid"] == LineIds[index]
              );
            }

            if (
              response[1]["Line_LenderFees"] &&
              response[1]["Line_LenderFees"].length > 0
            ) {
              LenderFees = response[1]["Line_LenderFees"].filter(
                (e) => e["Lineid"] == LineIds[index]
              );
            }
            try {
              LenderRanking.forEach((e, i) => {
                updatedRateBands[CommonID]["RateBandsRows"][LineIds[index]][i][
                  "Rank"
                ] = e["RankValue"];

                updatedRateBands[CommonID]["RateBandsRows"][LineIds[index]][i][
                  "Difference"
                ] = e["Diff"];
              });
            } catch (error) {
              console.log("Error in ranking");
            }
            //if (Action === "FreshLoad") {
            LenderFees.forEach((e, i) => {
              let LenderRows = {};

              LenderRows["FeeDesc"] = e["FeeDesc"];
              LenderRows["Fees"] = e["Fees"];
              LenderRows["Points"] = e["Points"];
              LenderRowsArr = {
                ...LenderRowsArr,
                ...{ [LineIds[index]]: [LenderRows] },
              };
            });
            // }
          }
          updatedRateBands[CommonID]["LenderFees"] = LenderRowsArr;

          //console.log("updatedRateBands ===>", updatedRateBands);
          return updatedRateBands;
        });
      } catch (error) {}
    });
  };
  const handleNoteRate = (Data, Rate) => {
    let result = Data.filter(
      (e) => parseFloat(e["NoteRate"]) == parseFloat(cleanValue(Rate))
    );
    return result[0];
  };
  const handleLockPeriodChange = (
    LockPeriodID,
    LineID,
    LineIds,
    CommonId,
    LnProgActiveId
  ) => {
    let RateBandDetails = handleRateBands(
      LineID,
      LockPeriodID,
      LineIds.join(","),
      CommonId
    );
    let RootObjects = {},
      LenderComp = {},
      LockRateDetails = {},
      NoteRate = {};
    let AllLoanProduct = fnProvideRowsByKeys(
      RawLoanProducts,
      "LoanProgramDetails",
      -1,
      2
    );
    //*********************************** Worsecase scenario *****************************

    let { finalWCRates, worseCaseLineId_1, worseCaseLineId_2 } =
      handleWorseCase(
        AllLoanProduct,
        RateBandDetails,
        LnProgActiveId,
        CommonId
      );
    RateBandDetails["RateBandsRows"][worseCaseLineId_1] = finalWCRates;
    //*********************************** Worsecase scenario *****************************

    let RunID = "",
      CommonID = "",
      LockPeriodsDesc = "";
    for (let index = 0; index < LineIds.length; index++) {
      let Row = AllLoanProduct.filter((e) => e["LineId"] == LineIds[index]);
      let {
        Name,
        Accept,
        Reason,
        ProgWarnMsg,
        LenderLnProgName,
        LoanProgId,
        Run,
        LineId,
        InterestRate,
      } = Row[0];
      RunID = Row[0]["Run"];
      CommonID = Row[0]["LPA_CommonData"];
      let LenderCompRow = fnProvideRowsByKeys(
        RawLoanProducts,
        "LoanData",
        LineIds[index],
        1
      );
      let NoteRateRow = fnProvideRowsByKeys(
        RawLoanProducts,
        "NoteRateAddons",
        LineIds[index],
        1
      );
      NoteRate[LineIds[index]] = { NoteRateRow: NoteRateRow[0] };
      let { LenderCompAmt, LoanAmt, LenderCompPoint } = LenderCompRow[0];

      let { LockExpDate, LockPeriods } = ProductInfo["LockPeriod"]?.filter(
        (e) => e["LockPeriodID"] == LockPeriodID
      )[0];
      LockPeriodsDesc = LockPeriods;
      RootObjects[LineIds[index]] = {
        Name,
        Accept,
        Reason,
        ProgWarnMsg,
        LenderLnProgName,
        LockExpDate,
        LoanProgId,
        Run,
        LineId,
        LoanAmt,
      };

      LenderCompPoint =
        (parseFloat(LenderCompAmt) / parseFloat(cleanValue(LoanAmt))) * 100;
      LenderComp[LineIds[index]] = {
        LenderCompAmt: LenderCompAmt,
        LenderCompPoint: LenderCompPoint.toFixed(3),
      };
      // LockRateDetails[LineIds[index]] = {
      //   Name,
      //   LenderLnProgName,
      //   LockExpDate,
      //   LockPeriods,
      //   LockPeriodID,
      //   InterestRate,
      // };
      // setContextDetails((prevContext) => {
      //   return {
      //     ...prevContext,

      //     LockRateDetails: {
      //       ...prevContext.LockRateDetails,
      //       [LineIds[index]]: {
      //         ...prevContext.LockRateDetails[LineIds[index]],
      //         LockPeriodID,
      //         LockExpDate,
      //         LockPeriods,
      //       },
      //     },
      //   };
      // });
    }

    const updatedItems = [...LoanProducts];
    var Index = updatedItems.findIndex(
      (e) => e["LineIds"].indexOf(LineID) != -1 && e["Id"] != -1
    );
    updatedItems[Index] = {
      ...updatedItems[Index],
      LockPeriodDesc: `${LockPeriodsDesc} Days`,
    };
    setLoanProducts(updatedItems);

    handleGetRankingInfo(
      contextDetails["LoanId"], //searchDetails["DataIn"][0]["RootObjects"][0]["LoanID"],
      RunID,
      CommonID,
      LockPeriodsDesc,
      1,
      LineIds
    );
    RateBandDetails["RootObjects"] = RootObjects; // Parent info for the rate bands
    RateBandDetails["LenderComp"] = LenderComp;
    let ReplacedVal = LineIds.toString().replace(`,${worseCaseLineId_2}`, "");
    RateBandDetails["LineIds"] = ReplacedVal; // to show one grid when worse case
    RateBandDetails["NoteRate"] = NoteRate;
    setRateBands({ ...RateBands, [CommonId]: RateBandDetails });

    // to trigger the active rate band after changing the lock period
    let ActiveRateRow = {};
    for (let i = 0; i < RateBandDetails["RateBandsRows"][LineID].length; i++) {
      let RateBand = RateBandDetails["RateBandsRows"][LineID][i];
      if (RateBand["IntRate"] == ActiveRate[CommonId]["IntRate"]) {
        // console.log('change lock days ==>', RateBand)
        ActiveRateRow = {
          Index: i,
          LineId: RateBand["LineId"],
          parallelLineId:RateBand["LineId"],
          Row: RateBand,
          CommonId: CommonId,
          RateSheetName: RateBand["RateSheetName"],
          LnProgActiveId: RateBand["LnProgActiveId"],
          activeLNPId: RateBand["LnProgActiveId"],
        };
        break;
      }
    }
    let AddonsResult = handleAddons(
      ActiveRateRow,
      RateBandDetails["Addons"][LineID]
    );

    handleRateBandRowClick(AddonsResult, LockPeriodID, "No APR");
  };

  const handleRankByChange = (obj) => {
    let { CommonId, LineId, LineIds, LockPeriodID, Rank } = obj;
    let { LockPeriods } = ProductInfo["LockPeriod"]?.filter(
      (e) => e["LockPeriodID"] == LockPeriodID
    )[0];

    let Row = LoanProducts.filter((e) => e["LineId"] == LineId);
    handleGetRankingInfo(
      contextDetails["LoanId"], //searchDetails["DataIn"][0]["RootObjects"][0]["LoanID"],
      Row[0]["Run"],
      CommonId,
      LockPeriods,
      Rank,
      LineIds
    );
    //console.log("handleRankByChange ====>", obj);
  };
  const handleRateBands = (
    LineId,
    LockPeriodID,
    LineIds,
    CommonId,
    Products,
    RawLoanData
  ) => {
    let Result = {},
      CombineArr = [],
      Adjustmentarr = [],
      CombineArr_Common = {},
      LockPeriod_Common = {},
      Adjustmentarr_Common = {},
      NoteRate = {},
      TotalDiscounts = {};
    LineIds = LineIds || LineId.toString();
    let LineIds_ = LineIds.split(",");
    for (let index = 0; index < LineIds_.length; index++) {
      CombineArr = [];
      Adjustmentarr = [];
      let ActiveProduct = fnProvideRowsByKeys(
        RawLoanProducts || RawLoanData,
        "",
        LineIds_[index],
        3
      );
      if (ActiveProduct?.[5]?.["RateData"] || null) {
        let NoteRateRow = fnProvideRowsByKeys(
          RawLoanProducts,
          "NoteRateAddons",
          LineIds_[index],
          1
        );

        let Products_ = LoanProducts || Products;
        if (!LockPeriodID) {
          LockPeriodID = Products_.filter(
            (e) => e["LineId"] == LineIds_[index] && e["Id"] != -1
          )[0]["LockPeriodID"];
        }
        let LockPeriod = ActiveProduct[4]["LockPeriod"].filter(
          (e) => e["LockPeriodID"] == LockPeriodID
        );
        let Rates = ActiveProduct[5]["RateData"];
        let Addons = ActiveProduct[6]["Addons"] || [];

        let OrgBaseAmt = "",
          TotalAdjust = 0,
          TotalDiscount = 0,
          FinalPoints = 0;
        for (let j = 0; j < Addons.length; j++) {
          let AddonAmount = Addons[j]["AddonAmount"];
          let Disc = Addons[j]["Disc"];
          if (
            Addons[j]["AdjustmentJSON"] != null &&
            Addons[j]["AdjustmentJSON"].length > 0
          ) {
            let AdjustmentJson = JSON.parse(Addons[j]["AdjustmentJSON"]);
            let rate = Products_.filter(
              (e) => e["LineId"] == LineIds_[index] && e["Id"] != -1
            );
            if (rate.length > 0) {
              rate = rate[0]["InterestRate"];
              let iAdjustmentRow = AdjustmentJson.filter(
                (e) => parseFloat(e["NoteRate"]) == cleanValue(rate)
              );

              if (iAdjustmentRow.length > 0) {
                Disc = iAdjustmentRow[0]["Adjustment"];
                AddonAmount = iAdjustmentRow[0]["AddonAmount"];
              } else {
                Disc = "0";
                AddonAmount = "0";
              }
            }
          }

          let iDisc = "";
          if (Disc.toString().indexOf("-") != -1)
            iDisc = "(" + Disc.toString().replace("-", "") + ")";
          else iDisc = Disc;

          Adjustmentarr.push({
            Descript: Addons[j]["Descript"],
            Rate: Addons[j]["Rate"],
            Disc: iDisc,
            AddonAmount: AddonAmount,
            CondLink: Addons[j]["CondLink"],
            AdjustmentJSON: JSON.parse(Addons[j]["AdjustmentJSON"] || "[]"),
          });

          if (AddonAmount.indexOf("(") != -1)
            TotalAdjust = -+AddonAmount.replace("(", "")
              .replace(")", "")
              .replace(",", "")
              .replace("$", "");
          else TotalAdjust = AddonAmount.replace(",", "").replace("$", "");
          TotalAdjust += parseFloat(TotalAdjust);
          let Dic = "0";
          if (AddonAmount.toString().indexOf("(") != -1)
            Dic = AddonAmount.replace("(", "-")
              .replace(")", "")
              .replace(",", "")
              .replace("$", "");
          else Dic = AddonAmount.toString().replace(",", "").replace("$", "");
          TotalDiscount += parseFloat(Dic);
        }

        let { LnProgActiveId, LoanAmt } =
          ActiveProduct[1]["LoanProgramDetails"][0];
        let BasePoints = 0,
          BaseAmt = 0;
        for (let i = 0; i < Rates.length; i++) {
          for (let j = 0; j < LockPeriod.length; j++) {
            BasePoints = fnGetBasePoints(
              Rates[i].IntRateID,
              LockPeriod[j].LockPeriodID,
              Rates,
              ActiveProduct[4]["LockPeriod"]
            );
            if(BasePoints == 0) BasePoints = BasePoints.toString()
            if (BasePoints) {
              // # 18973
              if (false) {
                //Global_IsCorrLoan
                var BasePoint2 = (BasePoints - 100) * -1;
                BaseAmt =
                  (parseFloat(LoanAmt) * parseFloat(BasePoint2)) / 100.0;
              } else {
                BaseAmt =
                  (parseFloat(cleanValue(LoanAmt, 1)) *
                    parseFloat(BasePoints)) /
                  100.0;
              }

              //BaseAmt = formatCurrency(BaseAmt);
              if (BasePoints.toString().indexOf("-") != -1)
                BasePoints = `(${BasePoints.toString()
                  .replace("-", "")
                  .replace("%", "")})`;

              OrgBaseAmt = BaseAmt.toString().replace(",", "").replace("$", "");
              OrgBaseAmt = parseFloat(OrgBaseAmt) + parseFloat(TotalAdjust);
              if (BasePoints != "1000.000") {
                CombineArr.push({
                  LockPeriodDays: LockPeriod[j].LockPeriodDesc,
                  IntRate: formatPercentage(Rates[i].Rate),
                  BasePoints: BasePoints + "%",
                  BaseAmt: formatCurrency(fnRoundUpValue(BaseAmt, 2)),
                  MonthlyPayment: Rates[i].MonthlyPayment,
                  LockPeriodID: LockPeriod[j].LockPeriodID,
                  CalAmt: OrgBaseAmt,
                  IntRateID: Rates[i]["IntRateID"],
                  LineId: LineIds_[index],
                  LnProgActiveId: LnProgActiveId,
                  RateSheetName: Rates[i]["RateSheetName"],
                });
              }
            }
          }
        }
       // console.log("------------", { [LineIds_[index]]: CombineArr });
        CombineArr_Common = {
          ...CombineArr_Common,
          [LineIds_[index]]: CombineArr,
        };
        Adjustmentarr_Common = {
          ...Adjustmentarr_Common,
          [LineIds_[index]]: Adjustmentarr,
        };
        TotalDiscounts = {
          ...TotalDiscounts,
          [LineIds_[index]]: TotalDiscount,
        };
        NoteRate = {
          ...NoteRate,
          [LineIds_[index]]: NoteRateRow[0],
        };
        LockPeriod_Common = {
          ...LockPeriod_Common,
          [LineIds_[index]]: ActiveProduct[4]["LockPeriod"],
        };
      }
    }
    //console.log("fnAddDummyRow =>", fnAddDummyRow(CombineArr_Common, LineIds_));
    CombineArr_Common = fnAddDummyRow(CombineArr_Common, LineIds_);
    return {
      RateBandsRows: CombineArr_Common,
      Addons: Adjustmentarr_Common,
      LockPeriod: LockPeriod_Common,
      TotalDiscounts: TotalDiscounts,
      NoteRate: NoteRate,
    };
  };
  const fnGetBasePoints = (IntRateID, LockPeriodID, Rates, LockPeriod) => {
    // Need to check change rate scenario
    try {
      let LockPeriodName = LockPeriod.filter(
        (e) => e["LockPeriodID"] == LockPeriodID
      )[0]["COlID"];

      let BasePoints = Rates.filter((e) => e["IntRateID"] == IntRateID)[0][
        LockPeriodName
      ];

      return BasePoints || 0;
    } catch (error) {
      console.log("Error in fnGetBasePoints function");
    }
  };
  const handleLenderComp = (val, Rows, IncludeLenderComp) => {
    let iProduct = [],
      from = "";
    if (val === "PageLoad") {
      iProduct = Rows;
      from = val;
      val = true;
    } else {
      iProduct = LoanProducts;
    }
    for (let index = 0; index < iProduct.length; index++) {
      let Items = iProduct[index];
      if (Items["Id"] != -1) {
        let finalPoint = 0,
          finalAmt = 0,
          lenderCompPoint = 0,
          LenderCompAmt = 0;
        finalPoint = Items["FinalPoint"];
        finalAmt = Items["FinalAmt"];
        LenderCompAmt = Items["LenderCompAmt"];
        lenderCompPoint = Items["LenderCompPoints"];

        if (!val || IncludeLenderComp == 0) {
          LenderCompAmt = 0;
          lenderCompPoint = 0;
        }
        let { lenderFinalAmt, LenderFinalPoint, RateChosen } = fnCalcLenderComp(
          finalPoint,
          finalAmt,
          lenderCompPoint,
          LenderCompAmt
        );

        setLoanProducts((PreProducts) => {
          PreProducts[index][
            "RateChosen"
          ] = `${LenderFinalPoint} | ${lenderFinalAmt} ${RateChosen}`;
          PreProducts[index]["IsLenderComp"] = val ? 1 : 0;
          return [...PreProducts];
        });
        // Items["RateChosen"] = `${LenderFinalPoint} | ${lenderFinalAmt} ${RateChosen}`;
      }
    }
    if (from == "PageLoad") {
      setLenderComp(IncludeLenderComp == 1 ? true : false);
    } else {
      setLenderComp(!LenderComp);
      handleUpdateLenderComp(contextDetails["EmpNum"], !LenderComp ? 1 : 0, 1);
      setContextDetails((prevContext) => {
        return {
          ...prevContext,
          UpdateLenderComp: !LenderComp ? 1 : 0,
        };
      });
    }
  };
  const fnCalcLenderComp = (
    finalPoint,
    finalAmt,
    lenderCompPoint,
    LenderCompAmt
  ) => {
    let lenderFinalAmt = 0,
      LenderFinalPoint = 0,
      RateChosen = "Charge";
    if (finalPoint.indexOf("(") != -1) {
      finalPoint = cleanValue(finalPoint, 2);
      finalPoint = `-${finalPoint}`;
    }
    if (finalAmt.indexOf("(") != -1) {
      finalAmt = cleanValue(finalAmt, 2);
      finalAmt = `-${finalAmt}`;
    }
    finalPoint = parseFloat(cleanValue(finalPoint));
    finalAmt = parseFloat(cleanValue(finalAmt));
    lenderFinalAmt = parseFloat(LenderCompAmt) + finalAmt;
    LenderFinalPoint = parseFloat(lenderCompPoint) + finalPoint;
    if (LenderFinalPoint < 0) {
      LenderFinalPoint = LenderFinalPoint.toString().replace("-", "");
      LenderFinalPoint = `(${parseFloat(LenderFinalPoint).toFixed(3)})%`;
      RateChosen = "Credit";
    } else {
      LenderFinalPoint = `${parseFloat(LenderFinalPoint).toFixed(3)}%`;
    }
    lenderFinalAmt = parseFloat(lenderFinalAmt).toFixed(2);
    if (lenderFinalAmt < 0) {
      lenderFinalAmt = formatCurrency(lenderFinalAmt, 1);
    } else {
      lenderFinalAmt = formatCurrency(lenderFinalAmt);
    }
    return {
      LenderFinalPoint,
      lenderFinalAmt,
      RateChosen,
    };
  };
  const handleWorseCase = (
    AllLoanProduct,
    RateBandDetails,
    LnProgActiveId,
    CommonId
  ) => {
    let worsecaseLineIds = AllLoanProduct.filter(
      (e) => e["LnProgActiveId"] == LnProgActiveId
    );
    let worseCaseLineId_1 = 0,
      worseCaseLineId_2 = 0,
      worseCaseDiscount_1 = 0,
      worseCaseDiscount_2 = 0,
      worseCaseRates_1 = [],
      worseCaseRates_2 = [],
      finalWCRates = [],
      omitRate = "";

    if (worsecaseLineIds.length > 1) {
      worseCaseLineId_1 = worsecaseLineIds[0]["LineId"];
      worseCaseLineId_2 = worsecaseLineIds[1]["LineId"];
      worseCaseRates_1 =
        RateBandDetails?.["RateBandsRows"]?.[worseCaseLineId_1] || [];
      worseCaseRates_2 =
        RateBandDetails?.["RateBandsRows"]?.[worseCaseLineId_2] || [];
      worseCaseDiscount_1 =
        RateBandDetails?.["TotalDiscounts"]?.[worseCaseLineId_1] || 0;
      worseCaseDiscount_2 =
        RateBandDetails?.["TotalDiscounts"]?.[worseCaseLineId_2] || 0;
    }
    let AdjustmentJSON_1 =
      RateBands?.[CommonId]?.["NoteRate"]?.[worseCaseLineId_1]?.[
        "NoteRateRow"
      ]?.["AdjustmentJSON"] || "[]";

    let AdjustmentJSON_2 =
      RateBands?.[CommonId]?.["NoteRate"]?.[worseCaseLineId_2]?.[
        "NoteRateRow"
      ]?.["AdjustmentJSON"] || "[]";
    for (let index = 0; index < worseCaseRates_1.length; index++) {
      let Row = "";
      let Point_1 = cleanValue(worseCaseRates_1[index]["BaseAmt"]);
      let Point_2 = cleanValue(
        worseCaseRates_2?.[index]?.["BaseAmt"] || "0.00"
      );
      let NoteRateRow_1 = handleNoteRate(
        JSON.parse(AdjustmentJSON_1 || "[]"),
        worseCaseRates_1[index]["IntRate"]
      );
      let NoteRateRow_2 = handleNoteRate(
        JSON.parse(AdjustmentJSON_2 || "[]"),
        worseCaseRates_1[index]["IntRate"]
      );
      NoteRateRow_1 = NoteRateRow_1 || 0;
      NoteRateRow_2 = NoteRateRow_2 || 0;

      Point_1 =
        parseFloat(Point_1) +
        worseCaseDiscount_1 +
        parseFloat(cleanValue(NoteRateRow_1));

      Point_2 =
        parseFloat(Point_2) +
        worseCaseDiscount_2 +
        parseFloat(cleanValue(NoteRateRow_2));

      if (Point_1 > Point_2) Row = worseCaseRates_1[index];
      else Row = worseCaseRates_2[index];
      // let omitDummyRow = worseCaseRates_1.filter(
      //   (e) => e["IntRate"] == worseCaseRates_1[index]["IntRate"]
      // );
      // if (omitDummyRow.length > 1)
      //   omitRate = worseCaseRates_1[index]["IntRate"];
      finalWCRates.push(Row);
    }
    // finalWCRates = finalWCRates.filter(e => e['IntRate'] !=omitRate && !e['IsDummy'])
    if (worseCaseRates_2.length == 0) finalWCRates = worseCaseRates_1;
    return {
      finalWCRates,
      worseCaseLineId_1,
      worseCaseLineId_2,
    };
  };
  const handleRunAUS = () => {};
  const fnFindNearestInterestRate = (desiredRate, ratesArray) => {
    let nearestRate = null;
    let minDifference = Infinity;
    for (let rateObj of ratesArray) {
      let rate = parseFloat(cleanValue(rateObj.Rate));
      desiredRate = parseFloat(cleanValue(desiredRate));
      let difference = Math.abs(rate - desiredRate);
      if (difference < minDifference && rateObj["Col1"] != "1000.000") {
        minDifference = difference;
        nearestRate = rateObj;
      }
    }
    return nearestRate || [];
  };
  const handleReset = () => {
    handleLoanProducts([]);
    setRawLoanProducts([]);
  };
  // ========================================DEVELOPMENT BLOCK =========================
  function onRenderCallback(
    id, // Profiler ID
    phase, // "mount" (for the initial render) or "update" (for subsequent renders)
    actualDuration, // time spent rendering the committed update
    baseDuration, // estimated time to render the entire subtree without memoization
    startTime, // when React began rendering this update
    commitTime, // when React committed this update
    interactions // the Set of interactions belonging to this update
  ) {
    if (Object.keys(RateBands).length == 0) {
      // console.log("========================================================");
      // console.log(`LoanProductTable: ${actualDuration}`);
      let time = document.getElementById("divUI").innerText;
      let TotalTime = document.getElementById("divProduct").innerText;
      if (time == "") time = 0;
      TotalTime = time - TotalTime;
      document.getElementById("divUI").innerText = (
        (actualDuration + parseFloat(time) * 1000) /
        1000
      ).toFixed(2);
      // console.log("========================================================");
    }
  }
  // ========================================DEVELOPMENT BLOCK =========================

  return (
    <>
      {Data["DataOut"] && (
        <Profiler onRender={onRenderCallback}>
          <LoanProductTable
            LoanProducts={LoanProducts}
            VisibleRateBand={ProductOpen}
            ProductClick={handleLoanProductClick}
            RateBandClick={handleRateBandRowClick}
            LockPeriodChange={handleLockPeriodChange}
            RankByChange={handleRankByChange}
            ActiveRate={ActiveRate}
            RawRateBand={RateBands}
            PaymentDetails={ProductInfo["PaymentDetails"]}
            handleProductInfo={handleProductInfo}
            handleLenderComp={handleLenderComp}
            LenderComp={LenderComp}
            handleRunAUS={handleRunAUS}
            LoanID={contextDetails["LoanId"]}
            handleLock={handleLock}
            handleLoanProducts={setLoanProducts}
            handleReset={handleReset}
          />
        </Profiler>
      )}
    </>
  );
};
export default LoanProducts;
