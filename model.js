const google = require('googleapis')
const config = require('config')
const tables = google.fusiontables('v2')
const Bluebird = require('bluebird')
const getTable = Bluebird.promisify(tables.table.get)
const query = Bluebird.promisify(tables.query.sql)

function FusionTables () {}

FusionTables.prototype.getData = function getData (req, callback) {
  const auth = config.google.auth
  const gsOpts = {
    auth: config.google.auth,
    sql: `SELECT * FROM ${req.params.id}`
  }
  // TODO these should go simeltaneously
  Promise.all([
    getTable({auth, tableId: req.params.id}),
    query(gsOpts)
  ])
  .then(responses => {
    const table = responses[0]
    const res = responses[1]
    const geojson = translate(res.rows, table.columns)
    geojson.ttl = 10
    geojson.metadata = {
      name: table.name,
      description: table.description,
      attribution: table.attribution,
      fields: createFieldMetadata(table.columns)
    }
    // console.log(JSON.stringify(geojson, null, 2))
    callback(null, geojson)
  })
}

function translate (rows, columns) {
  const locationField = extractLocationField(columns)
  return {
    type: 'FeatureCollection',
    features: rows.map(row => { return formatFeature(row, columns, locationField.columnId) })
  }
}

const typeMap = {
  'STRING': 'String',
  'NUMBER': 'Double',
  'DATETIME': 'Date',
  'LOCATION': 'LOCATION'
}

function createFieldMetadata (columns) {
  return columns.map(col => {
    return {
      name: col.name,
      type: typeMap[col.type]
    }
  }).filter(col => {
    return col.type !== 'LOCATION'
  })
}

function extractLocationField (columns) {
  return columns.filter(col => {
    return col.type === 'LOCATION'
  })[0]
}

function formatFeature (row, columns, locationField) {
  const coordinates = row[locationField].split(',').map(c => { return parseFloat(c) }).reverse()
  return {
    type: 'Feature',
    geometry: {
      type: coordinates.length > 2 ? 'Polygon' : 'Point',
      coordinates
    },
    properties: row.reduce((props, prop, i) => {
      if (columns[i].type === 'DATETIME') prop = new Date(prop).toISOString()
      if (columns[i].type !== 'LOCATION') props[columns[i].name] = prop
      return props
    }, {})
  }
}

module.exports = FusionTables
