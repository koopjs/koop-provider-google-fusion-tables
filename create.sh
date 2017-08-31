#!/bin/bash
claudia create --name koop-harvey-google-fusion-tables --handler lambda.handler --deploy-proxy-api --region us-east-1 --set-env KOOP_PORT=80,GOOGLE_AUTH=$GOOGLE_AUTH,LAMBDA=true
