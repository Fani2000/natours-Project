document.addEventListener("DOMContentLoaded", (e) => {
  const API_KEY =
    "pk.eyJ1IjoiZmFuaWtlb3JhcGV0c2UiLCJhIjoiY2xkaGt6cDM3MGJ3bzNvbnZjbXdnbnE0aCJ9.lu5xKj_-2p0YMjcVMbuvbw";
  let popup;

  console.log("Welcome to mapbox");

  const mapEl = document.getElementById("map");
  let locations = [];

  if (mapEl !== null) locations = JSON.parse(mapEl?.dataset.locations);

  console.log(window.mapboxgl)

  if (window.mapboxgl !== undefined) {
    mapboxgl.accessToken = API_KEY;

    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/fanikeorapetse/cldhlsonh001u01s0sdkhk2r3",
      scrollZoom: false,
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((loc) => {
      console.log("LOCATION", loc);
      const el = document.createElement("div");
      el.className = "marker";

      popup = new mapboxgl.Popup({ offset: 30, isOpen: true })
        .setLngLat(loc.coordinates)
        .setHTML(`<p class=''>Day ${loc.day}: ${loc.description}</p>`);

      new mapboxgl.Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat(loc.coordinates)
        .setPopup(popup)
        .addTo(map);
      bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
      padding: {
        top: 200,
        bottom: 200,
        left: 150,
        right: 100,
      },
    });
  }
});
