pipeline {
    agent any

    environment {
        // Pull MongoDB Atlas URI from Jenkins credentials
        MONGODB_URI = credentials('mongo-uri')
    }

    stages {
        stage('Checkout') {
            steps {
                echo "📥 Cloning repository..."
                checkout scm
            }
        }

        stage('Prepare .env') {
            steps {
                // Create .env file for Docker Compose (ignored by git)
                script {
                    writeFile file: '.env', text: "MONGODB_URI=${env.MONGODB_URI}"
                }
            }
        }

        stage('Build & Run Full App') {
            steps {
                echo "🐳 Building and starting containers..."
                // Ensure previous containers are stopped
                bat "docker-compose down --remove-orphans"
                bat "docker-compose up -d --build"
            }
        }

        stage('Verify Backend') {
            steps {
                echo "🩺 Waiting for backend startup..."
                sleep time: 15, unit: 'SECONDS'
                // Simple health endpoint check; fails pipeline if not reachable
                bat "curl -f http://localhost:5001/health || exit 1"
                echo "✅ Backend is running!"
            }
        }
    }

    post {
        success {
            echo "🎉 SUCCESS! Application deployed."
            echo "Frontend: http://localhost:3001"
            echo "Backend : http://localhost:5001"
        }
        failure {
            echo "❌ Pipeline failed. Printing container logs..."
            bat "docker-compose logs"
        }
        always {
            echo "Pipeline execution completed."
        }
    }
}
