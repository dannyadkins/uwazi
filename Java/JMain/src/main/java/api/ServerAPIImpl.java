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
public class ServerApiImpl implements ServerApi {
    //TODO: Implement CreateEmptyEmm(pathToEmm) (and talk to Danny about this)

    public void UpdateEmm(String pathToEmm, byte[] tokenUp) {
        //TODO

        // Load `emm` from file

        // Deserialize `tokenUp` into TreeMultimap<String, byte[]>

        // Run update op with `tokenUp` on `emm`
    }
}