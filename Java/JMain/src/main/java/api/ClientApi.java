package uwazi.es.api;

import com.googlecode.jsonrpc4j.JsonRpcParam;
import com.googlecode.jsonrpc4j.JsonRpcService;
import com.googlecode.jsonrpc4j.JsonRpcError;
import com.googlecode.jsonrpc4j.JsonRpcErrors;

import java.util.HashMap;
import com.google.common.collect.TreeMultimap;
import java.util.List;

@JsonRpcService("/client-api")
public interface ClientApi {

    @JsonRpcErrors({
    @JsonRpcError(exception=Throwable.class,
                  code=-1,
                  message="GetTokenUp threw an exception.",
                  data="")})
    byte[] GenTokenUp(@JsonRpcParam(value = "password") String password,
                      @JsonRpcParam(value = "keywords") String[] keywords,
                      @JsonRpcParam(value = "metadata") HashMap<String, String> metadata)
        throws Exception;


    @JsonRpcErrors({
    @JsonRpcError(exception=Throwable.class,
                  code=-1,
                  message="GenQueryToken threw an exception.",
                  data="")})
    byte[][] GenQueryToken(@JsonRpcParam(value = "password") String password,
                           @JsonRpcParam(value = "keyword") String keyword)
        throws Exception;

    
    @JsonRpcErrors({
    @JsonRpcError(exception=Throwable.class,
                  code=-1,
                  message="GetQueryToken threw an exception.",
                  data="")})
    List<String> Resolve(@JsonRpcParam(value = "password") String password,
                         @JsonRpcParam(value = "queryBytes") byte[][] queryBytes)
        throws Exception;
}