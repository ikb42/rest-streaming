# Nest REST Streaming API Sample

Sample app showcasing Nest's REST Streaming API

## Install

Install the dependencies from npm:

```sh
npm install
```

Log in to https://developer.nest.com/clients

Set your client redirect URI to be `http://localhost:3000/auth/nest/callback`

Set up your Nest credentials in your environment variables:

```sh
export NEST_ID=XXX
export NEST_SECRET=XXX
```

## Start

Start the server:

```sh
npm start
```

Open your browser to http://localhost:3000

### Server Only Mode

By default the app runs in a server-client mode with a browser UI.
You can also run the app in **server-only** mode (still requires a browser for initial OAuth2 flow).

Start in server-only mode:

```sh
npm run server-only
```

The events will then be logged to the node console rather than displayed in a browser UI.

## Contributing

We love contributions! :smile: Please follow the steps in the [CONTRIBUTING guide][contributing] to get started. If you found a bug, please file it [here][bugs].

## License

Licensed under the Apache 2.0 license. See the [LICENSE file][license] for details.

[nest-sim]: https://developer.nest.com/documentation/cloud/home-simulator/
[bugs]: #
[license]: LICENSE
