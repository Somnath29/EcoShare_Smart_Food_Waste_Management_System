import http from 'http';

const data = JSON.stringify({ email: "ngo@example.com", password: "password123" });
const req = http.request({ hostname: "localhost", port: 5001, path: "/api/v1/auth/login", method: "POST", headers: { "Content-Type": "application/json", "Content-Length": data.length } }, res => {
  let body = "";
  res.on("data", d => body += d);
  res.on("end", () => {
    const token = JSON.parse(body).token;
    if(!token) { console.log("Login failed", body); return; }
    
    // Now get foods
    const req2 = http.request({ hostname: "localhost", port: 5001, path: "/api/v1/foods?status=Available", method: "GET", headers: { "Authorization": "Bearer " + token } }, res2 => {
      let body2 = "";
      res2.on("data", d => body2 += d);
      res2.on("end", () => {
        const foods = JSON.parse(body2).foods;
        console.log("NGO Foods count:", foods ? foods.length : 0);
        console.log("Titles:", foods ? foods.map(f => f.title + " " + f.quantity) : body2);
      });
    });
    req2.end();
  });
});
req.write(data);
req.end();
