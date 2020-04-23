# Running locally

1. install stuff with 

```
npm install
```

2. This app contains both a node express app and a mongodb instance 
to run a local server and db use

```
docker-compose up
```

This will start a local node instance that mirrors your current directory
so nodemon and local changes will instantly be applied... nice!
This is done using the Dockerfile.dev file

# Building

To make production server build we use webpack. To build it you can run

```
npm run build:prod
```

This will output the server to `dist/main.js` where you can run it directly with

```
node dist/main.js
```