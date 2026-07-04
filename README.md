# 🚀 Online Judge & Collaborative Workspace

A full-stack, real-time algorithmic coding platform and collaborative workspace. This platform allows users to solve programming challenges, execute code in isolated environments, and collaborate with teammates in real-time using shared code editors and interactive whiteboards.

**🌟 Live Application:** [online-judge-taupe.vercel.app](https://online-judge-taupe.vercel.app/)

---

## 🛠 Tech Stack & Infrastructure

**Frontend:**
* React.js & React Router
* Monaco Editor (VS Code core) for syntax highlighting and code editing
* HTML5 Canvas for the interactive whiteboard
* Socket.io-client for real-time WebSocket communication
* Deployed via **Vercel**

**Backend & Execution Engine:**
* Node.js & Express.js
* MongoDB & Mongoose for data modeling (Users, Problems, Submissions)
* JSON Web Tokens (JWT) & HTTP-only cookies for secure cross-domain authentication
* Socket.io for real-time state synchronization (code changes, brush strokes)
* AI Integration for automated hinting and logic analysis

**DevOps & Cloud Architecture:**
* **AWS EC2 (Ubuntu):** Hosts the backend and isolated execution environments.
* **Docker & Docker Compose:** Containerizes the Node.js backend and code execution environments for secure, isolated compilation of untrusted user code.
* **Nginx:** Acts as a reverse proxy, routing HTTP/HTTPS traffic and maintaining persistent WebSocket tunnels.
* **Let's Encrypt (Certbot):** Provides automated SSL/TLS certificates for secure `https://` and `wss://` communication across domains.

---

## ✨ Key Features

* **Remote Code Execution (RCE):** Safely compiles and executes user-submitted C++, Java, and Python code against predefined test cases using isolated Docker containers.
* **Real-Time Collaboration:** Users can generate unique session links to invite teammates. Code changes and whiteboard drawings synchronize globally with sub-second latency via WebSockets.
* **Algorithmic Whiteboarding:** An integrated, synchronized Canvas API whiteboard allows users to draw system design diagrams or map out data structures together.
* **AI Code Coach:** Evaluates non-accepted submissions and generates intelligent, context-aware hints based on the user's specific logic and the problem constraints.
* **Secure Cross-Origin Architecture:** Implements strict CORS policies, proxy trust, and secure cross-site cookies (`SameSite=None`) to allow seamless communication between the Vercel frontend and the AWS-hosted backend.

---

## 🏗 System Architecture Diagram

1. **Client** makes HTTPS requests to the **Vercel Frontend**.
2. Frontend communicates securely via REST API and WebSockets to the **AWS EC2 Instance**.
3. **Nginx** receives the traffic, terminates SSL, and routes API/WebSocket requests to the **Node.js Backend**.
4. The Backend authenticates via **MongoDB**, evaluates code by spinning up **Docker Containers**, and broadcasts real-time updates via **Socket.io**.
