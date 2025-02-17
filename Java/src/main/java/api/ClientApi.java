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
                      @JsonRpcParam(value = "entityName") String entityName,
                      @JsonRpcParam(value = "fileExtension") String fileExtension,
                      @JsonRpcParam(value = "fileBytes") byte[] fileBytes)
        throws Exception;


    @JsonRpcErrors({
    @JsonRpcError(exception=Throwable.class,
                  code=-1,
                  message="MoreKeywordsTokenUp threw an exception.",
                  data="")})
    byte[] MoreKeywordsTokenUp(@JsonRpcParam(value = "password") String password,
                               @JsonRpcParam(value = "keywords") String[] keywords,
                               @JsonRpcParam(value = "entityName") String entytiName)
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
                  message="Resolve threw an exception.",
                  data="")})
    List<String> Resolve(@JsonRpcParam(value = "password") String password,
                         @JsonRpcParam(value = "queryBytes") List<byte[]> queryBytes)
        throws Exception;

}