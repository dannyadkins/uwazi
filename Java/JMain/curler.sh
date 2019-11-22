curl -H "Content-Type:application/json" -d \
'{
    "id": "1",
    "jsonrpc": "2.0",
    "method": "MakeEmm",
    "params": {}
}' \
 http://localhost:8081/client-api

curl -H "Content-Type:application/json" -d \
'{
    "id": "1",
    "jsonrpc": "2.0",
    "method": "GenTokenUp",
    "params":
        {
            "password": "abcd",
            "keywords": ["hi", "howdy", "hello"],
            "metadata": {
                "title": "Salutations",
                "dateCreated": "today",
                "docId": "abcd"
            }
        }
}' \
 http://localhost:8081/client-api
