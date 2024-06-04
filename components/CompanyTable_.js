import React, { useEffect, useState } from "react";

import DataTable from "react-data-table-component";
import {
  Button,
  InputBox,
  InputBoxOrdinary,
} from "./accessories/CommomComponents";
import CustomText from "./accessories/CustomText";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native-web";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const CompanyTable = ({ Result, handleSearch }) => {
  const [data, setData] = useState(Result);
  useEffect(() => {
    let combinedResult = {
      ...Result,
      Table_f: Result["Table"],
      Table1_f: Result["Table1"],
    };
    setData(combinedResult);
  }, []);

  const columnsCompany = [
    {
      name: "Company Id",
      selector: (row) => row.CompanyNum,
    },
    {
      name: "Company Name",
      selector: (row) => row.CompanyName,
      wrap: true,
    },
    {
      name: "Contact",
      selector: (row) => row.Contact || "",
    },
    {
      name: "Email Address",
      selector: (row) => row.CompEmail || "",
      wrap: true,
    },
    {
      name: "Address",
      selector: (row) => row.Address || "",
      wrap: true,
    },

    {
      name: "Select",
      selector: "Select",
      cell: (row) => (
        <Button
          title={
            <CustomText
              style={{ color: "#FFFFF", fontSize: 11, fontWeight: 200 }}
            >
              Select
            </CustomText>
          }
          style={{
            paddingVertical: 11,
            paddingHorizontal: 20,
            fontSize: 10,
            backgroundColor: "#428bca",
          }}
          onPress={() => {
            handleSearch("Select", row,'Comp');
          }}
        ></Button>
      ),
    },
  ];
  const columnsEmployee = [
    {
      name: "Company Id",
      selector: (row) => row.CompanyNum,
    },
    {
      name: "Company Name",
      selector: (row) => row.CompanyName,
      wrap: true,
    },
    {
      name: "Loan Officer",
      selector: (row) => row.Contact || "",
    },
    {
      name: "Email Address",
      selector: (row) => row.Emailoutside || "",
      wrap: true,
    },
    {
      name: "Address",
      selector: (row) => row.Address || "",
      wrap: true,
    },

    {
      name: "Select",
      selector: "Select",
      cell: (row) => (
        <Button
          title={
            <CustomText
              style={{ color: "#FFFFF", fontSize: 11, fontWeight: 200 }}
            >
              Select
            </CustomText>
          }
          style={{
            paddingVertical: 11,
            paddingHorizontal: 20,
            fontSize: 10,
            backgroundColor: "#428bca",
          }}
          onPress={() => {
            handleSearch("Select", row,'Emp');
          }}
        ></Button>
      ),
    },
  ];
  const customStyles = {
    table: {
      style: {
        borderWidth: 2,
      },
    },
    rows: {
      style: {
        minHeight: "72px", // override the row height
        padding: 10,
      },
    },
    headCells: {
      style: {
        paddingVertical: "8px", // override the cell padding for head cells
        fontFamily: '"Helvetica Neue",Inter,Helvetica,Arial,sans-serif',
        backgroundColor: "#f0f0f0",
        fontSize: 13,
        fontWeight: 400,
        color: "#000",
      },
    },
    cells: {
      style: {
        paddingVertical: "8px", // override the cell padding for head cells
        fontFamily: '"Helvetica Neue",Inter,Helvetica,Arial,sans-serif',
        backgroundColor: "#fff",
        fontSize: 12,
      },
    },
    pagination: {
      style: {
        fontSize: "13px",
        minHeight: "56px",
        borderTopStyle: "solid",
        borderTopWidth: "1px",
        fontFamily: '"Helvetica Neue",Inter,Helvetica,Arial,sans-serif',
      },
    },
  };

  const handleFilter = (value, from) => {
    let filteredData = data[from == 1 ? "Table" : "Table1"].filter((e) => e["CompanyName"].toLowerCase().includes(value));
    setData((prevData) => {
      return {
        ...prevData,
        [from == 1 ? "Table_f" : "Table1_f"]: filteredData,
      };
    });
  };
  return (
    <ScrollView>
      <View
        style={{
          width: "100%",
          height: "100vh",

          alignItems: "center",
          backgroundColor: "#00000087",
        }}
      >
        <View style={styles.container}>
          {/* <View style={{width:560}}> */}
          <View style={styles.filterContainer}>
            <View
              style={{ flexDirection: "row", gap: 10, alignItems: "baseline" }}
            >
              <CustomText style={{ fontSize: 16, color: "white" }}>
                Search results
              </CustomText>
            </View>

            <TouchableOpacity>
              <FontAwesome
                name="close"
                size={20}
                color="white"
                onPress={() => {
                  handleSearch("Table", false);
                  //setValue('')
                }}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              backgroundColor: "#EFF3F8",
              maxHeight: "90vh",
              height: "auto",
              alignSelf: "center",
              overflow: "auto",
            }}
          >
            <View>
              <View style={styles["headerView"]}>
                <CustomText>Company Results</CustomText>
                <View style={{ width: 300 }}>
                  <InputBoxOrdinary
                    label={"Filter"}
                    name={"Filter"}
                    disabled={false}
                    onChangeText={(e) => {
                      handleFilter(e, 1);
                    }}
                    Margin={true}
                  ></InputBoxOrdinary>
                </View>
              </View>
              <DataTable
                //  title={<CustomText>Company Results</CustomText>}
                columns={columnsCompany}
                data={data["Table_f"]?.filter((e) => e.CompanyNum != 0)}
                customStyles={customStyles}
                pagination
              />
            </View>
            <View>
              <View style={styles["headerView"]}>
                <CustomText>Employee Results</CustomText>
                <View style={{ width: 300 }}>
                  <InputBoxOrdinary
                    label={"Filter"}
                    name={"Filter"}
                    disabled={false}
                    onChangeText={(e) => {
                      handleFilter(e, 2);
                    }}
                    Margin={true}
                  ></InputBoxOrdinary>
                </View>
              </View>
              <DataTable
                // title={<CustomText>Employee Results</CustomText>}
                columns={columnsEmployee}
                data={data["Table1_f"]}
                customStyles={customStyles}
                pagination
              />
            </View>
          </View>
        </View>
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
    // width:560
    paddingHorizontal: 20,
    marginTop: 30,
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
  headerView: {
    justifyContent: "space-between",
    flexDirection: "row",
    paddingVertical: 13,
    paddingHorizontal: 6,
    alignItems: "baseline",
    backgroundColor: "#fff",
  },
});
export default CompanyTable;
