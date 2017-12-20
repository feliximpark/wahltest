console.log("JS läuft");
mapboxgl.accessToken = 'pk.eyJ1IjoiZmVsaXhpbXBhcmsiLCJhIjoiY2piMjh3a3UyOGhxejMycThuYWthODBnciJ9.wmJRvVwwtNr2VIweGqcZvQ';

//called function by clicking button "Zweitstimme"
function zweitstimme(){
    var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/feliximpark/ciz89vlfv005h2sqzq3iupqok' //
    });



    // when map loaded, starting operations
    map.on('load', function(){

        // add source for new layers (ex for hover effect etc.)
        // using stores-variable with geojson in it
        map.addSource("boundaries", {
        "type": "geojson",
        "data": stores
        });
        // add normal layer which is showed by starting app
        map.addLayer({
            "id": "datalayer",
            "type": "fill",
            "source": "boundaries",
            "layout": {},
            "paint": {
                "fill-color": "#627BC1",
                "fill-opacity": 0
            }
        });
        // add layer for hover-style, setting filter to fade it out
        map.addLayer({
            "id": "datalayer_hover",
            "type": "fill",
            "source": "boundaries",

            "layout": {},
            "paint": {
                "fill-color": "black",
                "fill-opacity": 0.3
            },
            "filter": ["==", "Wahlbez_Nr", ""]
        });

         // Change the cursor to a pointer when the mouse is over the states layer, change back when leaving the geodata of our datalayer
        map.on('mouseenter', 'datalayer', function(e) {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'datalayer', function () {
            map.getCanvas().style.cursor = '';
        });


        // Creating hover-effect
        map.on("mousemove", "datalayer", function(e){
            map.setFilter("datalayer_hover", ["==", "Wahlbez_Nr", e.features[0].properties.Wahlbez_Nr]);
        });
        //reset hover effect when mouse leaves polygon
        map.on("mouseleave", "datalayer", function(){
            map.setFilter("datalayer_hover", ["==", "Wahlbez_Nr", ""]);
        });

        // declaring var for popup
        var popup = new mapboxgl.Popup({
                    closeButton: false,
                    closeOnClick: false
                });
        //onclick open infowindow
        map.on('click', function(e){
            document.getElementById("infobox").style.display="inline";
            document.getElementById("message").style.display="none";
        });
         //closing Infobox on click
        function hide(){
            document.getElementById("infobox").style.display="none";
            document.getElementById("message").style.display="inline";
        };
        infowindow = document.getElementById("closeimg");
        infowindow.onclick = hide;


        // collecting data by hovering over polygon
        map.on('mousemove', function(e) {
            var election_data = map.queryRenderedFeatures(e.point, {layers: ['bswithcsv-5gxggy']});
        //wahl_clean_final_gewichtung_zs - preparing vars for datatransfer
            if (election_data.length > 0){
                var datasource = election_data[0].properties;
                var election_area = datasource.wahl_clean_final_BEZEICHNUNG;
                var election_number = datasource.Wahlbez_Nr;
                var votes = datasource.wahl_clean_final_B;
                var participation = datasource.wahl_clean_final_Beteiligung;
                var cdu = datasource.wahl_clean_final_CDU;
                var spd = datasource.wahl_clean_final_SPD;
                var grüne = datasource.wahl_clean_final_Grüne;
                var fdp = datasource.wahl_clean_final_FDP;
                var linke = datasource.wahl_clean_final_Linke;
                var afd = datasource.wahl_clean_final_AFD;
                var sonstige = datasource.wahl_clean_final_Sonstige.substring(0,4);
                var müller_cdu = datasource.wahl_clean_final_Müller_CDU;
                var reimann_spd = datasource.wahl_clean_final_Reimann_SPD;
                var krause_grüne = datasource.wahl_clean_final_Krause_Grüne;
                var gürtas_linke = datasource.wahl_clean_final_Gürtas_Linke;
                var schramm_fdp = datasource.wahl_clean_final_Schramm_FDP;
                var hanker_afd = datasource.wahl_clean_final_Hanker_AFD;
                var deutsch_mlpd = datasource.wahl_clean_final_Deutsch_MLPD;
                var rosenbaum_bibs = datasource.wahl_clean_final_Rosenbaum_BIBS;
                // Zweitstimme creating data-package with highest values on top
                var data = [["CDU", cdu], ["SPD", spd], ["FDP", fdp], ["Grüne", grüne], ["Linke", linke], ["AfD", afd], ["Sonstige", sonstige]];
                //sort array, lowest value first
                data.sort(function(a,b){
                    return a[1] - b[1];
                });
                // Erststimme creating data-package with highest values on top
                var data_es = [["Carsten Müller (CDU)", müller_cdu], ["Carola Reimann (SPD)", reimann_spd], ["Juliane Krause (Grüne)", krause_grüne], ["Cihane Gürtas-Yildrim (Linke)", gürtas_linke], ["Mirco Hanker (AfD)", hanker_afd], ["Ingo Schramm (FDP)", schramm_fdp], ["Paul Deutsch (MLPD)", deutsch_mlpd], ["Peter Rosenbaum (BIBS)", rosenbaum_bibs]];
                // sort array
                data_es.sort(function(a,b){
                    return a[1] - b[1];
                });

                // creating content for the info-box (party and percent)
                var content ="<p><b>Wahlbeteiligung: </b>"+participation+" Prozent (ohne Briefwähler)</p><br>";
                for(i = 6; i>=0; i--){
                    content += "<p><b>"+data[i][0]+": </b>"+data[i][1]+" Prozent</p>"
                }
                content += "<hr><p><b>Gewinner Direktkandidat:</b></p><p><b>"+data_es[7][0]+":</b> "+data_es[7][1]+"</p><br><p>Weitere Kandidaten:</p>"
                // adding data for Direktkandidaten
                for(k = 6; k>=0; k--){
                    content += "<p><b>"+data_es[k][0]+": </b>"+data_es[k][1]+" Prozent</p>"
                }
                //injecting content in infobox
                var box = document.getElementById("results");
                box.innerHTML = content;

                //injecting name of election area in HTML
                var wahllokal = document.getElementById("wahllokal");
                wahllokal.innerHTML = "<h3>"+election_area+"</h3> ";

                //preparing width of colorbars
                var barcontent = "";
                for(j = 6; j>=0; j--){
                    var partycolor = data[j][0];
                    var barcolor;
                    function bar_color (){
                        if (partycolor == "CDU"){
                            return "black";
                        }
                        else if (partycolor == "SPD"){
                            return "red";
                        }
                        else if (partycolor == "FDP"){
                            return "yellow";
                        }
                        else if (partycolor == "Grüne"){
                            return "green";
                        }
                        else if (partycolor == "Linke"){
                            return "purple";
                        }
                        else if (partycolor == "AfD"){
                            return "blue";
                        }
                        else{
                            return "grey";
                        }
                    };

                    barcontent += "<div class='bar' style='width:"+data[j][1]+"%;background-color:"+bar_color()+"'></div>";
                };

                var bar = document.getElementById("bar");

                document.getElementById("bar").innerHTML = barcontent;

                // creating popup by hover
                // adding popup automatically deletes old popup
                coord = e.lngLat;
                coord.lat = coord.lat + 0.0050
                popup.setLngLat(coord)
                    .setHTML("<h4>"+election_area+"</h4><h6>Wahlbezirk-Nr.: "+election_number+" / abgegebene Stimmen:"+votes+"</h6><div class='smallbar'>"+barcontent+"</div>")
                    .addTo(map);
                // document.getElementById("smallbar").innerHTML = barcontent;



// map.on("mousemove", "datalayer", function(e){
//             map.setFilter("datalayer_hover", ["==", "Wahlbez_Nr", e.features[0].properties.Wahlbez_Nr]);
        // });
        // end of if-loop
            };

        });
    });
};




zweitstimme();
