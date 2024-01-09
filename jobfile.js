import _ from 'lodash'
import moment from 'moment'
import { hooks } from '@kalisio/krawler'

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/openradiation'
const ttl = +process.env.TTL || (7 * 24 * 60 * 60)  // duration in seconds
const key = process.env.KEY
// For testing purpose we can set a fixed date
const dateOfCreation = process.env.DATE_OF_CREATION

const baseUrl = 'https://request.openradiation.net/measurements'

// Create a custom hook to generate tasks
let generateTask = (options) => {
  return (hook) => {
    // For testing purpose we can set a fixed date
    const now = moment.utc(dateOfCreation)
    const formattedDateOfCreation = now.format('YYYY-M-D')
    console.log('Querying the api with the following dateOfCreation: ' + formattedDateOfCreation)
    let task = {
      options: { 
        url: baseUrl + '?apiKey=' + key + '&dateOfCreation=' + formattedDateOfCreation + '&response=complete'
      }
    }
    hook.data.tasks = [task]
    return hook
  }
}
hooks.registerHook('generateTask', generateTask)

export const createJob = (options = {}) => {
  const collection = options.collection || 'openradiation'

  return {
    id: 'openradiation',
    store: 'memory',
    options: {
      workersLimit: 1
    },
    taskTemplate: {
      id: 'openradiation',
      type: 'http'
    },
    hooks: {
      tasks: {
        after: {
          readJson: {},
          convertToGeoJson: {
            dataPath: 'result.data.data',
            latitude: 'latitude',
            longitude: 'longitude'
          },
          apply: (item) => {
            const measurements = _.get(item.data, 'data.features')
            console.log(`[!] Found ${_.size(measurements)} measurements`)
          },
          updateMongoCollection: {
            dataPath: 'result.data.data.features',
            collection,
            filter: { 'properties.reportUuid': '<%= properties.reportUuid %>' },
            upsert : true,
            transform: {
              mapping: {
                'properties.startTime': { path: 'time', delete: false },
                'properties.userId': { path: 'properties.name', delete: false }
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
          createStores: { id: 'memory' },
          connectMongo: {
            url: dbUrl,
            clientPath: 'taskTemplate.client'
          },
          createMongoCollection: {
            clientPath: 'taskTemplate.client',
            collection,
            indices: [
              [{ time: 1, 'properties.reportUuid': 1 }, { unique: true }],
              { 'properties.reportUuid': 1 },
              [{ 'properties.reportUuid': 1, 'properties.value': 1, time: -1 },  { background: true }],
              [{ time: 1 }, { expireAfterSeconds: ttl }], // days in s
              { geometry: '2dsphere' }                                                                                                              
            ],
          },
          generateTask: {}
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
}

// Create a base job by default
export default createJob()