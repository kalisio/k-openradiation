const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/openradiation'
const ttl = +process.env.TTL || (7 * 24 * 60 * 60)  // duration in seconds
const key = process.env.KEY

const now = new Date(Date.now())
const date = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate()

console.log(date)

module.exports = {
  id: 'openradiation',
  store: 'memory',
  options: {
    workersLimit: 1
  },
  tasks: [{
    id: 'openradiation',
    type: 'http',
    options: {
      url: 'https://request.openradiation.net/measurements?apiKey=' + key + '&dateOfCreation=' + date
    }
  }],
  hooks: {
    tasks: {
      after: {
        readJson: {},
        convertToGeoJson: {
          dataPath: 'result.data.data',
          latitude: 'latitude',
          longitude: 'longitude'
        },
        updateMongoCollection: {
          dataPath: 'result.data.data',
          collection: 'openradiation',
          filter: { 'properties.reportUuid': '<%= properties.reportUuid %>' },
          upsert : true,
          transform: {
            mapping: {
              'properties.startTime': 'time',
            },
            unitMapping: { 
              time: { asDate: 'utc' } 
            } 
          },
          chunkSize: 256
        },
        clearData: {}
      }
    },
    jobs: {
      before: {
        createStores: [{ id: 'memory' }],
        connectMongo: {
          url: dbUrl,
          clientPath: 'taskTemplate.client'
        },
        createMongoCollection: {
          clientPath: 'taskTemplate.client',
          collection: 'openradiation',
          indices: [
            [{ time: 1, 'properties.reportUuid': 1 }, { unique: true }],
            { 'properties.value': 1 },
            { 'properties.reportUuid': 1, 'properties.value': 1, time: -1 },
            [{ time: 1 }, { expireAfterSeconds: ttl }], // days in s
            { geometry: '2dsphere' }                                                                                                              
          ],
        }
      },
      after: {
        disconnectMongo: {
          clientPath: 'taskTemplate.client'
        },
        removeStores: ['memory']
      },
      error: {
        disconnectMongo: {
          clientPath: 'taskTemplate.client'
        },
        removeStores: ['memory']
      }
    }
  }
}
