# dash-atomic-swap
Library for creating atomic swaps transactions on the Dash blockchain

## Docker Container for testing

The Dockerfile will start a Dashnode in regtest mode 

build with

```
docker build -t atomic_swap .
```

Run with (on MacOS) 

```
docker run -d -p 19898:19898 -p 19899:19899 -v "$HOME/Library/Application Support/DashCore/dash.conf:/root/.dashcore/dash.conf" atomic_swap
```