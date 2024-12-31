import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const router = express.Router();
let users = [];

const secret = "thisissecret";

const checking = (req, res, next) => {
    const { user, pass } = req.body;

    if (!user || !pass) {
        return res.status(400).send("Please enter both username and password.");
    }

    if (pass.length < 6) {
        return res.status(400).send("Password must be at least 6 characters.");
    }
    next();
};

const verify = (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(403).send("Authentication required");
    }

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(403).send("Invalid token");
        }
        req.user = decoded.user;
        next();
    });
};

router.post("/register", checking, (req, res) => {
    try {
        const { user, pass } = req.body;
        const existingUser = users.find((i) => i.user === user);
        if (existingUser) {
            return res.status(409).send("User already exists. Please login");
        }

        users.push({ user, pass });
        console.log(users);
        res.status(201).send("Registration successful");
    } catch (error) {
        res.status(500).send("Server error");
    }
});

router.post("/login", checking, (req, res) => {
    try {
        const { user, pass } = req.body;
        const result = users.find((i) => i.user === user && i.pass === pass);

        if (result) {
            jwt.sign({ user: user }, secret, { expiresIn: "1h" }, (err, token) => {
                if (err) {
                    return res.status(500).send("Server error");
                }

                res.cookie("authToken", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "Strict",
                    maxAge: 3600000,
                });

                res.status(200).json({ message: "Login successful" });
            });
        } else {
            res.status(401).send("Invalid username or password");
        }
    } catch (error) {
        res.status(500).send("Error in server");
    }
});

router.get("/protected", verify, (req, res) => {
    res.status(200).json({ message: "You have access to protected data", user: req.user });
});

router.post("/logout", (req, res) => {
    res.clearCookie("authToken");
    res.status(200).send("Logged out successfully");
});

export default router;
