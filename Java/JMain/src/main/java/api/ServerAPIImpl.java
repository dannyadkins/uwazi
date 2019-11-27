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
import java.io.FileOutputStream;
import java.io.ObjectOutputStream;
import java.io.FileInputStream;
import java.io.ObjectInputStream;
import java.io.ByteArrayInputStream;
import java.io.File;

@Service
@AutoJsonRpcServiceImpl
public class ServerApiImpl implements ServerApi {

    private void WriteEmmToFile(HashMap<String, byte[]> emm, String pathToEmm) throws Exception {
        FileOutputStream fout = new FileOutputStream(pathToEmm);
        ObjectOutputStream oos = new ObjectOutputStream(fout);
        oos.writeObject(emm);

        fout.close();
        oos.close();
    }

    public void CreateEmptyEmm(String pathToEmm) throws Exception {
        HashMap<String, byte[]> emm = DynRH.setup();

        // Create any necessary directories to fulfil the `pathToEmm`.
        File file = new File(pathToEmm);
        file.getParentFile().mkdirs();

        WriteEmmToFile(emm, pathToEmm);
    }

    private HashMap<String, byte[]> ReadEmmFromFile(String pathToEmm) throws Exception {
        FileInputStream fi = new FileInputStream(pathToEmm);
        ObjectInputStream oi = new ObjectInputStream(fi);

        // Read objects
        HashMap<String, byte[]> obj = (HashMap<String, byte[]>) oi.readObject();

        oi.close();
        fi.close();

        return obj;
    }

    private TreeMultimap<String, byte[]> DeserializeTokenUp(byte[] tokenUp) throws Exception {
        ByteArrayInputStream byteIn = new ByteArrayInputStream(tokenUp);
        ObjectInputStream inStream = new ObjectInputStream(byteIn);
        
        TreeMultimap<String, byte[]> obj = (TreeMultimap<String, byte[]>) inStream.readObject();

        byteIn.close();
        inStream.close();

        return obj;
    }

    public void UpdateEmm(String pathToEmm, byte[] tokenUpBytes) throws Exception {
        // Read `emm` from file
        HashMap<String, byte[]> emm = ReadEmmFromFile(pathToEmm);

        // Deserialize `tokenUp` into TreeMultimap<String, byte[]>
        TreeMultimap<String, byte[]> tokenUp = DeserializeTokenUp(tokenUpBytes);

        // Run update op with `tokenUp` on `emm`
        DynRH.update(emm, tokenUp);

        WriteEmmToFile(emm, pathToEmm);
    }
}