package uwazi.es.api;


import uwazi.es.api.ObjSerializer;

// RPC stuff
import com.googlecode.jsonrpc4j.spring.AutoJsonRpcServiceImpl;
import org.springframework.stereotype.Service;

// Clusion stuff
import org.crypto.sse.*;

// Everything else
import java.util.HashMap;
import com.google.common.collect.TreeMultimap;
import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.Multimap;
import java.util.List;
import java.util.Arrays;
import java.util.ArrayList;
import java.io.File;
import java.io.FileOutputStream;


@Service
@AutoJsonRpcServiceImpl
public class ClientApiImpl implements ClientApi {

    // Returns a secret key deterministic on `password` (assuming salt has not changed).
    public byte[] GetSkFromPassword(String password) throws Exception {
        return RR2Lev.keyGen(256, password, "salt/salt", 100000);
    }


    public byte[] GenTokenUp(String password, String entityName,
                             String fileExtension, byte[] fileBytes) throws Exception {
        byte[] sk = GetSkFromPassword(password);
        
        // Convert files bytes into a File type.
        File file = new File(entityName + "." + fileExtension);
        try (FileOutputStream stream = new FileOutputStream(file)) {
            stream.write(fileBytes);
        }
        // Note: this is NOT secure. Users can create files on our system, and they're
        // not in any /tmp directory or anything with reduced permissions.

        // Empty the multimap from any previous keywords.
        TextExtractPar.lp1 = ArrayListMultimap.create();

        // Run text extraction on the file.
        ArrayList<File> fileList = new ArrayList<File>();
        fileList.add(file);
        TextExtractPar.extractTextPar(fileList);
        file.delete();

        System.out.println(TextExtractPar.lp1);

        TreeMultimap<String, byte[]> tokenUp = DynRH.tokenUpdate(sk, TextExtractPar.lp1);

        // Serialize `tokenUp` into byte[] to be passed into RPC.
        return ObjSerializer.ToBytes(tokenUp);
    }


    public byte[] MoreKeywordsTokenUp(String password, String[] keywords,
                                      String entityName) throws Exception {

        byte[] sk = GetSkFromPassword(password);

        Multimap<String, String> multimap = ArrayListMultimap.create();
        for (int i = 0; i < keywords.length; i++) {
            multimap.put(keywords[i], entityName);
        }

        TreeMultimap<String, byte[]> tokenUp = DynRH.tokenUpdate(sk, multimap);

        // Serialize `tokenUp` into byte[] to be passed into RPC.
        return ObjSerializer.ToBytes(tokenUp);
    }


    // TODO: Get this to work with multiple keywords instead of just one?
    public byte[][] GenQueryToken(String password, String keyword) throws Exception {
        byte[] sk = GetSkFromPassword(password);
        return DynRH.genTokenFS(sk, keyword);
    }


    public List<String> Resolve(String password, List<byte[]> queryBytes) throws Exception {
        byte[] sk = GetSkFromPassword(password);
        return DynRH.resolve(sk, queryBytes);
    }
}