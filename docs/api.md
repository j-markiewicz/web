# API

The `transit-map` API is made up of two parts - the Data API for transit data and the Config API for configuring data sources for the Data API. All data is transferred in JSON format, errors are reported in plain text. API endpoints and authentication tokens are described below.

Additionally, `transit-map` has a small Auth API to manage authentication/authorization to the Config API. The Auth API is separate from the Data and Config APIs, and is designed primarily to support using those APIs from a website. The Auth API is described below.

## Data API endpoints

The following table describes API endpoints which make transit data available. All of them support the `GET` method (to get the data described below) and the `OPTIONS` method (for CORS preflight requests). No authorization is required for these endpoints.

| URL path | Return type | Description |
| --- | --- | --- |
| `/` | [`BasicSystemInfo[]`](types.html#basic-system-info) | Ⓢ\* Basic information about all transit systems, including their names, locations, and number of GTFS Schedule and GTFS Realtime data sources, stops, and lines. |
| `/:system` | [`BasicSystemInfo`](types.html#basic-system-info) | Ⓢ\* Basic information about the transit system `:system`. |
| `/:system/alerts` | [`Alert[]`](types.html#alert) | Ⓡ Any active or scheduled alerts about the transit system `:system`. |
| `/:system/vehicles` | [`Vehicle[]`](types.html#vehicle) | Ⓡ Real-time location information about all transit vehicles in `:system` for which this data is available. |
| `/:system/stops` | [`Stop[]`](types.html#stop) | Ⓢ All transit stops in `:system`. Multiple stops may share the same name (but not id), for example if they are adjacent stops on opposite sides of the street. |
| `/:system/lines` | [`Line[]`](types.html#line) | Ⓢ All transit lines in `:system`. A transit line is defined by a name (e.g. _218_), headsign (e.g. _Bronowice Małe_), and a sequence of stops. Often, transit routes operate with the same name in opposite directions, or even with the same name and headsign, but with different routings - in these cases each of these routings would be considered a different line. In GTFS terms, a _line_ is somewhere in between a _route_ and a _trip_. |
| `/:system/line/:line` | [`Line`](types.html#line) | Ⓢ Information about transit line `:line`. |
| `/:system/stop/:stop` | [`StopSchedule`](types.html#stop-schedule) | Ⓡ Schedule information for transit stop `:stop`. |
| `/:system/shape/:shape` | [`LineString`](https://www.rfc-editor.org/rfc/rfc7946#section-3.1.4) | Ⓢ A GeoJSON description of the geographic shape `:shape` of a transit line. |

Endpoints marked with Ⓡ are based (at least partially) on GTFS Realtime data, and should therefore be re-requested every 5-30 seconds. Because the API server caches both the raw data (from GTFS feeds) and the computed data (effectively the API response), re-requests should use conditional HTTP requests to avoid redownloading the data if it hasn't actually changed since the last request (`fetch()` in browsers should do this automatically).

Endpoints marked with Ⓢ are based on GTFS Schedule data only, and therefore their data doesn't change often. It should be safe to download this data once on page load and keep using it for the remainder of the session.

The two endpoints marked with Ⓢ\* are based mostly on server configuration, but additionally return the number of stops and lines based on GTFS Schedule data. This additional data is only returned if immediately available, because downloading and parsing GFTS Schedule data can take a while and the speed of these endpoints is important to the performance of the `transit-map` website. If this additional data is not immediately available, the API response is returned without it, and the API server starts the process of getting the information. If the additional data is important, these endpoints can be repeatedly re-requested until a response contains the desired information.

## Config API endpoints

The following table describes API endpoints which make `transit-map` transit system configuration available and editable. API tokens are required for these endpoints for `POST`, `PUT`, and `DELETE` requests.

| Method | URL path | Request type | Return type | Description |
| --- | --- | --- | --- | --- |
| `GET` | `/:system/config` | \- | [`SystemConfigWithMetadata`](types.html#system-config-with-metadata) | Configuration for the transit system `:system` and whether the requesting user can edit this configuration (always `false` if no credentials were sent in the request) |
| `PUT` | `/:system/config` | [`SystemConfig`](types.html#system-config) | \- | Overwrite the configuration for the existing transit system `:system` |
| `DELETE` | `/:system/config` | \- | \- | Delete the configuration for the existing transit system `:system` |
| `POST` | `/new` | [`SystemConfigWithName`](types.html#system-config-with-name) | \- | Create a new transit system with the given configuration and name (fails if a transit system with that name already exists) |

## Auth API endpoints

The following table describes API endpoints for website-based authentication for the `transit-map` Config API. Note that the base URL (the part before the "URL path" value in the table below) for the Auth API is different to the Data and Config APIs' base URL.

| Method | URL path | Request | Response | Description |
| --- | --- | --- | --- | --- |
| `POST` | `/gen_token` | No data, but the `__Secure-auth` cookie must be set | The API token with `text/plain` MIME type | The API token returned from this endpoint allow authentication to the Config API; the required cookie is set in response to a successful call to the `/login` endpoint and unset with a request to the `/logout` endpoint |
| `POST` | `/login` | [`Credentials`](types.html#credentials) in JSON format | No data, but the `__Secure-auth` cookie is set | The cookie set by this endpoint allows access to the `/gen_token` endpoint, which lets a user generate an API token for authentication to the Config API |
| `POST` | `/logout` | No data, but the `__Secure-auth` cookie should be set | No data, but the `__Secure-auth` cookie is cleared | A request to this endpoint clears the `__Secure-auth` cookie, and if the token in the cookie is valid, clears it from the server's database, thereby logging the requesting user out (though it does not invalidate any API tokens issued to the user - those expire on their own after a few minutes) |

## Authentication tokens

`transit-map` has two different kinds of tokens: API tokens and user tokens.

API tokens are [JWTs](https://en.wikipedia.org/wiki/JSON_Web_Token) which give access to the Config API. Short-lived API tokens are issued by the `/gen_token` endpoint of the Auth API.

User tokens are long-lived and issued to a user upon login. They are long random strings and are stored in an HTTP-only cookie (and in a database on the server). A user token can only be used to generate an API token by sending a POST request to the `/gen_token` endpoint of the Auth API.
