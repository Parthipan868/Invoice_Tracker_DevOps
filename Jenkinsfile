pipeline {
    agent any

    environment {
        // 🔥 CHANGE THIS to your Docker Hub username
        DOCKERHUB_USERNAME    = 'parthipan868'
        IMAGE_NAME            = 'invoice-tracker-frontend'
        IMAGE_FULL            = "${DOCKERHUB_USERNAME}/${IMAGE_NAME}"

        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'

        CONTAINER_NAME        = 'invoice-frontend'

        HOST_PORT             = '3000'
        CONTAINER_PORT        = '80'

        // ⚠️ For Windows Docker Desktop
        REACT_APP_API_URL     = 'http://host.docker.internal:5000/api'
    }

    stages {

        stage('Checkout') {
            steps {
                echo "📥 Cloning repository..."
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "🔨 Building image: ${IMAGE_FULL}:${BUILD_NUMBER}"

                    dockerImage = docker.build(
                        "${IMAGE_FULL}:${BUILD_NUMBER}",
                        "--build-arg REACT_APP_API_URL=${REACT_APP_API_URL} ."
                    )
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    echo "🚀 Pushing image..."

                    docker.withRegistry('https://index.docker.io/v1/', "${DOCKER_CREDENTIALS_ID}") {
                        dockerImage.push("${BUILD_NUMBER}")
                        dockerImage.push("latest")
                    }
                }
            }
        }

        stage('Deploy Container') {
            steps {
                script {
                    echo "🔄 Stopping old container..."

                    bat "docker stop ${CONTAINER_NAME} || exit 0"
                    bat "docker rm ${CONTAINER_NAME} || exit 0"

                    echo "▶️ Starting new container..."

                    bat """
                    docker run -d ^
                        --name ${CONTAINER_NAME} ^
                        --restart unless-stopped ^
                        -p ${HOST_PORT}:${CONTAINER_PORT} ^
                        ${IMAGE_FULL}:${BUILD_NUMBER}
                    """
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "🩺 Checking application..."

                    sleep(time: 10, unit: 'SECONDS')

                    bat "curl -f http://localhost:${HOST_PORT} || exit 1"

                    echo "✅ App is live at http://localhost:${HOST_PORT}"
                }
            }
        }
    }

    post {
        success {
            echo "🎉 SUCCESS!"
            echo "🌐 App: http://localhost:${HOST_PORT}"
            echo "📦 Docker Hub: https://hub.docker.com/r/${IMAGE_FULL}"
        }

        failure {
            echo "❌ Pipeline FAILED. Check logs."
        }

        always {
            script {
                bat "docker rmi ${IMAGE_FULL}:${BUILD_NUMBER} || exit 0"
            }
        }
    }
}