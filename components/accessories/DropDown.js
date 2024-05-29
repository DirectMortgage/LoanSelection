import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Modal,
  View,
  Keyboard,
  Dimensions,
} from "react-native";
import CustomText from "./CustomText";
import Icon from "react-native-vector-icons/Entypo";
import { web, android } from "./Platform";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import { Dropdown } from "react-native-element-dropdown/src/index.tsx";

const Dropdown_ = (props) => {
  let {
    label,
    options,
    onSelect,
    placeholder = "",
    value = null,
    isMap,
    isValid = false,
    disabled = false,
    isSearchable = false,
    width = "100%",
    KeyName
  } = props;
  try {
    if (value) {
      // console.log(label, options, value);
      value = options.filter(
        (state) =>
          state[isMap ? "value" : "label"].toString().toLowerCase() ===
          value?.toString().toLowerCase()
      )[0][isMap ? "value" : "label"];
    }
  } catch (error) {
    // console.log("Error form DropDown ====> ", error);
  }
  // console.log(label, value, options);
  const [isFocus, setIsFocus] = useState(false);
  const DropdownButton = useRef();
  const [visible, setVisible] = useState(false);
  const [dropdown, setDropdown] = useState({ top: 0, left: 0, opacity: 0 });

  const toggleDropdown = () => {
    visible ? setVisible(false) : openDropdown();
  };

  const openDropdown = () => {
    Keyboard.dismiss();
    DropdownButton.current.measure((_fx, _fy, _w, h, _px, py) => {
      setDropdown({
        top: py, //+ h - (android ? 55 : 30),
        left: _px + 15,
        width: _w - 30,
        opacity: 1,
      });
    });
    setVisible(true);
  };

  const onItemPress = (item) => {
    setVisible(false);
    onSelect(item);
  };

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={styles.item}
        onPress={() => onItemPress(item)}
      >
        <CustomText
          style={[
            {
              paddingHorizontal: 15,
              paddingVertical: 5,
            },

            item[isMap ? "label" : "value"] == value
              ? { backgroundColor: "#318CE7", color: "#fff" }
              : {},
          ]}
        >
          {item.label}
        </CustomText>
      </TouchableOpacity>
    );
  };

  const renderDropdown = () => {
    return (
      <View style={{ flex: 1, flexDirection: "row" }}>
        <View
          style={[
            styles.inputBoxContainer,
            {
              borderColor: "gray",
              width: "100%",
              borderColor:
                isValid && ["", 0, null, undefined, "0"].includes(value)
                  ? "red"
                  : "silver",
              marginBottom: label !== "Loan Officer" ? 20 : 0,
            },
          ]}
          ref={DropdownButton}
        >
          <CustomText bold={true} style={styles.inputBoxLabel}>
            {label || ""}
          </CustomText>
          {web ? (
            <>
              <select
                disabled={disabled}
                style={{ ...styles.inputBox, ...{ height: label ? 35 : 25 } }}
                value={value || ""}
                onChange={(e) => {
                  let { value, label = e.target.selectedOptions[0].text } =
                    e.target;
                  onSelect({ value });
                }}
              >
                {KeyName == "TypeDesc" ? (
                  <>
                    {options?.map((item, index) => (
                      <option key={index} value={item["TypeOption"]}>
                        {item["TypeDesc"]}
                      </option>
                    ))}
                  </>
                ) : (
                  <>
                    {options.map((item, index) => (
                      <option
                        key={index}
                        style={{ fontSize: 12 }}
                        value={item["value"]}
                      >
                        {item["label"]}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </>
          ) : (
            <>
              <Dropdown
                onFocus={() => {
                  openDropdown();
                }}
                style={[styles.dropdown]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={options}
                labelField="label"
                valueField="value"
                dropdownPosition={
                  Dimensions.get("window").height - 300 < dropdown.top
                    ? "top"
                    : "bottom"
                }
                itemTextStyle={{
                  marginVertical: -10,
                  color: "#000",
                  fontSize: 14,
                }}
                activeColor="#0000000f"
                autoScroll={false}
                maxHeight={300}
                value={value}
                onChange={(item) => {
                  toggleDropdown();
                  // debugger;
                  log("item", item);
                  onSelect(item);
                }}
                renderRightIconIcon={() => (
                  <Icon
                    style={styles.icon}
                    size={17}
                    name={`chevron-${visible ? "up" : "down"}`}
                  />
                )}
              />
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity
      tabIndex={"-1"}
      activeOpacity={1}
      // ref={DropdownButton}
      style={[styles.button, { width }]}
      onPress={() => {
        if (!disabled) toggleDropdown();
      }}
    >
      {renderDropdown()}
      {/* {!web && (
        <>
          <CustomText style={styles.buttonText}>
            {value || placeholder}
          </CustomText>
          <Icon
            style={styles.icon}
            size={17}
            name={`chevron-${visible ? "up" : "down"}`}
          />
        </>
      )} */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  buttonText: {
    flex: 1,
    color: "rgb(81, 87, 93)",
    textAlign: "center",
    textAlign: "left",
    position: "absolute",
    top: 20,
    left: 15,
  },
  icon: {
    right: 20,
    top: 22,
    position: "absolute",
  },
  dropdown: {
    position: "absolute",
    backgroundColor: "#fff",
    width: 350,
    // shadowColor: "#000000",
    // shadowRadius: 4,
    // shadowOffset: { height: 4, width: 0 },
    // shadowOpacity: 0.5,
    borderWidth: 1,
    borderColor: "#999",
  },
  overlay: {
    width: "100%",
    height: "100%",
    borderWidth: 2,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,.04)",
  },
  inputBoxContainer: {
    flexDirection: "row",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    padding: 3,
    marginBottom: 20,
  },
  inputBoxLabel: {
    position: "absolute",
    backgroundColor: "#fff",
    top: -12,
    left: 3,
    fontSize: 12,
    color: "gray",
    paddingHorizontal: 3,
  },
  inputBox: {
    ...{
      borderWidth: 0,
      borderRadius: 5,
      fontSize: web ? 12 : 16,
      backgroundColor: "rgba(0,0,0,.04)",
      color: "#51575d",
      width: "100%",
      padding: 3,
      height: 31,
    },
  },

  dropdown: {
    height: 33,
    borderRadius: 5,
    paddingHorizontal: 8,
    width: "100%",
    backgroundColor: "#0000000a",
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 12,
  },
  placeholderStyle: {
    fontSize: 12,
    color: "#4b4949",
  },
  selectedTextStyle: {
    fontSize: 12,
    color: "#4b4949",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});

export default Dropdown_;
