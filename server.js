const XlsxPopulate = require('xlsx-populate');
const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const path = require('path');
const filePath = path.join(__dirname, 'Sheet1.xlsx');

XlsxPopulate.fromFileAsync(filePath)
  .then(workbook => {
    const sheet = workbook.sheet("גיליון1");
    const usedRange = sheet.usedRange();
    const columnA = usedRange.column("A");
    const columnAValues = columnA.map(cell => cell.value());

    console.log(columnAValues);
  })
  .catch(error => {
    console.error("Error reading Excel file:", error);
  });
