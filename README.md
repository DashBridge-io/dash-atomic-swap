# dash-atomic-swap
Library for creating atomic swaps transactions on the Dash blockchain

## Running Demo Application 

1. Start local Dash node

2. ```
    npm install
   ```
3.
    ```
    npm run server
    ```

Demo app will them be available at http://localhost:8080/

## Local Dash Node

The demo application needs a local dash node running in regtest mode. The Dash build of MacOS has mining functions disabled, so Docker this can be used to get a full node running.

build with

```
docker build -t atomic_swap .
```

Run with (on MacOS) 

```
docker run -d -p 19898:19898 -p 19899:19899 -v "$HOME/Library/Application Support/DashCore/dash.conf:/root/.dashcore/dash.conf" atomic_swap
```

