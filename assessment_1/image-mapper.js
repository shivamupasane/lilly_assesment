let descriptionMap = new Map(); // created a map to store description added to image
let previousClickedX = null, // to check previously clicked point x coordinate by user
  previousClickedY = null; // to check previously clicked point y coordinate by user
//onFileSelected function to call once user upload any image
function onFileSelected(event) {
  // clear stored map initially for new file
  descriptionMap.clear();
  // hide image details grey section
  hideImageDetails();
  let imgtag = document.getElementById("display-image");
  let selectedFile = event.target.files[0];
  const reader = new FileReader();
  imgtag.title = selectedFile.name;
  imgtag.mimeType = selectedFile.type;

  reader.onload = function (event) {
    imgtag.src = event.target.result;
  };
  reader.onloadend = function () {
    render(imgtag);
    createDescriptionTable();
  };
  reader.readAsDataURL(selectedFile);
}
//render an svg on top of image
function render(img) {
  const div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip card")
    .style("display", "none");
  d3.select("#overLappedSvg").remove();
  d3.select("#imgParent")
    .append("svg")
    .attr("id", "overLappedSvg")
    .attr("width", img.naturalWidth)
    .attr("height", img.naturalHeight)
    .on("click", (d) => {
      addDescription(d, div);
    });
  showImageDetails(img);
}
// To show image name, dimension, mime type on UI
function showImageDetails(img) {
  document.getElementById("imageName").innerHTML = img.title;
  document.getElementById("imageDimension").innerHTML =
    img.naturalWidth + " x " + img.naturalHeight;
  document.getElementById("imageMime").innerHTML = img.mimeType;
  document.getElementById("imgDetails").style.display = "block";
}
// To hide image name, dimension, mime type on UI
function hideImageDetails() {
  document.getElementById("imgDetails").style.display = "none";
}
// To add description on click of any point on image
function addDescription(d, div) {
  removeWarning(d3.event.offsetX, d3.event.offsetY);
  if (!descriptionMap.has(`${previousClickedX}:${previousClickedY}`)) {
    cancel(previousClickedX, previousClickedY);
  }

  addCircle();
  div.transition().duration(200);
  div
    .html(
      ` <div>Description</div>
<div>
<input type="text" id="description-${d3.event.offsetX}-${d3.event.offsetY}" onClick="removeWarning(${d3.event.offsetX},${d3.event.offsetY})" placeholder="enter description" value="">
</div>
<div>
<button id="saveBtn-${d3.event.offsetX}-${d3.event.offsetY}" type="button" onClick="saveDescription(${d3.event.offsetX}, ${d3.event.offsetY})" class="saveBtn">save</button>
<button type="button"  onClick="cancel(${d3.event.offsetX}, ${d3.event.offsetY})" class="cancelBtn">cancel</button>
</div>`
    )
    .style("left", d3.event.offsetX + "px")
    .style("top", d3.event.offsetY + "px")
    .style("display", "block");
  previousClickedX = d3.event.offsetX;
  previousClickedY = d3.event.offsetY;
}
// To add circle(red dot) on click of any point on image
function addCircle() {
  d3.select("#overLappedSvg")
    .append("circle")
    .attr("r", 2)
    .attr("id", function (d) {
      return `circle-${d3.event.offsetX}-${d3.event.offsetY}`;
    })
    .attr("cx", function (d) {
      return d3.event.offsetX;
    })
    .attr("cy", function (d) {
      return d3.event.offsetY;
    })
    .style("fill", "#e43d30");
}
// To remove circle(red dot) on click of cancel in popup
function removeCircle(x, y) {
  d3.select("#overLappedSvg").select(`#circle-${x}-${y}`).remove();
}
// To hide tooltip popup
function hideTooltip() {
  d3.selectAll(".tooltip").style("display", "none");
}
// To remove red warning from input box if it is non empty
function removeWarning(x, y) {
  if (document.getElementById(`description-${x}-${y}`)) {
    if (
      document.getElementById(`description-${x}-${y}`).value &&
      document.getElementById(`description-${x}-${y}`).value.trim() !== ""
    ) {
      document
        .getElementById(`description-${x}-${y}`)
        .classList.remove("border-warning-color");
    }
  }
}
// To save description on click of any point on image (on save click in popup)
function saveDescription(x, y) {
  if (
    document.getElementById(`description-${x}-${y}`).value &&
    document.getElementById(`description-${x}-${y}`).value.trim() !== ""
  ) {
    if (!descriptionMap.has(`${x}:${y}`)) {
      descriptionMap.set(
        `${x}:${y}`,
        document.getElementById(`description-${x}-${y}`).value
      );
      updateDescriptionTable(
        x,
        y,
        document.getElementById(`description-${x}-${y}`).value
      );
      saveCircleOnImg(x, y);
      hideTooltip();
      document.getElementById(`description-${x}-${y}`).value = "";
    } else {
      alert(
        `Description already present for X Pos: ${x} and Y pos: ${y} as ${descriptionMap.get(
          `${x}:${y}`
        )}`
      );
    }
  } else {
    if (
      !document
        .getElementById(`description-${x}-${y}`)
        .classList.contains("border-warning-color")
    ) {
      document.getElementById(`description-${x}-${y}`).className +=
        "border-warning-color";
    }
  }
}
// To save red dot on image
function saveCircleOnImg(x, y) {
  const div = d3
    .select("body")
    .append("div")
    .attr("class", "cardHover")
    .style("display", "none");
  d3.select("#overLappedSvg").select(`#circle-${x}-${y}`).remove();
  setTimeout(() => {
    d3.select("#overLappedSvg")
      .append("circle")
      .attr("r", 2)
      .attr("id", function (d) {
        return `circle-${x}-${y}`;
      })
      .attr("cx", function (d) {
        return x;
      })
      .attr("cy", function (d) {
        return y;
      })
      .style("fill", "#e43d30")
      .on("mouseover", function (d) {
        div.transition().duration(200).style("display", "block");
        div
          .html(`<span>${descriptionMap.get(`${x}:${y}`)}</span>`)
          .style("left", x + "px")
          .style("top", y - 28 + "px");
      })
      .on("mouseout", function (d) {
        div.transition().duration(500).style("display", "none");
      });
  }, 10);
}
// To cancel to add description(on click of cancel in popup)
function cancel(x, y) {
  removeCircle(x, y);
  document.getElementById(`description-${x}-${y}`)
    ? (document.getElementById(`description-${x}-${y}`).value = "")
    : "";
  hideTooltip();
}
// To create table of description with X position, Y position, descriptyion and delete
function createDescriptionTable() {
  document.getElementById("descriptionTableContainer").innerHTML = "";
  let table = document.createElement("table"),
    tr,
    td,
    row,
    cell,
    th,
    tableHeaders = ["X Pos", "Y Pos", "Description", "Delete"];
  tr = document.createElement("tr");
  for (let i = 0; i < tableHeaders.length; i++) {
    th = document.createElement("th");
    th.innerHTML = tableHeaders[i];
    tr.appendChild(th);
  }
  table.appendChild(tr);
  if (descriptionMap.size > 0) {
    descriptionMap.forEach((value, key) => {
      tr = document.createElement("tr");
      let [x, y] = key.split(":");
      tr.id = `tr-${x}-${y}`;
      cellValues = [x, y, descriptionMap.get(key), "delete"];
      cellValues.forEach((val, index) => {
        td = document.createElement("td");
        tr.appendChild(td);
        if (val === "delete") {
          td.innerHTML = `<span onClick='deleteDescription(${cellValues[0]}, ${cellValues[1]})'>delete</span>`;
        } else {
          td.innerHTML = val;
        }
      });
      table.appendChild(tr);
    });
  } else {
    tr = document.createElement("tr");
    tr.className += "noRecordTr";
    td = document.createElement("td");
    td.colSpan = 4;
    td.className += "noRecordTd";
    tr.appendChild(td);
    td.innerHTML = "No Description added";
    table.appendChild(tr);
  }
  document.getElementById("descriptionTableContainer").appendChild(table);
}
// To update table of description when new description is added
function updateDescriptionTable(x, y, desc) {
  let table = document.querySelector("#descriptionTableContainer table"),
    tr,
    td,
    noRecordTr = document.querySelector(
      "#descriptionTableContainer table .noRecordTr"
    );
  if (noRecordTr) {
    table.removeChild(noRecordTr);
  }
  tr = document.createElement("tr");
  tr.id = `tr-${x}-${y}`;
  cellValues = [x, y, desc, "delete"];
  cellValues.forEach((val, index) => {
    td = document.createElement("td");
    tr.appendChild(td);
    if (val === "delete") {
      td.innerHTML = `<span onClick='deleteDescription(${cellValues[0]}, ${cellValues[1]})'>delete</span>`;
    } else {
      td.innerHTML = val;
    }
  });
  table.appendChild(tr);
}
// To delete already added description
function deleteDescription(x, y) {
  if (descriptionMap.has(`${x}:${y}`)) {
    descriptionMap.delete(`${x}:${y}`);
    cancel(x, y);
    document.getElementById("descriptionTableContainer").innerHTML = "";
    createDescriptionTable();
  }
}
