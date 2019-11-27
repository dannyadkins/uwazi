package uwazi.es.api;

import com.googlecode.jsonrpc4j.JsonRpcParam;
import com.googlecode.jsonrpc4j.JsonRpcService;
import com.googlecode.jsonrpc4j.JsonRpcError;
import com.googlecode.jsonrpc4j.JsonRpcErrors;

import java.util.HashMap;
import com.google.common.collect.TreeMultimap;
import java.io.ByteArrayOutputStream;
import java.util.List;

@JsonRpcService("/server-api")
public interface ServerApi {

    @JsonRpcErrors({
    @JsonRpcError(exception=Throwable.class,
                  code=-1,
                  message="CreateEmptyEmm threw an exception.",
                  data="")})
    void CreateEmptyEmm(@JsonRpcParam(value = "pathToEmm") String pathToEmm)
        throws Exception;


    @JsonRpcErrors({
    @JsonRpcError(exception=Throwable.class,
                  code=-1,
                  message="UpdateEmm threw an exception.",
                  data="")})
    void UpdateEmm(@JsonRpcParam(value = "pathToEmm") String pathToEmm,
                   @JsonRpcParam(value = "tokenUpBytes") byte[] tokenUpBytes)
        throws Exception;


    @JsonRpcErrors({
    @JsonRpcError(exception=Throwable.class,
                  code=-1,
                  message="Query threw an exception.",
                  data="")})
    byte[][] Query(@JsonRpcParam(value = "pathToEmm") String pathToEmm,
                   @JsonRpcParam(value = "searchToken") byte[][] searchToken)
        throws Exception;
}