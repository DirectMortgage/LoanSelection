import DataTable from 'react-data-table-component';
import { Button } from './CommomComponents';
import CustomText from './CustomText';

const columns = [
	{
		name: 'Company Id',
		selector: row => row.CompanyNum,
	},
	{
		name: 'Company Name',
		selector: row => row.CompanyName,
	},
    {
		name: 'Contact',
		selector: row => row.Contact||'',
	},
	{
		name: 'Email Address',
		selector: row => row.CompEmail||'',
	},
    {
		name: 'Address',
		selector: row => row.Address||'',
	},
	
    {
		name: 'Select',
		selector: 'Select',
        cell: row => <Button
        title={
          <CustomText style={{ color: "#FFFFF", fontSize: 11,fontWeight:200 }}>
            Select
          </CustomText>
        }
        style={{
          paddingVertical: 11,
          paddingHorizontal: 20,
          fontSize: 10,
          backgroundColor: "#428bca",
        }}
        onPress={(e) => {
        //  handleSearch("Table", false);
          alert(row)
        }}
      ></Button>,
	},
];
const customStyles = {
	rows: {
		style: {
			minHeight: '72px', // override the row height
            padding:10
		},
	},
	headCells: {
		style: {
			paddingVertical: '8px', // override the cell padding for head cells
			fontFamily:'"Helvetica Neue",Inter,Helvetica,Arial,sans-serif',
            backgroundColor:'#f0f0f0',
            fontSize:13,
            fontWeight:400,
            color:'#000'
		},
	},
	cells: {
		style: {
			paddingVertical: '8px', // override the cell padding for head cells
			fontFamily:'"Helvetica Neue",Inter,Helvetica,Arial,sans-serif',
            backgroundColor:'#fff',
            fontSize:12,
		},
	},
};
const data = [
    {
        "CompanyNum": 5117,
        "CompanyName": "Courtyard Mortgage",
        "Contact": "Brad Eldredge",
        "Address": "2545 NORTH CANYON ROAD #210",
        "City": "PROVO",
        "State": "UT",
        "Zip": "84604",
        "CompEmail": "BRADELDREDGE@solutioncenter.biz",
        "status": "Expired"
    },
    {
        "CompanyNum": 10808,
        "CompanyName": "Courtesy Mortgage Company",
        "Contact": "Paul Taccone",
        "Address": "2615 Camnio Del Rio South Ste 200",
        "City": "San Diego",
        "State": "CA",
        "Zip": "92108",
        "CompEmail": "ptaccone@courtesymortgage.com",
        "status": "Renewal Required"
    },
    {
        "CompanyNum": 21396,
        "CompanyName": "courtcapital.net",
        "Contact": null,
        "Address": null,
        "City": "",
        "State": "",
        "Zip": "",
        "CompEmail": "",
        "status": "Temporary"
    },
    {
        "CompanyNum": 26924,
        "CompanyName": "FULLCOURTSERVICES.COM",
        "Contact": null,
        "Address": null,
        "City": "",
        "State": "",
        "Zip": "",
        "CompEmail": "",
        "status": "Temporary"
    }
]

function MyComponent() {
	return (
		<DataTable
			columns={columns}
			data={data}
            customStyles={customStyles}
            pagination
		/>
	);
};

export default MyComponent;