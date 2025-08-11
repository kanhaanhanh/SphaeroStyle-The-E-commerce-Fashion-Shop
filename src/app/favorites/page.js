import FavoritePage from "../pages/favorite";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


export default function AppPage() {
  return (
    <div>
      <Navbar/>
      <FavoritePage /> {/* Rendering the Home component */}
      <Footer/>
    </div>
  );
}
