import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import CustomText from "./CustomText";
import { Image } from "react-native-web";
import { Button } from "./CommomComponents";

const MenuDropDown = (props) => {
  const { listOption, MenuPosition, children, Open, handleOpen } = props;

  return (
    <>
      <Modal visible={Open} transparent animationType="none">
        <TouchableOpacity
          activeOpacity={1}
          style={{ width: "100%", height: "100%" }}
          onPress={(event) => {
            if (event.target.tagName !== "INPUT") handleOpen();
          }}
        >
          <View
            style={[
              {
                backgroundColor: "#fff",
                position: "absolute",
                width: "auto",
                borderColor: "#d3dadf",
                borderWidth: 1,
                borderRadius: 5,
                boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
                width:270
              },
              MenuPosition,
            ]}
          >
            {listOption.map((item, index) => (
              <>
                <View
                  key={index}
                  style={[
                    styles.menuOption,
                    {
                      display: item["show"] == false ? "none" : "flex",
                    },
                  ]}
                >
                  <View
                    style={{
                      paddingVertical: 12,
                      gap: 15,
                      paddingHorizontal: 20,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    {item["icon"] != false && (
                      <>
                        <Image
                          style={{
                            height: 18,
                            width: 18,
                          }}
                          resizeMode="contain"
                          source={require(`../../assets/${item["icon"]}.svg`)}
                        />

                        <CustomText
                          key={index}
                          onPress={item["onPress"]}
                          style={{ fontSize: 12 }}
                        >
                          {item["Name"]}
                        </CustomText>
                      </>
                    )}
                  </View>
                  {item["isLast"] == true && (
                    <View
                      style={{
                        borderColor: "#c6c6c6",
                        marginHorizontal: 15,
                        marginVertical: 15,
                        marginBottom: 0,
                        borderBottomWidth: 1,
                      }}
                    ></View>
                  )}
                </View>
              </>
            ))}
            <View style={{ marginVertical: 18, alignSelf: "center" }}>
              <Button
                title={
                  <CustomText
                    style={{ color: "#FFFFF", fontSize: 11, fontWeight: 200 }}
                  >
                    Edit Rights: Allowed
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  styles["cardShadow"],
                  {
                    borderRadius: 3,
                    paddingVertical: 8,
                    paddingHorizontal: 15,
                    backgroundColor: "#88AB35",
                  },
                ]}
                onPress={() => {
                  //   handleMenu();
                  //   handleMenuOpen();
                }}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};
const styles = StyleSheet.create({
  menuOption: {
    fontSize: 11,
    borderBottomWidth: 0,
    borderColor: "#cccccc",
    color: "#333333",
  },
  cardShadow: {
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  btn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignSelf: "flex-end",
    fontSize: 12,
    justifyContent: "center",
  },
});

export default MenuDropDown;
