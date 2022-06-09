#!/bin/bash

curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/linux/amd64/kubectl
chmod +x ./kubectl
mv ./kubectl /usr/local/bin/kubectl
aws eks --region $AWS_REGION update-kubeconfig --name $EKS_CLUSTER --kubeconfig kubeconfig

deploys=`kubectl --kubeconfig kubeconfig -n default get deployments | tail -n +2 | cut -d ' ' -f 1`
for deploy in $deploys; do
  kubectl --kubeconfig kubeconfig -n default rollout restart deployments/$deploy
  if [[ $deploy == *"ticker"* ]]; then
    sleep 15
  else
    sleep 3
  fi
done