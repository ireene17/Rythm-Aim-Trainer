import Phaser from 'phaser';

interface TargetData {
  x: number;
  y: number;
  tiempo: number;
  tamano: number;
  destinoX?: number;
  destinoY?: number;
}

interface DatosMapa {
  targets: TargetData[];
  duracion: number;
  velocidad: string;
  cancion: string;
}

interface MapaActivo {
  _id: string;
  nombre: string;
  categoria: string;
  datosMapa: DatosMapa;
  audio: string;
}

export default class JuegoTrackerScene extends Phaser.Scene {
  private mapa!: MapaActivo;
  private targets: TargetData[] = [];
  private puntos = 0;
  private aciertosTotales = 0;
  private totalCirculos = 0;
  private clicsCentrales = 0;
  private tiempoPromedio = 0;
  private maxRacha = 0;
  private rachaActual = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private missedText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private juegoTerminado = false;
  private endTimer!: Phaser.Time.TimerEvent;
  private missedCircles = 0;
  private tiemposReaccion: number[] = []; 
  private activeSlider?: {
    startTime: number;
    duration: number;
    circle: Phaser.GameObjects.Arc;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    startCircle: Phaser.GameObjects.Arc;
    endCircle: Phaser.GameObjects.Arc;
    line: Phaser.GameObjects.Line;
    completed: boolean;
  };
  private music!: Phaser.Sound.WebAudioSound;
  private shootSound!: Phaser.Sound.WebAudioSound;
  private sensibilidad = 1;
  private volumen = 1;

  private actualizarAjustesDesdeLocalStorage() {
    const ajustes = JSON.parse(localStorage.getItem("ajustesJuego") || "{}");
    this.sensibilidad = ajustes.sensibilidad ?? 1;
    this.volumen = ajustes.volumen ?? 1;

    if (this.music) this.music.setVolume(this.volumen);
    if (this.shootSound) this.shootSound.setVolume(this.volumen);

    console.log("Ajustes actualizados:", ajustes);
  }

  constructor() {
    super('JuegoTrackerScene');
  }

  create() {
    this.mapa = this.registry.get("mapaActivo");
    this.input.setDefaultCursor('crosshair');

    window.addEventListener("storage", this.actualizarAjustesDesdeLocalStorage.bind(this));
    const ajustes = JSON.parse(localStorage.getItem("ajustesJuego") || "{}");
    this.sensibilidad = ajustes.sensibilidad ?? 1;
    this.volumen = ajustes.volumen ?? 1;

    let audioPath = this.mapa.audio || this.mapa.datosMapa?.cancion;
    if (!audioPath) {
      console.error("no hay audio");
      audioPath = "/audio/test.mp3";
    }

    audioPath = encodeURI(audioPath.trim());
    console.log("Cargando audio:", audioPath);

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

  private initSceneWithAudio() {
    console.log("Iniciando escena con audio");

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

  private startGame() {
    this.puntos = 0;
    this.aciertosTotales = 0;
    this.totalCirculos = 0;
    this.clicsCentrales = 0;
    this.tiempoPromedio = 0;
    this.maxRacha = 0;
    this.rachaActual = 0;
    this.juegoTerminado = false;
    this.missedCircles = 0;
    this.tiemposReaccion = [];
    this.activeSlider = undefined;

    this.targets = this.mapa.datosMapa.targets;

    const textStyle = { font: '20px Arial', color: '#ffffff' };
    this.add.text(20, 20, 'Tiempo restante:', textStyle);
    this.timeText = this.add.text(180, 20, '', textStyle);
    this.scoreText = this.add.text(20, 50, 'Puntos: 0', textStyle);
    this.missedText = this.add.text(20, 80, 'Fallados: 0/3', textStyle);

    if (this.mapa.categoria === "MixedMode") {
      this.generarFalsosNegativos();
    }

    this.endTimer = this.time.delayedCall(
      this.mapa.datosMapa.duracion * 1000,
      () => this.endGame(true)
    );

    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (this.juegoTerminado) return;
        const restante = Math.max(0, this.endTimer.getRemaining());
        this.timeText.setText(`${(restante / 1000).toFixed(1)}s`);
      },
    });

    for (const target of this.targets) {
      this.time.delayedCall(target.tiempo * 1000, () => {
        if (!this.juegoTerminado) {
          if (target.destinoX !== undefined && target.destinoY !== undefined) {
            this.spawnSlider(target);
          } else {
            this.spawnTap(target);
          }
        }
      });
    }
  }

  private spawnTap(target: TargetData) {
    const { x, y, tamano } = target;

    const outer = this.add.circle(x, y, tamano, 0xa855f7, 0.2);
    const middle = this.add.circle(x, y, tamano * 0.66, 0xd946ef, 0.5);
    const inner = this.add.circle(x, y, tamano * 0.33, 0xec4899, 0.8);

    const zone = this.add.zone(x, y, tamano * 1.8, tamano * 1.8)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: false });

    zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const dx = pointer.x - x;
      const dy = pointer.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const shootSound = this.sound.add('shootSound', { volume: this.volumen });
      shootSound.play();

      try {
        this.shootSound.play();
      } catch (error) {
        console.error("Error al reproducir sonido:", error);
      }

      let puntos = 0;
      if (dist <= tamano * 0.33) {
        puntos = 100;
        this.clicsCentrales++;
      } else if (dist <= tamano * 0.66) {
        puntos = 75;
      } else if (dist <= tamano) {
        puntos = 50;
      } else {
        return;
      }

      this.puntos += puntos;
      this.aciertosTotales++;
      this.totalCirculos++;
      this.rachaActual++;
      this.maxRacha = Math.max(this.rachaActual, this.maxRacha);
      this.scoreText.setText(`Puntos: ${this.puntos}`);

      if(puntos == 100){
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
          onComplete: () => feedback.destroy()
        });
      }

      outer.destroy();
      middle.destroy();
      inner.destroy();
      zone.destroy();
    });

    this.time.delayedCall(2000, () => {
      if (!zone.active) return;
      outer.destroy();
      middle.destroy();
      inner.destroy();
      zone.destroy();
      this.rachaActual = 0;
      this.handleMiss();
    });
  }

  private spawnSlider(target: TargetData) {
    const { x, y, destinoX, destinoY, tamano } = target;
    if (destinoX === undefined || destinoY === undefined) return;

    const startCircle = this.add.circle(x, y, tamano, 0x3333333, 0.5);
    
    const endCircle = this.add.circle(destinoX, destinoY, tamano, 0x6b21a8, 0.5);
    
    const line = this.add.line(0, 0, x, y, destinoX, destinoY, 0x3333333, 0.5)
      .setOrigin(0)
      .setLineWidth(0);
    
    const slider = this.add.circle(x, y, tamano * 0.6, 0x6b21a8, 0.8);
    slider.setInteractive();

    const duration = 1500;

    this.activeSlider = {
      startTime: this.time.now,
      duration,
      circle: slider,
      startX: x,
      startY: y,
      endX: destinoX,
      endY: destinoY,
      startCircle: startCircle,
      endCircle: endCircle,
      line: line,
      completed: false
    };


    this.time.delayedCall(duration + 1000, () => {
      if (this.activeSlider && !this.activeSlider.completed) {
        this.rachaActual = 0;
        this.handleMiss();
        this.cleanupSlider();
      }
    });
  }

  private cleanupSlider() {
    if (!this.activeSlider) return;
    
    this.activeSlider.circle.destroy();
    this.activeSlider.startCircle.destroy();
    this.activeSlider.endCircle.destroy();
    this.activeSlider.line.destroy();
    this.activeSlider = undefined;
  }

  update() {
    if (!this.activeSlider || this.juegoTerminado) return;

    const { circle, startTime, duration, startX, startY, endX, endY } = this.activeSlider;
    const pointer = this.input.activePointer;

    
    if (pointer.isDown) {
      const elapsed = this.time.now - startTime;
      const t = Phaser.Math.Clamp(elapsed / duration, 0, 1);
      
      const expectedX = Phaser.Math.Linear(startX, endX, t);
      const expectedY = Phaser.Math.Linear(startY, endY, t);
      
      const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, expectedX, expectedY);
      const maxAllowedDist = circle.radius * 2 * this.sensibilidad;
      
      if (dist <= maxAllowedDist) {
        circle.x = expectedX;
        circle.y = expectedY;
        
        if (t >= 1 && !this.activeSlider.completed) {
          this.activeSlider.completed = true;
          this.puntos += 125; 
          this.aciertosTotales++;
          this.rachaActual++;
          this.maxRacha = Math.max(this.rachaActual, this.maxRacha);
          this.scoreText.setText(`Puntos: ${this.puntos}`);
          
          this.tweens.add({
            targets: circle,
            scale: 1.5,
            alpha: 0,
            duration: 300,
            onComplete: () => this.cleanupSlider()
          });
        }
      }
    }
  }

  private handleMiss() {
    if (this.juegoTerminado) return;
    this.missedCircles++;
    this.missedText.setText(`Fallados: ${this.missedCircles}/3`);
    if (this.missedCircles >= 3) {
      this.endGame(false);
    }
  }

  private generarFalsosNegativos(): void {
    const cantidad = Phaser.Math.Between(4, 6);
    for (let i = 0; i < cantidad; i++) {
      const delay = Phaser.Math.Between(1000, this.mapa.datosMapa.duracion * 1000 - 2000);
      this.time.delayedCall(delay, () => {
        if (this.juegoTerminado) return;
        const x = Phaser.Math.Between(100, this.scale.width - 100);
        const y = Phaser.Math.Between(100, this.scale.height - 100);
        const tamano = 40;

        const fake = this.add.circle(x, y, tamano, 0xff0000, 0.5);
        const cross = this.add.text(x, y, 'X', {
          font: '24px Arial',
          color: '#ffffff',
          fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(10);

        const zone = this.add.zone(x, y, tamano * 1.8, tamano * 1.8)
          .setOrigin(0.5)
          .setInteractive({ cursor: 'crosshair' });

        zone.on('pointerdown', () => {
          this.puntos = Math.max(this.puntos - 50, 0);
          this.rachaActual = 0;
          this.scoreText.setText(`Puntos: ${this.puntos}`);
          this.handleMiss();

          fake.destroy();
          cross.destroy();
          zone.destroy();
        });

        this.time.delayedCall(2000, () => {
          fake.destroy();
          cross.destroy();
          zone.destroy();
        });
      });
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

    if (this.endTimer) {
      this.endTimer.destroy();
    }

    this.time.removeAllEvents();

    if (this.activeSlider) {
      this.cleanupSlider();
    }

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
        if (win) {
          const completadoRes = await fetch(`http://localhost:3001/api/usuario/${userId}/completado`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ mapaId: this.mapa._id })
          });
          if (!completadoRes.ok) throw new Error("error");
        }

        const statsRes = await fetch(`http://localhost:3001/api/usuario/actualizar-estadisticas`, {
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
            precision: precision
          }),
        });

        if (!statsRes.ok) throw new Error("Error al actualizar estadísticas");

      } catch (e) {
        console.error("Error en estadísticas:", e);
      }
    }

    const mensaje = win ? '¡Victoria!' : 'Game Over';
    this.add.text(this.scale.width / 2, 300, mensaje, {
      fontSize: '74px',
      fontFamily: 'Audiowide',
      color: win ? '#00ff00' : '#ff0000',
    }).setOrigin(0.5).setDepth(100);

    const restartButton = this.add.text(this.scale.width / 2, 400, 'VOLVER A JUGAR', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Audiowide',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setDepth(100)
      .setInteractive()
      .on('pointerdown', () => {
        this.time.removeAllEvents();
        
        if (this.activeSlider) {
          this.cleanupSlider();
        }
        
        this.juegoTerminado = false;
        this.missedCircles = 0;
        this.puntos = 0;
        
        this.scene.stop();
        this.registry.set("mapaActivo", this.mapa);
        this.scene.start('JuegoTrackerScene');
      });

    const volverButton = this.add.text(this.scale.width / 2, 480, 'VOLVER A LOS MAPAS', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Audiowide',
      backgroundColor: '#00000000',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setDepth(100)
      .setInteractive()
      .on('pointerdown', () => {
        window.location.href = `/individual/${this.mapa.categoria}`;
      });

    restartButton.on('pointerover', () => restartButton.setBackgroundColor('#555555'));
    restartButton.on('pointerout', () => restartButton.setBackgroundColor('#00000000'));
    volverButton.on('pointerover', () => volverButton.setBackgroundColor('#555555'));
    volverButton.on('pointerout', () => volverButton.setBackgroundColor('#00000000'));
  }
}