# 🌱 EcoShare – Smart Food Waste Management System

EcoShare is a full-stack MERN application that connects restaurants, students, NGOs, and administrators to reduce food waste through intelligent redistribution.

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Frontend [Frontend - React, Vite, Tailwind]
        UI[User Interface]
        State[State Management]
    end

    subgraph Backend [Backend - Node.js, Express.js]
        API[REST API]
        Auth[JWT Authentication]
        Controllers[Business Logic]
    end

    subgraph Database [Database - MongoDB]
        Models[Mongoose Models]
        DB[(MongoDB Cluster)]
    end

    UI -->|HTTP Requests| API
    API --> Auth
    Auth --> Controllers
    Controllers --> Models
    Models --> DB
```

## 👥 User Workflows

```mermaid
flowchart LR
    Donor([🍽️ Restaurant / Donor])
    Receiver([🎓 Student / NGO])
    Admin([🛡️ Administrator])
    Platform{EcoShare Platform}

    Donor -->|Posts surplus food| Platform
    Donor -->|Tracks donation history| Platform
    Receiver -->|Views available food| Platform
    Receiver -->|Claims food for pickup| Platform
    Admin -->|Monitors system health| Platform
    Admin -->|Manages users & roles| Platform
```

## 🔄 Food Donation Lifecycle

```mermaid
sequenceDiagram
    actor Donor
    participant System
    actor Receiver

    Donor->>System: Post food donation (Type, Quantity, Expiry)
    System-->>Donor: Donation successfully listed
    System->>Receiver: Alert: New food available nearby
    Receiver->>System: Request to claim food
    System-->>System: Update donation status to "Claimed"
    System-->>Receiver: Provide pickup details
    System-->>Donor: Notify that food has been claimed
    Receiver->>Donor: Pick up food
    Receiver->>System: Mark pickup as "Completed"
```

## 🚀 Features

- **Secure Access:** JWT Authentication & Role-Based Access Control (RBAC).
- **Interactive UI:** Fully responsive design with Dark/Light theme support.
- **Dynamic Frontend:** 3D elements and animations using Three.js and Framer Motion.
- **Scalable Architecture:** Built on the robust MERN stack.

## 🛠️ Tech Stack

| Frontend | Backend | Database | Tools & Libraries |
| :--- | :--- | :--- | :--- |
| React | Node.js | MongoDB | TypeScript |
| Vite | Express.js | Mongoose | Tailwind CSS |
| Framer Motion | JWT | | Recharts |
| Three.js | bcrypt | | React Query |

## 📌 Status

- ✅ **Phase 1:** Core Foundation & UI (Completed)
- 🚧 **Phase 2:** Advanced Features (Under Development)

## 👨‍💻 Author

Somnath Bhaskar