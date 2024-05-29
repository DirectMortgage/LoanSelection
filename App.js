import { StyleSheet, Text, View } from "react-native";
import * as Font from "expo-font";
import LoanSelection from "./components/LoanSelection";
import { context } from "./components/accessories/CommonFunctions";
import { useEffect, useState } from "react";
 import Dev from './components/accessories/Dev'

export default function App() {
  const [contextDetails, setContextDetails] = useState({});
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const loadFont = async () => {
    await Font.loadAsync({
      OpenSansRegular: require("./assets/fonts/OpenSansRegular.ttf"),
      OpenSansBold: require("./assets/fonts/OpenSansBold.ttf"),
      OpenSemiBold: require("./assets/fonts/OpenSans-SemiBold.ttf"),
      InterBold: require("./assets/fonts/Inter-Bold.ttf"),
      Inter: require("./assets/fonts/Inter-Regular.ttf"),
    });
    setFontsLoaded(true);
  };
  useEffect(() => {
    const styleElement = document.createElement("style");

    styleElement.innerHTML = `#gridFields:focus-visible {
      outline: none !important;
  }
  div[data-testid="gridFields"] select{
    appearance: none;
    padding-right: 20px;
  }
  `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  useEffect(() => {
    loadFont();
  }, []);
  return (
    <context.Provider value={{ contextDetails, setContextDetails }}>
      <View style={styles.container}>
        <LoanSelection />
        {/* <Dev/> */}
      </View>
    </context.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
});

/*
Root map for which functionalities in which Component

1. Menu 
    1. PQ Loan
        1. FNM 3.2 file import
        2. Use Last Run
        3. Start with Fresh Run
        4. Loan Prospect
        5. Creating New Scenario from Existing Loan
        6. Get Title Pricing
        7. Initial Fee Worksheet
        8. Setting
        9. Save window size and position
        
2. Change Company
3. Create Loan - NA
4. Add Borrower
5. Searching Fields
    1. Getting dropdown options
    2. Show/Hide based on the values
    3. TBD
6. Loan Program Search
    1. Saving details
    2. Searching Products
7. Loan Products
    1. Lender Comp
    2. Product on click
    3. APR
    4. View PITI
    5. Monthly Payment
    6. Rate Chosen
    7. Rate Band
        1. Lock Period dropdown
        2. Rank by dropdown
        3. Run AUS
        4. Guidelines
        5. Rate band selection
        6. Adjustment modal
        7. Rank modal
        8. Showing Addons
        9. Showing Lender comp
        10. Rate calculation
        11. Lock Rate
          1. PQ
            1. Create Loan and Lock Rate
              1. Borrower information
              2. Create a loan
              3. Locking Rate
            2. Create Loan Float Rate
              1. Borrower information
              2. Create a loan
*/
