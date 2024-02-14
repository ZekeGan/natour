export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoidHJhdmVsbGVyODcwNzIwIiwiYSI6ImNsc2h3OGtuYzE4eWsybHBnNDFyb2NqMTEifQ.KfXZS3e61LrIYtPFLegOsQ';

  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/traveller870720/clsipt6b300kz01pudfuygzsx', // style URL
    center: locations[0].coordinates, // starting position [lng, lat]
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((location) => {
    const el = document.createElement('div');
    el.className = 'marker';

    // add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(location.coordinates)
      .addTo(map);

    // add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(location.coordinates)
      .setHTML(`<p>Day ${location.day} : ${location.description}</p>`)
      .addTo(map);

    bounds.extend(location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      bottom: 150,
      top: 150,
      left: 100,
      right: 100,
    },
  });
};
