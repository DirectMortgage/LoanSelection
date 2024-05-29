import React, { useEffect, useState } from "react";
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
import FontAwesome from "react-native-vector-icons/FontAwesome";
import CustomText from "../accessories/CustomText";
import { Button } from "../accessories/CommomComponents";
import { Modal } from "react-native-web";

const AddressValidation = ({ Result, handleAddress }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCells, setVisibleCells] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [data, setData] = useState(Result);
  useEffect(() => {
    setData(Result);
  }, []);
  const handleFilter = (query) => {
    setSearchQuery(query);
    filterData(query);
  };

  const filterData = (query) => {
    const filteredData = data.filter(
      (item) =>
        item.CompName?.toLowerCase().includes(query.toLowerCase()) ||
        //item.UserNum.toLowerCase().includes(query.toLowerCase()) ||
        //item.LicenseNum.toLowerCase().includes(query.toLowerCase()) ||
        item.UserContact?.toLowerCase().includes(query.toLowerCase()) ||
        item.CompAdd1?.toLowerCase().includes(query.toLowerCase()) ||
        item.CompCity?.toLowerCase().includes(query.toLowerCase()) ||
        item.CompContact?.toLowerCase().includes(query.toLowerCase()) ||
        item.CompEmail?.toLowerCase().includes(query.toLowerCase()) ||
        item.AccountExec?.toLowerCase().includes(query.toLowerCase())
      // item.CompZip.toLowerCase().includes(query.toLowerCase()) ||
      //item.Select.toLowerCase().includes(query.toLowerCase()) ||
      // item.CompPhone.toLowerCase().includes(query.toLowerCase()       )
    );
    setData(filteredData);
  };

  const handleDropdownChange = (value) => {
    setVisibleCells(value);
    setCurrentPage(1);
    setRecordsPerPage(parseInt(value, 10));
  };

 

  let lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  lastIndex = lastIndex >= data.length ? data.length : lastIndex;
  // const records = data.slice(firstIndex, lastIndex);
  const npage = Math.ceil(data.length / recordsPerPage);
  const numbers = Array.from({ length: npage }, (_, i) => i + 1);

  const prePage = () => {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const changeCpage = (id) => {
    setCurrentPage(id);
  };

  const nextPage = () => {
    if (currentPage !== npage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const renderTableHeader = () => {
    return (
      <View style={styles.row}>
        <CustomText style={[styles.cell,{width:'30%',color:'#000'}]}>Select</CustomText>
        <CustomText style={[styles.cell,{width:'50%',color:'#000'}]}>Property Address</CustomText>
        <CustomText style={[styles.cell,{width:'20%',color:'#000'}]}>zip Code</CustomText>
      </View>
    );
  };

  const renderTableRow = (item) => {
    return (
      <View style={styles.row} key={item.id}>
        <View style={[styles.cell,{width:'30%'}]}>
          <Button
            title={
              <CustomText style={{ color: "#FFFFF", fontSize: 11,fontWeight:200 }}>
                Use This Address
              </CustomText>
            }
            style={{
              padding: 11,
              fontSize: 10,
              backgroundColor: "#428bca",
            }}
            onPress={() => {
              handleAddress("Select", item);
            }}
          ></Button>
        </View>
        <CustomText style={[styles.cell,{width:'50%',fontSize:12}]}>{item.PropertyAddress}</CustomText>
        <CustomText style={[styles.cell,{width:'20%',fontSize:12}]}>{item.Zip}</CustomText>
        
        
      </View>
    );
  };

  const renderTable = () => {
    if (data.length === 0) {
      return (
        <View
          style={{
            alignItems: "center",
            padding: 20,
            backgroundColor: "white",
            width: "100%",
            height: "auto",
          }}
        >
          <Text>No records found</Text>
        </View>
      );
    }

    return (
      <View style={styles.tableContainer}>
        {renderTableHeader()}
        {data.slice(firstIndex, lastIndex).map((item) => renderTableRow(item))}
      </View>
    );
  };

  return (
    <ScrollView>
      <View
        style={{
          
          width: "100%",
          height: "100vh",
         
          alignItems: "center",
          //backgroundColor: "#00000087",
        }}
      >
        <Modal transparent={true} visible={true}>
        <View style={styles.container}>
          {/* <View style={{width:560}}> */}
          <View style={styles.filterContainer}>
            <View
              style={{ flexDirection: "row", gap: 10, alignItems: "baseline" }}
            >
              <Text style={styles.label1}>Address Selection</Text>
              <FontAwesome name="search" size={20} color="white" />
            </View>

            <TouchableOpacity>
              <FontAwesome
                name="close"
                size={20}
                color="white"
                onPress={() => {
                  handleAddress("Table", false);
                  //setValue('')
                }}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              backgroundColor: "#EFF3F8",
              width: 550,
              height: "auto",
              alignSelf: "center",
            }}
          >
            <View style={styles.filterDropdownContainer}>
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
              <View style={styles.searchBox}>
                <Text>Filter:</Text>
                <TextInput
                  style={styles.input}
                  value={searchQuery}
                  onChangeText={handleFilter}
                />
              </View>
            </View>

            {renderTable()}

            <View>
              <View style={styles.paginationContainer}>
                <View>
                  <Text style={styles.paginationText}>
                    Showing {firstIndex + 1} to {lastIndex} of {data.length}{" "}
                    entries
                  </Text>
                </View>
                <View style={styles.paginationControls}>
                  <TouchableOpacity onPress={prePage}>
                    <FontAwesome
                      name="angle-double-left"
                      size={24}
                      color="grey"
                      style={{
                        paddingVertical: 5,
                        paddingHorizontal: 10,
                        backgroundColor: "white",
                        borderWidth: 1,
                        borderColor: "#DDDDDD",
                        textAlign: "center",
                      }}
                    />
                  </TouchableOpacity>
                  {numbers.map((num) => (
                    <TouchableOpacity
                      key={num}
                      onPress={() => changeCpage(num)}
                      style={{
                        backgroundColor:
                          currentPage === num ? "#428BCA" : "white",
                      }}
                    >
                      <Text
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 15,
                          color: currentPage === num ? "white" : "#428BCA",
                          gap: 5,
                          fontSize: 14,
                          textAlign: "center",
                        }}
                      >
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity onPress={nextPage}>
                    <FontAwesome
                      name="angle-double-right"
                      size={24}
                      color="grey"
                      style={{
                        paddingVertical: 5,
                        paddingHorizontal: 10,
                        backgroundColor: "white",
                        textAlign: "center",
                        borderWidth: 1,
                        borderColor: "#DDDDDD",
                        marginRight: 5,
                      }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
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
                handleAddress("Table", false);
                //setValue('')
              }}
            ></Button>
          </View>
          {/* </View> */}
        </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#00000087",
     width:590,
     alignSelf:'center',
    paddingHorizontal: 20,
   // marginTop: 30,
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
  filterDropdownContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",

    padding: 10,
  },
  label1: {
    color: "white",
    fontSize: 19,
  },
  label: {
    color: "black",
    fontSize: 14,
    marginLeft: 10,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 5,
    gap: 5,
    padding: 5,
  },

  input: {
    flex: 1,
    backgroundColor: "white",
    padding: 4,
  },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropdown: {
    height: 30,
    width: 60,
    marginLeft: 5,
  },
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },
  paginationText: {
    fontSize: 14,
    flexDirection: "row",
    marginLeft: 20,
  },
  tableContainer: {
    flexDirection: "column",
    marginTop: 10,
    marginBottom: 10,
    maxHeight: "60vh",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    overflowY: "auto",
    overflowX: "hidden",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    height: "auto",
  },
  cell: {
    flex: 1,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#c7c1c1",
  },
 
  cell_6: {
    fontSize: 18,
    borderColor: "#DDDDDD",
    paddingTop: 18,
    minWidth: 56,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    marginBottom: -8,
    backgroundColor: "#F9F9F9",
    // minHeight: 200,
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
    minWidth: 86,
    height: 100,
    backgroundColor: "#F5F5F5",
    color: "#rgb(112, 112, 112)",
    borderBottomWidth: 0,
    borderLeftWidth: 1,
    borderColor: "#DDDDDD",
  },
  headerCell3: {
    paddingTop: 20,
    fontSize: 14,
    fontWeight: "bold",
    minWidth: 75,
    height: 100,
    backgroundColor: "#F5F5F5",
    color: "#rgb(112, 112, 112)",
    borderLeftWidth: 1,
    borderColor: "#DDDDDD",
  },
  headerCell4: {
    paddingTop: 20,
    fontSize: 14,
    fontWeight: "bold",
    minWidth: 80,
    height: 100,
    backgroundColor: "#F5F5F5",
    color: "#rgb(112, 112, 112)",
    borderLeftWidth: 1,
    borderColor: "#DDDDDD",
  },
  headerCell5: {
    paddingTop: 20,
    fontSize: 14,
    fontWeight: "bold",
    minWidth: 80,
    height: 100,
    backgroundColor: "#F5F5F5",
    color: "#rgb(112, 112, 112)",
    borderLeftWidth: 1,
    borderColor: "#DDDDDD",
  },
  headerCell6: {
    paddingTop: 20,
    fontSize: 14,
    fontWeight: "bold",
    minWidth: 68,
    height: 100,
    backgroundColor: "#F5F5F5",
    color: "#rgb(112, 112, 112)",
    borderLeftWidth: 1,
    borderColor: "#DDDDDD",
  },
  paginationControls: {
    flexDirection: "row",
    // justifyContent: "space-between",
    gap: 1,
    marginTop: 10,
    marginBottom: 10,
  },
});

export default AddressValidation;
