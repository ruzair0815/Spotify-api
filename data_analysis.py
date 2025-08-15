import pandas as pd
from pymongo import MongoClient

# Load CSV
df = pd.read_csv("spotify_tracks.csv")

# Keep only needed columns
df = df[['name', 'artists', 'energy', 'danceability', 'tempo']]
df.rename(columns={'name': 'track_name', 'artists': 'artist_name'}, inplace=True)

# Remove duplicates
df.drop_duplicates(inplace=True)

# Connect to MongoDB (replace with your credentials)
client = MongoClient(
    "mongodb+srv://rehmauzair:3zffOi64NLq60Qct@cluster0.rax7xgg.mongodb.net/spotifyDB?retryWrites=true&w=majority"
)
db = client.spotifyDB
collection = db.artistStats

# Clear old data
collection.delete_many({})

# Insert new data
collection.insert_many(df.to_dict(orient="records"))

print("✅ Data uploaded to MongoDB successfully!")
