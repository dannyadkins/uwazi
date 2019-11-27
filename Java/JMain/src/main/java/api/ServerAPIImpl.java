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
import java.io.File;
import java.util.List;

@Service
@AutoJsonRpcServiceImpl
public class ServerApiImpl implements ServerApi {

    public void CreateEmptyEmm(String pathToEmm) throws Exception {
        HashMap<String, byte[]> emm = DynRH.setup();

        // Create any necessary directories to fulfil the `pathToEmm`.
        File file = new File(pathToEmm);
        file.getParentFile().mkdirs();

        // Write `emm` to file.
        ObjSerializer.ToFile(emm, pathToEmm);
    }


    public void UpdateEmm(String pathToEmm, byte[] tokenUpBytes) throws Exception {
        // Read `emm` from file
        HashMap<String, byte[]> emm = (HashMap<String, byte[]>)ObjSerializer.FromFile(pathToEmm);

        // Deserialize `tokenUp` into TreeMultimap<String, byte[]>
        TreeMultimap<String, byte[]> tokenUp = (TreeMultimap<String, byte[]>)ObjSerializer.FromBytes(tokenUpBytes);

        // Run update op with `tokenUp` on `emm`
        DynRH.update(emm, tokenUp);

        // Write `emm` to file.
        ObjSerializer.ToFile(emm, pathToEmm);
    }

    public List<byte[]> Query(String pathToEmm, byte[][] searchToken) throws Exception {
        // Read `emm` from file
        HashMap<String, byte[]> emm = (HashMap<String, byte[]>) ObjSerializer.FromFile(pathToEmm);
        
        List<byte[]> result = DynRH.queryFS(searchToken, emm);
        return result;
    }
}