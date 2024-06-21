//Pseudo code
//Step 1: Define chart properties.
//Step 2: Create the chart with defined properties and bind it to the DOM element.
//Step 3: Add the CandleStick Series.
//Step 4: Set the data and render.
//Step5 : Plug the socket to the chart


//Code
const log = console.log;

const chartProperties = {
  width: 1400,
  height: 700,
  timeScale: {
    timeVisible: true,
    secondsVisible: false,
  }
}

const domElement = document.getElementById('tvchart');
const chart = LightweightCharts.createChart(domElement, chartProperties);
const candleSeries = chart.addCandlestickSeries();
const hoverInfo = document.getElementById('hover-info');

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

  // Return Unix timestamp in seconds
  return Math.floor(date.getTime() / 1000);
}


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
  })
  .catch(err => log(err));

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
      <div>Time: ${new Date(param.time * 1000).toLocaleString()}</div>
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