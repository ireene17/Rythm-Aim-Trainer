import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";

const router = express.Router();
const JWT_SECRET = "supersecreto";

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { userName, email, password, nombre, apellidos, telefono, pais, provincia, nivel } = req.body;

    const existente = await UserModel.findOne({ $or: [{ email }, { userName }] });
    if (existente) {
      res.status(400).json({ error: "El usuario o email ya están en uso" });
      return;
    }

    const hashedPwd = await bcrypt.hash(password, 10);

    const nuevo = new UserModel({
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

    await nuevo.save();

    res.status(201).json({ mensaje: "Usuario registrado con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const usuario = await UserModel.findOne({ email });
    if (!usuario) {
      res.status(400).json({ error: "Usuario no encontrado" });
      return;
    }

    const passwordOk = await bcrypt.compare(password, usuario.password);
    if (!passwordOk) {
      res.status(401).json({ error: "pwd incorrecta" });
      return;
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        email: usuario.email,
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      mensaje: "Login correcto",
      token
      ,
      usuario: {
        _id: usuario._id,
        userName: usuario.userName,
        email: usuario.email,
        nivel: usuario.nivel,
        rango: usuario.rango,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error en login" });
  }
});


export default router;
