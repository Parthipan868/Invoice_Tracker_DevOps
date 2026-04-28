pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo "📥 Cloning repository..."
                checkout scm
            }
        }

        stage('Build & Run Full App') {
            steps {
                echo "🐳 Stopping old containers..."
                bat 'docker-compose down'

                echo "🚀 Building and starting containers..."

                withCredentials([
                    string(credentialsId: 'mongo-uri', variable: 'MONGODB_URI')
                ]) {

                    bat '''
                    docker-compose up -d --build
                    '''
                }
            }
        }

        stage('Verify Backend') {
            steps {
                echo "🩺 Waiting for backend startup..."
                sleep(time: 15, unit: 'SECONDS')

                bat '''
                curl -f http://localhost:5000/health || exit 1
                '''

                echo "✅ Backend is running!"
            }
        }
    }

    post {

        success {
            echo "🎉 Pipeline Successful!"
            echo "🌐 Frontend -> http://localhost:3000"
            echo "🔧 Backend -> http://localhost:5000"
        }

        failure {
            echo "❌ Pipeline Failed. Check console logs."
            bat 'docker-compose logs'
        }

        always {
            echo "Pipeline execution completed."
        }
    }
}