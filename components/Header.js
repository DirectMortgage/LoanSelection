import { StyleSheet, View } from "react-native";
import CustomText from "./accessories/CustomText";
import { Button, DMCImage } from "./accessories/CommomComponents";
import { context } from "./accessories/CommonFunctions";
import { useContext } from "react";
import { LinearGradient } from "expo-linear-gradient";
const Header = (props) => {
  let { name, icon } = props;
  const { contextDetails, setContextDetails } = useContext(context); //Get value from context

  return (
    // <View style={[styles.headerBackground, { color: "white" }]}>
    //   {contextDetails["IsLocked"] == 0 ||
    //   contextDetails["ChangeRate"] ||
    //   contextDetails["FloatDown"] ||
    //   contextDetails["ChangeLoanProgram"] ? (
    //     <View>
    //       <DMCImage />
    //     </View>
    //   ) : (
    //     <></>
    //   )}
    //   <CustomText bold={true} style={[styles.headerText, { color: "white" }]}>
    //     {contextDetails["IsLocked"] == 0 ||
    //     contextDetails["ChangeRate"] ||
    //     contextDetails["FloatDown"] ||
    //     contextDetails["ChangeLoanProgram"]
    //       ? `Rate Lock and Loan Selection Form`
    //       : contextDetails["IsLocked"] == 1
    //       ? `Interest Rate Lock Confirmation (Loan ${contextDetails["LoanId"]})`
    //       : `Loading...`}
    //   </CustomText>
    // </View>
    <LinearGradient
      colors={["#4680e1", "#386cc3", "#386CC3"]}
      start={{ x: 0.0, y: 0.25 }}
      end={{ x: 0.5, y: 1.0 }}
      style={{
        alignItems: "center",
        justifyContent: "space-evenly",
        width: "100%",
        padding:20
      }}
    >
      <View style={{ flexDirection: "row",alignItems:'baseline',justifyContent:'space-between',width:'100%' }}>
        <View>
          <CustomText style={{fontSize:27,color:'#fff'}} bold={true}>Price a Scenario</CustomText>
        </View>
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
              backgroundColor:'#E8E8E8'
            },
          ]}
          onPress={() => {
            // handleMenu();
            // handleMenuOpen();
          }}
        />
      </View>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
  headerText: {
    fontSize: 24,
    textAlign: "center",
  },
  headerBackground: {
    flexDirection: "row",
    backgroundColor: "#0d6ac5",
    width: "100%",
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "6px 6px 5px -2px rgba(43,43,43,1)",
  },
  btn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignSelf: "flex-end",
    fontSize: 12,
    justifyContent: "center",
  },
  cardShadow: {
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
});
export default Header;
