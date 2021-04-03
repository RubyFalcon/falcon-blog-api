#!/bin/bash

echo What should be the version
read VERSION


docker build -t rubyfalcon/falconblog:$VERSION .
docker push rubyfalcon/falconblog:$VERSION 
ssh root@138.68.185.109 "docker pull rubyfalcon/falconblog:$VERSION && docker tag rubyfalcon/falconblog:$VERSION dokku/api:$VERSION && dokku deploy api $VERSION"