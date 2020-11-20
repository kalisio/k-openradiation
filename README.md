# k-openradiation

[![Latest Release](https://img.shields.io/github/v/tag/kalisio/k-openradiation?sort=semver&label=latest)](https://github.com/kalisio/k-openradiation/releases)
[![Build Status](https://travis-ci.com/kalisio/k-openradiation.png?branch=master)](https://travis-ci.org/kalisio/k-teleray)

A [Krawler](https://kalisio.github.io/krawler/) based service to download data from the [OpenRadiation](https://www.openradiation.org/) project.

## Description

The **k-openradiation** job allow to scrape measurements from the [OpenRadiation API](https://github.com/openradiation/openradiation-api). The downloaded data are stored within a [MongoDB](https://www.mongodb.com/) database and more precisely in the collection `openradiation`.


All records are stored in [GeoJson](https://fr.wikipedia.org/wiki/GeoJSON) format.

The job is executed according a specific cron expression. By default, every hours.

## Configuration

| Variable | Description |
|--- | --- |
| `KEY` | The key to use the API. As mentioned [here](https://www.openradiation.org/en/developers), you should ask this access code to the **OpenRadiation** team. | - |
| `COMPLETE` | An option to specify whether you are requesting the complete answer or not. | `true` |
| `DB_URL` | The mongoDB database URL. The default value is `mongodb://127.0.0.1:27017/openradiation` |
| `TTL` | The observations data time to live. It must be expressed in seconds and the default value is `604 800` (7 days) | 
| `DEBUG` | Enables debug output. Set it to `krawler*` to enable full output. By default it is undefined. |

## Deployment

We personally use [Kargo](https://kalisio.github.io/kargo/) to deploy the service.

## Contributing

Please refer to [contribution section](./CONTRIBUTING.md) for more details.

## Authors

This project is sponsored by 

![Kalisio](https://s3.eu-central-1.amazonaws.com/kalisioscope/kalisio/kalisio-logo-black-256x84.png)

## License

This project is licensed under the MIT License - see the [license file](./LICENSE) for details