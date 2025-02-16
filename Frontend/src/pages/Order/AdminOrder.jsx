import React, { useEffect, useState, useRef } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import {
    Box, Typography, FormControl, InputLabel, Select, MenuItem, Paper, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Input, TablePagination, TableSortLabel
} from '@mui/material';
import { saveAs } from "file-saver";
import http from "../../http";
import ClearIcon from "@mui/icons-material/Clear"; // Import Clear Icon
import IconButton from "@mui/material/IconButton"; // Import IconButton

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// Function to generate distinct colors
const generateColors = (numColors) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
        const hue = (i * 360 / numColors) % 360;
        colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
};

const OrderItemsGraph = () => {
    const [chartData, setChartData] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [filterBy, setFilterBy] = useState("product");
    const [displayType, setDisplayType] = useState("totalRevenue"); // New state for display type
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortColumn, setSortColumn] = useState("id");
    const [sortDirection, setSortDirection] = useState("asc");
    const chartRef = useRef(null);
    const fileInputRef = useRef(null); // Ref for file input

    useEffect(() => {
        fetchData();
        fetchOrderItemsList();
    }, [filterBy, displayType]); // Refetch when filter or display type changes

    // Fetch data for the chart
    const fetchData = () => {
        http.get(`orderitem/graph?filterBy=${filterBy}`)
            .then(response => {
                const data = response.data;

                // Apply filter to the dataset before updating chart
                const filteredData = data.map(item => ({
                    label: filterBy === "product" ? item.productName : item.categoryName,
                    totalQuantity: item.totalQuantity,
                    totalSales: item.totalSales
                }));

                const colors = generateColors(filteredData.length);

                if (displayType === "quantitySold") {
                    setChartData({
                        labels: filteredData.map(item => item.label),
                        datasets: [
                            {
                                label: "Total Quantity Sold",
                                data: filteredData.map(item => item.totalQuantity),
                                backgroundColor: colors
                            }
                        ]
                    });
                } else {
                    setChartData({
                        labels: filteredData.map(item => item.label),
                        datasets: [
                            {
                                label: "Total Sales ($)",
                                data: filteredData.map(item => item.totalSales),
                                backgroundColor: colors
                            }
                        ]
                    });
                }
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

    // Clear selected file
    const clearFile = () => {
        setFile(null);
        setFileError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset file input field
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
            {/* Dropdown for selecting display type */}
            <FormControl variant="outlined" sx={{ mb: 3, minWidth: 200, ml: 2 }}>
                <InputLabel>Display Type</InputLabel>
                <Select value={displayType} onChange={(e) => setDisplayType(e.target.value)} label="Display Type">
                    <MenuItem value="quantitySold">Quantity Sold</MenuItem>
                    <MenuItem value="totalRevenue">Total Revenue</MenuItem>
                </Select>
            </FormControl>

            {/* Graph */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                {chartData ? (
                    displayType === "quantitySold" ? (
                        <Pie ref={chartRef} data={chartData} />
                    ) : (
                        <Bar ref={chartRef} data={chartData} />
                    )
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                        <CircularProgress />
                    </Box>
                )}
            </Paper>

            {/* File Upload Section - Now Below the Graph */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* File Input */}
                    <Input type="file" inputRef={fileInputRef} onChange={handleFileChange} />

                    {/* Clear File Icon Button */}
                    <IconButton onClick={clearFile} color="error">
                        <ClearIcon />
                    </IconButton>
                </Box>
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
                                <TableCell>{item.categoryName}</TableCell>
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