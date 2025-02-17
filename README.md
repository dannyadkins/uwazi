<!-- @format -->

![Uwazi Logo](https://www.uwazi.io/wp-content/uploads/2017/09/cropped-uwazi-color-logo-300x68.png)

This project aims to enhance the security and privacy of private documents on Uwazi.
Now, when a new document is uploaded to an entity

- The file is encrypted with AES before being sent to the server
- Words are automatically extracted from the document and added as keywords
- The `{keyword: document}` mapping is stored encrypted on the sever, in a form that can
  be queried while encrypted.
- All Uwazi functionality appears to the user exactly the same as it did prior to the
  addition of encrypted search.

The searchable encryption functionality was implemented using the `DynRH` scheme from
the [Clusion Library](https://github.com/encryptedsystems/clusion). This dynamic, forward
secure scheme is a variant of [CJJJKRS14](https://eprint.iacr.org/2014/853.pdf).

<br><br>

## The glue between Clusion and Uwazi

The Web App interfaces with the Clusion methods that implement DynRH by means of
`JSON-RPC`. We developed a Java program (source code in `Java/`) built on a
[Spring](https://spring.io/) server to listen for and respond to these types of
requests. The program must be running on both the client and server machines. It
listens for incoming JSON-RPC requests on `localhost:8081/client-api` and `/server-api`,
invokes the appropriate Clusion methods, and responds with the result.

Note that the current implementation builds a single binary that listens for both the
client and server requests. This was done simply to make testing a little easier. The
two "halves" of the binary do not share any memory or communicate directly. All data
transfer happens entirely through Uwazi.

## Demo & Presentation

- [UwaziES Demo - Youtube](https://www.youtube.com/watch?v=k_Rg60yn0Sc)
- [Presentation - Google Slides](https://docs.google.com/presentation/d/1iSW1vfI9qD5v8LKAPG-5Z3Ofkrd_TvT3leJla2f1nqg/edit?usp=sharing)

## How to run

- Follow instructions @ https://github.com/huridocs/uwazi (and ensure you are running Node 8.10).
- Build the Java client with `cd Java && mvn clean install`
- Run the Java client with `java -jar target/uwazi-es-0.1.jar`

## JavaScript packages
- Encrypts documents with CryptoJS
- View documents with PDFjs
- Search documents by title via existing Uwazi architecture

<br><br>

## References

1. [[CJJJKRS14](https://eprint.iacr.org/2014/853.pdf)]: _Dynamic Searchable Encryption in
   Very-Large Databases: Data Structures and Implementation_ by D. Cash, J. Jaeger, S.
   Jarecki, C. Jutla, H. Krawczyk, M. Rosu, M. Steiner.
