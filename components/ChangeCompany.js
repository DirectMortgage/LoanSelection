import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Button, InputBox } from "./accessories/CommomComponents";
import Icon from "react-native-vector-icons/FontAwesome";
import CustomText from "./accessories/CustomText";

const ChangeCompany = (props) => {
  const btnRefSearch = useRef(null);
  let { Visible, handleSearch } = props;
  const [value, setValue] = useState("");
  const translateY = useSharedValue(-300);

  const handleKeyDown = (event) => {
    if ( event.keyCode === 13) {
      event.preventDefault(); // Prevent scrolling the page when space bar is pressed
    
        btnRefSearch.current.click();
      
    }
  };

  return (
    <View  style={styles.container}>
      {/* <TouchableOpacity onPress={openModal}>
        <Text style={styles.openButton}>Change Company</Text>
      </TouchableOpacity> */}

      <Modal
        transparent={true}
        visible={Visible}
        //onRequestClose={closeModal}
      >
        <Animated.View
          style={[
            styles.centeredView,
            { transform: [{ translateY: translateY }] },
          ]}
        >
          <View style={styles.modalView} >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 15,
                borderBottomWidth: 1,
                borderBottomColor: "#eeeeee",
              }}
            >
              <Text style={styles.modalText}>Company & Loan Officer Search</Text>

              <Icon
                name="close"
                size={18}
                color="black"
                onPress={() => {
                  handleSearch("Modal", false);
                  setValue("");
                }}
              />
            </View>
            <View  style={styles.SearchBox} >
              <InputBox
                style={styles.InputBox}
                name={""}
                placeholder={"Search Criteria"}
                onChangeText={(text) => setValue(text)}
                value={value}
                onKeyPress={handleKeyDown}
              />

              <Button
              forwardedRef={btnRefSearch}
                title={
                  <CustomText
                    style={{
                      color: "#FFFFF",
                      fontSize: 11,
                      fontWeight: 200,
                    }}
                  >
                    Search
                  </CustomText>
                }
                style={[
                  styles["btn"],
                  {
                    borderRadius: 3,
                    marginBottom: 7,
                    paddingVertical: 11,
                    paddingHorizontal: 10,
                  },
                ]}
                onPress={() => {
                  handleSearch("Search", value);
                  setValue("");
                }}
              />
            </View>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3c40455e",
  },
  openButton: {
    color: "#428bca",
    fontSize: 14,
    fontWeight: 400,
  },
  centeredView: {
    flex: 1,
    //justifyContent: "center",
    alignItems: "center",
    marginTop:250
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 6,
    top: 240,
    width: 330,
    height: 149,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 9,
  },
  modalText: {
    fontSize: 18,
    color: "#333333",
    fontWeight: 500,
  },
  close_icon: {
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  SearchBox: {
    flexDirection: "row",
    margin: 15,
    width: "71%",
    // height: 46,
    borderWidth: 1,
    backgroundColor: "white",

    borderColor: "#eeeeee",
  },
  search_icon: {
    width: 18,
    height: 18,
  },
  InputBox: {
    width: 208,
    fontSize: 18,
    height: 46,
    color: "#858585",
    borderWidth: 1,
    borderColor: "#0000",
  },
  btn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignSelf: "flex-end",
    fontSize: 12,
    justifyContent: "center",
  },
});

export default ChangeCompany;
