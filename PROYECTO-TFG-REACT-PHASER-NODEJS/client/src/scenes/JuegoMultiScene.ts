import Phaser from 'phaser';
import socket from '../socket';

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

interface JugadorPuntuacion {
  id: string;
  nombre: string;
  puntuacion: number;
  esAnfitrion?: boolean;
}

export default class JuegoMultiScene extends Phaser.Scene {
  private circles: Phaser.GameObjects.Arc[] = [];
  private targets: TargetData[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
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
  private ranking: JugadorPuntuacion[] = [];
  private salaId!: string;
  private esBot = false;

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
    super('JuegoMultiScene');
  }

  create() {
    this.mapa = this.registry.get("mapaActivo");
    this.salaId = localStorage.getItem("salaId") || '';
    this.esBot = localStorage.getItem("modoJuego") === "bot";
    this.input.setDefaultCursor('crosshair');


    if (!this.mapa || !Array.isArray(this.mapa.datosMapa.targets)) {
      console.error("Mapa activo inválido.");
      return;
    }


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
    this.input.setDefaultCursor('crosshair');
    this.targets = this.mapa.datosMapa.targets;
    this.puntos = 0;
    this.juegoTerminado = false;


    const textStyle = { font: '20px Arial', color: '#ffffff' };
    this.add.text(20, 20, 'Tiempo restante:', textStyle);
    this.timeText = this.add.text(180, 20, '', textStyle);
    this.scoreText = this.add.text(20, 50, 'Puntos: 0', textStyle);


    this.endTimer = this.time.delayedCall(
      this.mapa.datosMapa.duracion * 1000,
      () => this.endGame()
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

    if (this.esBot) {
      this.simularJugadorBot();
    }


    socket.on('actualizarPuntuaciones', (ranking: JugadorPuntuacion[]) => {
      this.ranking = ranking;
    });
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
      if (this.juegoTerminado || this.esBot) return;

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
      if (dist <= size * 0.33) {
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


      if (puntos == 100) {
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
      outer.destroy();
      middle.destroy();
      inner.destroy();
      zone.destroy();
    });
  }

  private stopAllSounds() {
  try {

    if (this.music && this.music.isPlaying) {
      this.music.stop();
      console.log("Música pausada");
    }


    if (this.shootSound && this.shootSound.isPlaying) {
      this.shootSound.stop();
    }


    this.sound.stopAll();
  } catch (error) {
    console.error("Error al detener los sonidos:", error);
  }
}

  private async endGame() {
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

    // const precision = this.totalCirculos > 0
    //   ? (this.aciertosTotales / this.totalCirculos) * 100
    //   : 0;


    if (!this.esBot && this.salaId) {
      // socket.emit('actualizarPuntuacion', {
      //   salaId: this.salaId,
      //   jugadorId: socket.id,
      //   puntuacion: this.puntos
      // });


      // await new Promise(resolve => setTimeout(resolve, 500)); 
      //!^^ Esto es para actualizar en tiempo real durante la partida, TODO
      socket.emit('finalizarPartida', {
        salaId: this.salaId,
        puntuaciones: [
          {
            id: socket.id,
            puntuacion: this.puntos
          }
        ]
      });
      socket.once('mostrarResultados', (data: { ranking: JugadorPuntuacion[] }) => {
      this.ranking = data.ranking;
      this.mostrarRanking();
    });
      
    } else{
      this.mostrarRanking();
    }
  }

 private mostrarRanking() {
  this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7)
    .setOrigin(0)
    .setDepth(50);

  this.add.text(
    this.scale.width / 2,
    100,
    'RESULTADOS FINALES',
    {
      fontSize: '48px',
      fontFamily: 'Audiowide',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  ).setOrigin(0.5).setDepth(51);

  const jugadoresReales = this.ranking.filter(j => !j.id.startsWith("bot_"));
  const mostrarBots = this.ranking.some(j => j.id.startsWith("bot_"));
  const rankingAMostrar = mostrarBots ? this.ranking : jugadoresReales;
  
  rankingAMostrar.forEach((jugador, index) => {
    const yPos = 180 + (index * 40);
    const color = jugador.id === socket.id ? '#00ff00' : '#ffffff';

    // Posición
    this.add.text(
      this.scale.width / 2 - 200,
      yPos,
      `${index + 1}.`,
      {
        fontSize: '24px',
        color: color,
        fontFamily: 'Inter'
      }
    ).setOrigin(0.5).setDepth(51);

    // Nombre
    this.add.text(
      this.scale.width / 2 - 100,
      yPos,
      jugador.nombre,
      {
        fontSize: '24px',
        color: color,
        fontFamily: 'Inter'
      }
    ).setOrigin(0.5).setDepth(51);

    // Puntuación
    this.add.text(
      this.scale.width / 2 + 100,
      yPos,
      jugador.puntuacion.toString(),
      {
        fontSize: '24px',
        color: color,
        fontFamily: 'Inter'
      }
    ).setOrigin(0.5).setDepth(51);
  });

  const backButton = this.add.text(
    this.scale.width / 2,
    650,
    'VOLVER AL MENÚ',
    {
      fontSize: '32px',
      fontFamily: 'Audiowide',
      color: '#ffffff',
      padding: { x: 20, y: 10 },
    }
  )
    .setOrigin(0.5)
    .setDepth(51)
    .setInteractive()
    .on('pointerdown', () => {
      window.location.href = '/multiplayer';
    });

  backButton.on('pointerover', () => backButton.setBackgroundColor('#555555'));
  backButton.on('pointerout', () => backButton.setBackgroundColor('#00000000'));
}

  // private generarRankingBots(): JugadorPuntuacion[] {

  //   const playerId = socket.id || 'player_' + Math.random().toString(36).substr(2, 9);


  //   const botScores = Array.from({ length: 7 }, (_, i) => ({
  //     id: `bot_${i + 1}`,
  //     nombre: `bot_${i + 1}`,
  //     puntuacion: Math.floor(Math.random() * 17) * 25 + 100, // 100-500, múltiplos de 25
  //     esAnfitrion: false
  //   }));


  //   botScores.push({
  //     id: playerId,
  //     nombre: 'Tú',
  //     puntuacion: this.puntos,
  //     esAnfitrion: false
  //   });


  //   return botScores.sort((a, b) => b.puntuacion - a.puntuacion);
  // }

  private simularJugadorBot() {

    this.time.addEvent({
      delay: 500, 
      callback: () => {
        if (this.juegoTerminado || this.circles.length === 0) return;


        const randomCircle = Phaser.Utils.Array.GetRandom(this.circles);
        const x = randomCircle.x;
        const y = randomCircle.y;
        const size = randomCircle.radius;


        const isPerfectClick = Phaser.Math.Between(1, 100) <= 75;
        const offset = isPerfectClick ? 0 : Phaser.Math.Between(1, size * 0.66);


        const angle = Phaser.Math.Between(0, 360);
        const clickX = x + offset * Math.cos(Phaser.Math.DegToRad(angle));
        const clickY = y + offset * Math.sin(Phaser.Math.DegToRad(angle));


        const dist = Phaser.Math.Distance.Between(clickX, clickY, x, y);
        let puntos = 0;

        if (dist <= size * 0.33) {
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
      },
      loop: true
    });
  }
}