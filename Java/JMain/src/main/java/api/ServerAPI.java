package uwazi.es.api;

import com.googlecode.jsonrpc4j.JsonRpcParam;
import com.googlecode.jsonrpc4j.JsonRpcService;
import com.googlecode.jsonrpc4j.JsonRpcError;
import com.googlecode.jsonrpc4j.JsonRpcErrors;

import java.util.HashMap;
import com.google.common.collect.TreeMultimap;
import java.io.ByteArrayOutputStream;

@JsonRpcService("/server-api")
public interface ServerApi {
    void UpdateEmm(@JsonRpcParam(value = "pathToEmm") String pathToEmm,
                   @JsonRpcParam(value = "tokenUp") byte[] tokenUp);
}