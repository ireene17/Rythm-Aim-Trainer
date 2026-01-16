import { Route, Routes } from "react-router-dom";
import ScreenInicio from "./components/zonaMenus/ScreenInicio";
import MenuIndividual from "./components/zonaMenus/GameModes/MenuIndividual";
import MenuMultiplayer from "./components/zonaMenus/GameModes/MenuMultiplayer";
import IndividualModeScreen from "./components/zonaJuego/IndividualModeScreen";
import MenuInicio from "./components/zonaMenus/MenuInicio";
import RegisterForm from "./components/zonaAuth/RegisterForm";
import LoginForm from "./components/zonaAuth/LoginForm";
import PerfilUsuario from "./components/zonaAuth/PerfilUsuario";
import UserMenuButton from "./components/layout/UserMenuButton";
import GameContainer from "./GameContainer";
import UserAvatar from "./components/layout/UserAvatar";
import EstadisticasUsuario from "./components/ui/EstadisticasUsuario";
import CrearSala from "./components/zonaMultiplayer/CrearSala";
import ElegirMapa from "./components/zonaMultiplayer/ElegirMapa";
import SalaEspera from "./components/zonaMultiplayer/SalaEspera";
import UnirseASala from "./components/zonaMultiplayer/UnirseASala";
import AjustesGenerales from "./components/zonaSettings/AjustesGenerales";
import MenuInicioJuegos from "./components/zonaMenus/MenuInicioJuegos";
import Rankings from "./components/zonaStats/Rankings";

function App() {
  return (
    <div className="relative">
      <div className="fixed top-4 right-4 flex items-center gap-4 z-50 w-26">
        <UserAvatar />
        <UserMenuButton />
      </div>

      <Routes>
        <Route path="/" element={<ScreenInicio />} />
        <Route path="/jugar" element={<GameContainer />} />
        <Route path="/menuInicio" element={<MenuInicio />} />
        <Route path="/menuInicioJuegos" element={<MenuInicioJuegos />} />
        <Route path="/individual" element={<MenuIndividual />} />
        <Route path="/multiplayer" element={<MenuMultiplayer />} />
        <Route path="/multiplayer/crear" element={<CrearSala />} />
        <Route path="/multiplayer/crear/:categoria" element={<ElegirMapa />} />
        <Route path="/sala-espera/:id" element={<SalaEspera />} />
        <Route path="/partida/:id" element={<GameContainer />} />
        <Route path="/multiplayer/unirse" element={<UnirseASala />} />


        <Route path="/ajustes" element={<AjustesGenerales />} />
        <Route path="/registro" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/estadisticas" element={<EstadisticasUsuario />} />
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/perfilUsuario" element={<PerfilUsuario />} />
        <Route path="/individual/:mode" element={<IndividualModeScreen />} />
      </Routes>
    </div>
  );
}

export default App;
