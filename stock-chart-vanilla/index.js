const chartProperties = {
  timeScale: {
    timeVisible: true,
    secondsVisible: false,
  }
}

const domElement = document.getElementById('tvchart');
const chart = LightweightCharts.createChart(domElement, chartProperties);
const candleSeries = chart.addCandlestickSeries();
const hoverInfo = document.getElementById('hover-info');
const spinner = document.getElementById('spinner');

// Function to read CSV file and convert data
function readCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    Papa.parse(filePath, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: function(results) {
        resolve(results.data);
      },
      error: function(err) {
        reject(err);
      }
    });
  });
}

// Helper function to parse date string {eg 21-JUN-2021} to Unix timestamp in seconds
function parseDateToUnix(dateTime) {
  const [day, month, year] = dateTime.split('-');
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const monthIndex = monthNames.indexOf(month.toUpperCase());
  if (monthIndex === -1) {
    throw new Error(`Invalid month: ${month} ${dateTime}`);
  }
  const date = new Date(year, monthIndex, day);
  return Math.floor(date.getTime() / 1000);
}

// Helper function to parse date-time string to Unix timestamp in seconds
function parseDateTimeToUnix(dateTime) {
  // Split date and time parts
  const [datePart, timePart] = dateTime.split(' ');

  // Parse date part
  const [year, month, day] = datePart.split('-').map(Number);

  // Parse time part
  const [hour, minute, second] = timePart.split(':').map(Number);

  // Create a new Date object using the parsed components (month is zero-based in JavaScript)
  const date = new Date(year, month - 1, day, hour, minute, second);
  
  //Create offset (5:30) for converting utc to Asia/Kolkata
  const offset = (5 * 60 * 60 * 1000) + (30 * 60 * 1000);

  // Create a new date with the offset added
  const newDate = new Date(date.getTime() + offset);

  // Return Unix timestamp in seconds
  return Math.floor(newDate.getTime() / 1000);
}

// Show the spinner
function showSpinner() {
  spinner.style.display = 'block';
}

// Hide the spinner
function hideSpinner() {
  spinner.style.display = 'none';
}

showSpinner();

// Path to your CSV file
const csvFilePath = 'nifty50M.csv';

// Fetch and process CSV data
readCSVFile(csvFilePath)
  .then(data => {
    const cdata = data.map(d => {
      // log(parseDateTimeToUnix(d.Date))
      return {
        time: parseDateTimeToUnix(d.Date), // Convert date-time string to Unix timestamp in seconds
        open: parseFloat(d.Open),
        high: parseFloat(d.High),
        low: parseFloat(d.Low),
        close: parseFloat(d.Close)
      };
    });
    candleSeries.setData(cdata);
    // log(data)
    hideSpinner();
  })
  .catch(err => {
    log(err)
    hideSpinner();
  });

// Handle crosshair move event to display hover info
chart.subscribeCrosshairMove(param => {
  if (!param || !param.time) {
    hideHoverInfo();
    return;
  }


  const { seriesData } = param;
  const data = seriesData.get(candleSeries);

  if (data) {
    const hoverInfoContent = `
      <div>Time: ${(new Date(param.time * 1000 - ((5 * 60 * 60 * 1000) + (30 * 60 * 1000)))).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
      <div>Open: ${data.open}</div>
      <div>High: ${data.high}</div>
      <div>Low: ${data.low}</div>
      <div>Close: ${data.close}</div>
    `;
    showHoverInfo(param.point.x, param.point.y, hoverInfoContent);
  } else {
    hideHoverInfo();
  }
});

// Function to show hover info box
function showHoverInfo(x, y, content) {
  hoverInfo.style.display = 'block';
  hoverInfo.style.top = `${y+20}px`;
  hoverInfo.style.left = `${x+20}px`;
  hoverInfo.innerHTML = content;
}

// Function to hide hover info box
function hideHoverInfo() {
  hoverInfo.style.display = 'none';
}

// //Dynamic Chart
// const socket = io.connect('http://127.0.0.1:4000/');

// socket.on('KLINE',(pl)=>{
//   //log(pl);
//   candleSeries.update(pl);
// });


// Top Bar Code

document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('search-button');
  const searchPopup = document.getElementById('search-popup');
  const closeButton = document.querySelector('.close-button');

  // Search button click event
  searchButton.addEventListener('click', () => {
    searchPopup.style.display = 'block';
  });

  // Close button click event
  closeButton.addEventListener('click', () => {
    searchPopup.style.display = 'none';
  });

  // Close the popup when clicking outside of it
  window.addEventListener('click', (event) => {
    if (event.target == searchPopup) {
      searchPopup.style.display = 'none';
    }
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const dropdownHeader = document.getElementById('dropdown-header');
  const dropdownContent = document.getElementById('dropdown-content');
  const options = document.querySelectorAll('.option');

  let selectedOptions = [];

  // Toggle dropdown visibility on header click
  dropdownHeader.addEventListener('click', () => {
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
  });

  // Handle option click to toggle selection
  options.forEach(option => {
    option.addEventListener('click', () => {
      const value = option.getAttribute('data-value');
      option.classList.toggle('selected');

      if (option.classList.contains('selected')) {
        selectedOptions.push(value);
      } else {
        selectedOptions = selectedOptions.filter(item => item !== value);
      }

    });
  });

  // Close dropdown when clicking outside
  window.addEventListener('click', (event) => {
    if (!dropdownHeader.contains(event.target) && !dropdownContent.contains(event.target)) {
      dropdownContent.style.display = 'none';
    }
  });
});

document.addEventListener("DOMContentLoaded", function() {
  // Fullscreen button functionality
  const fullscreenButton = document.getElementById("fullscreen-button");

  fullscreenButton.addEventListener("click", function() {
    if (!document.fullscreenElement &&    // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
      const element = document.documentElement; // Fullscreen the entire document

      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) { /* Firefox */
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) { /* IE/Edge */
        element.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
      }
    }
  });
});


function selectStock(row) {
  // Get all rows with the class 'stock-row'
  var rows = document.getElementsByClassName('stock-row');
  
  // Remove the 'selected' class from all rows
  for (var i = 0; i < rows.length; i++) {
      rows[i].classList.remove('selected');
  }
  
  // Add the 'selected' class to the clicked row
  row.classList.add('selected');
}