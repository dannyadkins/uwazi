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


curl -H "Content-Type:application/json" -d \
'{
    "id": "1",
    "jsonrpc": "2.0",
    "method": "CreateEmptyEmm",
    "params":
        {
            "pathToEmm": "EMMs/emm.out"
        }
}' \
 http://localhost:8081/server-api




curl -H "Content-Type:application/json" -d \
'{
    "id": "1",
    "jsonrpc": "2.0",
    "method": "UpdateEmm",
    "params":
        {
            "pathToEmm": "EMMs/emm.out",
            "tokenUpBytes": "rO0ABXNyACZjb20uZ29vZ2xlLmNvbW1vbi5jb2xsZWN0LlRyZWVNdWx0aW1hcAAAAAAAAAAAAwAAeHIAPGNvbS5nb29nbGUuY29tbW9uLmNvbGxlY3QuQWJzdHJhY3RTb3J0ZWRLZXlTb3J0ZWRTZXRNdWx0aW1hcFzo2cZs87g1AgAAeHIAM2NvbS5nb29nbGUuY29tbW9uLmNvbGxlY3QuQWJzdHJhY3RTb3J0ZWRTZXRNdWx0aW1hcAX6roHeccSkAgAAeHIALWNvbS5nb29nbGUuY29tbW9uLmNvbGxlY3QuQWJzdHJhY3RTZXRNdWx0aW1hcGcib9TNCSjYAgAAeHIAMmNvbS5nb29nbGUuY29tbW9uLmNvbGxlY3QuQWJzdHJhY3RNYXBCYXNlZE11bHRpbWFwIfdmsfVoyB0CAAB4cHNyACljb20uZ29vZ2xlLmNvbW1vbi5jb2xsZWN0Lk5hdHVyYWxPcmRlcmluZwAAAAAAAAAAAgAAeHBzcgAvY29tLmdvb2dsZS5jb21tb24uY29sbGVjdC5Vc2luZ1RvU3RyaW5nT3JkZXJpbmcAAAAAAAAAAAIAAHhwdwQAAAADdAAaCu+/ve+/vWYPw4deNE1Gw43vv73vv73vv713BAAAAAF1cgACW0Ks8xf4BghU4AIAAHhwAAAAdBvWhfEdvrJQpLqBe6qb14GldLG2VCPEMv/aGfNqyuwxqAaGvnR8wU6haK35u7oN6wCveGoBmbgqhxJjVR5KTRUU3ZWJY3Q8jhu0+bqNhNQOx+Gn4N7KgGwImcfpSit5gdfYN7zpTWT1UhSdCwed17h9bMyWdAAgFu+/ve+/ve+/vSUP77+9zKdV77+9ARnvv73vv73vv713BAAAAAF1cQB+AAsAAAB0Y2X1sVxJACzVQpVeTY7XajZhtDn+mD2NsPn/zH8KvhgKAEyk1AFxuUxJDIFmkb5/btpILX1bM6mHYfvJP1nUabfN9bejAwJ3HaaUo3dv9+qT6IpVeTYuco0V2PdTkl80XHcyDHQthUp6u4qlY7NL3Iil0IJ0ABYvUSUQIO+/vT1cbMiq77+977+9OwlldwQAAAABdXEAfgALAAAAdHR6cKgMCTFy+aDtOA2/9Uj544ipC9y2wkZmzmnp3pnOqgksin7CMAs/Fuyt1W0sdOckxI1l+mqe7qoHcrwhNL446drUnKwU5qFgiqdnQdh3YW6l/dxTg3kt9iZZF4w8hLgOShzt0V7XWXJL9aBjwWCR99haeA=="
        }
}' \
 http://localhost:8081/server-api
