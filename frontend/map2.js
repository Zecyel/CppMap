var map = L.map('map').setView([31.3, 121.5], 15);

// L.tileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
L.tileLayer('http://localhost:1234/tile/{z}/{x}/{y}.png', {
    // attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.marker([31.3, 121.5]).addTo(map)
    .bindPopup('A pretty CSS popup.<br> Easily customizable.')
    .openPopup();