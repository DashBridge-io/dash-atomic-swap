FROM ubuntu
LABEL version="1.0"
LABEL description="Dash Container"
RUN apt-get clean
RUN apt-get update
RUN apt-get install -qy wget
RUN apt-get install -qy net-tools
RUN apt-get -qy autoremove
WORKDIR /dash
RUN wget https://github.com/dashpay/dash/releases/download/v0.16.1.1/dashcore-0.16.1.1-x86_64-linux-gnu.tar.gz && tar -xzf dashcore-0.16.1.1-x86_64-linux-gnu.tar.gz
RUN mkdir $HOME/.dashcore/
EXPOSE 19898/tcp
ENTRYPOINT dashcore-0.16.1/bin/./dashd -regtest -daemon -debug -server -addressindex -rpcbind=0.0.0.0 -rpcallowip=0.0.0.0/0.0.0.0 && tail -f /dev/null