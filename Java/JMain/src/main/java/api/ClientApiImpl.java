package uwazi.es.api;


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
import java.io.ByteArrayOutputStream;
import java.io.ObjectOutputStream;

@Service
@AutoJsonRpcServiceImpl
public class ClientApiImpl implements ClientApi {
    private byte[] GetSkFromPassword(String password) throws Exception {
        return RR2Lev.keyGen(256, password, "salt/salt", 100000);
    }

    public HashMap<String, byte[]> MakeEmm() {
        // Create the initial (empty) emm.
        HashMap<String, byte[]> emm = DynRH.setup();
        return emm;
    }

    public byte[] GenTokenUp(String password,
               String[] keywords,
               HashMap<String, String> metadata) throws Exception {

        byte[] sk = GetSkFromPassword(password);

        String docId = metadata.get("docId");
        
        // TODO: Make multimap of {keyword: metadata} instead of {keyword: docId}
        Multimap<String, String> multimap = ArrayListMultimap.create();
        for (int i = 0; i < keywords.length; i++) {
            multimap.put(keywords[i], docId);
        }

        TreeMultimap<String, byte[]> tokenUp = DynRH.tokenUpdate(sk, multimap);
        
        // Serialize `tokenUp` into byte[] to be passed into RPC.
        ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
        ObjectOutputStream outStream = new ObjectOutputStream(byteOut);
        outStream.writeObject(tokenUp);
        outStream.close();

        return byteOut.toByteArray();
    }
}