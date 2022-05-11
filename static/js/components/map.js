// Initialize and add the map
var initMap = function () {
    // The location of UCSC 36.98973133172732, -122.0593088463258
    const coord = { lat: 36.9927, lng: -122.0593 };
    // The map, centered at UCSC
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: coord,
    });
    // The marker, positioned at UCSC
    const marker = new google.maps.Marker({
        position: coord,
        map: map,
    });
}

window.initMap = initMap;