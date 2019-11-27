
package uwazi.es;

import uwazi.es.api.ClientApiImpl;
import uwazi.es.api.ServerApiImpl;

import java.util.List;
import java.util.HashMap;

public class TestApplication {
    public static void main(String[] args) throws Exception {
        ClientApiImpl client = new ClientApiImpl();
        ServerApiImpl server = new ServerApiImpl();

        String password = "my secure password";
        String pathToEmm = "EMMs/emm.out";



        System.out.println("Creating new EMM on server.");
        server.CreateEmptyEmm(pathToEmm);




        byte[][] queryToken = client.GenQueryToken(password, "hello");
        System.out.print("\nQuery token for \"hello\": ");
        System.out.println(queryToken);




        List<byte[]> queryResp1 = server.Query(pathToEmm, queryToken);
        System.out.print("\nServer response for query: ");
        System.out.println(queryResp1);
        System.out.println("EXPECTED empty response...");




        String[] keywords = {"hello", "goodbye"};
        HashMap<String, String> metadata = new HashMap<>();
        metadata.put("docId", "first-document");

        byte[] encToken = client.GenTokenUp(password, keywords, metadata);
        System.out.print("\nUpdating remote EMM with new file. Sending EncToken: ");
        System.out.println(encToken);




        server.UpdateEmm(pathToEmm, encToken);
        System.out.println("\nUpdated EMM with that token.");




        System.out.println("\nResending Query to server, now that it has the file.");
        List<byte[]> queryResp2 = server.Query(pathToEmm, queryToken);
        System.out.print("Server response for query: ");
        System.out.println(queryResp1);
        System.out.println("EXPECTED some response.");
    }
}