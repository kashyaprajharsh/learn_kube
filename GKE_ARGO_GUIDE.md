# Learning Path: GKE and ArgoCD

## Prerequisites
1. Install the following tools:
   ```bash
   # Install Google Cloud SDK
   curl https://sdk.cloud.google.com | bash
   
   # Install kubectl
   gcloud components install kubectl
   
   # Login to Google Cloud
   gcloud auth login
   ```

## Part 1: Setting Up GKE

### 1. Create a GKE Cluster
```bash
# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Create a GKE cluster
gcloud container clusters create learn-kube-cluster \
    --zone us-central1-a \
    --num-nodes 3 \
    --machine-type e2-standard-2

# Get credentials for kubectl
gcloud container clusters get-credentials learn-kube-cluster --zone us-central1-a
```

### 2. Verify Cluster Setup
```bash
# Check nodes
kubectl get nodes

# Check system pods
kubectl get pods -n kube-system
```

## Part 2: Setting Up ArgoCD

### 1. Install ArgoCD
```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods to be ready
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s
```

### 2. Access ArgoCD UI
```bash
# Port forward ArgoCD server
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

### 3. Install ArgoCD CLI
```bash
# For Linux
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64
```

## Part 3: Deploying Your Application with ArgoCD

### 1. Prepare Your Application
Create a Git repository with your Kubernetes manifests:
```bash
# Example repository structure
my-app/
├── kubernetes/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
```

### 2. Create ArgoCD Application
```yaml
# application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: learn-kube-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/YOUR_USERNAME/learn-kube.git
    targetRevision: HEAD
    path: kubernetes
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### 3. Apply the Application
```bash
kubectl apply -f application.yaml
```

## Part 4: GitOps Workflow

1. **Make Changes**:
   - Update your Kubernetes manifests in Git
   - Commit and push changes
   - ArgoCD will automatically detect and apply changes

2. **Monitor Deployments**:
   - Check sync status in ArgoCD UI
   - View application health
   - Check deployment history

## Practice Exercises

1. **Basic ArgoCD**:
   - Deploy a simple web application
   - Scale the deployment
   - Rollback to a previous version

2. **Advanced Features**:
   - Set up automated sync policies
   - Configure health checks
   - Use ApplicationSets for multiple applications

3. **GitOps Practices**:
   - Implement environment-specific configurations
   - Set up promotion between environments
   - Configure notifications

## Common Commands

```bash
# ArgoCD CLI commands
argocd login localhost:8080
argocd app list
argocd app sync learn-kube-app
argocd app history learn-kube-app
argocd app rollback learn-kube-app

# Kubernetes commands
kubectl get applications -n argocd
kubectl get pods -n argocd
kubectl logs -n argocd deploy/argocd-server
```

## Best Practices

1. **GitOps**:
   - Keep manifests in Git
   - Use branches for environments
   - Never modify cluster directly

2. **Security**:
   - Change default admin password
   - Use RBAC for access control
   - Enable SSO if possible

3. **Monitoring**:
   - Set up alerts for sync failures
   - Monitor application health
   - Keep track of sync history

## Troubleshooting Tips

1. **Sync Issues**:
   ```bash
   argocd app get learn-kube-app
   argocd app sync learn-kube-app --debug
   ```

2. **Pod Issues**:
   ```bash
   kubectl describe pod <pod-name>
   kubectl logs <pod-name>
   ```

3. **ArgoCD Issues**:
   ```bash
   kubectl logs -n argocd deploy/argocd-server
   kubectl logs -n argocd deploy/argocd-repo-server
   ``` 