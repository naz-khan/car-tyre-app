using MongoDB.Bson;
using System.Text.Json.Nodes;

public static class JsonExtensions
{
    public static BsonDocument ToBsonDocument(this JsonObject jsonObject)
    {
        // Convert JObject to BsonDocument
        return BsonDocument.Parse(jsonObject.ToString());
    }
}
