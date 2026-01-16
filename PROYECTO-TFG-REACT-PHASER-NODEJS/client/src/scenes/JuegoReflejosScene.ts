import Phaser from 'phaser';

interface MapaActivo {
  _id: string;
  nombre: string;
  categoria: string;
  audio: string;
  dificultad: number;
  datosMapa: {
    duracion: number;
    cancion: string;
  }
}




export default class JuegoReflejosScene extends Phaser.Scene {
  private circles: Phaser.GameObjects.Arc[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private missedText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private missedCircles = 0;
  private puntos = 0;
  private endTimer!: Phaser.Time.TimerEvent;
  private juegoTerminado = false;
  private aciertosTotales = 0;
  private totalCirculos = 0;
  private clicsCentrales = 0;
  private tiempoPromedio = 0;
  private maxRacha = 0;
  private rachaActual = 0;
  private tiemposReaccion: number[] = [];
  private tiempoApareceCirculo: number = 0;
  private mapa!: MapaActivo;
  private duracion!: number;
  private intervaloAparicion = 1000;
  private tamanoMin = 20;
  private tamanoMax = 60;

  private music!: Phaser.Sound.WebAudioSound;
  private shootSound!: Phaser.Sound.WebAudioSound;

  private volumen = 1;

  private actualizarAjustesDesdeLocalStorage() {
  const ajustes = JSON.parse(localStorage.getItem("ajustesJuego") || "{}");
  this.volumen = ajustes.volumen ?? 1;

  if (this.music) this.music.setVolume(this.volumen);
  if (this.shootSound) this.shootSound.setVolume(this.volumen);

  console.log("🔄 Ajustes actualizados en vivo:", ajustes);
}

  constructor() {
    super('JuegoReflejosScene');
  }

  create() {
    this.input.setDefaultCursor('crosshair');

    this.mapa = this.registry.get("mapaActivo");

    window.addEventListener("storage", this.actualizarAjustesDesdeLocalStorage.bind(this));
    const ajustes = JSON.parse(localStorage.getItem("ajustesJuego") || "{}");
    this.volumen = ajustes.volumen ?? 1;

    let audioPath = this.mapa.audio || this.mapa.datosMapa?.cancion;
        if (!audioPath) {
          console.error("No se encontró ruta de audio en el mapa");
          audioPath = "/audio/test.mp3"; 
        }
    
        audioPath = encodeURI(audioPath.trim());
    
        console.log("Cargando audio desde:", audioPath);
    
        this.load.audio('backgroundMusic', audioPath);
        this.load.audio('shootSound', '/audio/disparo.mp3');
    
        this.load.once(Phaser.Loader.Events.COMPLETE, () => {
          console.log("Audios cargados");
          this.initSceneWithAudio();
        });
    
    
        this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
     'Toca en cualquier parte para comenzar',
  {
    fontSize: '32px',
    color: '#ffffff',
    backgroundColor: '#00000000',
    padding: { x: 20, y: 12 },
    fontFamily: 'Audiowide'
  }
    ).setOrigin(0.5)
    .setDepth(1000)
    .setName('startMessage');
    
        this.load.start();
  }

  private startGame(){
    if (!this.mapa || !this.mapa.datosMapa ) {
      console.error("Mapa no encontrado");
      return;
    }

    this.duracion = this.mapa.datosMapa.duracion ?? 30;
    // Ajustar parámetros según dificultad (1–7)
    const dificultad = Phaser.Math.Clamp(this.mapa.dificultad ?? 3, 1, 7);

    // Interpolar entre 1300ms (fácil) y 500ms (difícil)
    this.intervaloAparicion = 1300 - (dificultad - 1) * ((1300 - 500) / 6);
    this.tamanoMax = 65 - (dificultad - 1) * ((65 - 35) / 6);
    this.tamanoMin = 20; 

    // UI
    const textStyle = { font: '20px Arial', color: '#ffffff' };
    this.add.text(20, 20, 'Tiempo restante:', textStyle);
    this.timeText = this.add.text(180, 20, '', textStyle);
    this.scoreText = this.add.text(20, 50, 'Puntos: 0', textStyle);
    this.missedText = this.add.text(20, 80, 'Fallados: 0/3', textStyle);

    this.endTimer = this.time.delayedCall(this.duracion * 1000, () => this.endGame(true));

    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (this.juegoTerminado) return;
        const restante = Math.max(0, this.endTimer.getRemaining());
        this.timeText.setText(`${(restante / 1000).toFixed(1)}s`);
      }
    });

    this.generarCicloDeTargets();
  }

private initSceneWithAudio(){

   console.log("Iniciando escena con audio");

    // Crear instancias de sonido pero NO reproducir todavía
    this.music = this.sound.add('backgroundMusic', {
      loop: true,
      volume: this.volumen
    }) as Phaser.Sound.WebAudioSound;

    this.shootSound = this.sound.add('shootSound', {
      volume: this.volumen
    }) as Phaser.Sound.WebAudioSound;

this.input.once('pointerdown', () => {
  const touchText = this.children.getByName('startMessage') as Phaser.GameObjects.Text;

  if (touchText) {
    this.tweens.add({
      targets: touchText,
      alpha: 0,
      duration: 500,
      onComplete: () => touchText.destroy(),
    });
  }

  if (!this.music.isPlaying) {
    try {
      this.music.play();
      console.log("Música iniciada");
    } catch (error) {
      console.error("Error al reproducir música:", error);
    }
  }


  this.startGame();
});

  }
  
  private generarCicloDeTargets() {
    const spawn = () => {
      if (this.juegoTerminado) return;

      const x = Phaser.Math.Between(100, this.scale.width - 100);
      const y = Phaser.Math.Between(100, this.scale.height - 100);
      const tamano = Phaser.Math.Between(this.tamanoMin, this.tamanoMax);
      const esTrampa = Math.random() < 0.2;

      this.spawnCircle(x, y, tamano, esTrampa);

      this.time.delayedCall(this.intervaloAparicion, spawn);
    };

    spawn();
  }

  private spawnCircle(x: number, y: number, size: number, esTrampa: boolean = false) {
    this.tiempoApareceCirculo = this.time.now;

    const color = esTrampa ? 0xff0000 : 0xa855f7;
    const outer = this.add.circle(x, y, size, color, 0.3);
    const middle = this.add.circle(x, y, size * 0.66, esTrampa ? 0xaa0000 : 0xd946ef, 0.5);
    const inner = this.add.circle(x, y, size * 0.33, esTrampa ? 0x660000 : 0xec4899, 0.8);

    let xTexto: Phaser.GameObjects.Text | null = null;

    if (esTrampa) {
    xTexto = this.add.text(x, y, 'X', {
        font: '24px Arial',
        color: '#ffffff',
        fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
}

    const zone = this.add.zone(x, y, size * 1.8, size * 1.8)
      .setOrigin(0.5)
      .setInteractive();

    zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const tiempoReaccion = this.time.now - this.tiempoApareceCirculo;
      this.tiemposReaccion.push(tiempoReaccion);

      if (esTrampa) {
        this.puntos = Math.max(0, this.puntos - 100);
        this.rachaActual = 0;
        this.scoreText.setText(`Puntos: ${this.puntos}`);
      } else {
        const dx = pointer.x - x;
        const dy = pointer.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const shootSound = this.sound.add('shootSound', { volume: this.volumen });
        shootSound.play();

        try {
          this.shootSound.play();
        } catch (error) {
          console.error("Error al reproducir sonido", error);
        }


        let puntos = 0;
        if (dist <= size * 0.33) {
          puntos = 100;
          this.clicsCentrales++;
        } else if (dist <= size * 0.66) puntos = 75;
        else if (dist <= size) puntos = 50;
        else return;

        this.puntos += puntos;
        this.aciertosTotales++;
        this.totalCirculos++;
        this.rachaActual++;
        this.maxRacha = Math.max(this.rachaActual, this.maxRacha);
        this.scoreText.setText(`Puntos: ${this.puntos}`);

        if (puntos === 100) {
        const feedback = this.add.text(x, y, `+${puntos}`, {
            font: '24px Arial',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: feedback,
            y: y - 40,
            alpha: 0,
            duration: 800,
            ease: 'easeOut',
            onComplete: () => feedback.destroy()
        });
        }

      }

      outer.destroy();
      middle.destroy();
      inner.destroy();
      zone.destroy();
      if (xTexto) xTexto.destroy();
    });

    this.circles.push(outer);

    this.time.delayedCall(2000, () => {
      if (!zone.active) return;

     
      outer.destroy();
      middle.destroy();
      inner.destroy();
      zone.destroy();
       if (xTexto) xTexto.destroy();

        if (!esTrampa) {
        this.rachaActual = 0;
        this.handleMiss(outer);
    }
    });
  }

  private handleMiss(circle: Phaser.GameObjects.Arc) {
    if (this.juegoTerminado) return;

    circle.destroy();
    this.circles = this.circles.filter(c => c !== circle);
    this.missedCircles++;
    this.missedText.setText(`Fallados: ${this.missedCircles}/3`);

    if (this.missedCircles >= 3) {
      this.endGame(false);
    }
  }

  private stopAllSounds() {
  try {
 
    if (this.music && this.music.isPlaying) {
      this.music.stop();
      console.log("Música detenida");
    }


    if (this.shootSound && this.shootSound.isPlaying) {
      this.shootSound.stop();
    }


    this.sound.stopAll();
  } catch (error) {
    console.error("Error al detener los sonidos:", error);
  }
}

  private async endGame(win: boolean = true) {
    if (this.juegoTerminado) return;
    this.juegoTerminado = true;

    this.stopAllSounds();


    this.endTimer?.destroy();
    this.time.removeAllEvents();
    this.circles.forEach(circle => circle.destroy());
    this.circles = [];

    this.tiempoPromedio = this.tiemposReaccion.length > 0
      ? parseFloat((this.tiemposReaccion.reduce((a, b) => a + b, 0) / this.tiemposReaccion.length).toFixed(1))
      : 0;

    const precision = this.totalCirculos > 0
      ? (this.aciertosTotales / this.totalCirculos) * 100
      : 0;

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (userId && token) {
      try {
        const statsResponse = await fetch(
          `http://localhost:3001/api/usuario/actualizar-estadisticas`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId,
              mapaId: this.mapa._id,
              mapa: this.mapa.nombre,
              puntos: this.puntos,
              aciertos: this.aciertosTotales,
              intentos: this.totalCirculos,
              centroClicks: this.clicsCentrales,
              tiempoReaccion: this.tiempoPromedio,
              rachaMax: this.maxRacha,
              resultado: win ? "victoria" : "derrota",
              rachaActual: this.rachaActual,
              precision
            }),
          }
        );

        if (!statsResponse.ok) throw new Error('Error al actualizar estadísticas');
        const statsData = await statsResponse.json();
        console.log("Estadísticas actualizadas:", statsData);
      } catch (error) {
        console.error("Error al guardar estadísticas:", error);
      }
    }

    const message = win ? '¡Victoria!' : 'Game Over';
    this.add.text(this.scale.width / 2, 300, message, {
      fontSize: '74px',
      color: win ? '#00ff00' : '#ff0000',
      fontFamily: 'Audiowide'
    }).setOrigin(0.5);

  const restartButton = this.add.text(this.scale.width / 2, 400, 'VOLVER A JUGAR', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Audiowide',
    backgroundColor: '#333333',
    padding: { x: 20, y: 10 }
  })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
      this.time.removeAllEvents(); 
      this.circles.forEach(circle => circle.destroy());
      this.circles = [];
      
      this.juegoTerminado = false;
      this.puntos = 0;
      this.missedCircles = 0;
      this.aciertosTotales = 0;
      this.totalCirculos = 0;
      this.clicsCentrales = 0;
      this.tiemposReaccion = [];
      this.rachaActual = 0;
      
      this.scene.restart();
      this.scene.start('JuegoReflejosScene'); 
    });

const volverButton = this.add.text(this.scale.width / 2, 480, 'VOLVER A LOS MAPAS', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Audiowide',
    backgroundColor: '#333333',
    padding: { x: 20, y: 10 }
  })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => window.location.href = `/individual/${this.mapa.categoria}`);

      restartButton.on('pointerover', () => restartButton.setBackgroundColor('#555555'));
  restartButton.on('pointerout', () => restartButton.setBackgroundColor('#00000000'));
  volverButton.on('pointerover', () => volverButton.setBackgroundColor('#555555'));
  volverButton.on('pointerout', () => volverButton.setBackgroundColor('#00000000'));
  }
}
