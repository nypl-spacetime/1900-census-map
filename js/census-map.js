var enumerationDistrictsUrl = 'http://s3.amazonaws.com/spacetime-nypl-org/datasets/enumeration-districts/enumeration-districts.geojson'

var edStyle = {
  color: '#0078f0',
  weight: 5,
  opacity: 0.65,
  fill: 'none'
}

function pageToArchiveOrg (reel, page) {
  return 'https://archive.org/stream/12thcensusofpopu' + reel + 'unit#page/n' + page + '/mode/1up'
}

var map = L.map('map', {
  maxZoom: 19
}).setView([40.72050, -73.98529], 17)

L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
}).addTo(map)

var tileLayer = L.tileLayer('http://maps.nypl.org/warper/layers/tile/906/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map)

function onEachFeature(feature, layer) {
  var props = feature.properties
  var html = [
    '<h2>District ' + props.name + '</h2>',
    '<p>Reel: ' + props.reel + '</p>',
    '<p>Pages: <a href="' + pageToArchiveOrg(props.reel, props.pages[0]) + '">' + props.pages[0] + '</a> to <a href="' + pageToArchiveOrg(props.reel, props.pages[1]) + '">' + props.pages[1] + '</a></p>',
    '<p><a href="' + props.familySearch + '">Open in FamilySearch</a></p>'
  ]
  layer.bindPopup(html.join('\n'))
}

d3.json('census-links.json', function (censusLinks) {
  d3.json(enumerationDistrictsUrl, function (eds) {
    var features = eds.features
      .filter(function (ed) {
        return censusLinks.enumerationDistricts[ed.properties.name]
      })
      .map(function (ed) {
        return {
          type: 'Feature',
          properties: Object.assign(
            {},
            ed.properties,
            censusLinks.enumerationDistricts[ed.properties.name]
          ),
          geometry: ed.geometry
        }
      })

    L.geoJSON({
      type: 'FeatureCollection',
      features: features
    }, {
      style: edStyle,
      onEachFeature: onEachFeature
    }).addTo(map)
  })
})

d3.select('#slider').on('input', function () {
  tileLayer.setOpacity(this.value / 100)
})
