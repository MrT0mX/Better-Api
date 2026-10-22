require("./settings");
const http = require("http");
const app = require("./index");
const PORTHOST = Number(port) || 8080;

http.createServer(app).listen(PORTHOST, () => {
  console.clear();
  console.log(
    `
    
███╗   ███╗████████╗██╗  ██╗     █████╗ ██████╗ ██╗
████╗ ████║╚══██╔══╝╚██╗██╔╝    ██╔══██╗██╔══██╗██║
██╔████╔██║   ██║    ╚███╔╝     ███████║██████╔╝██║
██║╚██╔╝██║   ██║    ██╔██╗     ██╔══██║██╔═══╝ ██║
██║ ╚═╝ ██║   ██║   ██╔╝ ██╗    ██║  ██║██║     ██║
╚═╝     ╚═╝   ╚═╝   ╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝     ╚═╝
                                                   
								 			 
Server running on http://localhost:${PORTHOST}`
  );
  console.log(`Hello ${creator}`);
  if (!process.env.mongodb) {
    console.warn("[!] WARNING: mongodb env is not set. Falling back to localhost MongoDB. Set mongodb in .env for production.");
  }
  if (!(sendemail && sendpwmail && fromsendemail)) {
    console.warn("[!] WARNING: SMTP credentials are not set. Email verification/reset will fail until you configure them.");
  }
});
