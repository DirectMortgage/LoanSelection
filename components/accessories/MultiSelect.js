import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, Modal, View } from "react-native";
import CustomText from "./CustomText";
import Icon from "react-native-vector-icons/FontAwesome";
import { web } from "./Platform";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";

const Dropdown = (props) => {
  let {
    label,
    options,
    onSelect,
    placeholder,
    value,
    isMap = false,
    isValid,
    name,
    onFocus = {},
    onBlur = {},
  } = props;
  //   if (value)
  //     value = options.filter(
  //       (state) =>
  //         state["label"].toString().toLowerCase() ===
  //         value.toString().toLowerCase()
  //     )[0]["value"];

  const DropdownButton = useRef();
  const [visible, setVisible] = useState(false);
  const [focus, setFocus] = useState(false);
  const [dropdown, setDropdown] = useState({ top: 0, left: 0 });
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  useEffect(() => {
    value = (value || "").toString()?.split(",") || [];
    value = value.map((num) => Number(num)); //.filter((num) => num !== 0)
    setSelectedItems(value);
  }, [props]);

  const toggleItem = (item) => {
    let selectedItems_ = selectedItems;

    if (selectedItems_.includes(Number(item))) {
      selectedItems_ = selectedItems_.filter(
        (selectedItem) => selectedItem != item
      );
    } else {
      selectedItems_ = [...selectedItems, item];
    }
    // selectedItems_ = selectedItems_.filter((num) => num);

    setSelectedItems(selectedItems_);
   // console.log("selected item", selectedItems_);

    onSelect({ value: selectedItems_.join(",") });
  };

  const handleMouseEnter = (item) => {
    setHoveredItem(item);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const toggleDropdown = () => {
    //console.log("triggered");
    visible ? setVisible(false) : openDropdown();
  };

  const openDropdown = () => {
    DropdownButton.current.measure((_fx, _fy, _w, h, _px, py) => {
      setDropdown({ top: py + (h - 3), left: _px + 0, width: _w - 0 });
    });
    setVisible(true);
  };

  const getFocusProps = () => {
    if (!web)
      return { tabIndex: 1, accessible: true, accessibilityRole: "button" };
    return {};
  };
  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        //  activeOpacity={1}
        style={styles.item}
        onPress={() => toggleItem(item["TypeOption"])}
        onMouseEnter={() => handleMouseEnter(item)}
        onMouseLeave={handleMouseLeave}
      >
        <CustomText
          style={[
            {
              paddingHorizontal: 15,
              paddingVertical: 5,
              fontSize: 12,
              color: "#6c757d",
            },
            item === hoveredItem
              ? // ||
                // (item[isMap ? "label" : "value"] == value && hoveredItem === null)
                { backgroundColor: "#318CE7", color: "#fff" }
              : {},
          ]}
        >
          {item.TypeDesc}
          {selectedItems.includes(
            Number(item["TypeOption"]?.toString().trim())
          ) && (
            <Icon
              name="check"
              size={12}
              color="#6c757d"
              style={{ position: "absolute", right: 10 }}
            />
          )}
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
            },
          ]}
        >
          <CustomText bold={true} style={styles.inputBoxLabel}>
            {label || ""}
          </CustomText>

          <View
            {...getFocusProps()}
            style={[
              styles.inputBox,
              {
                width: "100%",
                marginRight: 10,
                borderWidth: 0,
              },
            ]}
          >
            <Modal visible={visible} transparent animationType="none">
              <TouchableOpacity
                activeOpacity={1}
                style={styles.overlay}
                onPress={() => setVisible(false)}
              >
                <View
                  style={[
                    styles.dropdown,
                    {
                      top: dropdown["top"],
                      left: dropdown["left"],
                      width: dropdown["width"],
                    },
                    dropdown["top"] === 0 &&
                      dropdown["left"] === 0 && { zIndex: -11111 },
                    web ? { overflow: "auto", maxHeight: 300 } : {},
                  ]}
                >
                  <KeyboardAwareFlatList
                    data={options}
                    renderItem={renderItem}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        </View>
      </View>
    );
  };
  const getLabelByValue = (value) => {
    const option = options.find((item) => item.TypeOption == value);
    return option ? option.TypeDesc : "";
  };
  const getSelectedText = () => {
    let text = [];
    selectedItems.forEach((item, index) => text.push(getLabelByValue(item)));
    text = text.filter((item) => item);
    if (text.length === 0) return name == "Product Type" ? "All" : ""; //"Nothing selected";
    return text.join(", ");
  };
  const fnFocus = () => {
    setFocus(true);
  };
  return (
    <TouchableOpacity
      activeOpacity={1}
      tabIndex={1}
      ref={DropdownButton}
      style={[
        styles.button,
        {
          borderColor: isValid ? "red"  : "silver",
          borderWidth: isValid ? 2  : 0,
        },
      ]}
      onPress={toggleDropdown}
      onFocus={fnFocus}
      // {...props}
    >
      {renderDropdown()}
      <CustomText style={styles.buttonText}>
        <CustomText
          style={[
            {
              maxWidth: "100%",
              overflow: "hidden",
              color: "#51575d",
            },
            web && {
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
              left: 6,
            },
          ]}
        >
          {getSelectedText()}
        </CustomText>
      </CustomText>
      <Icon
        style={styles.icon}
        name={`chevron-${visible ? "up" : "down"}`}
        size={11}
        color="#6c757d"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
    borderWidth: 1,
  },
  buttonText: [
    {
      flex: 1,
      color: "#6c757d",
      textAlign: "left",
      position: "absolute",
      // top: 20,
      //left: 15,
      maxWidth: "89%",
      minWidth: "89%",
      overflow: "hidden",
      fontSize: 12,
      borderWidth: 0,
    },
    web && {
      whiteSpace: "nowrap",
      display: "inline-block",
      textOverflow: "ellipsis",
    },
  ],
  icon: {
    right: 4,
    top: 10,
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
  },
  item: {
    // borderBottomWidth: 1,
    // borderBottomColor: "rgba(0,0,0,.04)",
  },
  inputBoxContainer: {
    flexDirection: "row",
    borderColor: "gray",
    // borderWidth: 1,
    padding: 10,
  },
  inputBoxLabel: {
    position: "absolute",
    backgroundColor: "#fff",
    top: -12,
    left: 3,
    fontSize: 14,
    color: "gray",
    paddingHorizontal: 3,
  },
  inputBox: {
    ...{
      borderWidth: 0,
      borderRadius: 5,
      fontSize: web ? 12 : 16,
      backgroundColor: "inherit",
      color: "#51575d",
      width: "100%",
      padding: 5,
    },
  },
});

export default Dropdown;
