
package uwazi.es;

import uwazi.es.api.ClientApiImpl;
import uwazi.es.api.ServerApiImpl;
import uwazi.es.api.ObjSerializer;

import org.crypto.sse.*;

import java.io.*;
import java.util.List;
import java.util.HashMap;
import com.google.common.collect.TreeMultimap;
import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.Multimap;

public class TestApplication {
    public static void main(String[] args) throws Exception {
        ClientApiImpl client = new ClientApiImpl();
        ServerApiImpl server = new ServerApiImpl();

        String password = "my secure password";
        String pathToEmm = "EMMs/emm.out";


        System.out.println("Creating new EMM on server.");
        server.CreateEmptyEmm(pathToEmm);

        byte[][] queryToken1 = client.GenQueryToken(password, "hello");
        System.out.printf("\nFIRST query token for \"hello\": ");
        System.out.println(queryToken1);



        // Check that a query on an empty emm reports no documents.
        List<byte[]> queryResp1 = server.Query(pathToEmm, queryToken1);
        System.out.print("\nServer response for query: ");
        System.out.println(queryResp1);

        System.out.print("Client's decryption of query response: ");
        System.out.println(client.Resolve(password, queryResp1));
        System.out.println("## We expect an empty response ##");



        // Upload a new file, "first-document" with keywords {hello, goodbye}.
        String[] keywords = { "hello", "goodbye" };
        HashMap<String, String> metadata = new HashMap<>();
        metadata.put("docId", "first-document");

        byte[] encToken = client.GenTokenUp(password, keywords, metadata);
        System.out.print("\nUpdating remote EMM with new file. Sending EncToken: ");
        System.out.println(encToken);

        server.UpdateEmm(pathToEmm, encToken);
        System.out.println("Updated EMM with that token.");

        // Check that the document is found with our "hello" query.

        byte[][] queryToken2 = client.GenQueryToken(password, "hello");
        System.out.printf("\nSECOND query token for \"hello\": ");
        System.out.println(queryToken2);

        System.out.println("\nResending Query to server (but now it has the file).");
        List<byte[]> queryResp2 = server.Query(pathToEmm, queryToken2);
        System.out.print("Server response for query: ");
        System.out.println(queryResp2);

        System.out.print("Client's decryption of query response: ");
        System.out.println(client.Resolve(password, queryResp2));
        System.out.println("## We expect ['first-document'] response ##");
    }
}