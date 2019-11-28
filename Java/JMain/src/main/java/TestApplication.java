
package uwazi.es;

import uwazi.es.api.ClientApiImpl;
import uwazi.es.api.ServerApiImpl;

import org.crypto.sse.*;

import java.io.*;
import java.util.List;
import java.util.HashMap;
import com.google.common.collect.TreeMultimap;
import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.Multimap;

public class TestApplication {
    public static void main(String[] args) throws Exception {
        TestReference();
        System.out.println("\n––––––––––––––-\n");
        TestOurSystem();
    }






    private static void TestReference() throws Exception {
        String password = "my secure password";


        ClientApiImpl client = new ClientApiImpl();
        byte[] sk = client.GetSkFromPassword(password);


        System.out.println("Creating new EMM on server.");
        HashMap<String, byte[]> emm = DynRH.setup();


    
        byte[][] token1 = DynRH.genTokenFS(sk, "hello");
        System.out.printf("\nFIRST query token for \"hello\": ");
        System.out.println(token1);


        // Query on empty
        List<byte[]> q1 = DynRH.queryFS(token1, emm);
        System.out.print("\nServer response for query: ");
        System.out.println(q1);

        System.out.print("Client's decryption of query response: ");
        List<String> result1 = DynRH.resolve(sk, q1);
        System.out.println(result1);
        System.out.println("## We expect an empty response ##");


        String[] keywords = { "hello", "goodbye" };
        Multimap<String, String> multimap = ArrayListMultimap.create();
        for (int i = 0; i < keywords.length; i++) {
            multimap.put(keywords[i], "docId");
        }
        TreeMultimap<String, byte[]> tokenUp = DynRH.tokenUpdate(sk, multimap);

        DynRH.update(emm, tokenUp);



        byte[][] token2 = DynRH.genTokenFS(sk, "hello");

        // Valid query
        List<byte[]> q2 = DynRH.queryFS(token2, emm);
        List<String> result2 = DynRH.resolve(sk, q2);
        System.out.println(result2);
    }














    private static void TestOurSystem() throws Exception {
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
        byte[][] queryResp1 = server.Query(pathToEmm, queryToken1);
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
        byte[][] queryResp2 = server.Query(pathToEmm, queryToken2);
        System.out.print("Server response for query: ");
        System.out.println(queryResp2);

        System.out.print("Client's decryption of query response: ");
        System.out.println(client.Resolve(password, queryResp2));
        System.out.println("## We expect ['first-document'] response ##");
    }
}