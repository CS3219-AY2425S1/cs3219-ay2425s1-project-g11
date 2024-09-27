package services

import (
    "context"
    "fmt"
    "log"
    "os"

    "authentication-service/models"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
    "github.com/joho/godotenv"
)

var client *mongo.Client

func init() {
    connectDB()
}

func connectDB() {
    err := godotenv.Load(".env.dev")
    if err != nil {
        log.Fatalf("Error loading .env file")
    }

    mongoURI := os.Getenv("MONGODB_URI")
    clientOptions := options.Client().ApplyURI(mongoURI)

    c, err := mongo.Connect(context.TODO(), clientOptions)
    if err != nil {
        log.Fatalf("MongoDB connection error: %v", err)
    }

    fmt.Println("MongoDB connected")
    client = c
}

func GetUserCollection() *mongo.Collection {
    return client.Database("Database1").Collection("user_account")
}

func GetUserByEmail(ctx context.Context, email string, user *models.UserModel) error {
	err := GetUserCollection().FindOne(ctx, bson.M{"email": email}).Decode(user)
	return err
}

func DisconnectDB() {
    if err := client.Disconnect(context.TODO()); err != nil {
        log.Fatalf("Error disconnecting from MongoDB: %v", err)
    }
}