pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Run Full App') {
            steps {
                script {
                    echo "🐳 Running docker-compose..."

                    bat "docker-compose down"
                    bat "docker-compose up -d --build"
                }
            }
        }

        stage('Verify') {
            steps {
                script {
                    echo "🩺 Checking backend..."

                    bat "curl http://localhost:5000/health"

                    echo "🩺 Checking frontend..."

                    bat "curl http://localhost:80"
                }
            }
        }
    }

    post {
        success {
            echo "🎉 FULL APP DEPLOYED!"
        }
        failure {
            echo "❌ FAILED!"
        }
    }
}