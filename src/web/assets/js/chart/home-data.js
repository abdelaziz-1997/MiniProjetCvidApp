$(document).ready(function () {
  // Get Statistic About Maroc Country
  var parentElement = $("#state-overview > .row").children();
  var firstElement = parentElement.first();
  var secondElement = firstElement.next();
  var ThirdElement = secondElement.next();
  var lastElement = parentElement.last();

  async function loadcovid19data() {
    var dataOfMaroc = null;
    await fetch("https://api.covid19api.com/summary", {
      mode: "cors",
      method: "GET",
      cache: "no-cache",
    })
      .then((res) => res.json())
      .then((data) => {
        dataOfMaroc = data.Countries.find((countryData) => {
          return countryData.Country === "Morocco";
        });
      })
      .catch((err) => {
        console.log("Error Retrieve Data : ", err);
      });

    // Start Fill The Data
    // Confirmed
    firstElement.find(".info-box-number").text(dataOfMaroc.TotalConfirmed);
    firstElement
      .find(".progress-description")
      .text("A augmenté de +" + dataOfMaroc.NewConfirmed);
    //Recovered
    secondElement.find(".info-box-number").text(dataOfMaroc.TotalRecovered);
    secondElement
      .find(".progress-description")
      .text("A augmenté de +" + dataOfMaroc.NewRecovered);
    // Deaths
    ThirdElement.find(".info-box-number").text(dataOfMaroc.TotalDeaths);
    ThirdElement.find(".progress-description").text(
      "A augmenté de +" + dataOfMaroc.NewDeaths
    );
    // Actives
    lastElement
      .find(".info-box-number")
      .text(
        dataOfMaroc.TotalConfirmed -
          dataOfMaroc.TotalRecovered -
          dataOfMaroc.TotalDeaths
      );
    let actived =
      dataOfMaroc.NewConfirmed -
      dataOfMaroc.NewRecovered -
      dataOfMaroc.NewDeaths;
    let incOrDec = actived > 0 ? "A augmenté de " : "Diminué par -";
    lastElement
      .find(".progress-description")
      .text(incOrDec + Math.abs(actived));
    // Start Draw Chart
    TCR = Math.round(
      (dataOfMaroc.TotalRecovered / dataOfMaroc.TotalConfirmed) * 100
    );
    TCD = Math.round(
      (dataOfMaroc.TotalDeaths / dataOfMaroc.TotalConfirmed) * 100
    );
    TCS = 100 - (TCR + TCD);
    var config = {
      type: "pie",
      data: {
        datasets: [
          {
            data: [TCR, TCD, TCS],
            backgroundColor: [
              window.chartColors.green,
              window.chartColors.red,
              window.chartColors.yellow,
            ],
            label: "Dataset Of Covid19",
          },
        ],
        labels: ["Récupérer", "Décidé", "Active"],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
        labels: {
          render: 'percentage',
          fontColor: ['green', 'white', 'red'],
          precision: 2
        }
      }
      },
    };
    var ctx = document.getElementById("chartjs_pie").getContext("2d");
    window.myPie = new Chart(ctx, config);
  }
  // Second Chart
  async function loadDatacovid19Monthly() {
    var M1 = [],
      M2 = [],
      M3 = [],
      M4 = [],
      M5 = [],
      M6 = [],
      M7 = [],
      M8 = [],
      M9 = [],
      M10 = [],
      M11 = [],
      M12 = [];
    var MonthsRec = null;
    var MonthsDeath = null;
    var MonthsAct = null;
    var currentTime = new Date();
    var year = currentTime.getFullYear();
   

    var url = "https://api.covid19api.com/country/morocco";
    await fetch(url, {
      mode: "cors",
      method: "GET",
      cache: "no-cache",
    })
      .then((res) => res.json())
      .then((data) => {
        data.forEach((obj) => {
          var recovred = ((obj.Recovered / obj.Confirmed)*100).toFixed(2);
          var death = ((obj.Deaths / obj.Confirmed)*100).toFixed(2);
          var active = ((obj.Active / obj.Confirmed)*100).toFixed(2);

          if( obj.Date.split("-")[0] == year && obj.Date.split("-")[1] == "01") {
            M1[0] = recovred
            M1[1] = death
            M1[2] = active
          }
          if (obj.Date.split("-")[0] == year && obj.Date.split("-")[1] == "02") {
            M2[0] = recovred
            M2[1] = death
            M2[2] = active
          }
          if (obj.Date.split("-")[0] == year && obj.Date.split("-")[1] == "03") {
            M3[0] = recovred;
            M3[1] = death
            M3[2] = active
          }
          if (obj.Date.split("-")[0] == year && obj.Date.split("-")[1] == "04") {
            M4[0] = recovred
            M4[1] = death
            M4[2] = active
          }
          if (obj.Date.split("-")[0] == year && obj.Date.split("-")[1] == "05") {
            M5[0] = recovred
            M5[1] = death
            M5[2] = active
          }
          if (obj.Date.split("-")[0] == year && obj.Date.split("-")[1] == "06") {
            M6[0] = recovred
            M6[1] = death
            M6[2] = active
          }
          if (obj.Date.split("-")[0] == year && obj.Date.split("-")[1] == "07") {
            M7[0] = recovred
            M7[1] = death 
            M7[2] = active
          }
          if (obj.Date.split("-")[0] == year && obj.Date.split("-")[1] == "08") {
            M8[0] = recovred
            M8[1] = death
            M8[2] = active
          }
          if (obj.Date.split("-")[0] == year && obj.Date.split("-")[1] == "09") {
            M9[0] = recovred
            M9[1] = death
            M9[2] = active
          }
          if (obj.Date.split("-")[0] == year && obj.Date.split("-")[1] == "10") {
            M10[0] = recovred
            M10[1] = death
            M10[2] = active
          }
          if (obj.Date.split("-")[0] == year && obj.Date.split("-")[1] == "11") {
            M11[0] = recovred
            M11[1] = death
            M11[2] = active
          }
          if (obj.Date.split("-")[0] == year && obj.Date.split("-")[1] == "12") {
            M12[0] = recovred
            M12[1] = ((obj.Deaths / obj.Confirmed)*100).toFixed(2);
            M12[2] = active
          }
        });
        MonthsRec = [
          M1[0],
          M2[0],
          M3[0],
          M4[0],
          M5[0],
          M6[0],
          M7[0],
          M8[0],
          M9[0],
          M10[0],
          M11[0],
          M12[0],
        ];
        MonthsDeath = [
          M1[1],
          M2[1],
          M3[1],
          M4[1],
          M5[1],
          M6[1],
          M7[1],
          M8[1],
          M9[1],
          M10[1],
          M11[1],
          M12[1],
        ];
        MonthsAct = [
          M1[2],
          M2[2],
          M3[2],
          M4[2],
          M5[2],
          M6[2],
          M7[2],
          M8[2],
          M9[2],
          M10[2],
          M11[2],
          M12[2],
        ];
      })
      .catch((err) => {
        console.log("Error Retrieve Data : ", err);
      });
    // Start Draw Chart
    var color = Chart.helpers.color;
    var barChartData = {
      labels: [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre  ",
        "Octobre ",
        "Novembre ",
        "Decembre ",
      ],
      datasets: [
        {
          type: "bar",
          label: "Active",
          backgroundColor: color(window.chartColors.yellow)
            .alpha(0.7)
            .rgbString(),
          borderColor: window.chartColors.yellow,
          data: MonthsAct,
        },
        {
          type: "line",
          label: "Récupérer",
          backgroundColor: color(window.chartColors.green)
            .alpha(0.2)
            .rgbString(),
          borderColor: window.chartColors.green,
          data: MonthsRec,
        },
        {
          type: "bar",
          label: "Décidé",
          backgroundColor: color(window.chartColors.red).alpha(0.7).rgbString(),
          borderColor: window.chartColors.red,
          data: MonthsDeath,
        },
      ],
    };
    var ctx = document.getElementById("canvas1").getContext("2d");
    window.myBar = new Chart(ctx, {
      type: "bar",
      data: barChartData,
      options: {
        responsive: true,
        title: {
          display: true,
          text: "Représentation données pour chaque mois - "+ year,
        },
      },
    });
  }
  loadcovid19data();
  loadDatacovid19Monthly();

  /****************** refresh button in pie Chart *****************/
  $(".box-refresh.pieChart").on("click", function (e) {
    e.preventDefault();
    $(
      "<div class='refresh-block'><span class='refresh-loader'><i class='fa fa-spinner fa-spin'></i></span></div>"
    ).appendTo(
      $(this).parents(".tools").parents(".card-head").parents(".card")
    );
    loadcovid19data();
    setTimeout(function () {
      $(".refresh-block").remove();
    }, 1000);
  });
  /****************** refresh button in Circle Chart  *****************/
  $(".box-refresh.circleChart").on("click", function (e) {
    e.preventDefault();
    $(
      "<div class='refresh-block'><span class='refresh-loader'><i class='fa fa-spinner fa-spin'></i></span></div>"
    ).appendTo(
      $(this).parents(".tools").parents(".card-head").parents(".card")
    );
    loadDatacovid19Monthly();
    setTimeout(function () {
      $(".refresh-block").remove();
    }, 1000);
  });
});
