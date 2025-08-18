# Resume Builder

A full-stack web application that allows users to create, manage, and download professional resumes in PDF format. It provides a user-friendly interface to input personal details, educational background, work experience, projects, and skills, and then generates a polished resume from the provided information.

## 🚀 Features

* **User Authentication:** Secure sign-up and login functionality for users to manage their personal information and resumes.
* **Dynamic Resume Sections:** Easily add, edit, and delete information for:
    * Basic Information (Name, Contact Details)
    * Education
    * Work Experience
    * Projects
    * Skills
* **Multiple Resume Templates:** Choose from a variety of templates to create a resume that best suits your profile.
* **Real-time Preview:** Instantly see how your resume looks as you fill in the details.
* **PDF Download:** Download your generated resume as a high-quality PDF file.
* **User Profile Management:** Users can view and manage their profile information.

## 🛠️ Tech Stack

### Frontend

* **React:** A JavaScript library for building user interfaces.
* **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
* **Vite:** A fast build tool for modern web development.
* **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
* **Shadcn/ui:** Re-usable components built using Radix UI and Tailwind CSS.
* **React Hook Form:** Performant, flexible and extensible forms with easy-to-use validation.
* **Zod:** TypeScript-first schema validation with static type inference.
* **React PDF:** Display PDFs in your React app as easily as if they were images.

### Backend

* **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine.
* **Express.js:** A minimal and flexible Node.js web application framework.
* **MongoDB:** A NoSQL database for storing user and resume data.
* **Mongoose:** An elegant MongoDB object modeling tool for Node.js.
* **JWT (JSON Web Tokens):** For securing the API endpoints.
* **Bcrypt.js:** A library to help you hash passwords.

## ⚙️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following installed on your machine:

* [Node.js](https://nodejs.org/) (v14 or higher)
* [npm](https://www.npmjs.com/) (Node Package Manager)
* [MongoDB](https://www.mongodb.com/) (or a MongoDB Atlas account)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/resume-builder.git](https://github.com/your-username/resume-builder.git)
    cd resume-builder
    ```

2.  **Setup the Backend:**
    * Navigate to the `backend` directory:
        ```sh
        cd backend
        ```
    * Install the dependencies:
        ```sh
        npm install
        ```
    * Create a `.env` file in the `backend` directory and add the following environment variables:
        ```env
        PORT=5000
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=your_jwt_secret
        ```
    * Start the backend server:
        ```sh
        npm start
        ```
    The server will be running on `http://localhost:5000`.

3.  **Setup the Frontend:**
    * Navigate to the `my-portfolio-cms` (frontend) directory from the root project folder:
        ```sh
        cd ../my-portfolio-cms
        ```
    * Install the dependencies:
        ```sh
        npm install
        ```
    * Create a `.env.local` file in the `my-portfolio-cms` directory and add the following, pointing to your backend server:
        ```env
        VITE_API_BASE_URL=http://localhost:5000
        ```
    * Start the frontend development server:
        ```sh
        npm run dev
        ```
    The application will be running on `http://localhost:5173`.

## 📸 Screenshots

![Landing Page](./my-portfolio-cms/src/assets/resume1.png)
_Landing Page_

![Dashboard](./my-portfolio-cms/src/assets/Resume2.png)
_User Dashboard_

![Resume Preview](./my-portfolio-cms/src/assets/Resume3.png)
_Resume Preview_

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

