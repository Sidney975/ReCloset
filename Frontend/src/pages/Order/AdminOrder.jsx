import React, { useEffect, useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import {
    Box, Typography, FormControl, InputLabel, Select, MenuItem, Paper, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Input, TablePagination, TableSortLabel
} from '@mui/material';
import { saveAs } from "file-saver";
import http from "../../http";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const OrderItemsGraph = () => {
    const [chartData, setChartData] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [filterBy, setFilterBy] = useState("product");
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortColumn, setSortColumn] = useState("id");
    const [sortDirection, setSortDirection] = useState("asc");
    const chartRef = useRef(null);

    useEffect(() => {
        fetchData();
        fetchOrderItemsList();
    }, [filterBy]);

    // Fetch data for the chart
    const fetchData = () => {
        http.get(`orderitem/graph?filterBy=${filterBy}`)
            .then(response => {
                const data = response.data;
                setChartData({
                    labels: data.map(item => filterBy === "product" ? item.productName : item.categoryName),
                    datasets: [
                        { label: "Total Quantity Sold", data: data.map(item => item.totalQuantity), backgroundColor: "rgba(75,192,192,0.6)" },
                        { label: "Total Sales ($)", data: data.map(item => item.totalSales), backgroundColor: "rgba(255,99,132,0.6)" }
                    ]
                });
            })
            .catch(error => console.error("Error fetching order items data", error));
    };

    // Fetch data for the table
    const fetchOrderItemsList = () => {
        http.get("orderitem/list")
            .then(response => {
                console.log("Total Order Items Retrieved:", response.data.length); // Debugging log
                const itemsWithIds = response.data.map((item) => ({
                    id: item.OrderItemId, // Ensure unique ID from DB
                    ...item
                }));
                setOrderItems(itemsWithIds);
            })
            .catch(error => console.error("Error fetching order items list", error));
    };

    // Handle sorting
    const handleSort = (column) => {
        const isAsc = sortColumn === column && sortDirection === "asc";
        setSortDirection(isAsc ? "desc" : "asc");
        setSortColumn(column);
    };

    // Sort the data
    const sortedData = [...orderItems].sort((a, b) => {
        if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1;
        if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    // Handle pagination
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Handle file selection (validate file type)
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (!selectedFile) {
            setFile(null);
            setFileError("");
            return;
        }

        // Ensure only .xlsx files are selected
        if (!selectedFile.name.endsWith(".xlsx")) {
            setFile(null);
            setFileError("Only Excel (.xlsx) files are allowed.");
        } else {
            setFile(selectedFile);
            setFileError(""); // Clear error if valid file
        }
    };

    // Upload Excel File to Backend
    const importExcel = () => {
        if (!file) {
            alert("Please select a valid Excel file before importing.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        http.post("orderitem/import-excel", formData)
            .then(() => {
                alert("Excel file imported successfully!");
                setFile(null); // Clear file after upload
                fetchOrderItemsList(); // Refresh table after import
            })
            .catch(error => alert("Error importing file:", error));
    };

    // Download Excel File from Backend
    const exportExcel = () => {
        http.get("orderitem/export-excel", { responseType: "blob" })
            .then(response => saveAs(response.data, "OrderItems.xlsx"))
            .catch(error => alert("Error exporting file:", error));
    };
    

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Order Items Sales Data
            </Typography>

            {/* Dropdown for selecting filter */}
            <FormControl variant="outlined" sx={{ mb: 3, minWidth: 200 }}>
                <InputLabel>Filter By</InputLabel>
                <Select value={filterBy} onChange={(e) => setFilterBy(e.target.value)} label="Filter By">
                    <MenuItem value="product">Filter by Product</MenuItem>
                    <MenuItem value="category">Filter by Category</MenuItem>
                </Select>
            </FormControl>

            {/* Graph */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                {chartData ? <Bar ref={chartRef} data={chartData} /> : <CircularProgress />}
            </Paper>

            {/* File Upload Section - Now Below the Graph */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <Input type="file" onChange={handleFileChange} />
                {fileError && <Typography color="error">{fileError}</Typography>}
                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button variant="contained" color="primary" onClick={importExcel} disabled={!file}>Import Excel</Button>
                    <Button variant="contained" color="secondary" onClick={exportExcel}>Export to Excel</Button>
                </Box>
            </Box>

            {/* Table displaying order items */}
            <Typography variant="h5" gutterBottom>Order Items List</Typography>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {["id", "productName", "categoryName", "quantityBought", "totalSales", "timeBought"].map((column) => (
                                <TableCell key={column}>
                                    <TableSortLabel
                                        active={sortColumn === column}
                                        direction={sortColumn === column ? sortDirection : "asc"}
                                        onClick={() => handleSort(column)}
                                    >
                                        {column.charAt(0).toUpperCase() + column.slice(1).replace(/([A-Z])/g, " $1")}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.id}</TableCell>
                                <TableCell>{item.productName}</TableCell>
                                <TableCell>{item.productCategory}</TableCell>
                                <TableCell>{item.quantityBought}</TableCell>
                                <TableCell>${item.totalSales.toFixed(2)}</TableCell>
                                <TableCell>{item.timeBought}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
                component="div"
                count={orderItems.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50, { label: "All", value: orderItems.length }]} // Allow viewing all
            />
        </Box>
    );
};

export default OrderItemsGraph;