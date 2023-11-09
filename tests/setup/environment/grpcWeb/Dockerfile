FROM debian:buster

ENV DEBIAN_FRONTEND noninteractive

# https://github.com/improbable-eng/grpc-web/releases
COPY grpcwebproxy-v0.15.0-linux-x86_64 /usr/local/bin/grpcwebproxy

RUN chmod +x /usr/local/bin/grpcwebproxy

CMD grpcwebproxy --help