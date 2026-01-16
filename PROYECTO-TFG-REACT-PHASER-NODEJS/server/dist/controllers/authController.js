"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const router = express_1.default.Router();
const JWT_SECRET = "supersecreto";
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userName, email, password, nombre, apellidos, telefono, pais, provincia, nivel } = req.body;
        const existente = yield User_1.UserModel.findOne({ $or: [{ email }, { userName }] });
        if (existente) {
            res.status(400).json({ error: "El usuario o email ya están en uso" });
            return;
        }
        const hashedPwd = yield bcrypt_1.default.hash(password, 10);
        const nuevo = new User_1.UserModel({
            userName,
            nombre,
            apellidos,
            email,
            password: hashedPwd,
            telefono,
            pais,
            provincia,
            nivel
        });
        yield nuevo.save();
        res.status(201).json({ mensaje: "Usuario registrado con éxito" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const usuario = yield User_1.UserModel.findOne({ email });
        if (!usuario) {
            res.status(400).json({ error: "Usuario no encontrado" });
            return;
        }
        const passwordOk = yield bcrypt_1.default.compare(password, usuario.password);
        if (!passwordOk) {
            res.status(401).json({ error: "pwd incorrecta" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            id: usuario._id,
            email: usuario.email,
        }, JWT_SECRET, { expiresIn: "2h" });
        res.json({
            mensaje: "Login correcto",
            token,
            usuario: {
                _id: usuario._id,
                userName: usuario.userName,
                email: usuario.email,
                nivel: usuario.nivel,
                rango: usuario.rango,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Error en login" });
    }
}));
exports.default = router;
