
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.RandomAccessFile;
import java.io.Writer;
import java.net.ServerSocket;
import java.net.Socket;

public class Servidor extends Thread {
	private static ServerSocket server; 
	private String nome;
	private Socket con;
	private InputStream in;  
	private InputStreamReader inr;  
	private BufferedReader bfr;
	private RandomAccessFile rf = null;
	
	public Servidor(Socket con) throws FileNotFoundException{
        this.con = con;
        rf = new RandomAccessFile("clientes.txt", "rw");
        try {
            in  = con.getInputStream();
            inr = new InputStreamReader(in);
            bfr = new BufferedReader(inr);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
	
	public static String inputStreamAsString(InputStream stream) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(stream));
        StringBuilder sb = new StringBuilder();
        String line = null;

        while ((line = br.readLine()) != null) {
            sb.append(line + "\n");
        }

        br.close();
        return sb.toString();
    }

    public void run() {
        try {
            String msg;            
            msg = Servidor.inputStreamAsString(this.con.getInputStream());
            System.out.println(msg);
            
            if(msg.length() > 0) {
            	if(msg.startsWith("setNewClient")) {
            		String[] explodedMsg = msg.split("@@##@@");
            		rf.seek(rf.length());
                    rf.writeBytes(explodedMsg[1] + "@@##@@");
            	} else if (msg.startsWith("getClients")){
            		String condiction;
            		String resp = "getClients####";
            		rf.seek(0);
            		condiction = rf.readLine();
            		while (condiction != null) {
            			resp += condiction;	
            			condiction = rf.readLine();
            		}
            		System.out.println(resp);
            		
            		Socket socket = new Socket("127.0.0.1",8002);
            		OutputStream ou = socket.getOutputStream();
                    OutputStreamWriter ouw = new OutputStreamWriter(ou);
                    BufferedWriter bfw = new BufferedWriter(ouw);
                    bfw.write(resp);
                    bfw.flush();
            	}
            }
            
            this.con.close();            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    
    public static void main(String []args) {
        try{
            server = new ServerSocket(8001);
            while(true) {
            	System.out.println("esperando conexões");
                Socket con = server.accept();
                System.out.println("chegou alguma coisa");
                Thread t = new Servidor(con);
                t.start();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}