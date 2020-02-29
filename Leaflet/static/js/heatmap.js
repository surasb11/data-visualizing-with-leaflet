var myMap = L.map("map", {
	center: [29.9483519,-113.7599537],
	zoom: 3.5,
	layers: [outdoors, faultLine, earthquakes]
});

L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
	attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
	maxZoom: 18,
	id: "mapbox.streets",
	accessToken: API_KEY
}).addTo(myMap);

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(url, function(response) {

	console.log(response);

	var heatArray = [];

	for (var i = 0; i < response.length; i++) {
		var location = response[i].location;

		if (location) {
			heatArray.push([location.coordinates[1], location.coordinates[0]]);
		}
	}

	var heat = L.heatLayer(heatArray, {
		radius: 20,
		blur: 35
	}).addTo(myMap);

});
