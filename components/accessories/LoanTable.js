import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Picker,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Button } from "./CommomComponents";
import CustomText from "./CustomText";
// import CustomText from "./accessories/CustomText";

const LoanTable = ({ data, handleSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCells, setVisibleCells] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const handleFilter = (query) => {
    setSearchQuery(query);
  };

  const handleDropdownChange = (value) => {
    setVisibleCells(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderTableHeader = () => {
    return (
      <View style={styles.row}>
        <Text style={[styles.cell, styles.headerCell3]}>Select</Text>
        <Text style={[styles.cell, styles.headerCell1]}>Borrower</Text>
        <Text style={[styles.cell, styles.headerCell2]}>Property Address</Text>
        <Text style={[styles.cell, styles.headerCell4]}>Loan($)</Text>
        <Text style={[styles.cell, styles.headerCell5]}>Company</Text>
        <Text style={[styles.cell, styles.headerCell6]}>Status</Text>
      </View>
    );
  };

  const renderTableRow = ({ item }) => {
    return (
      <View
        style={[
          styles.row,
          { backgroundColor: parseInt(item.id) % 2 === 0 ? "red" : "yellow" },
        ]}
      >
        <Text
          style={styles.cell_3}
          onPress={() => {
            handleSelect("Select", item.LoanId);
          }}
        >
          {`${item.LoanId}`}
        </Text>
        <Text style={styles.cell_1}>{`${item.Customer1}`}</Text>
        <Text style={styles.cell_2}>{item.CustAddress}</Text>

        <Text style={styles.cell_4}>{item.LoanAmt}</Text>
        <Text style={styles.cell_5}>{`${item.UserName}`}</Text>
        <Text style={[styles.cell, styles.cell_6]}>{item.WorkflowStatus}</Text>
      </View>
    );
  };

  const totalPages = Math.ceil(data.length);
  const startIdx = (currentPage - 1) * visibleCells;
  const endIdx = startIdx + visibleCells;

  return (
    <View
      style={{
        alignSelf: "center",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 9,
        width: "100%",
        height: "100vh",
        alignItems: "center",
        backgroundColor: "#00000087",
      }}
    >
      <View style={{ width: 550, backgroundColor: "white", marginTop: 20 }}>
        <View
          style={{
            width: 550,
            height: 50,
            backgroundColor: "#428BCA",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems:'center'
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={{ color: "white", fontSize: 19, margin: 10 }}>
              Search results
            </Text>
            <Icon
              // style={{ width: 12, height: 12, margin: 5 }}
              name="search"
              size={20}
              color="white"
            />
          </View>
          <TouchableOpacity>
            {/* <Image
              style={{ width: 12, height: 12, margin: 5 }}
              source={require("../assets/close.png")}
            /> */}
            <Icon
              style={{ marginRight: 5 }}
              name="close"
              size={20}
              color="white"
              onPress={() => {
                handleSelect("Table", false);
                //setValue('')
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Filter and Dropdown Section */}
        <View
          style={{
            backgroundColor: "#EFF3F8",
            width: 550,
            height:'auto',
            maxHeight: "80vh",
            alignSelf: "center",
            overflowX: "hidden",
            overflowY: "auto",
          }}
        >
          <View style={styles.container}>
            <View style={styles.dropdownContainer}>
              <Text style={styles.label}>Display</Text>
              <Picker
                selectedValue={visibleCells}
                style={styles.dropdown}
                onValueChange={handleDropdownChange}
              >
                {[10, 25, 50, 100].map((value) => (
                  <Picker.Item
                    key={value}
                    label={value.toString()}
                    value={value}
                  />
                ))}
              </Picker>
              <Text style={styles.label}>records</Text>
            </View>
            <View style={styles.filterbox}>
              <Text style={styles.label}>Filter :</Text>
              <TextInput
                style={styles.input}
                value={searchQuery}
                onChangeText={handleFilter}
              />
            </View>
          </View>

          {/* Pagination Controls */}

          {renderTableHeader()}
          <ScrollView showsVerticalScrollIndicator={false}>
            {data
              // .slice(startIdx, endIdx)
              .filter((item) =>
                Object.values(item).some((value) =>
                  String(value)
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
              )
              .map((item) => renderTableRow({ item }))}
          </ScrollView>

          {/* pagination */}
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              onPress={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <Text style={styles.paginationText}>
                Showing {currentPage} to {totalPages} of {totalPages} entries
              </Text>
            </TouchableOpacity>
            <View
              style={{
                flexDirection: "row",
                marginTop: 6,
                left: -60,
              }}
            >
              <TouchableOpacity
                onPress={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === totalPages}
              >
                {/* <Image
                  style={{ width: 30, height: 30 }}
                  source={require("../assets/previous.png")}
                /> */}
              </TouchableOpacity>
              <Text
                style={{
                  width: 30,
                  height: 30,
                  backgroundColor: "#428BCA",
                  color: "white",
                  textAlign: "center",
                  paddingTop: 5,
                }}
              >
                {currentPage}
              </Text>
              <TouchableOpacity
                onPress={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                {/* <Image
                  style={{ width: 30, height: 30 }}
                  source={require("../assets/next.png")}
                /> */}
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={[
              styles.filterContainer,
              {
                backgroundColor: "#e5e5e5",
                justifyContent: "flex-end",
                height: 70,
              },
            ]}
          >
            <Button
              title={
                <CustomText style={{ color: "#FFFFF", fontSize: 11 }}>
                  Close
                </CustomText>
              }
              style={{
                paddingVertical: 11,
                paddingHorizontal: 20,
                fontSize: 10,
                backgroundColor: "#428bca",
              }}
              onPress={() => {
                handleSelect("Table", false);
                //setValue('')
              }}
            ></Button>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  filterbox: {
    flexDirection: "row",
    gap: 10,
    width: 300,
    marginLeft: 40,
    marginTop: 15,
  },
  label: {
    fontSize: 14,
    marginTop: 5,
  },
  input: {
    backgroundColor: "white",
    height: 26,
    width: 150,
    marginBottom: 16,
    paddingLeft: 8,
  },
  dropdownContainer: {
    flexDirection: "row",
    gap: 10,
    width: 200,
    marginTop: 15,
    marginLeft: 20,
  },
  dropdown: {
    height: 26,
    width: 70,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#F9F9F9",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  cell: {
    flex: 1,
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    maxHeight: 200,
    padding: 8,
    minWidth: 70,
    marginBottom: -8,
    backgroundColor: "#F9F9F9",
  },
  cell_1: {
    flex: 1,
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    maxHeight: 200,
    padding: 8,
    minWidth: 82,
    marginBottom: -8,
    backgroundColor: "#F9F9F9",
  },
  cell_2: {
    flex: 1,
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    maxHeight: 200,
    padding: 8,
    minWidth: 82,
    marginBottom: -8,
    backgroundColor: "#F9F9F9",
  },
  cell_3: {
    flex: 1,
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    maxHeight: 200,
    padding: 8,
    minWidth: 70,
    marginBottom: -8,
    backgroundColor: "#F9F9F9",
    textDecoration: "underline",
    color: "#428bca",
  },
  cell_4: {
    flex: 1,
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    maxHeight: 200,
    padding: 8,
    minWidth: 85,
    marginBottom: -8,
    backgroundColor: "#F9F9F9",
  },
  cell_5: {
    flex: 1,
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    maxHeight: 200,
    padding: 8,
    minWidth: 80,
    marginBottom: -8,
    backgroundColor: "#F9F9F9",
  },
  cell_6: {
    fontSize: 13,
    textAlign: "center",
    paddingTop: 40,
  },

  headerCell1: {
    paddingTop: 20,
    fontSize: 14,
    fontWeight: "bold",
    minWidth: 82,
    height: 100,
    backgroundColor: "#F5F5F5",
    color: "#rgb(112, 112, 112)",
  },
  headerCell2: {
    paddingTop: 20,
    fontSize: 14,
    fontWeight: "bold",
    minWidth: 82,
    height: 100,
    backgroundColor: "#F5F5F5",
    color: "#rgb(112, 112, 112)",
  },
  headerCell3: {
    paddingTop: 20,
    fontSize: 14,
    fontWeight: "bold",
    minWidth: 70,
    height: 100,
    backgroundColor: "#F5F5F5",
    color: "#rgb(112, 112, 112)",
  },
  headerCell4: {
    paddingTop: 20,
    fontSize: 14,
    fontWeight: "bold",
    minWidth: 85,
    height: 100,
    backgroundColor: "#F5F5F5",
    color: "#rgb(112, 112, 112)",
  },
  headerCell5: {
    paddingTop: 20,
    fontSize: 14,
    fontWeight: "bold",
    minWidth: 80,
    height: 100,
    backgroundColor: "#F5F5F5",
    color: "#rgb(112, 112, 112)",
  },
  headerCell6: {
    paddingTop: 20,
    fontSize: 14,
    fontWeight: "bold",
    minWidth: 70,
    height: 100,
    backgroundColor: "#F5F5F5",
    color: "#rgb(112, 112, 112)",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    left: 30,
  },
  paginationText: {
    color: "#black",
    marginTop: 10,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#428BCA",
    padding: 10,
    // borderTopRightRadius: 5,
    // borderTopLeftRadius: 5,
    height: 50,
  },
});

export default LoanTable;
