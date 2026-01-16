import Phaser from 'phaser';

interface TargetData {
  x: number;
  y: number;
  tiempo: number;
  tamano: number;
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

export default class JuegoScene extends Phaser.Scene {
  private circles: Phaser.GameObjects.Arc[] = [];
  private targets: TargetData[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private missedText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private missedCircles = 0;
  private puntos = 0;
  private endTimer!: Phaser.Time.TimerEvent;
  private mapa!: MapaActivo;
  private juegoTerminado = false;
  private aciertosTotales = 0;
  private totalCirculos = 0;
  private clicsCentrales = 0;
  private tiempoPromedio = 0;
  private maxRacha = 0;
  private rachaActual = 0;
  private tiemposReaccion: number[] = []; 
  private tiempoApareceCirculo: number = 0;

  private music!: Phaser.Sound.WebAudioSound;
  private shootSound!: Phaser.Sound.WebAudioSound;
  private volumen = 1;

  private actualizarAjustesDesdeLocalStorage() {
  const ajustes = JSON.parse(localStorage.getItem("ajustesJuego") || "{}");
  this.volumen = ajustes.volumen ?? 1;

  if (this.music) this.music.setVolume(this.volumen);
  if (this.shootSound) this.shootSound.setVolume(this.volumen);

  console.log("Ajustes actualizados:", ajustes);
}

  constructor() {
    super('JuegoScene');
  }

  create() {
    this.mapa = this.registry.get("mapaActivo");

    if (!this.mapa || !Array.isArray(this.mapa.datosMapa.targets)) {
      console.error("Mapa activo inválido.");
      return;
    }
    this.input.setDefaultCursor('crosshair');

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

    private initSceneWithAudio(){
  
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

  private startGame(){
    this.targets = this.mapa.datosMapa.targets;
    this.puntos = 0;
    this.missedCircles = 0;
    this.juegoTerminado = false;


    const textStyle = { font: '20px Arial', color: '#ffffff' };
    this.add.text(20, 20, 'Tiempo restante:', textStyle);
    this.timeText = this.add.text(180, 20, '', textStyle);
    this.scoreText = this.add.text(20, 50, 'Puntos: 0', textStyle);
    this.missedText = this.add.text(20, 80, 'Fallados: 0/3', textStyle);


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
          this.spawnCircle(target.x, target.y, target.tamano);
        }
      });
    }
  }

private spawnCircle(x: number, y: number, size: number) {
  this.tiempoApareceCirculo = this.time.now;

  const outer = this.add.circle(x, y, size, 0xa855f7, 0.2);
  const middle = this.add.circle(x, y, size * 0.66, 0xd946ef, 0.5);
  const inner = this.add.circle(x, y, size * 0.33, 0xec4899, 0.8);

  

  const zone = this.add.zone(x, y, size * 1.8, size * 1.8)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: false, pixelPerfect: false });

  zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    const tiempoReaccion = this.time.now - this.tiempoApareceCirculo;
    this.tiemposReaccion.push(tiempoReaccion);
    const dx = pointer.x - x;
    const dy = pointer.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const shootSound = this.sound.add('shootSound', { volume: this.volumen });
      shootSound.play();

       try {
        this.shootSound.play();
      } catch (error) {
        console.error("Error al reproducir sonido de disparo:", error);
      }

    let puntos = 0;
    if (dist <= size * 0.33){ 
      puntos = 100;
      this.clicsCentrales++;
    }
    else if (dist <= size * 0.66) puntos = 75;
    else if (dist <= size) puntos = 50;
    else return; 

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
      ease: 'easeOut',
      onComplete: () => feedback.destroy()
    });

        }


    outer.destroy();
    middle.destroy();
    inner.destroy();
    zone.destroy();

    this.circles = this.circles.filter(c => c !== outer);
  });


  this.circles.push(outer);


  this.time.delayedCall(2000, () => {
    if (!zone.active) return;

    this.rachaActual = 0; 

    this.handleMiss(outer); 
    outer.destroy();
    middle.destroy();
    inner.destroy();
    zone.destroy();
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
    // Detener la música de fondo
    if (this.music && this.music.isPlaying) {
      this.music.stop();
      console.log("⏹ Música detenida");
    }

    // Detener el sonido de disparo si está sonando
    if (this.shootSound && this.shootSound.isPlaying) {
      this.shootSound.stop();
    }

    // Detener todos los demás sonidos de Phaser
    this.sound.stopAll();
  } catch (error) {
    console.error("Error al detener los sonidos:", error);
  }
}


 private async endGame(win: boolean = true) {
    if (this.juegoTerminado) return;
    this.juegoTerminado = true;

    if (this.endTimer) {
        this.endTimer.destroy();
    }

    this.stopAllSounds();

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
              console.log("mapa.nombre:", this.mapa.nombre);         
              if (win) {

                console.log("mapa.nombre:", this.mapa.nombre);
                const completadoResponse = await fetch(
                    `http://localhost:3001/api/usuario/${userId}/completado`, 
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ mapaId: this.mapa._id })
                    }
                );
                 if (!completadoResponse.ok) {
                    throw new Error('Error al marcar mapa como completado');
                }   
              }           
                
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
                            precision: precision
                        }),
                    }
                );

                if (!statsResponse.ok) {
                    throw new Error('Error al actualizar estadísticas');
                }

                const statsData = await statsResponse.json();
                console.log("Estadísticas actualizadas:", statsData);

            } catch (error) {
                console.error("Error en las peticiones al backend:", error);
            }
        }

    const message = win ? '¡Victoria!' : 'Game Over';
    this.add.text(
        this.scale.width / 2,
        300,
        message,
        {
            fontSize: '74px',
            fontFamily: 'Audiowide',
            color: win ? '#00ff00' : '#ff0000',
        }
    ).setOrigin(0.5).setDepth(100);

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
        this.scene.restart();
        this.registry.set("mapaActivo", this.mapa);
    });

const volverButton = this.add.text(this.scale.width / 2, 480, 'VOLVER A LOS MAPAS', {
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
        window.location.href = `/individual/${this.mapa.categoria}`;
    });

      restartButton.on('pointerover', () => restartButton.setBackgroundColor('#555555'));
  restartButton.on('pointerout', () => restartButton.setBackgroundColor('#00000000'));
  volverButton.on('pointerover', () => volverButton.setBackgroundColor('#555555'));
  volverButton.on('pointerout', () => volverButton.setBackgroundColor('#00000000'));
}

}
