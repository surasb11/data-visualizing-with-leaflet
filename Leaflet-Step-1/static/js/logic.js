// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Query to retrieve the faultline data
var faultlinequery = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
	// Once we get a response, send the data.features object to the createFeatures function
	createFeatures(data.features);
});


function createFeatures(earthquakeData) {

	// Define a function we want to run once for each feature in the features array
	// Give each feature a popup describing the place and time of the earthquake
	function onEachFeature(feature, layer) {
		layer.bindPopup("<h3>" + feature.properties.place +
			"</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
	}

	// Define function to create the circle radius based on the magnitude
	function radiusSize(magnitude) {
		return magnitude * 20000;
	}

	// Define function to set the circle color based on the magnitude
function c_color(magnitude) {
	if (magnitude <= 1) {
		return "#f5e640"
	}
	else if (magnitude <= 2) {
		return "#f5c440"
	}
	else if (magnitude <= 3) {
		return "#ff9326"
	}
	else if (magnitude <= 4) {
		return "#ff7626"
	}
	else if (magnitude <= 5) {
		return "#f04d24"
	}
	else {
		return "#d62020"
	}
};


	// Create a GeoJSON layer containing the features array on the earthquakeData object
	// Run the onEachFeature function once for each piece of data in the array
	var earthquakes = L.geoJSON(earthquakeData, {
		pointToLayer: function(earthquakeData, latlng) {
			return L.circle(latlng, {
				radius: radiusSize(earthquakeData.properties.mag),
				color: c_color(earthquakeData.properties.mag),
				fillOpacity: 1
			});
		},
		onEachFeature: onEachFeature
	});

	// Sending our earthquakes layer to the createMap function
	createMap(earthquakes);
}

function createMap(earthquakes) {

	// Define streetmap, satellite, and dark layers
	var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
		attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
		maxZoom: 18,
		id: "mapbox.streets",
		accessToken: API_KEY
	});
	
	var highContrastMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox.high-contrast',
		accessToken: API_KEY
	});

	var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
		attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
		maxZoom: 18,
		id: "mapbox.satellite",
		accessToken: API_KEY
	});

	var dark = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
		attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
		maxZoom: 18,
		id: "mapbox.dark",
		accessToken: API_KEY
	});
	

	// Create the faultline layer
	var faultLine = new L.LayerGroup();
	
	// Define a baseMaps object to hold our base layers
	var baseMaps = {
		"High Contrast": highContrastMap,
		"Street Map": streetmap,
		"Dark Map": dark,
		"Satellite Map": satellite
	};

	// Create overlay object to hold our overlay layer
	var overlayMaps = {
		Earthquake: earthquakes,
		FaultLines: faultLine
	};
	

	// Create our map, giving it the streetmap and earthquakes layers to display on load
	var myMap = L.map("map", {
		center: [29.9483519,-113.7599537],
		zoom: 3.5,
		layers: [streetmap, earthquakes, faultLine]
	});
	
	// Create the faultlines and add them to the faultline layer
	d3.json(faultlinequery, function(data) {
		L.geoJSON(data, {
			style: function() {
				return {color: "#ffcc33", 
						weight: 2,
						fillOpacity: 0}
			}
		}).addTo(faultLine).bringToBack()
	})

	// Create a layer control
	// Pass in our baseMaps and overlayMaps
	// Add the layer control to the map
	L.control.layers(baseMaps, overlayMaps, {
		collapsed: true
	}).addTo(myMap);


	// Add legend to the map
	var legend = L.control({position: "bottomright"});
	
	legend.onAdd = function (myMap) {
	
		var div = L.DomUtil.create("div", "info legend");
		
		var grades = [0, 1, 2, 3, 4, 5];
		var colors = ['#ffff33', '#ccff33','#ff3333', 
						'#ff6633', '#ff9933', '#ffcc33'];
	
		// loop through our density intervals and generate a label with a colored square for each interval
		for (var i = 0; i < grades.length; i++) {
			div.innerHTML += "<i style='background: " + colors[i] + "'></i> " + 
			grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
		}
		return div;
	};
	
	// Add legend to the map
	legend.addTo(myMap);
};