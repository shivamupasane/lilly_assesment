let previousSearchedTerm = ""; // to store last searched tearm by user
let searchedSymbol = ""; // to store current searched tearm by user
let selectedSymbolDetail = {}; // seleted symbol detail from data list\
// function to get intraday data of a stock from remote API
function getIntraDayData(stockSymbol) {
  showSelectedBtn("intraDayBtn");
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "2e5bacd5e3msh520bb3b518ee900p1bd586jsn971c3765a692",
      "X-RapidAPI-Host": "alpha-vantage.p.rapidapi.com",
    },
  };
  fetch(
    `https://alpha-vantage.p.rapidapi.com/query?interval=5min&function=TIME_SERIES_INTRADAY&symbol=${stockSymbol}&datatype=json&output_size=compact`,
    options
  )
    .then((response) => response.json())
    .then((response) => {
      let dataForChart = response
        ? response["Time Series (5min)"]
          ? response["Time Series (5min)"]
          : []
        : [];
      if (dataForChart && dataForChart.length > 0) {
        drawChart(dataForChart, "intraDay");
      } else {
        handleError("Invalid API call. Please retry with some other symbol");
      }
    })
    .catch((err) => {
      handleError(err);
    });
}
// function to get daily data of a stock from remote API
function getDailyData(stockSymbol) {
  showSelectedBtn("dailyBtn");
  fetch(
    `https://alpha-vantage.p.rapidapi.com/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&outputsize=compact&datatype=json`,
    options
  )
    .then((response) => response.json())
    .then((response) => {
      let dataForChart = response
        ? response["Time Series (Daily)"]
          ? response["Time Series (Daily)"]
          : []
        : [];
      if (dataForChart && dataForChart.length > 0) {
        drawChart(dataForChart, "intraDay");
      } else {
        handleError("Invalid API call. Please retry with some other symbol");
      }
    })
    .catch((err) => {
      handleError(err);
    });
}
// function to get symbol list from remote API once user anter some value in input box
function getSymbolList(inputText) {
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "2e5bacd5e3msh520bb3b518ee900p1bd586jsn971c3765a692",
      "X-RapidAPI-Host": "twelve-data1.p.rapidapi.com",
    },
  };

  fetch(
    `https://twelve-data1.p.rapidapi.com/symbol_search?symbol=${inputText}&outputsize=30`,
    options
  )
    .then((response) => response.json())
    .then((response) => {
      updateResponseToDropdown(response, inputText);
    })
    .catch((err) => {
      handleError(err);
    });
}
// function to update latest selected symbol from data list
function updateSelectedSymbolDetail(selectedInstrument) {
  selectedSymbolDetail = selectedInstrument;
}
// function to update symbol list to UI (along input box)
function updateResponseToDropdown(response, inputText) {
  let dataList = document.getElementById("symbol-list"),
    option;
  if (response && response.data && response.data.length > 0) {
    for (let i = 0; i <= response.data.length - 1; i++) {
      option = document.createElement("option");
      option.value = response.data[i]["symbol"];
      option.innerHTML = `${response.data[i]["instrument_name"]}&nbsp;(${response.data[i]["symbol"]})`;
      option.onclick = updateSelectedSymbolDetail(
        `${response.data[i]["instrument_name"]}&nbsp;(${response.data[i]["symbol"]})`
      );
      dataList.appendChild(option);
    }
    updateSelectedSymbolDetail(
      `${response.data[0]["instrument_name"]}&nbsp;(${response.data[0]["symbol"]})`
    );
    searchedSymbol = inputText;
    getIntraDayData(searchedSymbol);
    document.getElementById(
      "instrumentDetail"
    ).innerHTML = `Showing price chart for ${selectedSymbolDetail}`;
  }
}
// function to search symbol once user enter some value
function searchSymbol(event) {
  if (
    event.target.value &&
    event.target.value.trim() !== "" &&
    event.target.value.length > 1
  ) {
    if (event.target.value.toLowerCase() !== previousSearchedTerm) {
      document.getElementById("instrumentDetail").innerHTML = "";
      previousSearchedTerm = event.target.value.toLowerCase();
      getSymbolList(event.target.value);
    }
  }
}
// function to handle API errors
function handleError(error) {
  d3.select("#container").remove();
  d3.select("#containerDiv")
    .append("div")
    .html(
      `<h2 style="color:red">Some Error Occured Please try after some time(5 min)</h2>`
    );
}
// function to show selected button as green
function showSelectedBtn(btnId) {
  document.getElementById(`intraDayBtn`).classList.remove("selected");
  document.getElementById(`dailyBtn`).classList.remove("selected");
  document.getElementById(`${btnId}`).classList += "selected";
}
// function to draw d3 chart for price
function drawChart(response, viewType) {
  //remove old chart
  d3.select("#container").remove();
  //months mapping
  const months = {
    0: "Jan",
    1: "Feb",
    2: "Mar",
    3: "Apr",
    4: "May",
    5: "Jun",
    6: "Jul",
    7: "Aug",
    8: "Sep",
    9: "Oct",
    10: "Nov",
    11: "Dec",
  };
  // date format for intraday and daily
  const dateFormat =
    viewType === "intraDay"
      ? d3.timeParse("%Y-%m-%d %H:%M:%S")
      : d3.timeParse("%Y-%m-%d");
  // margin, width, height of svg
  const margin = { top: 15, right: 65, bottom: 205, left: 50 },
    w = window.screen.width - 30 - margin.left - margin.right,
    h = window.screen.height - 200 - margin.top - margin.bottom;
  //append svg to container div
  let svg = d3
    .select("#containerDiv")
    .append("svg")
    .attr("id", "container")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  //get dates from response(for x axis)
  let dates = Object.keys(response).reverse();
  //x axis scale from dates to map only in permitted width
  let xScale = d3.scalePoint().domain(dates).range([0, w]);
  //x band width of rectangle/candle
  let xBand = d3
    .scaleBand()
    .domain(d3.range(-1, dates.length))
    .range([0, w])
    .padding(0.3);
  //create x axis
  let xAxis = d3
    .axisBottom()
    .scale(xScale)
    .ticks(50)
    .tickValues(xScale.domain().filter((d, i) => i % 30 === 0))
    .tickFormat(function (d) {
      d = dateFormat(d);
      hours = d.getHours();
      minutes = d.getMinutes();
      return viewType === "intraDay"
        ? hours + ":" + minutes
        : (d.getDate().toString().length === 1
            ? `0${d.getDate()}`
            : d.getDate()) +
            `\n` +
            months[d.getMonth()] +
            `\n` +
            d.getFullYear();
    });
  //create x axis label
  svg
    .append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", w)
    .attr("y", h - 6)
    .text("Time(intraDay/Daily)");
  //draw y axis label
  svg
    .append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("price/performance");
  svg
    .append("rect")
    .attr("id", "rect")
    .attr("width", w)
    .attr("height", h)
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr("clip-path", "url(#clip)");
  // create x axis
  let gX = svg
    .append("g")
    .attr("class", "axis x-axis") //Assign "axis" class
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis);

  gX.selectAll(".tick text").call(wrap, xBand.bandwidth());
  // get min, max, scaling for y axis
  let ymin = d3.min(Object.values(response).map((r) => r["3. low"]));
  let ymax = d3.max(Object.values(response).map((r) => r["2. high"]));
  let yScale = d3.scaleLinear().domain([ymin, ymax]).range([h, 0]).nice();
  let yAxis = d3.axisLeft().scale(yScale);
  // draw y axis
  svg.append("g").attr("class", "axis y-axis").call(yAxis);
  // grouping tag for candles and line
  let chartBody = svg
    .append("g")
    .attr("class", "chartBody")
    .attr("clip-path", "url(#clip)");
  // tooltip for candles and line
  let tip = d3
    .tip()
    .attr("class", "d3-tip card")
    .offset(function (d, i) {
      return i > dates.length / 2 ? [-50, -50] : [0, -10];
    })
    .html(function (d, i) {
      return `<div>Date : ${dates[i]}</div><div>Open : ${d["1. open"]}</div> <div>High : ${d["2. high"]}</div> <div>Low : ${d["3. low"]}</div> <div>Close : ${d["4. close"]}</div>`;
    });
  svg.call(tip);
  // draw rectangles / candles
  let candles = chartBody
    .selectAll(".candle")
    .data(Object.values(response))
    .enter()
    .append("rect")
    .attr("x", (d, i) => {
      return xScale(dates[i]);
    })
    .attr("class", "candle")
    .attr("y", (d) => yScale(Math.max(d["1. open"], d["4. close"])))
    .attr("width", xBand.bandwidth())
    .attr("height", (d) =>
      d["1. open"] === d["4. close"]
        ? 1
        : yScale(Math.min(d["1. open"], d["4. close"])) -
          yScale(Math.max(d["1. open"], d["4. close"]))
    )
    .attr("fill", (d) =>
      d["1. open"] === d["4. close"]
        ? "silver"
        : d["1. open"] > d["4. close"]
        ? "red"
        : "green"
    )
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);

  // draw high and low lines
  let stems = chartBody
    .selectAll("g.line")
    .data(Object.values(response))
    .enter()
    .append("line")
    .attr("class", "stem")
    .attr("x1", (d, i) => xScale(dates[i]) + xBand.bandwidth() / 2)
    .attr("x2", (d, i) => xScale(dates[i]) + xBand.bandwidth() / 2)
    .attr("y1", (d) => yScale(d["2. high"]))
    .attr("y2", (d) => yScale(d["3. low"]))
    .attr("stroke", (d) =>
      d["1. open"] === d["4. close"]
        ? "white"
        : d["1. open"] > d["4. close"]
        ? "red"
        : "green"
    )
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);
  // to write text for each tick on x axis
  function wrap(text, width) {
    text.each(function () {
      let text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text
          .text(null)
          .append("tspan")
          .attr("x", 0)
          .attr("y", y)
          .attr("dy", dy + "em");
      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", 0)
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .text(word);
        }
      }
    });
  }
}
