// יצירת רשימת השולחנות
var tables = [];
for (var i = 1; i <= 20; i++) {
  tables.push({
    name: 'שולחן ' + i,
    type: 'רגיל',
    seats: getRandomSeats(10, 14),
    guests: []
  });
}

// פונקציה לקבלת מספר מקומות ישיבה אקראי
function getRandomSeats(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// יצירת השולחנות ב-HTML
var hall = document.getElementById('hall');
for (var i = 0; i < tables.length; i++) {
  var tableDiv = document.createElement('div');
  tableDiv.className = 'table';
  tableDiv.textContent = tables[i].name;
  tableDiv.setAttribute('draggable', true); // הוספת האפשרות לגרירה
  hall.appendChild(tableDiv);
}

// הוספת אירועי לחיצה ואירועי גרירה לשולחנות
var tableElements = document.getElementsByClassName('table');
for (var i = 0; i < tableElements.length; i++) {
  var tableElement = tableElements[i];
  tableElement.addEventListener('click', function() {
    this.classList.toggle('selected');
  });
  tableElement.addEventListener('dragstart', function(event) {
    event.dataTransfer.setData('text', this.textContent);
  });
}

// הוספת אירועי גרירה ושחרור לשולחן
var hallElement = document.getElementById('hall');
hallElement.addEventListener('dragover', function(event) {
  event.preventDefault();
});
hallElement.addEventListener('drop', function(event) {
  event.preventDefault();
  var guestName = event.dataTransfer.getData('text');
  var tableElement = event.target;
  if (tableElement.classList.contains('table')) {
    var tableName = tableElement.textContent;
    // הוסף את שם המוזמן לתוך השולחן המתאים
    addGuestToTable(guestName, tableName);
  }
});

// פונקציה להוספת שם מוזמן לתוך השולחן המתאים
function addGuestToTable(guestName, tableName) {
  for (var i = 0; i < tables.length; i++) {
    if (tables[i].name === tableName) {
      tables[i].guests.push(guestName);
      break;
    }
  }
  updateGuestCount();
}

// עדכון מספר המוזמנים
function updateGuestCount() {
  var guestCount = 0;
  for (var i = 0; i < tables.length; i++) {
    guestCount += tables[i].guests.length;
  }
  console.log('כמות המוזמנים:', guestCount);
}

// פונקציה להוספת שולחן לסקיצה ולרשימת השולחנות
function addTableToHall(table) {
  tables.push(table);
  refreshHall();
  updateTableSelect();
  updateEmptySeats();
}

// פונקציה לקישור של שמות השולחנות לתפריט הנגלל של המוזמנים
function updateTableSelect() {
  var tableSelectElement = document.getElementById("table-name-select");
  tableSelectElement.innerHTML = "";

  tables.forEach(function(table) {
    var optionElement = document.createElement("option");
    optionElement.value = table.name;
    optionElement.textContent = table.name;
    tableSelectElement.appendChild(optionElement);
  });
}

// פונקציה להוספת מוזמן לשולחן ולרשימת המוזמנים
function addGuestToTable(guestName, tableName) {
  var table = tables.find(function(table) {
    return table.name === tableName;
  });

  if (table) {
    table.guests.push(guestName);
    refreshHall();
    updateGuestList();
  }
}

// פונקציה לטעינת רשימת המוזמנים מקובץ אקסל
function loadGuestListFromFile(file) {
  var reader = new FileReader();
  reader.onload = function(e) {
    var data = new Uint8Array(e.target.result);
    var workbook = XLSX.read(data, { type: "array" });
    var sheetName = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[sheetName];
    var guestNames = [];
    var rowIndex = 1;
    var cell = worksheet["A" + rowIndex];

    while (cell && cell.v) {
      guestNames.push(cell.v);
      rowIndex++;
      cell = worksheet["A" + rowIndex];
    }

    var guestListTextbox = document.getElementById("guest-list-textbox");
    guestListTextbox.value = guestNames.join(", ");
  };

  reader.readAsArrayBuffer(file);
}

// עיצוב האלמנטים בעזרת עריכת קובץ ה-css
// ניתן להוסיף עיצובים נוספים בהתאם לצורך

// הוספת אירוע מאזין לטופס השולחן
var formElement = document.getElementById("table-form");
formElement.addEventListener("submit", function(event) {
  event.preventDefault();

  var tableName = document.getElementById("table-name").value;
  var tableType = document.getElementById("table-type").value;
  var tableSeats = parseInt(document.getElementById("table-seats").value);

  var table = {
    name: tableName,
    type: tableType,
    seats: tableSeats,
    guests: []
  };

  addTableToHall(table);
});

// הוספת אירוע מאזין לטופס המוזמנים
var guestFormElement = document.getElementById("guest-form");
guestFormElement.addEventListener("submit", function(event) {
  event.preventDefault();

  var selectedTable = document.getElementById("table-name-select").value;
  var guestName = document.getElementById("guest-name").value;

  addGuestToTable(guestName, selectedTable);

  guestFormElement.reset();
});

// הוספת אירוע מאזין לטופס ההעלאה של קובץ אקסל
var excelUploadFormElement = document.getElementById("excel-upload-form");
excelUploadFormElement.addEventListener("submit", function(event) {
  event.preventDefault();

  var fileInput = document.getElementById("excel-upload");

  if (fileInput.files.length > 0) {
    var file = fileInput.files[0];
    loadGuestListFromFile(file);
  }
});

// פונקציה לקביעת סידורי ההושבה
function setSeatingArrangement(tableName, guests) {
  var table = tables.find(function(table) {
    return table.name === tableName;
  });

  if (table) {
    table.guests = guests;
    refreshHall();
    updateGuestList();
  }
}

// פונקציה למחיקת שולחן ומחיקת מוזמנים מרשימת המוזמנים
function deleteTable(tableName) {
  var index = tables.findIndex(function(table) {
    return table.name === tableName;
  });

  if (index !== -1) {
    tables.splice(index, 1);
    refreshHall();
    updateTableSelect();
    updateGuestList();
  }
}

// פונקציה להוספת שולחן בהתאם למספר הכיסאות
function addTableBySeatCount(tableSeats) {
  var table = {
    name: "שולחן " + (tables.length + 1),
    type: "רגיל",
    seats: tableSeats,
    guests: []
  };

  addTableToHall(table);
}

// פונקציה למחיקת כל השולחנות והמוזמנים
function clearTables() {
  tables = [];
  refreshHall();
  updateTableSelect();
  updateGuestList();
}

// הוספת אירוע מאזין לטופס המחיקה של שולחן
var deleteFormElement = document.getElementById("delete-form");
deleteFormElement.addEventListener("submit", function(event) {
  event.preventDefault();

  var tableToDelete = document.getElementById("table-to-delete").value;
  deleteTable(tableToDelete);

  deleteFormElement.reset();
});

// הוספת אירוע מאזין לטופס ההוספה של שולחן
var addFormElement = document.getElementById("add-form");
addFormElement.addEventListener("submit", function(event) {
  event.preventDefault();

  var tableSeats = parseInt(document.getElementById("table-seats-add").value);
  addTableBySeatCount(tableSeats);

  addFormElement.reset();
});

// הוספת אירוע מאזין לטופס ההכנסה של סידורי ההושבה
var seatingFormElement = document.getElementById("seating-form");
seatingFormElement.addEventListener("submit", function(event) {
  event.preventDefault();

  var tableName = document.getElementById("table-name-seating").value;
  var guests = document.getElementById("guests-seating").value.split(",").map(function(guest) {
    return guest.trim();
  });

  setSeatingArrangement(tableName, guests);

  seatingFormElement.reset();
});

// הוספת אירוע מאזין לטופס הכיבוי של כל השולחנות והמוזמנים
var clearFormElement = document.getElementById("clear-form");
clearFormElement.addEventListener("submit", function(event) {
  event.preventDefault();

  clearTables();

  clearFormElement.reset();
});

function refreshHall() {
  var hallElement = document.getElementById("hall");
  hallElement.innerHTML = "";

  tables.forEach(function(table) {
    var tableElement = document.createElement("div");
    tableElement.className = "table";

    tableElement.innerHTML = table.name + "<br>(" + table.type + ")<br>";
    tableElement.innerHTML += "מספר הכסאות: " + table.seats + "<br>";
    tableElement.innerHTML += "מספר המוזמנים: " + table.guests.length + "<br>";

    if (table.type === "רזרבה") {
      tableElement.classList.add("reserved");
    } else if (table.type === "אבירים") {
      tableElement.classList.add("knight");
    }

    hallElement.appendChild(tableElement);
  });

  // עדכון אירוע מאזין למחיקת שולחן
  var deleteFormElement = document.getElementById("delete-form");
  var tableToDeleteSelect = document.getElementById("table-to-delete");
  tableToDeleteSelect.innerHTML = "";

  tables.forEach(function(table) {
    var optionElement = document.createElement("option");
    optionElement.value = table.name;
    optionElement.textContent = table.name;
    tableToDeleteSelect.appendChild(optionElement);
  });

  // עדכון אירוע מאזין לקביעת סידורי הושבה
  var seatingFormElement = document.getElementById("seating-form");
  var tableNameSelect = document.getElementById("table-name-seating");
  tableNameSelect.innerHTML = "";

  tables.forEach(function(table) {
    var optionElement = document.createElement("option");
    optionElement.value = table.name;
    optionElement.textContent = table.name;
    tableNameSelect.appendChild(optionElement);
  });
}
