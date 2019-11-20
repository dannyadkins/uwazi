package uwazi.es.api;

import com.googlecode.jsonrpc4j.JsonRpcParam;
import com.googlecode.jsonrpc4j.JsonRpcService;
import com.googlecode.jsonrpc4j.JsonRpcError;
import com.googlecode.jsonrpc4j.JsonRpcErrors;

import java.util.HashMap;
import com.google.common.collect.TreeMultimap;
import java.io.ByteArrayOutputStream;

@JsonRpcService("/client-api")
public interface ClientApi {

    HashMap<String, byte[]> MakeEmm();

    @JsonRpcErrors({
    @JsonRpcError(exception=Throwable.class,
                  code=-1,
                  message="GetTokenUp threw an exception.",
                  data="")})
    byte[] GenTokenUp(@JsonRpcParam(value = "password") String password,
                      @JsonRpcParam(value = "keywords") String[] keywords,
                      @JsonRpcParam(value = "metadata") HashMap<String, String> metadata)
        throws Exception;
}