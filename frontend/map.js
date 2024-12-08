var map = L.map('map').setView([31.3, 121.5], 15);
console.log('Map initialized');

L.tileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
console.log('Tile layer added');

var points = [];
var pathLayer;

map.on('click', function(e) {
    console.log('Map clicked at', e.latlng);
    if (points.length < 2) {
        fetchNearestPoint(e.latlng.lat, e.latlng.lng);
    }
});

function fetchNearestPoint(lat, lon) {
    console.log('Fetching nearest point for', lat, lon);
    fetch(`http://localhost:18080/nearest_point?lat=${lat}&lon=${lon}`)
        .then(response => {
            console.log('Nearest point response received');
            return response.json();
        })
        .then(data => {
            console.log('Nearest point data', data);
            points.push(data.nearest_point);
            console.log('Points array updated', points);
            if (points.length === 2) {
                fetchShortestPath(points[0], points[1]);
                points = [];
                console.log('Points array reset');
            }
        });
}

function fetchShortestPath(start, end) {
    console.log('Fetching shortest path from', start, 'to', end);
    fetch(`http://localhost:18080/shortest_path?start=${start}&end=${end}`)
        .then(response => {
            console.log('Shortest path response received');
            return response.json();
        })
        .then(data => {
            console.log('Shortest path data', data);
            if (pathLayer) {
                map.removeLayer(pathLayer);
                console.log('Previous path layer removed');
            }
            var latlngs = data.path.map(p => [p.lat, p.lon]);
            pathLayer = L.polyline(latlngs, {color: 'blue'}).addTo(map);
            console.log('New path layer added');
        });
}
