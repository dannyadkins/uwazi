package uwazi.es.api;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

public class ObjSerializer {

    public static void ToFile(Object obj, String path) throws Exception {
        FileOutputStream fout = new FileOutputStream(path);
        ObjectOutputStream oos = new ObjectOutputStream(fout);
        
        oos.writeObject(obj);

        fout.close();
        oos.close();
    }

    public static byte[] ToBytes(Object obj) throws Exception {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream(bos);

        oos.writeObject(obj);
        
        oos.close();
        bos.close();

        return bos.toByteArray();
    }

    public static Object FromFile(String path) throws Exception {
        FileInputStream fis = new FileInputStream(path);
        ObjectInputStream ois = new ObjectInputStream(fis);

        Object obj = ois.readObject();

        ois.close();
        fis.close();

        return obj;
    }

    public static Object FromBytes(byte[] bytes) throws Exception {
        ByteArrayInputStream bis = new ByteArrayInputStream(bytes);
        ObjectInputStream ois = new ObjectInputStream(bis);

        Object obj = ois.readObject();

        bis.close();
        ois.close();

        return obj;
    }
}