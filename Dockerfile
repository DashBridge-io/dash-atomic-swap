FROM ubuntu
LABEL version="1.0"
LABEL description="Dash Container"
RUN apt-get clean
RUN apt-get update
RUN apt-get install -qy wget
RUN apt-get -qy autoremove
WORKDIR /dash
RUN wget https://github.com/dashpay/dash/releases/download/v0.16.0.1/dashcore-0.16.0.1-x86_64-linux-gnu.tar.gz && tar -xzf dashcore-0.16.0.1-x86_64-linux-gnu.tar.gz
RUN mkdir $HOME/.dashcore/
ENTRYPOINT dashcore-0.16.0/bin/./dashd -regtest -daemon && tail -f /dev/null