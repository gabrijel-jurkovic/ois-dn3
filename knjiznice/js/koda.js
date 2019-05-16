
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";
var patitentBMI=null;

/**
 * Generiranje niza za avtorizacijo na podlagi uporabniškega imena in gesla,
 * ki je šifriran v niz oblike Base64
 *
 * @return avtorizacijski niz za dostop do funkcionalnost
 */
function getAuthorization() {
  return "Basic " + btoa(username + ":" + password);
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
function generirajPodatke(stPacienta) {
  if (stPacienta===1){
      var ime = "Gabrijel";
      var priimek = "Jurkovic";
      var datumRojstva = "1998-12-05";
      var visina= 192;
      var teza = 82;

      return postGenerated(ime,priimek,datumRojstva,visina,teza);
  }
  else if(stPacienta===2){
      var ime = "Don Vito";
      var priimek = "Corleone";
      var datumRojstva = "1892-12-07";
      var visina= 175;
      var teza = 95;

      return postGenerated(ime,priimek,datumRojstva,visina,teza);
  }
  else if(stPacienta===3){
      var ime = "Claudia";
      var priimek = "Schiffer";
      var datumRojstva = "1970-08-25";
      var visina= 180;
      var teza = 58;

      return postGenerated(ime,priimek,datumRojstva,visina,teza);
  }

}

function postGenerated (ime,priimek,datumRojstva,visina,teza){
    var ehr="";
    $.ajax({
        async:false,
        url: baseUrl + "/ehr",
        type: 'POST',
        headers: {
            "Authorization": getAuthorization()
        },
        success: function (data) {
            var ehrId = data.ehrId;
            ehr=ehrId;
            var partyData = {
                firstNames: ime,
                lastNames: priimek,
                dateOfBirth: datumRojstva,
                additionalInfo: {"ehrId": ehrId}
            };
            $.ajax({
                url: baseUrl + "/demographics/party",
                type: 'POST',
                headers: {
                    "Authorization": getAuthorization()
                },
                contentType: 'application/json',
                data: JSON.stringify(partyData),
                success: function (party) {
                    if (party.action == 'CREATE') {
                        var datumInUra = new Date();
                        var telesnaVisina = visina;
                        var telesnaTeza = teza;
                        var merilec = "Gabrijel Jurkovic";

                        if (!ehrId || ehrId.trim().length == 0) {
                            $("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
                        } else {
                            var podatki = {
                                "ctx/language": "en",
                                "ctx/territory": "SI",
                                "ctx/time": datumInUra,
                                "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
                                "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
                            };
                            var parametriZahteve = {
                                "ehrId": ehrId,
                                templateId: 'Vital Signs',
                                format: 'FLAT',
                                committer: merilec
                            };
                            $.ajax({
                                url: baseUrl + "/composition?" + $.param(parametriZahteve),
                                type: 'POST',
                                headers: {
                                    "Authorization": getAuthorization()
                                },
                                contentType: 'application/json',
                                data: JSON.stringify(podatki),
                            });
                        }
                    }
                },
                error: function(err) {
                    $("#kreirajSporocilo").html("<span class='obvestilo label " +
                        "label-danger fade-in'>Napaka '" +
                        JSON.parse(err.responseText).userMessage + "'!");
                }

            });
        }

    });
return ehr;
}



// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija

function kreirajEHRzaBolnika() {
  var ime = $("#kreirajIme").val();
  var priimek = $("#kreirajPriimek").val();
  var datumRojstva = $("#kreirajDatumRojstva").val();
  var visina= $("#kreirajVisino").val();
  var teza = $("#kreirajTezo").val();

  if (!ime || !priimek || !datumRojstva ||!visina|| !teza|| visina==0 || teza==0 || ime.trim().length == 0 ||
      priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
    $("#kreirajSporocilo").html("<span class='obvestilo label " +
        "label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
  } else {
    $.ajax({
      url: baseUrl + "/ehr",
      type: 'POST',
      headers: {
        "Authorization": getAuthorization()
      },
      success: function (data) {
        var ehrId = data.ehrId;
        var partyData = {
          firstNames: ime,
          lastNames: priimek,
          dateOfBirth: datumRojstva,
          additionalInfo: {"ehrId": ehrId}
        };
        $.ajax({
          url: baseUrl + "/demographics/party",
          type: 'POST',
          headers: {
            "Authorization": getAuthorization()
          },
          contentType: 'application/json',
          data: JSON.stringify(partyData),
          success: function (party) {
            if (party.action == 'CREATE') {
              $("#kreirajSporocilo").html("<span class='obvestilo " +
                  "label label-success fade-in'>Uspešno kreiran EHR '" +
                  ehrId + "'.</span>");
              $("#preberiEHRid").val(ehrId);


              var datumInUra = new Date();
              var telesnaVisina = visina;
              var telesnaTeza = teza;
              var merilec = "Gabrijel Jurkovic";

              if (!ehrId || ehrId.trim().length == 0) {
                $("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
              } else {
                var podatki = {
                  "ctx/language": "en",
                  "ctx/territory": "SI",
                  "ctx/time": datumInUra,
                  "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
                  "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
                };
                var parametriZahteve = {
                  "ehrId": ehrId,
                  templateId: 'Vital Signs',
                  format: 'FLAT',
                  committer: merilec
                };
                $.ajax({
                  url: baseUrl + "/composition?" + $.param(parametriZahteve),
                  type: 'POST',
                  headers: {
                    "Authorization": getAuthorization()
                  },
                  contentType: 'application/json',
                  data: JSON.stringify(podatki),
                  success: function (res) { // pošiljanje podatkov na server
                    $("#kreirajSporocilo").html("<span class='obvestilo label label-success fade-in'>Uspešno kreiran EHR '" + ehrId + "' + dodani podatki.</span>");
                  },
                  error: function(err) {
                    $("#kreirajSporocilo").html("<span class='obvestilo label label-danger fade-in'>Napaka '" + JSON.parse(err.responseText).userMessage + "'!");
                  }
                });
              }
            }
          },
          error: function(err) {
            $("#kreirajSporocilo").html("<span class='obvestilo label " +
                "label-danger fade-in'>Napaka '" +
                JSON.parse(err.responseText).userMessage + "'!");
          }
        });
      }
    });
  }
}

//funkcija za pridobivanje receptov
function getRecipes(bmi) {
    var piletina = new Object();
    var svinjetina = new Object();
    var govedina= new Object();

  if (bmi<19){ // nizak BMI
    fetch('https://cors.io/?https://api.edamam.com/search?q=chicken&app_id=cdf44dcd&app_key=16fcac1b229242e5ad960ae8841bca90&from=0&to=100')
        .then(resp=>resp.json())
        .then(function (data) {
          var counter=0;
          data.hits.forEach(hits=>{
            if (hits.recipe.totalDaily.ENERC_KCAL.quantity >350&& counter <5){
                piletina.ime=hits.recipe.label;
                piletina.link=hits.recipe.shareAs;

                //dodavanje detalja
                $("#listaPiletina").append($("<li><a href='"+piletina.link+"'>"+piletina.ime+"</a></li>"));
              counter++;
            }

          })
        });
    fetch('https://cors.io/?https://api.edamam.com/search?q=pork&app_id=cdf44dcd&app_key=16fcac1b229242e5ad960ae8841bca90&from=0&to=100')
        .then(resp=>resp.json())
        .then(function (data) {
          var counter=0;
          data.hits.forEach(hits=>{
            if (hits.recipe.totalDaily.ENERC_KCAL.quantity >350&& counter <5){
                svinjetina.ime=hits.recipe.label;
                svinjetina.link=hits.recipe.shareAs;

                $("#listaSvinjina").append($("<li><a href='"+svinjetina.link+"'>"+svinjetina.ime+"</a></li>"));
              counter++;
            }

          })
        });
    fetch('https://cors.io/?https://api.edamam.com/search?q=beef&app_id=cdf44dcd&app_key=16fcac1b229242e5ad960ae8841bca90&from=0&to=100')
        .then(resp=>resp.json())
        .then(function (data) {
          var counter=0;
          data.hits.forEach(hits=>{
            if (hits.recipe.totalDaily.ENERC_KCAL.quantity >350&& counter <5){
                govedina.ime=hits.recipe.label;
                govedina.link=hits.recipe.shareAs;

                $("#listaGoveje").append($("<li><a href='"+govedina.link+"'>"+govedina.ime+"</a></li>"));
              counter++;
            }

          })
        });
  }
  else if (bmi>=19 && bmi <=25){ // normalan BMI

    fetch('https://api.edamam.com/search?q=chicken&app_id=cdf44dcd&app_key=16fcac1b229242e5ad960ae8841bca90&from=0&to=100')
        .then(resp=>resp.json())
        .then(function (data) {
          var counter=0;
          data.hits.forEach(hits=>{
            if (hits.recipe.totalDaily.ENERC_KCAL.quantity <350 && hits.recipe.totalDaily.ENERC_KCAL.quantity > 200 && counter <5){
                piletina.ime=hits.recipe.label;
                piletina.link=hits.recipe.shareAs;

                $("#listaPiletina").append($("<li><a href='"+piletina.link+"'>"+piletina.ime+"</a></li>"));
              counter++;
            }
          })
        });
    fetch('https://api.edamam.com/search?q=pork&app_id=cdf44dcd&app_key=16fcac1b229242e5ad960ae8841bca90&from=0&to=100')
        .then(resp=>resp.json())
        .then(function (data) {
          var counter=0;
          data.hits.forEach(hits=>{
            if (hits.recipe.totalDaily.ENERC_KCAL.quantity <350 && hits.recipe.totalDaily.ENERC_KCAL.quantity > 200 && counter <5){
                svinjetina.ime=hits.recipe.label;
                svinjetina.link=hits.recipe.shareAs;

                $("#listaSvinjina").append($("<li><a href='"+svinjetina.link+"'>"+svinjetina.ime+"</a></li>"));
              counter++;
            }
          })
        });
    fetch('https://api.edamam.com/search?q=beef&app_id=cdf44dcd&app_key=16fcac1b229242e5ad960ae8841bca90&from=0&to=100')
        .then(resp=>resp.json())
        .then(function (data) {
          var counter=0;
          data.hits.forEach(hits=>{
            if (hits.recipe.totalDaily.ENERC_KCAL.quantity <350 && hits.recipe.totalDaily.ENERC_KCAL.quantity > 200 && counter <5){
                govedina.ime=hits.recipe.label;
                govedina.link=hits.recipe.shareAs;

                $("#listaGoveje").append($("<li><a href='"+govedina.link+"'>"+govedina.ime+"</a></li>"));
              counter++;
            }
          })
        })
  }
  else if (bmi > 25){ // visok BMI
    fetch('https://api.edamam.com/search?q=chicken&app_id=cdf44dcd&app_key=16fcac1b229242e5ad960ae8841bca90&from=0&to=100')
        .then(resp=>resp.json())
        .then(function (data) {
          var counter=0;
          data.hits.forEach(hits=>{
            if (hits.recipe.totalDaily.ENERC_KCAL.quantity < 200&& counter <5){
                piletina.ime=hits.recipe.label;
                piletina.link=hits.recipe.shareAs;

                $("#listaPiletina").append($("<li><a href='"+piletina.link+"'>"+piletina.ime+"</a></li>"));
              counter++;
            }

          })
        });
    fetch('https://api.edamam.com/search?q=pork&app_id=cdf44dcd&app_key=16fcac1b229242e5ad960ae8841bca90&from=0&to=100')
        .then(resp=>resp.json())
        .then(function (data) {
          var counter=0;
          data.hits.forEach(hits=>{
            if (hits.recipe.totalDaily.ENERC_KCAL.quantity < 200&& counter <5){
                svinjetina.ime=hits.recipe.label;
                svinjetina.link=hits.recipe.shareAs;

                $("#listaSvinjina").append($("<li><a href='"+svinjetina.link+"'>"+svinjetina.ime+"</a></li>"));
              counter++;
            }

          })
        });
    fetch('https://api.edamam.com/search?q=beef&app_id=cdf44dcd&app_key=16fcac1b229242e5ad960ae8841bca90&from=0&to=100')
        .then(resp=>resp.json())
        .then(function (data) {
          var counter=0;
          data.hits.forEach(hits=>{
            if (hits.recipe.totalDaily.ENERC_KCAL.quantity < 200&& counter <5){
                govedina.ime=hits.recipe.label;
                govedina.link=hits.recipe.shareAs;

                $("#listaGoveje").append($("<li><a href='"+govedina.link+"'>"+govedina.ime+"</a></li>"));
              counter++;
            }

          })
        });
  }
}


function preberiEHRodBolnika() {
    //brisanje recepata
    $("ol").empty();

  var ehrId = $("#preberiEHRid").val();
  if (!ehrId || ehrId.trim().length == 0) {
    $("#preberiSporocilo").html("<span class='obvestilo label label-warning " +
        "fade-in'>Prosim vnesite zahtevan podatek!");
  } else {

    var visina;
    var teza;
    //pridobivanje teze pacienta
   $.ajax({
      url: baseUrl + "/view/" + ehrId+"/weight",
      type: 'GET',
      headers: {
        "Authorization": getAuthorization()
      },
      success: function (res) {
        if (res.length > 0) {
          teza=parseFloat(res[0].weight);
            //pridobivanje visine pacienta
            $.ajax({
                url: baseUrl + "/view/" + ehrId+"/height",
                type: 'GET',
                headers: {
                    "Authorization": getAuthorization()
                },
                success: function (res) {
                    visina= parseFloat(res[0].height)/100;
                    var BMI =(teza/(visina*visina)).toFixed(2);
                    if (res.length > 0) {

                        $("#preberiSporocilo").html("<span class='obvestilo label label-success " + "fade-in'>"+ 'Vaš BMI je '+BMI);
                        narisiGraf(BMI);
                        getRecipes(BMI);
                    } else {
                        $("#preberiSporocilo").html(
                            "<span class='obvestilo label label-warning fade-in'>" +
                            "Ni podatkov!</span>");
                    }
                },
                error: function(err) {
                    $("#preberiSporocilo").html("<span class='obvestilo label " +
                        "label-danger fade-in'>Napaka '" +
                        JSON.parse(err.responseText).userMessage + "'!");
                }
            });
        } else {
          $("#preberiSporocilo").html(
              "<span class='obvestilo label label-warning fade-in'>" +
              "Ni podatkov!</span>");
        }
      },
      error: function(err) {
        $("#preberiSporocilo").html("<span class='obvestilo label " +
            "label-danger fade-in'>Napaka '" +
            JSON.parse(err.responseText).userMessage + "'!");
      }
    });
  }
}




window.addEventListener("load", function () {

    // predloge bolnikov
    $("#preberiPredlogoBolnika").on('change',function () {
        if ($("#preberiPredlogoBolnika").val() === "Gabrijel Jurkovic"){
            $("#kreirajIme").val("Gabrijel");
            $("#kreirajPriimek").val("Jurkovic");
            $("#kreirajDatumRojstva").val("1998-12-05");
            $("#kreirajVisino").val("192");
            $("#kreirajTezo").val("82");
        }
        else if ($("#preberiPredlogoBolnika").val() === "Don Vito Corleone"){
            $("#kreirajIme").val("Don Vito");
            $("#kreirajPriimek").val("Corleone");
            $("#kreirajDatumRojstva").val("1892-12-07");
            $("#kreirajVisino").val("175");
            $("#kreirajTezo").val("95");
        }
        else if ($("#preberiPredlogoBolnika").val() === "Claudia Schiffer"){
            $("#kreirajIme").val("Claudia");
            $("#kreirajPriimek").val("Schiffer");
            $("#kreirajDatumRojstva").val("1970-08-25");
            $("#kreirajVisino").val("180");
            $("#kreirajTezo").val("58");
        }
    });
    //generiranje podatkov
    $("#generiranje").on('click',function () {
        for (var i = 1; i <= 3; i++){
            if (i==1){
                $("#patient1").attr("ehrValue",generirajPodatke(i));
            }
            else if( i==2){
                $("#patient2").attr("ehrValue",generirajPodatke(i));
            }
            else if (i==3){
                $("#patient3").attr("ehrValue",generirajPodatke(i));
            }
        }

    });
    //izbira 3 pacijenti
    $("#preberiObstojeciEHR").on('change',function () {
       if ($("#preberiObstojeciEHR").val() == "Gabrijel Jurkovic"){
           $("#preberiEHRid").val($("#patient1").attr("ehrValue"));
       }
       else if($("#preberiObstojeciEHR").val() == "Don Vito Corleone"){
           $("#preberiEHRid").val($("#patient2").attr("ehrValue"));
       }
       else if($("#preberiObstojeciEHR").val() == "Claudia Schiffer"){
           $("#preberiEHRid").val($("#patient3").attr("ehrValue"));
       }
    });

    console.log(window.location.pathname)

    //for distribution
   if(window.location.pathname==="/bolnisnice.html"){
        navigator.geolocation.getCurrentPosition(function(location) {
            var latlng = new L.LatLng(location.coords.latitude, location.coords.longitude);
            prikaziMapo(latlng);
        });
    }
    else if(window.location.pathname==="/index.html"){
        narisiGraf(patitentBMI);
    }

    // for development
   /*if(window.location.pathname==="/gabrijel98.bitbucket.org/bolnisnice.html"){
        navigator.geolocation.getCurrentPosition(function(location) {
            var latlng = new L.LatLng(location.coords.latitude, location.coords.longitude);
            prikaziMapo(latlng);
        });
    }
    else if(window.location.pathname==="/gabrijel98.bitbucket.org/index.html"){
        narisiGraf(patitentBMI);
    }*/


    $("#chicken").click(function () {
        $("#listaPiletina").css({'visibility':'visible'});
        $("#listaSvinjina").css({'visibility':'hidden'});
        $("#listaGoveje").css({'visibility':'hidden'});

    });
    $("#pork").click(function () {
        $("#listaSvinjina").css({'visibility':'visible'});
        $("#listaPiletina").css({'visibility':'hidden'});
        $("#listaGoveje").css({'visibility':'hidden'});
    });
    $("#beef").click(function () {
        $("#listaGoveje").css({'visibility':'visible'});
        $("#listaSvinjina").css({'visibility':'hidden'});
        $("#listaPiletina").css({'visibility':'hidden'});
    });
});


//create bar chart
function narisiGraf(bmi){
  var layout = {
    xaxis: {
      title: 'BMI',
      size: 14
    },
    yaxis:{
      title: 'Pogostost (%)',
      size: 14
    }
  };
  var data = [{
    x: [15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50],
    y: [0.1 ,0.2,0.55,1.7,2.8,4.3,6.1,7,7.8,8.45,10,
      6.3,7.5,6.3,4.5,3.5,3.6,3.45,2.5,2.3,1.75,1.85,
      1.4,1.2,0.9,0.8,0.7,0.6,0.5,0.6,0.2,0.5,0.2,0.5,0.1,0.05],
    marker: {
      color: ['rgb(107, 185, 240)','rgb(107, 185, 240)',
        'rgb(34, 167, 240)','rgb(34, 167, 240)',
        'rgb(46, 204, 113)','rgb(46, 204, 113)','rgb(46, 204, 113)','rgb(46, 204, 113)','rgb(46, 204, 113)','rgb(46, 204, 113)','rgb(46, 204, 113)',
        'rgb(37, 116, 169)','rgb(37, 116, 169)','rgb(37, 116, 169)','rgb(37, 116, 169)','rgb(37, 116, 169)',
        'rgb(52, 93, 135)','rgb(52, 93, 135)','rgb(52, 93, 135)','rgb(52, 93, 135)','rgb(52, 93, 135)','rgb(52, 93, 135)',
        'rgb(44, 62, 80)','rgb(44, 62, 80)','rgb(44, 62, 80)','rgb(44, 62, 80)',
        'rgb(25, 37, 48)','rgb(25, 37, 48)','rgb(25, 37, 48)','rgb(25, 37, 48)','rgb(25, 37, 48)','rgb(25, 37, 48)','rgb(25, 37, 48)','rgb(25, 37, 48)','rgb(25, 37, 48)','rgb(25, 37, 48)']
    },
    type: 'bar'
  }];

  data[0].marker.color[Math.round(bmi)-15]='rgb(247, 144, 9)';
  Plotly.newPlot('diagram', data, layout, {showSendToCloud:true});
}
//end of bar chart

function prikaziMapo(positionInfo) {
    var mapa;
    var mapOptions = {
        center: positionInfo,
        zoom: 13
    };
    mapa = L.map('mapa_id', mapOptions);
    var layer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    mapa.addLayer(layer);


    //podatci o bolnicama
    const request = new XMLHttpRequest();
    request.open('GET', 'https://teaching.lavbic.net/cdn/OIS/DN3/bolnisnice.json');
    request.send();
    request.onload = () => {
        if (request.status === 200) {
            var bolnice = JSON.parse(request.response).features;
            for (var i = 0; i < bolnice.length; i++) {

                if (bolnice[i].geometry.type == "Polygon") {
                    var name = bolnice[i].properties.name;
                    if (name == null) {
                        name = "Ni podatkov";
                    }

                    if (bolnice[i].properties.hasOwnProperty("addr:street")) {
                        var addres = bolnice[i].properties["addr:street"];
                        var addresNum = bolnice[i].properties["addr:housenumber"];
                    } else {
                        var addres = "Ni podatkov";
                        var addresNum = "";
                    }

                    for (var j = 0; j < bolnice[i].geometry.coordinates[0].length; j++) {
                        bolnice[i].geometry.coordinates[0][j].reverse();
                       // console.log(bolnice[i].geometry.coordinates[0][j][0])

                    }

                    var polygon = L.polygon(bolnice[i].geometry.coordinates, {color: 'blue'}).bindPopup("<b>Ime:</b> " + name + "<br><b>Naslov:</b> " + addres + " " + addresNum);

                    for (var j=0;j<bolnice[i].geometry.coordinates[0].length;j++) {
                        if (distance(bolnice[i].geometry.coordinates[0][j][0], bolnice[i].geometry.coordinates[0][j][1], positionInfo.lat, positionInfo.lng) <= 2) {
                            polygon.options.color = "green";
                            polygon.addTo(mapa);
                        } else {
                            polygon.options.color="blue";
                            polygon.addTo(mapa);
                        }
                    }

                }

            }

        }
    };

    request.onerror = () => {
        console.log("error")
    };
}









