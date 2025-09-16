import http from "http";
import express from "express";
import envs from "../config/enviroment-vars";

export class ServerBoostrap {
  //Atributos - Propiedades - Caracteristicas (Lo mismo)
  private app!: express.Application;

  //Constructor (Dar valores iniciales o inyectarlos)
  constructor(app: express.Application) {
    this.app = app;
  }

  init(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const server = http.createServer(this.app);
      const PORT = envs.PORT || 4100;
      server.listen(PORT)
      .on("listening", ()=>{
        console.log(`Server is running on port ${PORT}`);
        resolve(true);
      })
      .on("error", ()=>{
        console.error(`Error starting server on port ${PORT}`)
        reject(false);
      })
      });
  }
}
