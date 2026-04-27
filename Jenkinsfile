pipeline {
    agent any

    // ─── All configurable values live here ───────────────────────────
    environment {
        DOCKERHUB_USERNAME    = 'abiram08'               // ← your Docker Hub username
        IMAGE_NAME            = 'invoice-tracker-frontend'
        IMAGE_FULL            = "${DOCKERHUB_USERNAME}/${IMAGE_NAME}"

        // ID of the Docker Hub credentials stored in Jenkins
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'

        // Name of the running container on the host
        CONTAINER_NAME        = 'invoice-frontend'

        // Port mapping: host port 3000 → container port 80 (nginx)
        HOST_PORT             = '3000'
        CONTAINER_PORT        = '80'

        // Backend API URL baked into the React build
        // Change this to your actual backend URL once backend is deployed
        REACT_APP_API_URL     = 'http://localhost:5000/api'
    }

    stages {

        // ── Stage 1: Get the code ─────────────────────────────────────
        stage('Checkout') {
            steps {
                echo "📥 Cloning repository from GitHub..."
                checkout scm
            }
        }

        // ── Stage 2: Build the Docker image ──────────────────────────
        stage('Build Docker Image') {
            steps {
                script {
                    echo "🔨 Building frontend image: ${IMAGE_FULL}:${BUILD_NUMBER}"
                    // Build using Dockerfile.frontend
                    // Pass REACT_APP_API_URL as a build argument
                    dockerImage = docker.build(
                        "${IMAGE_FULL}:${BUILD_NUMBER}",
                        "--build-arg REACT_APP_API_URL=${REACT_APP_API_URL} ."
                    )
                }
            }
        }

        // ── Stage 3: Push to Docker Hub ──────────────────────────────
        stage('Push to Docker Hub') {
            steps {
                script {
                    echo "🚀 Pushing image to Docker Hub..."
                    docker.withRegistry('https://index.docker.io/v1/', "${DOCKER_CREDENTIALS_ID}") {
                        dockerImage.push("${BUILD_NUMBER}")   // versioned tag  e.g. :5
                        dockerImage.push('latest')            // always move :latest forward
                    }
                }
            }
        }

        // ── Stage 4: Deploy ───────────────────────────────────────────
        stage('Deploy Container') {
            steps {
                script {
                    echo "🔄 Stopping old container (if any)..."
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm   ${CONTAINER_NAME} || true"

                    echo "▶️  Starting new container: ${IMAGE_FULL}:${BUILD_NUMBER}"
                    sh """
                        docker run -d \
                            --name ${CONTAINER_NAME} \
                            --restart unless-stopped \
                            -p ${HOST_PORT}:${CONTAINER_PORT} \
                            ${IMAGE_FULL}:${BUILD_NUMBER}
                    """
                }
            }
        }

        // ── Stage 5: Verify ───────────────────────────────────────────
        stage('Health Check') {
            steps {
                script {
                    echo "🩺 Waiting 10 seconds for nginx to start..."
                    sleep(time: 10, unit: 'SECONDS')
                    sh "curl -f http://localhost:${HOST_PORT} || (echo '❌ Health check failed!' && exit 1)"
                    echo "✅ Frontend is live at http://localhost:${HOST_PORT}"
                }
            }
        }
    }

    post {
        success {
            echo "🎉 SUCCESS! Frontend deployed → http://localhost:${HOST_PORT}"
            echo "    Docker Hub image → https://hub.docker.com/r/${IMAGE_FULL}"
        }
        failure {
            echo "❌ Pipeline FAILED. Scroll up in Console Output to find the error."
        }
        always {
            // Clean up the locally built image to save disk space
            script {
                sh "docker rmi ${IMAGE_FULL}:${BUILD_NUMBER} || true"
            }
        }
    }
}
